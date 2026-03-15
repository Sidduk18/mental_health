import React, { useState, useEffect } from 'react';
import { UserProfile, JournalEntry } from '../types';
import { format } from 'date-fns';
import { PenLine, Mic, History, Sparkles, Loader2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Journal({ profile }: { profile: UserProfile }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'history'>('write');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const prompts = [
    "What's one thing that made you smile today?",
    "Describe a challenge you faced and how you handled it.",
    "What are three things you're grateful for right now?",
    "How does your body feel in this moment?",
    "What's a goal you want to achieve tomorrow?",
    "What's a song that perfectly matches your mood today?",
    "If you could talk to your future self, what would you say?"
  ];

  const getDailyPrompt = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return prompts[day % prompts.length];
  };

  const fetchJournals = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch('/api/journals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setEntries(data.map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) })));
    } catch (err) {
      console.error('Error fetching journals:', err);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      await fetch('/api/journals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      setContent('');
      setActiveTab('history');
      fetchJournals();
    } catch (error) {
      console.error('Error saving journal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const simulateVoiceNote = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setContent(prev => prev + (prev ? '\n' : '') + '[Voice Note: Feeling a bit overwhelmed but hopeful today. Taking it one step at a time.]');
    }, 3000);
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Personal Journal</h2>
          <p className="text-black/50">A private space for your thoughts.</p>
        </div>
        <div className="flex bg-black/5 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('write')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'write' ? 'bg-white shadow-sm' : 'opacity-50'}`}
          >
            Write
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white shadow-sm' : 'opacity-50'}`}
          >
            History
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'write' ? (
          <motion.div 
            key="write"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-black text-white p-8 rounded-[32px] shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-4 opacity-50">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Daily Prompt</span>
                </div>
                <h3 className="text-2xl font-bold italic">"{getDailyPrompt()}"</h3>
              </div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mb-10 -mr-10 blur-2xl" />
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-black/10 shadow-sm space-y-4">
              <textarea
                placeholder="Start typing your thoughts here..."
                className="w-full min-h-[300px] p-0 text-lg bg-transparent border-none focus:ring-0 outline-none resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex justify-between items-center pt-4 border-t border-black/5">
                <div className="flex space-x-2">
                  <button 
                    onClick={simulateVoiceNote}
                    disabled={isRecording}
                    className={`p-3 rounded-xl transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-black/5'}`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setContent('')}
                    className="p-3 hover:bg-black/5 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
                <button
                  onClick={handleSave}
                  disabled={!content.trim() || isSubmitting}
                  className="bg-black text-white px-8 py-3 rounded-2xl font-bold flex items-center space-x-2 disabled:opacity-50 hover:shadow-lg transition-all"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <PenLine className="w-5 h-5" />}
                  <span>Save Entry</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {entries.length > 0 ? entries.map((entry: any) => (
              <div key={entry._id} className="bg-white p-6 rounded-3xl border border-black/10 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-black/40 uppercase tracking-widest">
                    {format(entry.timestamp, 'MMMM d, yyyy')}
                  </span>
                  <History className="w-4 h-4 opacity-20" />
                </div>
                <p className="text-black/80 line-clamp-4 leading-relaxed">{entry.content}</p>
                <button 
                  onClick={() => setSelectedEntry(entry)}
                  className="mt-4 text-xs font-bold uppercase tracking-widest hover:underline"
                >
                  Read Full Entry
                </button>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center text-black/30">
                <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-bold">No entries yet. Start writing today.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedEntry && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[40px] p-10 relative max-h-[80vh] overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedEntry(null)}
                className="absolute top-6 right-6 p-2 hover:bg-black/5 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="space-y-6">
                <header>
                  <span className="text-xs font-bold text-black/40 uppercase tracking-widest">
                    {format(selectedEntry.timestamp, 'MMMM d, yyyy')}
                  </span>
                  <h3 className="text-3xl font-black mt-2">Journal Entry</h3>
                </header>
                
                <div className="prose prose-neutral max-w-none">
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{selectedEntry.content}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
