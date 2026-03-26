import React, { useState, useEffect } from 'react';
import { UserProfile, Appointment } from '../types';
import { Layout } from './Layout';
import getApiUrl from '../lib/api';
import { 
  Smile,
  BookOpen,
  Calendar, 
  ShieldAlert,
  Users,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  profile: UserProfile;
  setView: (view: string) => void;
}

export default function Dashboard({ profile, setView }: DashboardProps) {
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem('auth_token');
      try {
        const response = await fetch(getApiUrl('/api/appointments'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        const upcoming = data
          .filter((app: any) => app.status === 'scheduled' && new Date(app.dateTime) > new Date())
          .sort((a: any, b: any) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

        if (upcoming.length > 0) {
          setNextAppointment({ ...upcoming[0], dateTime: new Date(upcoming[0].dateTime) });
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
      }
    };
    fetchAppointments();
  }, []);

  const stats = [
    { label: 'Current Streak', value: `${profile.streak} Days`, icon: Sparkles, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Mood Logs', value: '12', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Journals', value: '8', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  const quickActions = [
    { id: 'mood', label: 'Log Mood', description: 'How are you feeling?', icon: Smile, color: 'bg-emerald-500' },
    { id: 'journal', label: 'Journal', description: 'Write your thoughts', icon: BookOpen, color: 'bg-blue-500' },
    { id: 'therapy', label: 'Book Therapy', description: 'Talk to an expert', icon: Calendar, color: 'bg-purple-500' },
    { id: 'crisis', label: 'Crisis Help', description: 'Get immediate support', icon: ShieldAlert, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-8 md:space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black dark:text-white">
            Welcome back, {profile.displayName || 'Friend'}!
          </h2>
          <p className="text-black/50 dark:text-white/50 mt-2 text-base md:text-lg">Your mental wellness journey continues today.</p>
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <img
              key={i}
              src={`https://picsum.photos/seed/${i + 20}/100/100`}
              className="w-12 h-12 rounded-full border-4 border-white shadow-sm"
              alt=""
            />
          ))}
          <div className="w-12 h-12 rounded-full bg-black text-white border-4 border-white shadow-sm flex items-center justify-center text-xs font-bold">
            +42
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-black/20 p-6 md:p-8 rounded-[32px] border border-black/10 dark:border-white/10 shadow-sm flex items-center space-x-4 md:space-x-6"
          >
            <div className={`${stat.bg} dark:bg-white/5 p-3 md:p-4 rounded-2xl`}>
              <stat.icon className={`w-6 h-6 md:w-8 md:h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-black/40 dark:text-white/40 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-2xl md:text-3xl font-black text-black dark:text-white">{stat.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      <section>
        <h3 className="text-xl md:text-2xl font-black mb-6 md:mb-8 text-black dark:text-white">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => setView(action.id)}
              className="bg-white dark:bg-black/20 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-black/10 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all text-left group"
            >
              <div className={`${action.color} w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center mb-4 md:mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h4 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-black dark:text-white">{action.label}</h4>
              <p className="hidden md:block text-sm text-black/40 dark:text-white/40 mb-6">{action.description}</p>
              <div className="flex items-center text-[10px] md:text-xs font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform text-black/60 dark:text-white/60">
                <span className="hidden md:inline">Start Now</span>
                <span className="md:hidden">Go</span>
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <section className="bg-black dark:bg-white text-white dark:text-black p-8 md:p-10 rounded-[40px] md:rounded-[48px] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-black mb-4">Mindfulness Hub</h3>
            <p className="text-white/60 dark:text-black/60 mb-6 md:mb-8 max-w-sm text-sm md:text-base">Join a guided meditation session or explore our library of breathing exercises.</p>
            <button 
              onClick={() => setView('exercises')}
              className="bg-white dark:bg-black text-black dark:text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold flex items-center space-x-2 hover:scale-105 transition-all text-sm md:text-base"
            >
              <span>Explore Library</span>
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 md:w-64 h-48 md:h-64 bg-white/10 dark:bg-black/10 rounded-full blur-3xl" />
        </section>

        <section className="bg-white dark:bg-black/20 p-8 md:p-10 rounded-[40px] md:rounded-[48px] border border-black/10 dark:border-white/10 shadow-sm flex flex-col justify-between">
          {nextAppointment ? (
            <>
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] md:text-xs font-bold text-black/40 dark:text-white/40 uppercase tracking-widest text-emerald-600">Upcoming Session</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-2 md:mb-4 italic text-black dark:text-white">Next Step Forward</h3>
                <p className="text-black/50 dark:text-white/50 mb-6 md:mb-8 text-sm md:text-base">Your session is scheduled. Preparing your journal notes can help make the most of your time.</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <Clock className="w-5 h-5 text-black/20 dark:text-white/20" />
                  <span className="font-bold text-black dark:text-white text-sm md:text-base">
                    {nextAppointment.dateTime.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <button
                  onClick={() => setView('therapy')}
                  className="text-black dark:text-white font-black uppercase tracking-tighter flex items-center hover:translate-x-2 transition-transform text-sm"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-[10px] md:text-xs font-bold text-black/40 dark:text-white/40 uppercase tracking-widest text-blue-600">Always Here</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-2 md:mb-4 italic text-black dark:text-white">Next Step Forward</h3>
                <p className="text-black/50 dark:text-white/50 mb-6 md:mb-8 text-sm md:text-base">You're not alone. Our community and experts are here to help you whenever you're ready. Take a small step today.</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <Users className="w-5 h-5 text-black/20 dark:text-white/20" />
                  <span className="font-bold text-black dark:text-white text-sm md:text-base">Supportive Community</span>
                </div>
                <button
                  onClick={() => setView('peer')}
                  className="text-black dark:text-white font-black uppercase tracking-tighter flex items-center hover:translate-x-2 transition-transform text-sm"
                >
                  <span>Join a Group</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
