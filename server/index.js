const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();

// --- UPDATED CORS CONFIGURATION FOR WEB & MOBILE ---
app.use(cors({
  origin: [
    'http://localhost:5173',      // Local Vite Web
    'http://localhost:3000',      // Local Web fallback
    'http://localhost',           // Capacitor Android
    'capacitor://localhost'       // Capacitor iOS
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
// ---------------------------------------------------

app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    initGroups();
    initCenters();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: String,
  role: { type: String, default: 'adult' },
  anonymous: { type: Boolean, default: false },
  streak: { type: Number, default: 1 },
  lastActive: { type: Date, default: Date.now },
  preferences: {
    theme: { type: String, default: 'light' },
    notifications: { type: Boolean, default: true },
    parentDashboardEnabled: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const moodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mood: Number,
  note: String,
  timestamp: { type: Date, default: Date.now }
});
const Mood = mongoose.model('Mood', moodSchema);

const journalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  content: String,
  mood: Number,
  timestamp: { type: Date, default: Date.now }
});
const Journal = mongoose.model('Journal', journalSchema);

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  therapistId: String,
  dateTime: Date,
  duration: Number,
  status: { type: String, default: 'scheduled' },
  meetLink: String,
  totalCost: Number,
  cancelReason: String,
  refundAmount: Number
});
const Appointment = mongoose.model('Appointment', appointmentSchema);

const messageSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderId: String,
  content: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

const peerGroupSchema = new mongoose.Schema({
  name: String,
  description: String,
  memberCount: { type: Number, default: 0 },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  icon: String
});
const PeerGroup = mongoose.model('PeerGroup', peerGroupSchema);

// --- POST SCHEMA FOR PEER GROUPS (WITH COMMENTS) ---
const postSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'PeerGroup' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  score: { type: Number, default: 0 },
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
  }]
});
const Post = mongoose.model('Post', postSchema);
// ---------------------------------------------------

const assessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String,
  score: Number,
  timestamp: { type: Date, default: Date.now }
});
const Assessment = mongoose.model('Assessment', assessmentSchema);

const supportCenterSchema = new mongoose.Schema({
  name: String,
  type: String,
  address: String,
  phone: String,
  lat: Number,
  lng: Number
});
const SupportCenter = mongoose.model('SupportCenter', supportCenterSchema);

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, displayName });
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.status(201).json({ token, user: { email, displayName, role: user.role, preferences: user.preferences, uid: user._id, streak: user.streak, lastActive: user.lastActive, anonymous: user.anonymous } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token, user: { email: user.email, displayName: user.displayName, role: user.role, preferences: user.preferences, uid: user._id, streak: user.streak, lastActive: user.lastActive, anonymous: user.anonymous } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ email: user.email, displayName: user.displayName, role: user.role, preferences: user.preferences, uid: user._id, streak: user.streak, lastActive: user.lastActive, anonymous: user.anonymous });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, req.body, { new: true });
    res.json({ email: user.email, displayName: user.displayName, role: user.role, preferences: user.preferences, uid: user._id, streak: user.streak, lastActive: user.lastActive, anonymous: user.anonymous });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mood Routes
app.get('/api/moods', authMiddleware, async (req, res) => {
  const moods = await Mood.find({ userId: req.userId }).sort({ timestamp: 1 }).limit(30);
  res.json(moods);
});

app.post('/api/moods', authMiddleware, async (req, res) => {
  const mood = new Mood({ ...req.body, userId: req.userId });
  await mood.save();
  res.status(201).json(mood);
});

// Journal Routes
app.get('/api/journals', authMiddleware, async (req, res) => {
  const journals = await Journal.find({ userId: req.userId }).sort({ timestamp: -1 });
  res.json(journals);
});

app.post('/api/journals', authMiddleware, async (req, res) => {
  const journal = new Journal({ ...req.body, userId: req.userId });
  await journal.save();
  res.status(201).json(journal);
});

// Appointment Routes
app.get('/api/appointments', authMiddleware, async (req, res) => {
  const appointments = await Appointment.find({ userId: req.userId }).sort({ dateTime: -1 });
  res.json(appointments);
});

app.post('/api/appointments', authMiddleware, async (req, res) => {
  const appointment = new Appointment({ ...req.body, userId: req.userId });
  await appointment.save();
  res.status(201).json(appointment);
});

app.patch('/api/appointments/:id', authMiddleware, async (req, res) => {
  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );
  res.json(appointment);
});

// Message Routes
app.get('/api/messages/:appointmentId', authMiddleware, async (req, res) => {
  const messages = await Message.find({ appointmentId: req.params.appointmentId, userId: req.userId }).sort({ timestamp: 1 });
  res.json(messages);
});

app.post('/api/messages', authMiddleware, async (req, res) => {
  const message = new Message({ ...req.body, userId: req.userId });
  await message.save();
  res.status(201).json(message);
});

// Peer Group Routes
app.get('/api/peergroups', authMiddleware, async (req, res) => {
  const groups = await PeerGroup.find();
  res.json(groups);
});

app.post('/api/peergroups/:id/join', authMiddleware, async (req, res) => {
  const group = await PeerGroup.findById(req.params.id);
  if (!group.members.includes(req.userId)) {
    group.members.push(req.userId);
    group.memberCount = group.members.length;
    await group.save();
  }
  res.json(group);
});

app.post('/api/peergroups/:id/leave', authMiddleware, async (req, res) => {
  const group = await PeerGroup.findById(req.params.id);
  group.members = group.members.filter(id => id.toString() !== req.userId);
  group.memberCount = group.members.length;
  await group.save();
  res.json(group);
});

// --- POST & COMMENT ROUTES FOR PEER GROUPS ---
app.get('/api/peergroups/:id/posts', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ groupId: req.params.id }).sort({ timestamp: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/peergroups/:id/posts', authMiddleware, async (req, res) => {
  try {
    const post = new Post({
      groupId: req.params.id,
      userId: req.userId,
      authorName: req.body.authorName || 'Anonymous',
      content: req.body.content
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.post('/api/peergroups/posts/:postId/comments', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({
      userId: req.userId,
      authorName: req.body.authorName || 'Anonymous',
      content: req.body.content
    });
    
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

app.post('/api/peergroups/posts/:postId/vote', authMiddleware, async (req, res) => {
  try {
    const { type } = req.body; // 'up' or 'down'
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const upIndex = post.upvotes.indexOf(req.userId);
    const downIndex = post.downvotes.indexOf(req.userId);

    if (type === 'up') {
      if (upIndex > -1) {
        post.upvotes.splice(upIndex, 1);
      } else {
        post.upvotes.push(req.userId);
        if (downIndex > -1) post.downvotes.splice(downIndex, 1);
      }
    } else if (type === 'down') {
      if (downIndex > -1) {
        post.downvotes.splice(downIndex, 1);
      } else {
        post.downvotes.push(req.userId);
        if (upIndex > -1) post.upvotes.splice(upIndex, 1);
      }
    }

    post.score = post.upvotes.length - post.downvotes.length;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to vote' });
  }
});
// ---------------------------------------------

// Support Center Routes
app.get('/api/centers', authMiddleware, async (req, res) => {
  try {
    const centers = await SupportCenter.find();
    res.json(centers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch centers' });
  }
});

// Assessment Routes
app.post('/api/assessments', authMiddleware, async (req, res) => {
  const assessment = new Assessment({ ...req.body, userId: req.userId });
  await assessment.save();
  res.status(201).json(assessment);
});

// Serve static files in production
app.use(express.static(path.join(__dirname, '../dist')));

// Fallback for SPA routing
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Initialize Support Centers
const initCenters = async () => {
  try {
    const count = await SupportCenter.countDocuments();
    if (count === 0) {
      await SupportCenter.create([
        { name: 'Sthira Wellness Center', type: 'Mental Health Clinic', address: '123 Peace St, Wellness City', phone: '+1 234 567 8901', lat: 12.9716, lng: 77.5946 },
        { name: 'City General Hospital - Psych Ward', type: 'Hospital', address: '456 Care Rd, Wellness City', phone: '+1 234 567 8902', lat: 12.9800, lng: 77.6000 },
        { name: 'Hope Counseling Hub', type: 'Counseling Center', address: '789 Support Ave, Wellness City', phone: '+1 234 567 8903', lat: 12.9600, lng: 77.5800 }
      ]);
      console.log('Initial support centers created');
    }
  } catch (err) {
    console.error('Error initializing centers:', err);
  }
};

// Initialize Peer Groups
const initGroups = async () => {
  const count = await PeerGroup.countDocuments();
  if (count === 0) {
    await PeerGroup.create([
      { name: 'Anxiety Support', description: 'A safe space to share and cope with anxiety.', memberCount: 0, members: [], icon: 'wind' },
      { name: 'Stress Management', description: 'Practical tips and support for daily stress.', memberCount: 0, members: [], icon: 'shield' },
      { name: 'Mindfulness Hub', description: 'Practicing being present together.', memberCount: 0, members: [], icon: 'sparkles' }
    ]);
    console.log('Initial peer groups created');
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
