import React, { ReactNode } from 'react';
import { 
  LayoutDashboard, 
  Heart, 
  AlertCircle, 
  BookOpen, 
  Calendar, 
  ClipboardCheck, 
  Settings as SettingsIcon,
  LogOut,
  Wind,
  Users
} from 'lucide-react';
import { auth } from '../firebase';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  setView: (view: string) => void;
  profile: UserProfile;
}

export function Layout({ children, currentView, setView, profile }: LayoutProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mood', label: 'Mood Tracker', icon: Heart },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'exercises', label: 'Exercises', icon: Wind },
    { id: 'therapy', label: 'Therapy', icon: Calendar },
    { id: 'assessments', label: 'Assessments', icon: ClipboardCheck },
    { id: 'peer', label: 'Peer Group', icon: Users },
    { id: 'crisis', label: 'Crisis Support', icon: AlertCircle, color: 'text-red-600' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex min-h-screen font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-black/10 flex flex-col fixed h-full bg-white dark:bg-black">
        <div className="p-6 border-b border-black/10">
          <h1 className="text-2xl font-bold tracking-tighter text-black dark:text-white">MindAnchor</h1>
          <p className="text-xs text-black/50 dark:text-white/50 uppercase tracking-widest mt-1">
            {profile.role} Edition
          </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                currentView === item.id 
                  ? "bg-black text-white shadow-md dark:bg-white dark:text-black" 
                  : "hover:bg-black/5 text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white",
                item.color
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-black/10">
          <button 
            onClick={() => auth.signOut()}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 min-h-screen bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
