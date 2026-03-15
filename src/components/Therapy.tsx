import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Appointment, Message } from '../types';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  User, 
  Video, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  Loader2, 
  X, 
  ChevronRight, 
  Send,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const therapists = [
  { id: 't1', name: 'Dr. Sarah Chen', specialty: 'Anxiety & Stress', image: 'https://picsum.photos/seed/sarah/100/100', role: 'adult', bio: 'Specializing in cognitive behavioral therapy for over 10 years.' },
  { id: 't2', name: 'Mark Thompson', specialty: 'Teen Counseling', image: 'https://picsum.photos/seed/mark/100/100', role: 'teen', bio: 'Focusing on adolescent mental health and peer relationships.' },
  { id: 't3', name: 'Dr. Elena Rodriguez', specialty: 'Relationship & Family', image: 'https://picsum.photos/seed/elena/100/100', role: 'adult', bio: 'Expert in family dynamics and systemic therapy.' },
  { id: 't4', name: 'Priya Sharma', specialty: 'Academic Stress', image: 'https://picsum.photos/seed/priya/100/100', role: 'teen', bio: 'Helping students manage exam anxiety and career pressure.' },
  { id: 't5', name: 'Dr. Amit Patel', specialty: 'Workplace Wellness', image: 'https://picsum.photos/seed/amit/100/100', role: 'adult', bio: 'Specialist in corporate mental health and burnout prevention.' },
  { id: 't6', name: 'Sanya Gupta', specialty: 'Self-Esteem & Identity', image: 'https://picsum.photos/seed/sanya/100/100', role: 'teen', bio: 'Empowering teens to build confidence and navigate social identity.' },
];

export default function Therapy({ profile }: { profile: UserProfile }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<any | null>(null);
  const [bookingStep, setBookingStep] = useState<'therapist' | 'date' | 'time' | 'confirm'>('therapist');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [duration, setDuration] = useState(30);
  const [isBooking, setIsBooking] = useState(false);
  const [activeChat, setActiveChat] = useState<Appointment | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filteredTherapists = therapists.filter(t => t.role === profile.role);

  const calculateCost = (mins: number) => {
    if (mins === 30) return 499;
    if (mins === 45) return 499 + 199;
    if (mins === 60) return 499 + 199 + 199;
    return 499;
  };

  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];
  const dates = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i + 1));

  useEffect(() => {
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', profile.uid),
      orderBy('dateTime', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allApps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      const filteredApps = allApps.filter(app => {
        const therapist = therapists.find(t => t.id === app.therapistId);
        return therapist?.role === profile.role;
      });
      setAppointments(filteredApps);
    });
    return () => unsubscribe();
  }, [profile.uid, profile.role]);

  useEffect(() => {
    if (activeChat) {
      const q = query(
        collection(db, 'messages'),
        where('appointmentId', '==', activeChat.id),
        where('userId', '==', profile.uid),
        orderBy('timestamp', 'asc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setChatMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
      });
      return () => unsubscribe();
    }
  }, [activeChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleBook = async () => {
    if (!selectedTherapist || !selectedDate || !selectedTime) return;
    setIsBooking(true);
    try {
      const [time, period] = selectedTime.split(' ');
      const [hours, minutes] = time.split(':');
      const date = new Date(selectedDate);
      let h = parseInt(hours);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      date.setHours(h);
      date.setMinutes(parseInt(minutes));

      await addDoc(collection(db, 'appointments'), {
        userId: profile.uid,
        therapistId: selectedTherapist.id,
        dateTime: Timestamp.fromDate(date),
        duration,
        status: 'scheduled',
        meetLink: `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`,
        totalCost: calculateCost(duration)
      });
      setSelectedTherapist(null);
      setBookingStep('therapist');
    } catch (error) {
      console.error('Error booking:', error);
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancel = async (appId: string, cost: number) => {
    const reason = window.prompt('Please tell us why you are cancelling:');
    if (reason === null) return;

    const refundAmount = (cost * 0.75).toFixed(2);
    if (window.confirm(`Are you sure? You will receive a 75% refund (₹${refundAmount}).`)) {
      try {
        await updateDoc(doc(db, 'appointments', appId), {
          status: 'cancelled',
          cancelReason: reason,
          refundAmount: Number(refundAmount)
        });
      } catch (error) {
        console.error('Error cancelling:', error);
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;
    const msg = newMessage;
    setNewMessage('');
    try {
      await addDoc(collection(db, 'messages'), {
        appointmentId: activeChat.id,
        userId: profile.uid,
        senderId: profile.uid,
        content: msg,
        timestamp: Timestamp.now()
      });

      // Simulated therapist reply
      setTimeout(async () => {
        const replies = [
          "I understand how you feel. We'll discuss this in our next session.",
          "That's a very insightful observation.",
          "Remember to practice your breathing exercises when you feel this way.",
          "I'm here to support you. You're doing great.",
          "Let's explore that thought further when we meet.",
          "It's completely normal to feel that way given the circumstances."
        ];
        await addDoc(collection(db, 'messages'), {
          appointmentId: activeChat.id,
          userId: profile.uid,
          senderId: activeChat.therapistId,
          content: replies[Math.floor(Math.random() * replies.length)],
          timestamp: Timestamp.now()
        });
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-black tracking-tight">Therapy & Counselling</h2>
        <p className="text-black/50">Professional support tailored to your needs.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Your Sessions */}
        <section className="lg:col-span-1 space-y-6">
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Your Sessions</span>
          </h3>
          <div className="space-y-4">
            {appointments.length > 0 ? appointments.map((app) => (
              <div key={app.id} className={`p-6 rounded-3xl border shadow-sm space-y-4 ${app.status === 'cancelled' ? 'bg-neutral-50 opacity-60' : 'bg-white border-black/10'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={therapists.find(t => t.id === app.therapistId)?.image} 
                      className="w-10 h-10 rounded-full" 
                      alt="" 
                    />
                    <div>
                      <h4 className="font-bold">{therapists.find(t => t.id === app.therapistId)?.name || 'Therapist'}</h4>
                      <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">
                        {format(app.dateTime.toDate(), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                  {app.status === 'scheduled' && (
                    <button 
                      onClick={() => handleCancel(app.id!, app.totalCost)}
                      className="p-2 hover:bg-red-50 rounded-xl transition-colors"
                      title="Cancel Session"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                  {app.status === 'cancelled' && (
                    <span className="text-[10px] font-bold text-red-500 uppercase">Cancelled</span>
                  )}
                </div>
                {app.status === 'scheduled' && (
                  <div className="flex space-x-2">
                    <a 
                      href={app.meetLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 bg-black text-white py-2 rounded-xl text-xs font-bold text-center hover:bg-black/80 transition-all"
                    >
                      Join Session
                    </a>
                    <button 
                      onClick={() => setActiveChat(app)}
                      className="p-2 border border-black/10 rounded-xl hover:bg-black/5"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )) : (
              <div className="bg-white p-8 rounded-3xl border border-black/10 text-center text-black/30 italic">
                No sessions scheduled.
              </div>
            )}
          </div>
        </section>

        {/* Booking Flow */}
        <section className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5" />
            <span>Book a New Session</span>
          </h3>
          
          <div className="bg-white p-8 rounded-[32px] border border-black/10 shadow-sm min-h-[400px]">
            {bookingStep === 'therapist' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTherapists.map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => { setSelectedTherapist(t); setBookingStep('date'); }}
                    className="text-left p-6 rounded-3xl border border-black/5 hover:border-black/20 hover:bg-black/5 transition-all flex items-center space-x-4 group"
                  >
                    <img src={t.image} alt="" className="w-16 h-16 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold">{t.name}</h4>
                      <p className="text-xs text-black/50">{t.specialty}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            )}

            {bookingStep === 'date' && selectedTherapist && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-8">
                  <button onClick={() => setBookingStep('therapist')} className="p-2 hover:bg-black/5 rounded-full"><X className="w-5 h-5" /></button>
                  <h4 className="font-bold">Select Date for {selectedTherapist.name}</h4>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {dates.map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => { setSelectedDate(date); setBookingStep('time'); }}
                      className={`p-4 rounded-2xl border transition-all text-center ${
                        selectedDate && isSameDay(selectedDate, date)
                          ? 'bg-black text-white border-black'
                          : 'border-black/5 hover:border-black/20'
                      }`}
                    >
                      <p className="text-[10px] font-bold uppercase opacity-50">{format(date, 'EEE')}</p>
                      <p className="text-lg font-black">{format(date, 'd')}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {bookingStep === 'time' && selectedTherapist && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-8">
                  <button onClick={() => setBookingStep('date')} className="p-2 hover:bg-black/5 rounded-full"><X className="w-5 h-5" /></button>
                  <h4 className="font-bold">Select Time for {format(selectedDate!, 'MMMM d')}</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => { setSelectedTime(time); setBookingStep('confirm'); }}
                      className={`p-4 rounded-2xl border transition-all font-bold ${
                        selectedTime === time
                          ? 'bg-black text-white border-black'
                          : 'border-black/5 hover:border-black/20'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {bookingStep === 'confirm' && selectedTherapist && (
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <button onClick={() => setBookingStep('time')} className="p-2 hover:bg-black/5 rounded-full"><X className="w-5 h-5" /></button>
                  <h4 className="font-bold">Confirm Booking</h4>
                </div>
                
                <div className="bg-neutral-50 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold opacity-50">Duration</span>
                    <div className="flex bg-white p-1 rounded-xl border border-black/5">
                      {[30, 45, 60].map(m => (
                        <button 
                          key={m}
                          onClick={() => setDuration(m)}
                          className={`px-4 py-1 rounded-lg text-xs font-bold transition-all ${duration === m ? 'bg-black text-white' : 'opacity-50'}`}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-black/5">
                    <span className="text-sm font-bold opacity-50">Base Rate (30m)</span>
                    <span className="font-bold">₹499</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-black/5">
                    <span className="text-lg font-bold">Total Cost</span>
                    <span className="text-2xl font-black">₹{calculateCost(duration)}</span>
                  </div>
                </div>

                <button 
                  onClick={handleBook}
                  disabled={isBooking}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isBooking ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6" />}
                  <span>Pay & Book Session</span>
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Chat Window Overlay */}
      <AnimatePresence>
        {activeChat && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed bottom-0 right-8 w-full max-w-md bg-white border border-black/10 rounded-t-[32px] shadow-2xl z-50 flex flex-col h-[500px]"
          >
            <div className="p-6 border-b border-black/5 flex justify-between items-center bg-black text-white rounded-t-[32px]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{therapists.find(t => t.id === activeChat.therapistId)?.name}</h4>
                  <p className="text-[10px] opacity-50">Online</p>
                </div>
              </div>
              <button onClick={() => setActiveChat(null)} className="p-2 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === profile.uid ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${
                    msg.senderId === profile.uid 
                      ? 'bg-black text-white rounded-tr-none' 
                      : 'bg-white text-black border-2 border-black/10 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-black/5 flex space-x-2 bg-white">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-neutral-50 border border-black/5 rounded-xl px-4 py-2 text-sm outline-none focus:border-black text-black"
              />
              <button 
                onClick={sendMessage}
                className="bg-black text-white p-2 rounded-xl"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
