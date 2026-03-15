import React, { useState, useEffect } from 'react';
import { Wind, Brain, Heart, Zap, Play, Pause, RotateCcw, Eye, Music, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Exercises({ profile }: { profile: any }) {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const exercises = [
    { 
      id: 'breathing', 
      title: 'Box Breathing', 
      description: 'A simple technique to calm the nervous system.',
      duration: '5 min',
      icon: Wind,
      color: 'bg-blue-500',
      steps: ['Inhale for 4s', 'Hold for 4s', 'Exhale for 4s', 'Hold for 4s']
    },
    { 
      id: 'mindfulness', 
      title: '5-4-3-2-1 Grounding', 
      description: 'Reconnect with the present moment using your senses.',
      duration: '10 min',
      icon: Brain,
      color: 'bg-emerald-500',
      steps: ['5 things you see', '4 things you feel', '3 things you hear', '2 things you smell', '1 thing you taste']
    },
    { 
      id: 'cbt', 
      title: 'Thought Reframing', 
      description: 'Challenge negative thought patterns.',
      duration: '15 min',
      icon: Heart,
      color: 'bg-rose-500',
      steps: ['Identify the thought', 'Check for evidence', 'Find an alternative view']
    },
    { 
      id: 'visualization', 
      title: 'Safe Space Visualization', 
      description: 'Mentally transport yourself to a place of peace.',
      duration: '12 min',
      icon: Eye,
      color: 'bg-indigo-500',
      steps: ['Close your eyes', 'Imagine a peaceful place', 'Focus on the details', 'Stay for a few minutes']
    },
    { 
      id: 'music', 
      title: 'Sound Bath', 
      description: 'Immerse yourself in calming frequencies.',
      duration: '20 min',
      icon: Music,
      color: 'bg-amber-500',
      steps: ['Put on headphones', 'Close your eyes', 'Focus on the sound', 'Let thoughts pass by']
    }
  ];

  useEffect(() => {
    let interval: any;
    if (isActive && activeExercise === 'breathing') {
      interval = setInterval(() => {
        setTimer(t => t + 1);
        if (timer % 4 === 0) {
          setCurrentStep(s => (s + 1) % 4);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timer, activeExercise]);

  const renderExerciseUI = () => {
    const ex = exercises.find(e => e.id === activeExercise);
    if (!ex) return null;

    switch (ex.id) {
      case 'breathing':
        return (
          <div className="py-8 md:py-12 flex flex-col items-center space-y-8">
            <motion.div 
              animate={{ 
                scale: currentStep === 0 ? 1.3 : currentStep === 2 ? 1 : 1.3,
                opacity: currentStep === 1 || currentStep === 3 ? 0.8 : 1
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black"
            >
              <div className="text-center">
                <Wind className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2" />
                <p className="text-xl md:text-2xl font-black">{ex.steps[currentStep]}</p>
              </div>
            </motion.div>
            <button 
              onClick={() => setIsActive(!isActive)}
              className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-2xl font-bold flex items-center space-x-2"
            >
              {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isActive ? 'Pause' : 'Start Timer'}</span>
            </button>
          </div>
        );
      case 'mindfulness':
        return (
          <div className="grid grid-cols-1 gap-3 md:gap-4 py-4 md:py-8">
            {ex.steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.2 }}
                className="p-4 md:p-6 bg-neutral-50 dark:bg-white/5 rounded-2xl md:rounded-3xl border border-black/5 dark:border-white/5 flex items-center space-x-4"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-black flex-shrink-0 text-sm md:text-base">
                  {5 - i}
                </div>
                <p className="text-base md:text-xl font-bold text-left">{step}</p>
              </motion.div>
            ))}
          </div>
        );
      default:
        return (
          <div className="space-y-4 md:space-y-6 py-4 md:py-8">
            {ex.steps.map((step, i) => (
              <div key={i} className="p-4 md:p-6 bg-neutral-50 dark:bg-white/5 rounded-2xl md:rounded-3xl border border-black/5 dark:border-white/5 text-base md:text-xl font-bold text-left">
                {step}
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-black tracking-tight text-black dark:text-white">Guided Exercises</h2>
        <p className="text-black/50 dark:text-white/50">CBT, mindfulness, and breathing tools.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {exercises.map((ex) => (
          <motion.div 
            key={ex.id}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-black/20 p-6 md:p-8 rounded-[32px] border border-black/10 dark:border-white/10 shadow-sm flex flex-col h-full group"
          >
            <div className={`w-12 h-12 ${ex.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
              <ex.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 text-black dark:text-white">{ex.title}</h3>
            <p className="text-sm text-black/50 dark:text-white/50 flex-1 mb-6">{ex.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest opacity-40 text-black dark:text-white">{ex.duration}</span>
              <button 
                onClick={() => {
                  setActiveExercise(ex.id);
                  setIsActive(false);
                  setCurrentStep(0);
                  setTimer(0);
                }}
                className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-transform"
              >
                Start
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeExercise && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-[#0a0a0a] max-w-2xl w-full rounded-[32px] md:rounded-[48px] p-6 md:p-12 text-center space-y-6 md:space-y-8 relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setActiveExercise(null)}
                className="absolute top-4 md:top-8 right-4 md:right-8 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
              >
                <RotateCcw className="w-6 h-6 rotate-45 text-black dark:text-white" />
              </button>

              <div className="space-y-2">
                <h3 className="text-2xl md:text-4xl font-black tracking-tight text-black dark:text-white">
                  {exercises.find(e => e.id === activeExercise)?.title}
                </h3>
                <p className="text-black/50 dark:text-white/50 text-sm md:text-base">Follow the steps below at your own pace.</p>
              </div>

              {renderExerciseUI()}

              <button 
                onClick={() => setActiveExercise(null)}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold text-lg md:text-xl hover:shadow-2xl transition-all"
              >
                Complete Session
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
