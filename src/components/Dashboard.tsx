import React from 'react';
import { UserProfile } from '../types';
import { Layout } from './Layout';
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
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-black">
            Welcome back, {profile.displayName || 'Friend'}!
          </h2>
          <p className="text-black/50 mt-2 text-lg">Your mental wellness journey continues today.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[32px] border border-black/10 shadow-sm flex items-center space-x-6"
          >
            <div className={`${stat.bg} p-4 rounded-2xl`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-black/40 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-3xl font-black">{stat.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      <section>
        <h3 className="text-2xl font-black mb-8">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => setView(action.id)}
              className="bg-white p-8 rounded-[40px] border border-black/10 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all text-left group"
            >
              <div className={`${action.color} w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <action.icon className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold mb-2">{action.label}</h4>
              <p className="text-sm text-black/40 mb-6">{action.description}</p>
              <div className="flex items-center text-xs font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                <span>Start Now</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-black text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-4">Mindfulness Hub</h3>
            <p className="text-white/60 mb-8 max-w-sm">Join a guided meditation session or explore our library of breathing exercises.</p>
            <button 
              onClick={() => setView('exercises')}
              className="bg-white text-black px-8 py-4 rounded-2xl font-bold flex items-center space-x-2 hover:scale-105 transition-all"
            >
              <span>Explore Library</span>
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </section>

        <section className="bg-white p-10 rounded-[48px] border border-black/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-black/40 uppercase tracking-widest text-emerald-600">Upcoming Session</span>
            </div>
            <h3 className="text-3xl font-black mb-4 italic">Next Step Forward</h3>
            <p className="text-black/50 mb-8">Your next session with Dr. Sarah Chen is in 2 hours. Preparing your journal notes can help make the most of your time.</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Clock className="w-5 h-5 text-black/20" />
              <span className="font-bold">Today, 4:00 PM</span>
            </div>
            <button
              onClick={() => setView('therapy')}
              className="text-black font-black uppercase tracking-tighter flex items-center hover:translate-x-2 transition-transform"
            >
              <span>View Details</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
