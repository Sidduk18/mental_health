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
    { id: 'mood', label: 'Mood', icon: Heart },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'exercises', label: 'Exercises', icon: Wind },
    { id: 'therapy', label: 'Therapy', icon: Calendar },
    { id: 'assessments', label: 'Assessments', icon: ClipboardCheck },
    { id: 'peer', label: 'Groups', icon: Users },
    { id: 'crisis', label: 'Crisis', icon: AlertCircle, color: 'text-red-600' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleSignOut = () => {
    localStorage.removeItem('auth_token');
    window.location.reload();
  };

  const mobileNavItems = navItems.slice(0, 5); // Just first 5 for bottom nav

  return (
    <div className="flex min-h-screen font-sans bg-neutral-50 dark:bg-[#111111]">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 border-r border-black/10 flex-col fixed h-full bg-white dark:bg-black">
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
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left",
                currentView === item.id 
                  ? "bg-black text-white shadow-md dark:bg-white dark:text-black" 
                  : "hover:bg-black/5 text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white",
                item.color
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-black/10">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 z-50 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tighter text-black dark:text-white">MindAnchor</h1>
        <button
          onClick={() => setView('settings')}
          className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center"
        >
          <SettingsIcon className="w-4 h-4 text-black/50 dark:text-white/50" />
        </button>
      </div>

      <main className="flex-1 md:ml-64 p-6 md:p-8 min-h-screen pt-20 md:pt-8 pb-32 md:pb-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-black/90 dark:bg-white/90 backdrop-blur-lg rounded-[24px] border border-white/10 dark:border-black/10 shadow-2xl z-50 flex items-center justify-around p-2">
        {mobileNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={cn(
              "flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300",
              currentView === item.id
                ? "bg-white text-black scale-110 shadow-lg dark:bg-black dark:text-white"
                : "text-white/50 hover:text-white dark:text-black/50 dark:hover:text-black"
            )}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}
        <button
          onClick={() => setView('crisis')}
          className={cn(
            "flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300",
            currentView === 'crisis'
              ? "bg-red-500 text-white scale-110 shadow-lg"
              : "text-red-400/70 hover:text-red-400"
          )}
        >
          <AlertCircle className="w-5 h-5" />
        </button>
      </nav>
    </div>
  );
}
