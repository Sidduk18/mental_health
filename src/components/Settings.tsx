import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { Settings as SettingsIcon, User, Shield, Bell, Trash2, Check, Loader2, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import getApiUrl from '../lib/api';

interface SettingsProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}

export default function Settings({ profile, setProfile }: SettingsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setIsUpdating(true);
    setSuccess(false);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(getApiUrl('/api/auth/profile'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      setProfile(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-black tracking-tight text-black dark:text-white">Settings</h2>
        <p className="text-black/50 dark:text-white/50">Manage your account and preferences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <section className="bg-white dark:bg-black/20 p-6 md:p-8 rounded-[32px] border border-black/10 dark:border-white/10 shadow-sm space-y-6">
          <h3 className="text-xl font-bold flex items-center space-x-2 text-black dark:text-white">
            <User className="w-5 h-5" />
            <span>Profile Type</span>
          </h3>
          <p className="text-sm text-black/50 dark:text-white/50">Tailor your experience based on your age group.</p>
          
          <div className="flex space-x-3 md:space-x-4">
            {(['teen', 'adult'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => updateProfile({ role })}
                disabled={isUpdating}
                className={`flex-1 p-4 md:p-6 rounded-2xl border-2 transition-all text-center ${
                  profile.role === role 
                    ? 'border-black bg-black dark:bg-white text-white dark:text-black shadow-lg'
                    : 'border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 text-black dark:text-white'
                }`}
              >
                <span className="text-base md:text-lg font-bold capitalize">{role}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-black/20 p-6 md:p-8 rounded-[32px] border border-black/10 dark:border-white/10 shadow-sm space-y-6">
          <h3 className="text-xl font-bold flex items-center space-x-2 text-black dark:text-white">
            <Sun className="w-5 h-5" />
            <span>Appearance</span>
          </h3>
          <p className="text-sm text-black/50 dark:text-white/50">Choose your preferred theme.</p>
          <div className="flex space-x-3 md:space-x-4">
            {(['light', 'dark'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => updateProfile({ preferences: { ...profile.preferences, theme } })}
                disabled={isUpdating}
                className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center space-x-2 ${
                  profile.preferences.theme === theme 
                    ? 'border-black bg-black dark:bg-white text-white dark:text-black shadow-lg'
                    : 'border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 text-black dark:text-white'
                }`}
              >
                {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span className="font-bold capitalize">{theme}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-black/20 p-6 md:p-8 rounded-[32px] border border-black/10 dark:border-white/10 shadow-sm space-y-6">
          <h3 className="text-xl font-bold flex items-center space-x-2 text-black dark:text-white">
            <Shield className="w-5 h-5" />
            <span>Privacy & Security</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-white/5 rounded-2xl">
              <div>
                <p className="font-bold text-black dark:text-white text-sm md:text-base">Anonymous Mode</p>
                <p className="text-[10px] md:text-xs text-black/50 dark:text-white/50">Hide your identity in peer groups</p>
              </div>
              <button 
                onClick={() => updateProfile({ anonymous: !profile.anonymous })}
                className={`w-12 h-6 rounded-full transition-colors relative ${profile.anonymous ? 'bg-black dark:bg-white' : 'bg-black/10 dark:bg-white/20'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white dark:bg-black transition-all ${profile.anonymous ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {profile.role === 'teen' && (
              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-white/5 rounded-2xl">
                <div>
                  <p className="font-bold text-black dark:text-white text-sm md:text-base">Parent Dashboard</p>
                  <p className="text-[10px] md:text-xs text-black/50 dark:text-white/50">Allow parents to see progress overview</p>
                </div>
                <button 
                  onClick={() => updateProfile({ preferences: { ...profile.preferences, parentDashboardEnabled: !profile.preferences.parentDashboardEnabled } })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${profile.preferences.parentDashboardEnabled ? 'bg-black dark:bg-white' : 'bg-black/10 dark:bg-white/20'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white dark:bg-black transition-all ${profile.preferences.parentDashboardEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white dark:bg-black/20 p-6 md:p-8 rounded-[32px] border border-black/10 dark:border-white/10 shadow-sm space-y-6">
          <h3 className="text-xl font-bold flex items-center space-x-2 text-black dark:text-white">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </h3>
          <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-white/5 rounded-2xl">
            <div>
              <p className="font-bold text-black dark:text-white text-sm md:text-base">Smart Nudges</p>
              <p className="text-[10px] md:text-xs text-black/50 dark:text-white/50">Non-intrusive check-in reminders</p>
            </div>
            <button 
              onClick={() => updateProfile({ preferences: { ...profile.preferences, notifications: !profile.preferences.notifications } })}
              className={`w-12 h-6 rounded-full transition-colors relative ${profile.preferences.notifications ? 'bg-black dark:bg-white' : 'bg-black/10 dark:bg-white/20'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white dark:bg-black transition-all ${profile.preferences.notifications ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </section>

        <section className="col-span-full bg-red-50 dark:bg-red-900/10 p-6 md:p-8 rounded-[32px] border border-red-100 dark:border-red-900/20 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-red-600">Danger Zone</h3>
              <p className="text-sm text-red-600/60">Irreversible actions for your account.</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('auth_token');
                window.location.reload();
              }}
              className="px-6 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all flex items-center space-x-2"
            >
              <Trash2 className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl font-bold flex items-center space-x-2 z-50"
          >
            <Check className="w-5 h-5" />
            <span>Preferences Saved!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
