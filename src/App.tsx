import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import MoodTracker from './components/MoodTracker';
import CrisisSupport from './components/CrisisSupport';
import Journal from './components/Journal';
import Therapy from './components/Therapy';
import Assessments from './components/Assessments';
import Settings from './components/Settings';
import Exercises from './components/Exercises';
import { Layout } from './components/Layout';
import { Loader2 } from 'lucide-react';
import PeerGroup from './components/PeerGroup';
import getApiUrl from './lib/api';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(getApiUrl('/api/auth/me'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Token invalid');
      const userData = await response.json();
      setUser({ uid: userData.uid, email: userData.email });
      setProfile(userData);
    } catch (err) {
      localStorage.removeItem('auth_token');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (profile) {
      const isTeen = profile.role === 'teen';
      const isDark = profile.preferences?.theme === 'dark';
      
      document.documentElement.classList.remove('dark', 'teen-theme');
      if (isTeen) {
        document.documentElement.classList.add('teen-theme');
      }
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, [profile?.role, profile?.preferences?.theme]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-black">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return <Auth onAuthSuccess={() => {
      setLoading(true);
      checkAuth();
    }} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard profile={profile} setView={setCurrentView} />;
      case 'mood': return <MoodTracker profile={profile} />;
      case 'crisis': return <CrisisSupport profile={profile} />;
      case 'journal': return <Journal profile={profile} />;
      case 'therapy': return <Therapy profile={profile} />;
      case 'assessments': return <Assessments profile={profile} />;
      case 'exercises': return <Exercises profile={profile} />;
      case 'peer': return <PeerGroup profile={profile} />;
      case 'settings': return <Settings profile={profile} setProfile={setProfile} />;
      default: return <Dashboard profile={profile} setView={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView} profile={profile}>
      {renderView()}
    </Layout>
  );
}
