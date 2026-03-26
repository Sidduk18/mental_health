import React, { useState } from 'react';
import { Mail, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import getApiUrl from '../lib/api';
import logo from '../assets/logo.jpg';

interface AuthProps {
  onAuthSuccess: () => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<'email' | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Auth failed');

      localStorage.setItem('auth_token', data.token);
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-black p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 p-8 md:p-10 rounded-[32px] md:rounded-[40px] shadow-2xl backdrop-blur-xl"
      >
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Sthira Logo" className="w-20 h-20 rounded-2xl shadow-lg object-cover border border-black/5" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-black dark:text-white">Sthira</h2>
          <p className="mt-2 text-sm text-black/50 dark:text-white/50 font-medium italic">One tap closer to feeling better</p>
        </div>

        <AnimatePresence mode="wait">
          {!authMethod ? (
            <motion.div 
              key="methods"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <button
                onClick={() => setAuthMethod('email')}
                className="w-full flex items-center justify-center px-4 py-4 border border-black/10 rounded-2xl shadow-sm bg-black text-white hover:bg-black/90 transition-all font-bold"
              >
                <Mail className="w-5 h-5 mr-2" />
                Continue with Email
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <button onClick={() => setAuthMethod(null)} className="flex items-center text-sm font-bold opacity-50 hover:opacity-100">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>
              
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <input
                  type="email"
                  required
                  className="w-full px-4 py-4 border border-black/10 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all bg-transparent text-black dark:text-white"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  required
                  className="w-full px-4 py-4 border border-black/10 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all bg-transparent text-black dark:text-white"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-4 border border-transparent rounded-2xl shadow-sm text-white dark:text-black bg-black dark:bg-white hover:bg-black/90 transition-all font-bold"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
              </form>
              <div className="text-center">
                <button onClick={() => setIsLogin(!isLogin)} className="text-sm font-bold opacity-50 hover:opacity-100">
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-6 border-t border-black/5 flex items-center justify-center space-x-4 opacity-30">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-widest font-bold">End-to-End Encrypted</span>
        </div>
      </motion.div>
    </div>
  );
}
