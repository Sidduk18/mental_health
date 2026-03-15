import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { LogIn, Mail, Phone, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthProps {
  onAuthSuccess: () => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authMethod === 'phone' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  }, [authMethod]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess();
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is not enabled in Firebase Console. Please enable it under Authentication > Sign-in method.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (confirmationResult) {
        await confirmationResult.confirm(otp);
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div id="recaptcha-container"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white border border-black/10 p-10 rounded-[40px] shadow-2xl"
      >
        <div className="text-center">
          <h2 className="text-4xl font-black tracking-tighter text-black">MindAnchor</h2>
          <p className="mt-2 text-sm text-black/50">Your safe space for mental well-being.</p>
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
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-4 border border-black/10 rounded-2xl shadow-sm bg-white text-black hover:bg-black/5 transition-all font-bold"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                Continue with Google
              </button>

              <button
                onClick={() => setAuthMethod('email')}
                className="w-full flex items-center justify-center px-4 py-4 border border-black/10 rounded-2xl shadow-sm bg-white text-black hover:bg-black/5 transition-all font-bold"
              >
                <Mail className="w-5 h-5 mr-2" />
                Continue with Email
              </button>

              <button
                onClick={() => setAuthMethod('phone')}
                className="w-full flex items-center justify-center px-4 py-4 border border-black/10 rounded-2xl shadow-sm bg-white text-black hover:bg-black/5 transition-all font-bold"
              >
                <Phone className="w-5 h-5 mr-2" />
                Continue with Phone (OTP)
              </button>
            </motion.div>
          ) : authMethod === 'email' ? (
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
                  className="w-full px-4 py-4 border border-black/10 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  required
                  className="w-full px-4 py-4 border border-black/10 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-4 border border-transparent rounded-2xl shadow-sm text-white bg-black hover:bg-black/90 transition-all font-bold"
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
          ) : (
            <motion.div 
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <button onClick={() => setAuthMethod(null)} className="flex items-center text-sm font-bold opacity-50 hover:opacity-100">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>

              {!confirmationResult ? (
                <form onSubmit={handlePhoneSignIn} className="space-y-4">
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-4 border border-black/10 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all"
                    placeholder="+1 234 567 8900"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center px-4 py-4 border border-transparent rounded-2xl shadow-sm text-white bg-black hover:bg-black/90 transition-all font-bold"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-4 border border-black/10 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center px-4 py-4 border border-transparent rounded-2xl shadow-sm text-white bg-black hover:bg-black/90 transition-all font-bold"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify OTP'}
                  </button>
                </form>
              )}
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

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
