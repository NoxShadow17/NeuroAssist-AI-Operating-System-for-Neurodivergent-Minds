import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/layout/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer as TimerIcon, 
  Coffee, 
  RotateCcw, 
  Play, 
  Pause, 
  Zap, 
  Award,
  CircleDot,
  History,
  TrendingUp
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/api';

import { useRouter } from 'next/router';

const FocusTimer = () => {
  const router = useRouter();
  const { task } = router.query;
  const { profile, fetchProfile } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // focus, break
  const [sessions, setSessions] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const fetchSessions = async () => {
    try {
      const { data } = await api.get('/focus-sessions');
      setSessions(data);
    } catch (err) {
      console.error('Failed to fetch sessions');
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const handleComplete = async () => {
    setIsActive(false);
    if (mode === 'focus') {
      try {
        await api.post('/focus-sessions', { duration: 25, session_type: 'focus' });
        fetchProfile();
        fetchSessions();
        alert('Focus session complete! +30 XP gained.');
        setMode('break');
        setTimeLeft(5 * 60);
      } catch (err) {
        console.error('Failed to log session');
      }
    } else {
      setMode('focus');
      setTimeLeft(25 * 60);
      alert('Break over! Let\'s get back to it.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20">
        
        {/* Timer Column */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-12">
          <div className="flex gap-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-3xl w-fit">
             <button 
               onClick={() => { setMode('focus'); setTimeLeft(25*60); setIsActive(false); }}
               className={`px-8 py-3 rounded-2xl font-bold transition-all ${mode === 'focus' ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600' : 'text-slate-500'}`}
             >
               Focus Session
             </button>
             <button 
               onClick={() => { setMode('break'); setTimeLeft(5*60); setIsActive(false); }}
               className={`px-8 py-3 rounded-2xl font-bold transition-all ${mode === 'break' ? 'bg-white dark:bg-slate-700 shadow-md text-emerald-600' : 'text-slate-500'}`}
             >
               Short Break
             </button>
          </div>

          <div className="relative group">
            <motion.div 
               animate={{ scale: isActive ? 1.05 : 1 }}
               className={`w-80 h-80 md:w-[450px] md:h-[450px] rounded-full flex flex-col items-center justify-center border-[16px] transition-colors ${
                 mode === 'focus' ? 'border-indigo-500 shadow-[0_0_60px_-15px_rgba(99,102,241,0.3)]' : 'border-emerald-500 shadow-[0_0_60px_-15px_rgba(16,185,129,0.3)]'
               } bg-white dark:bg-slate-900`}
            >
               <span className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
                 {mode === 'focus' ? 'Time to Focus' : 'Take a Breath'}
               </span>
               {task && (
                 <h3 className="text-lg font-bold text-indigo-500 mb-4 animate-pulse">
                   Target: {task}
                 </h3>
               )}
               <h2 className="text-8xl md:text-9xl font-black tabular-nums tracking-tighter dark:text-white">
                 {formatTime(timeLeft)}
               </h2>
               <div className="flex items-center gap-2 mt-4 text-indigo-500 font-bold">
                 <Zap className="w-5 h-5 fill-indigo-500" />
                 <span>+30 XP on completion</span>
               </div>
            </motion.div>

            {/* Floaties */}
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center border dark:border-slate-700">
               {mode === 'focus' ? <TimerIcon className="text-indigo-500" /> : <Coffee className="text-emerald-500" />}
            </div>
          </div>

          <div className="flex items-center gap-8">
             <button 
               onClick={resetTimer}
               className="p-5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
             >
               <RotateCcw className="w-8 h-8" />
             </button>
             <button 
               onClick={toggleTimer}
               className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl transition-all hover:scale-105 ${
                 isActive ? 'bg-slate-900 shadow-slate-200' : mode === 'focus' ? 'bg-indigo-600 shadow-indigo-200' : 'bg-emerald-600 shadow-emerald-200'
               }`}
             >
               {isActive ? <Pause className="w-10 h-10 fill-white" /> : <Play className="w-10 h-10 fill-white ml-2" />}
             </button>
             <div className="w-16 h-16" /> {/* Spacer */}
          </div>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-5 space-y-8">
           <section className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-sm border dark:border-slate-700">
             <h3 className="text-xl font-black mb-6 flex items-center gap-3 dark:text-white">
               <TrendingUp className="text-indigo-500" />
               Daily Progress
             </h3>
             <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <div>
                     <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Sessions Today</p>
                     <p className="text-4xl font-black dark:text-white">{sessions.filter(s => s.date === new Date().toISOString().split('T')[0]).length}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Total XP</p>
                     <p className="text-4xl font-black text-indigo-500">+{sessions.reduce((acc, s) => acc + (s.xp_gained || 30), 0)}</p>
                   </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                   {[...Array(7)].map((_, i) => (
                     <div key={i} className={`h-12 rounded-lg flex items-center justify-center text-[10px] font-black ${i === 4 ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-400'}`}>
                       {"MTWTFSS"[i]}
                     </div>
                   ))}
                </div>
             </div>
           </section>

           <section className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-sm border dark:border-slate-700 flex-1">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3 dark:text-white">
                <History className="text-slate-400" />
                Recent History
              </h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {sessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${s.session_type === 'focus' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                           {s.session_type === 'focus' ? <CircleDot className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm dark:text-slate-200">{s.session_type === 'focus' ? 'Deep Work' : 'Break Time'}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{new Date(s.created_at).toLocaleTimeString()}</p>
                        </div>
                     </div>
                     <span className="text-xs font-black text-indigo-500">+{s.xp_gained} XP</span>
                  </div>
                ))}
                {sessions.length === 0 && <p className="text-center text-slate-400 py-10 font-medium">No sessions logged yet.</p>}
              </div>
           </section>
        </div>

      </div>
    </Layout>
  );
};

export default FocusTimer;
