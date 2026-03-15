import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ClipboardCheck, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import getApiUrl from '../lib/api';

export default function Assessments({ profile }: { profile: UserProfile }) {
  const [activeTest, setActiveTest] = useState<'PHQ-9' | 'GAD-7' | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const phq9Questions = [
    "Little interest or pleasure in doing things?",
    "Feeling down, depressed, or hopeless?",
    "Trouble falling or staying asleep, or sleeping too much?",
    "Feeling tired or having little energy?",
    "Poor appetite or overeating?",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?",
    "Trouble concentrating on things, such as reading the newspaper or watching television?",
    "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?",
    "Thoughts that you would be better off dead or of hurting yourself in some way?"
  ];

  const gad7Questions = [
    "Feeling nervous, anxious, or on edge?",
    "Not being able to stop or control worrying?",
    "Worrying too much about different things?",
    "Trouble relaxing?",
    "Being so restless that it is hard to sit still?",
    "Becoming easily annoyed or irritable?",
    "Feeling afraid, as if something awful might happen?"
  ];

  const options = [
    { label: "Not at all", value: 0 },
    { label: "Several days", value: 1 },
    { label: "More than half the days", value: 2 },
    { label: "Nearly every day", value: 3 }
  ];

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    const questions = activeTest === 'PHQ-9' ? phq9Questions : gad7Questions;
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAssessment(newAnswers);
    }
  };

  const submitAssessment = async (finalAnswers: number[]) => {
    setIsSubmitting(true);
    const score = finalAnswers.reduce((a, b) => a + b, 0);
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(getApiUrl('/api/assessments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: activeTest, score })
      });
      setResult(score);
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setActiveTest(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-black tracking-tight text-black dark:text-white">Clinical Assessments</h2>
        <p className="text-black/50 dark:text-white/50">Validated tools to help understand your mental health.</p>
      </header>

      {!activeTest ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white dark:bg-black/20 p-6 md:p-8 rounded-[32px] border border-black/10 dark:border-white/10 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-black dark:text-white">PHQ-9</h3>
            <p className="text-sm md:text-base text-black/50 dark:text-white/50">Patient Health Questionnaire for depression screening.</p>
            <button 
              onClick={() => setActiveTest('PHQ-9')}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold hover:shadow-xl transition-all"
            >
              Start Assessment
            </button>
          </div>
          <div className="bg-white dark:bg-black/20 p-6 md:p-8 rounded-[32px] border border-black/10 dark:border-white/10 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-black dark:text-white">GAD-7</h3>
            <p className="text-sm md:text-base text-black/50 dark:text-white/50">Generalized Anxiety Disorder scale for anxiety screening.</p>
            <button 
              onClick={() => setActiveTest('GAD-7')}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold hover:shadow-xl transition-all"
            >
              Start Assessment
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-black/20 p-6 md:p-12 rounded-[32px] md:rounded-[48px] border border-black/10 dark:border-white/10 shadow-2xl max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {result === null ? (
              <motion.div 
                key="question"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 md:space-y-8"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-30 text-black dark:text-white">
                    Question {currentQuestion + 1} of {activeTest === 'PHQ-9' ? phq9Questions.length : gad7Questions.length}
                  </span>
                  <button onClick={reset} className="text-xs font-bold hover:underline text-black dark:text-white">Cancel</button>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold leading-tight text-black dark:text-white">
                  {activeTest === 'PHQ-9' ? phq9Questions[currentQuestion] : gad7Questions[currentQuestion]}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(opt.value)}
                      className="w-full p-4 md:p-6 text-left border border-black/10 dark:border-white/10 rounded-2xl hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all font-bold text-base md:text-lg text-black dark:text-white"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <h3 className="text-2xl md:text-4xl font-black tracking-tight text-black dark:text-white">Assessment Complete</h3>
                <div className="p-6 md:p-8 bg-neutral-50 dark:bg-white/5 rounded-3xl">
                  <p className="text-xs md:text-sm font-bold uppercase tracking-widest opacity-40 mb-1 text-black dark:text-white">Your Score</p>
                  <p className="text-5xl md:text-6xl font-black text-black dark:text-white">{result}</p>
                </div>
                <div className="flex items-start space-x-3 text-left p-4 md:p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-3xl text-yellow-800 dark:text-yellow-200">
                  <AlertCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                  <p className="text-xs md:text-sm font-medium">
                    This score is for informational purposes and is not a clinical diagnosis. 
                    Please share these results with a mental health professional.
                  </p>
                </div>
                <button 
                  onClick={reset}
                  className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold text-lg md:text-xl"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
