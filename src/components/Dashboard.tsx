import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, MoodLog, Goal } from '../types';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Zap,
  ArrowRight,
  Smile,
  Meh,
  Frown,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardProps {
  profile: UserProfile;
  setView: (view: string) => void;
}

export default function Dashboard({ profile, setView }: DashboardProps) {
  const [recentMoods, setRecentMoods] = useState<MoodLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  const isTeen = profile.role === 'teen';

  useEffect(() => {
    const moodQuery = query(
      collection(db, 'moods'),
      where('userId', '==', profile.uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribeMoods = onSnapshot(moodQuery, (snapshot) => {
      setRecentMoods(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MoodLog)));
    });

    const goalQuery = query(
      collection(db, 'goals'),
      where('userId', '==', profile.uid),
      where('completed', '==', false),
      limit(5)
    );

    const unsubscribeGoals = onSnapshot(goalQuery, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal)));
    });

    return () => {
      unsubscribeMoods();
      unsubscribeGoals();
    };
  }, [profile.uid]);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;

    try {
      await addDoc(collection(db, 'goals'), {
        userId: profile.uid,
        title: newGoal,
        completed: false,
        createdAt: Timestamp.now()
      });
      setNewGoal('');
      setIsAddingGoal(false);
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteDoc(doc(db, 'goals', goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getMoodIcon = (mood: number) => {
    if (mood >= 4) return <Smile className="text-green-500" />;
    if (mood >= 3) return <Meh className="text-yellow-500" />;
    return <Frown className="text-red-500" />;
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tight">
            {isTeen ? `Yo, ${profile.displayName || 'Bestie'}! ✌️` : `Hello, ${profile.displayName || 'Friend'}`}
          </h2>
          <p className="text-black/50 mt-1">
            {isTeen ? "How's the vibe today? No cap." : "How are you feeling today?"}
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-2xl shadow-lg">
          <Zap className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          <span className="font-bold">{profile.streak || 0} Day Streak</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mood Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-3xl border border-black/10 shadow-sm space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>{isTeen ? 'Mood Check' : 'Recent Mood'}</span>
            </h3>
            <button 
              onClick={() => setView('mood')}
              className="text-xs font-bold uppercase tracking-widest hover:underline"
            >
              {isTeen ? 'See All' : 'View All'}
            </button>
          </div>
          <div className="space-y-3">
            {recentMoods.length > 0 ? recentMoods.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  {getMoodIcon(m.mood)}
                  <span className="text-sm font-medium">
                    {m.timestamp ? format(m.timestamp.toDate(), 'MMM d, h:mm a') : 'Just now'}
                  </span>
                </div>
                <span className="text-xs font-bold opacity-30">{m.mood}/5</span>
              </div>
            )) : (
              <p className="text-sm text-black/40 italic">{isTeen ? 'Empty vibes here...' : 'No moods logged yet.'}</p>
            )}
          </div>
        </motion.div>

        {/* Goals Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-3xl border border-black/10 shadow-sm space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>{isTeen ? 'Main Quests' : 'Active Goals'}</span>
            </h3>
            <button 
              onClick={() => setIsAddingGoal(!isAddingGoal)}
              className="p-1 hover:bg-black/5 rounded-full"
            >
              {isAddingGoal ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
          
          {isAddingGoal && (
            <form onSubmit={handleAddGoal} className="flex gap-2">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder={isTeen ? "What's the move?" : "New goal..."}
                className="flex-1 text-sm border border-black/10 rounded-xl px-3 py-2 focus:outline-none focus:border-black"
                autoFocus
              />
              <button type="submit" className="bg-black text-white px-3 py-2 rounded-xl text-xs font-bold">Add</button>
            </form>
          )}

          <div className="space-y-3">
            {goals.length > 0 ? goals.map((g) => (
              <div key={g.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-2xl group">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-black" />
                  <span className="text-sm font-medium">{g.title}</span>
                </div>
                <button 
                  onClick={() => handleDeleteGoal(g.id!)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </button>
              </div>
            )) : (
              <p className="text-sm text-black/40 italic">{isTeen ? 'No quests active. Chill.' : 'No active goals.'}</p>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <button 
            onClick={() => setView('therapy')}
            className="w-full bg-black text-white p-6 rounded-3xl flex items-center justify-between group hover:shadow-xl transition-all"
          >
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">{isTeen ? 'Real Talk' : 'Counselling'}</p>
              <h4 className="text-xl font-bold">{isTeen ? 'Talk to a Pro' : 'Book a Session'}</h4>
            </div>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
          <button 
            onClick={() => setView('journal')}
            className="w-full bg-white border border-black/10 p-6 rounded-3xl flex items-center justify-between group hover:bg-black/5 transition-all"
          >
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">{isTeen ? 'Brain Dump' : 'Journal'}</p>
              <h4 className="text-xl font-bold">{isTeen ? 'Write it out' : 'Write Entry'}</h4>
            </div>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>

      {/* Role Specific Section */}
      <section className="bg-black text-white p-8 rounded-[40px] shadow-2xl overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">
            {isTeen ? 'Level Up Your Mind 🚀' : 'Professional Growth & Balance'}
          </h3>
          <p className="opacity-70 max-w-md">
            {isTeen 
              ? 'Complete daily challenges to earn points and build healthy habits. Slay the day.' 
              : 'Tools designed to help you manage work stress and maintain healthy boundaries.'}
          </p>
          <button 
            onClick={() => setView('exercises')}
            className="mt-6 bg-white text-black px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-transform"
          >
            {isTeen ? 'Start Quest' : 'Explore Modules'}
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
      </section>
    </div>
  );
}
