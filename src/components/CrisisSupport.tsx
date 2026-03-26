import React, { useState } from 'react';
import { AlertTriangle, Phone, MessageSquare, Heart, Shield, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import MapComponent from './Map';

export default function CrisisSupport({ profile }: { profile: any }) {
  const [sosActive, setSosActive] = useState(false);

  const hotlines = [
    { name: 'National Suicide Prevention', number: '988', description: '24/7 free and confidential support' },
    { name: 'Crisis Text Line', number: 'Text HOME to 741741', description: 'Connect with a crisis counselor' },
    { name: 'The Trevor Project', number: '1-866-488-7386', description: 'Support for LGBTQ youth' },
    { name: 'SAMHSA Helpline', number: '1-800-662-HELP', description: 'Substance use and mental health' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      <header className="bg-red-50 dark:bg-red-900/10 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-red-100 dark:border-red-900/20">
        <div className="flex items-center space-x-4 text-red-600 mb-4">
          <AlertTriangle className="w-8 h-8 md:w-10 md:h-10" />
          <h2 className="text-2xl md:text-4xl font-black tracking-tight">Crisis Support</h2>
        </div>
        <p className="text-red-900/70 dark:text-red-200/70 max-w-2xl text-sm md:text-base">
          If you are in immediate danger, please call emergency services or go to the nearest emergency room. 
          We are here to help you find the right support right now.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* SOS Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setSosActive(!sosActive)}
          className={`h-48 md:h-64 rounded-[32px] md:rounded-[40px] flex flex-col items-center justify-center space-y-3 md:space-y-4 transition-all shadow-2xl ${
            sosActive ? 'bg-red-600 text-white border-transparent' : 'bg-white dark:bg-black/20 border-4 border-red-600 text-red-600'
          }`}
        >
          <div className={`w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center ${sosActive ? 'bg-white text-red-600' : 'bg-red-600 text-white'}`}>
            <Shield className="w-8 h-8 md:w-12 md:h-12" />
          </div>
          <span className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
            {sosActive ? 'SOS ACTIVE' : 'ONE-TAP SOS'}
          </span>
          <p className="text-[10px] md:text-xs font-bold opacity-70">Notifies emergency contacts & shares location</p>
        </motion.button>

        <div className="space-y-4">
          <h3 className="text-xl font-bold px-2 text-black dark:text-white">Immediate Resources</h3>
          {hotlines.map((h, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-black/20 p-5 md:p-6 rounded-3xl border border-black/10 dark:border-white/10 flex items-center justify-between group hover:bg-neutral-50 dark:hover:bg-white/5 transition-all"
            >
              <div className="flex-1 pr-4">
                <h4 className="font-bold text-base md:text-lg text-black dark:text-white">{h.name}</h4>
                <p className="text-xs md:text-sm text-black/50 dark:text-white/50">{h.description}</p>
                <p className="text-black dark:text-white font-mono font-bold mt-1 text-sm">{h.number}</p>
              </div>
              <a 
                href={`tel:${h.number.replace(/\D/g,'')}`}
                className="p-3 md:p-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl hover:scale-110 transition-transform flex-shrink-0"
              >
                <Phone className="w-5 h-5 md:w-6 md:h-6" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>

      <section className="bg-white dark:bg-black/20 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-black/10 dark:border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl md:text-2xl font-bold flex items-center space-x-3 text-black dark:text-white">
            <MapPin className="w-6 h-6 text-emerald-500" />
            <span>Find Help Nearby</span>
          </h3>
          <p className="text-[10px] md:text-xs text-black/40 dark:text-white/40 font-bold uppercase tracking-widest leading-none">Showing Wellness Centers Near You</p>
        </div>
        <MapComponent />
      </section>
    </div>
  );
}
