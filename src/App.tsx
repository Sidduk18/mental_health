import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from './types';
import Auth from './components/Auth';
import { Layout } from './components/Layout';
import { Loader2 } from 'lucide-react';
import { lazy, Suspense } from 'react';
import logo from './assets/logo.jpg';

const Dashboard = lazy(() => import('./components/Dashboard'));
const MoodTracker = lazy(() => import('./components/MoodTracker'));
const CrisisSupport = lazy(() => import('./components/CrisisSupport'));
const Journal = lazy(() => import('./components/Journal'));
const Therapy = lazy(() => import('./components/Therapy'));
const Assessments = lazy(() => import('./components/Assessments'));
const Settings = lazy(() => import('./components/Settings'));
const Exercises = lazy(() => import('./components/Exercises'));
const PeerGroup = lazy(() => import('./components/PeerGroup'));
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white p-6">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-black/5 dark:bg-white/5 blur-2xl rounded-full scale-150 animate-pulse"></div>
          <img src={logo} alt="Sthira Logo" className="w-24 h-24 md:w-32 md:h-32 rounded-3xl shadow-2xl relative z-10 object-cover border border-black/5" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-3 animate-in fade-in slide-in-from-bottom-4 duration-1000">Sthira</h1>
        <p className="text-black/50 dark:text-white/50 font-medium tracking-tight text-center animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-200">One tap closer to feeling better</p>
        <div className="mt-12">
          <Loader2 className="w-6 h-6 animate-spin text-black/20 dark:text-white/20" />
        </div>
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
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-black/20" />
        </div>
      }>
        {(() => {
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
        })()}
      </Suspense>
    );
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView} profile={profile}>
      {renderView()}
    </Layout>
  );
}
