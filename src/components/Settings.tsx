import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserProfile, UserRole } from '../types';
import { Settings as SettingsIcon, User, Shield, Bell, Trash2, Check, Loader2, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
      const docRef = doc(db, 'users', profile.uid);
      await updateDoc(docRef, updates);
      setProfile({ ...profile, ...updates });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-black tracking-tight">Settings</h2>
        <p className="text-black/50">Manage your account and preferences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Section */}
        <section className="bg-white p-8 rounded-[32px] border border-black/10 shadow-sm space-y-6">
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Profile Type</span>
          </h3>
          <p className="text-sm text-black/50">Tailor your experience based on your age group.</p>
          
          <div className="flex space-x-4">
            {(['teen', 'adult'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => updateProfile({ role })}
                disabled={isUpdating}
                className={`flex-1 p-6 rounded-2xl border-2 transition-all text-center ${
                  profile.role === role 
                    ? 'border-black bg-black text-white shadow-lg' 
                    : 'border-black/5 hover:border-black/20'
                }`}
              >
                <span className="text-lg font-bold capitalize">{role}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Theme Section */}
        <section className="bg-white p-8 rounded-[32px] border border-black/10 shadow-sm space-y-6">
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <Sun className="w-5 h-5" />
            <span>Appearance</span>
          </h3>
          <p className="text-sm text-black/50">Choose your preferred theme.</p>
          <div className="flex space-x-4">
            {(['light', 'dark'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => updateProfile({ preferences: { ...profile.preferences, theme } })}
                disabled={isUpdating}
                className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center space-x-2 ${
                  profile.preferences.theme === theme 
                    ? 'border-black bg-black text-white shadow-lg' 
                    : 'border-black/5 hover:border-black/20'
                }`}
              >
                {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span className="font-bold capitalize">{theme}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Privacy Section */}
        <section className="bg-white p-8 rounded-[32px] border border-black/10 shadow-sm space-y-6">
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Privacy & Security</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
              <div>
                <p className="font-bold">Anonymous Mode</p>
                <p className="text-xs text-black/50">Hide your identity in peer groups</p>
              </div>
              <button 
                onClick={() => updateProfile({ anonymous: !profile.anonymous })}
                className={`w-12 h-6 rounded-full transition-colors relative ${profile.anonymous ? 'bg-black dark:bg-white' : 'bg-black/10 dark:bg-white/20'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white dark:bg-black transition-all ${profile.anonymous ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {profile.role === 'teen' && (
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
                <div>
                  <p className="font-bold">Parent Dashboard</p>
                  <p className="text-xs text-black/50">Allow parents to see progress overview</p>
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

        {/* Notifications */}
        <section className="bg-white p-8 rounded-[32px] border border-black/10 shadow-sm space-y-6">
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </h3>
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
            <div>
              <p className="font-bold">Smart Nudges</p>
              <p className="text-xs text-black/50">Non-intrusive check-in reminders</p>
            </div>
            <button 
              onClick={() => updateProfile({ preferences: { ...profile.preferences, notifications: !profile.preferences.notifications } })}
              className={`w-12 h-6 rounded-full transition-colors relative ${profile.preferences.notifications ? 'bg-black dark:bg-white' : 'bg-black/10 dark:bg-white/20'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white dark:bg-black transition-all ${profile.preferences.notifications ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50 p-8 rounded-[32px] border border-red-100 space-y-6">
          <h3 className="text-xl font-bold text-red-600 flex items-center space-x-2">
            <Trash2 className="w-5 h-5" />
            <span>Danger Zone</span>
          </h3>
          <button className="w-full py-4 border-2 border-red-600 text-red-600 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition-all">
            Delete All My Data
          </button>
        </section>
      </div>

      {/* Status Toast */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-black text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 z-50"
          >
            <Check className="w-5 h-5 text-emerald-400" />
            <span className="font-bold">Settings Updated</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
