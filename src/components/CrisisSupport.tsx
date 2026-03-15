import React, { useState } from 'react';
import { AlertTriangle, Phone, MessageSquare, Heart, Shield, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

export default function CrisisSupport({ profile }: { profile: any }) {
  const [sosActive, setSosActive] = useState(false);

  const hotlines = [
    { name: 'National Suicide Prevention', number: '988', description: '24/7 free and confidential support' },
    { name: 'Crisis Text Line', number: 'Text HOME to 741741', description: 'Connect with a crisis counselor' },
    { name: 'The Trevor Project', number: '1-866-488-7386', description: 'Support for LGBTQ youth' },
    { name: 'SAMHSA Helpline', number: '1-800-662-HELP', description: 'Substance use and mental health' },
  ];

  return (
    <div className="space-y-8">
      <header className="bg-red-50 p-8 rounded-[40px] border border-red-100">
        <div className="flex items-center space-x-4 text-red-600 mb-4">
          <AlertTriangle className="w-10 h-10" />
          <h2 className="text-4xl font-black tracking-tight">Crisis Support</h2>
        </div>
        <p className="text-red-900/70 max-w-2xl">
          If you are in immediate danger, please call emergency services or go to the nearest emergency room. 
          We are here to help you find the right support right now.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SOS Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setSosActive(!sosActive)}
          className={`h-64 rounded-[40px] flex flex-col items-center justify-center space-y-4 transition-all shadow-2xl ${
            sosActive ? 'bg-red-600 text-white' : 'bg-white border-4 border-red-600 text-red-600'
          }`}
        >
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${sosActive ? 'bg-white text-red-600' : 'bg-red-600 text-white'}`}>
            <Shield className="w-12 h-12" />
          </div>
          <span className="text-3xl font-black uppercase tracking-tighter">
            {sosActive ? 'SOS ACTIVE' : 'ONE-TAP SOS'}
          </span>
          <p className="text-xs font-bold opacity-70">Notifies emergency contacts & shares location</p>
        </motion.button>

        <div className="space-y-4">
          <h3 className="text-xl font-bold px-2">Immediate Resources</h3>
          {hotlines.map((h, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-black/10 flex items-center justify-between group hover:bg-neutral-50 transition-all"
            >
              <div>
                <h4 className="font-bold text-lg">{h.name}</h4>
                <p className="text-sm text-black/50">{h.description}</p>
                <p className="text-black font-mono font-bold mt-1">{h.number}</p>
              </div>
              <a 
                href={`tel:${h.number.replace(/\D/g,'')}`}
                className="p-4 bg-black text-white rounded-2xl hover:scale-110 transition-transform"
              >
                <Phone className="w-6 h-6" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>

      <section className="bg-white p-8 rounded-[40px] border border-black/10 space-y-6">
        <h3 className="text-2xl font-bold flex items-center space-x-3">
          <MapPin className="w-6 h-6" />
          <span>Nearby Crisis Centers</span>
        </h3>
        <div className="aspect-video bg-neutral-100 rounded-3xl flex items-center justify-center text-black/30 italic">
          Map integration would load here...
        </div>
      </section>
    </div>
  );
}
