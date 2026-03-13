import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, Check, Sparkles, AlertCircle, Layout, Eye, Volume2 } from 'lucide-react';
import { useRouter } from 'next/router';
import api from '../lib/api';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

const questions = [
  {
    id: 1,
    text: "Do large, complex task lists often feel overwhelming or paralyzing?",
    options: [
      { label: "Yes, all the time", score: { adhd: 3, executive: 3 } },
      { label: "Sometimes", score: { adhd: 1, executive: 1 } },
      { label: "Rarely", score: { adhd: 0 } }
    ]
  },
  {
    id: 2,
    text: "Do you struggle with starting tasks, even when you know they're important?",
    options: [
      { label: "Always", score: { adhd: 3, executive: 2 } },
      { label: "Often", score: { adhd: 2, executive: 1 } },
      { label: "Not really", score: { adhd: 0 } }
    ]
  },
  {
    id: 3,
    text: "Do you find yourself 'zoning out' or getting distracted by small details?",
    options: [
      { label: "Yes", score: { adhd: 3, autism: 1 } },
      { label: "No", score: { adhd: 0 } }
    ]
  },
  {
    id: 4,
    text: "Does bright light, loud noise, or crowded UIs bother you?",
    options: [
      { label: "Significantly", score: { autism: 3 } },
      { label: "A little", score: { autism: 1 } },
      { label: "Not at all", score: { autism: 0 } }
    ]
  },
  {
    id: 5,
    text: "Do you often find letters 'dancing' or shifting when reading long texts?",
    options: [
      { label: "Often", score: { dyslexia: 3 } },
      { label: "Rarely", score: { dyslexia: 1 } },
      { label: "Never", score: { dyslexia: 0 } }
    ]
  }
];

const Onboarding = () => {
  const [step, setStep] = useState(0); // 0: Welcome, 1: Quiz, 2: Result
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({ adhd: 0, autism: 0, dyslexia: 0, executive: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleAnswer = (score) => {
    const newScores = { ...scores };
    Object.keys(score).forEach(key => {
      newScores[key] += score[key];
    });
    setScores(newScores);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setStep(2);
    }
  };

  const determineProfile = () => {
    const max = Math.max(scores.adhd, scores.autism, scores.dyslexia);
    if (max === 0) return 'mixed';
    if (scores.adhd === max) return 'adhd';
    if (scores.autism === max) return 'autism';
    if (scores.dyslexia === max) return 'dyslexia';
    return 'mixed';
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    const profile = determineProfile();
    const settings = {
      motion_reduction: scores.autism > 2,
      dyslexia_font: scores.dyslexia > 2,
      task_granularity: scores.adhd > 2 || scores.executive > 2 ? 'micro' : 'normal',
      notification_frequency: scores.adhd > 2 ? 'high' : 'normal'
    };

    try {
      await api.post('/users/onboarding', { neuro_profile: profile, settings });
      // Important: fetch the updated profile so the _app guard knows we're done
      await useAuthStore.getState().fetchProfile();
      // No manual redirect needed, _app.jsx handles it
    } catch (err) {
      console.error('Onboarding update failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-[48px] shadow-2xl overflow-hidden border">
        
        {/* Progress Bar */}
        {step === 1 && (
          <div className="h-2 w-full bg-slate-100">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(currentQuestion / questions.length) * 100}%` }}
              className="h-full bg-indigo-600"
            />
          </div>
        )}

        <div className="p-12">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-8"
              >
                <div className="w-20 h-20 bg-slate-900 rounded-[32px] flex items-center justify-center mx-auto">
                  <Brain className="w-10 h-10 text-indigo-400" />
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl font-black text-slate-900 leading-tight">Welcome to NeuroAssist</h1>
                  <p className="text-slate-500 font-medium text-lg">Let's tailor your experience to match how your brain works best. It only takes a minute.</p>
                </div>
                <button 
                  onClick={() => setStep(1)}
                  className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xl shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Start Discovery <ArrowRight />
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div 
                key="quiz"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="space-y-2">
                   <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Discovery Question {currentQuestion + 1}</span>
                   <h2 className="text-2xl font-black text-slate-900 leading-snug">{questions[currentQuestion].text}</h2>
                </div>
                <div className="space-y-4">
                  {questions[currentQuestion].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt.score)}
                      className="w-full p-6 bg-slate-50 hover:bg-indigo-50 border-2 border-transparent hover:border-indigo-200 rounded-3xl text-left font-bold text-slate-700 transition-all flex items-center justify-between group"
                    >
                      {opt.label}
                      <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Check className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
              >
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                   <Sparkles className="w-12 h-12 text-emerald-600" />
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl font-black text-slate-900">Discovery Complete!</h1>
                  <p className="text-slate-500 font-medium">We've identified your cognitive preferences and prepared a custom layout just for you.</p>
                </div>
                
                <div className="bg-indigo-50 p-6 rounded-[32px] text-left space-y-4 border border-indigo-100">
                   <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500">Applied Enhancements</h4>
                   <div className="grid grid-cols-2 gap-3">
                      {scores.adhd > 2 && <div className="flex items-center gap-2 text-sm font-bold text-indigo-700"><Check className="w-4 h-4" /> Micro-tasks</div>}
                      {scores.autism > 2 && <div className="flex items-center gap-2 text-sm font-bold text-indigo-700"><Check className="w-4 h-4" /> Static UI</div>}
                      {scores.dyslexia > 2 && <div className="flex items-center gap-2 text-sm font-bold text-indigo-700"><Check className="w-4 h-4" /> Dyslexic Font</div>}
                      <div className="flex items-center gap-2 text-sm font-bold text-indigo-700"><Check className="w-4 h-4" /> AI Companion</div>
                   </div>
                </div>

                <button 
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xl shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                >
                  {isSubmitting ? "Setting Up..." : "Enter My Workspace"} <ArrowRight />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
