import React, { useState, useEffect } from 'react';
import { UserProfile, MoodLog } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { Smile, Meh, Frown, Send, Loader2 } from 'lucide-react';
import getApiUrl from '../lib/api';

interface MoodTrackerProps {
  profile: UserProfile;
}

const moodOptions = [
  { value: 1, label: 'Very Low', icon: Frown, color: 'text-red-500' },
  { value: 2, label: 'Low', icon: Frown, color: 'text-orange-500' },
  { value: 3, label: 'Neutral', icon: Meh, color: 'text-yellow-500' },
  { value: 4, label: 'Good', icon: Smile, color: 'text-green-500' },
  { value: 5, label: 'Excellent', icon: Smile, color: 'text-emerald-500' },
];

export default function MoodTracker({ profile }: MoodTrackerProps) {
  const [moods, setMoods] = useState<MoodLog[]>([]);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMoods = async () => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(getApiUrl('/api/moods'), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setMoods(data.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
  };

  useEffect(() => {
    fetchMoods();
  }, []);

  const handleLogMood = async () => {
    if (selectedMood === null) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(getApiUrl('/api/moods'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mood: selectedMood, note })
      });
      setSelectedMood(null);
      setNote('');
      fetchMoods();
    } catch (error) {
      console.error('Error logging mood:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const chartData = moods.map(m => {
    const moodValue = Number(m.mood);
    return {
      date: format(m.timestamp, 'MMM d'),
      time: format(m.timestamp, 'h:mm a'),
      mood: moodValue,
      fullDate: format(m.timestamp, 'MMM d, h:mm a'),
      label: moodOptions.find(o => o.value === moodValue)?.label || 'Unknown'
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black text-white p-4 rounded-2xl shadow-2xl border border-white/10 z-50">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">{data.fullDate}</p>
          <p className="text-lg font-black">{data.label}</p>
          <p className="text-xs font-bold text-yellow-400">Level {data.mood}/5</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-black tracking-tight text-black dark:text-white">Mood Tracker</h2>
        <p className="text-black/50 dark:text-white/50">Visualize your emotional journey over time.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <section className="bg-white dark:bg-black/20 p-6 md:p-8 rounded-[32px] border border-black/10 dark:border-white/10 shadow-sm space-y-6">
          <h3 className="text-lg md:text-xl font-bold text-black dark:text-white">How are you right now?</h3>
          <div className="grid grid-cols-5 gap-1 md:gap-2 items-center">
            {moodOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedMood(opt.value)}
                className={`flex flex-col items-center space-y-2 p-2 md:p-4 rounded-2xl transition-all ${
                  selectedMood === opt.value 
                    ? 'bg-black text-white scale-105 md:scale-110 shadow-lg'
                    : 'hover:bg-black/5 text-black/40'
                }`}
              >
                <opt.icon className={`w-6 h-6 md:w-8 md:h-8 ${selectedMood === opt.value ? 'text-white' : opt.color}`} />
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-center">{opt.label}</span>
              </button>
            ))}
          </div>

          <textarea
            placeholder="Add a note about how you're feeling (optional)..."
            className="w-full p-4 bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none min-h-[100px] transition-all text-black dark:text-white"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button
            onClick={handleLogMood}
            disabled={selectedMood === null || isSubmitting}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50 hover:shadow-xl transition-all"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            <span>Log Mood</span>
          </button>
        </section>

        <section className="bg-white dark:bg-black/20 p-6 md:p-8 rounded-[32px] border border-black/10 dark:border-white/10 shadow-sm">
          <h3 className="text-lg md:text-xl font-bold mb-6 text-black dark:text-white">Mood Trends</h3>
          <div className="w-full h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="fullDate" axisLine={false} tickLine={false} tick={false} />
                <YAxis 
                  domain={[1, 5]} 
                  ticks={[1, 2, 3, 4, 5]} 
                  tickFormatter={(val) => {
                    const label = moodOptions.find(o => o.value === val)?.label || '';
                    return `${val} - ${label.substring(0, 3)}`; // Shorten label for mobile
                  }}
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--chart-text)' }}
                  width={60} // Reduced width for mobile
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="var(--chart-line)"
                  strokeWidth={4}
                  dot={{ r: 4, fill: 'var(--chart-line)', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: 'var(--chart-line)' }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="bg-white dark:bg-black/20 p-6 md:p-8 rounded-[32px] border border-black/10 dark:border-white/10 shadow-sm">
        <h3 className="text-lg md:text-xl font-bold mb-6 text-black dark:text-white">Mood History</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {moods.slice().reverse().map((m) => {
            const option = moodOptions.find(o => o.value === m.mood);
            const Icon = option?.icon;
            return (
              <div key={m._id} className="p-4 bg-neutral-50 dark:bg-white/5 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {Icon && <Icon className={`w-5 h-5 ${option?.color}`} />}
                    <span className="font-bold text-black dark:text-white">{option?.label}</span>
                  </div>
                  <span className="text-xs font-bold opacity-30 text-black dark:text-white">
                    {format(m.timestamp, 'MMM d, h:mm a')}
                  </span>
                </div>
                {m.note && <p className="text-sm text-black/60 dark:text-white/60 italic">"{m.note}"</p>}
              </div>
            );
          })}
          {moods.length === 0 && (
            <p className="text-black/40 italic col-span-full text-center py-8">No mood logs yet. Start by logging your current mood!</p>
          )}
        </div>
      </section>
    </div>
  );
}
