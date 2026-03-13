import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTaskStore } from '../../store/useTaskStore';
import { Play, Pause, RotateCcw, X, Heart } from 'lucide-react';
import api from '../../lib/api';

const OverwhelmOverlay = () => {
  const { overwhelmMode, toggleOverwhelmMode } = useSettingsStore();
  const { tasks } = useTaskStore();
  const [encouragement, setEncouragement] = useState('Take a deep breath. You are doing great.');
  const [timer, setTimer] = useState(120); // 2 minute calming timer
  const [timerRunning, setTimerRunning] = useState(true);

  const nextTask = tasks.find(t => !t.completed);

  useEffect(() => {
    if (overwhelmMode) {
      setTimer(120);
      setTimerRunning(true);
      fetchEncouragement();
    }
  }, [overwhelmMode]);

  useEffect(() => {
    let interval;
    if (overwhelmMode && timerRunning && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [overwhelmMode, timerRunning, timer]);

  const fetchEncouragement = async () => {
    try {
      const { data } = await api.get('/companion/encourage');
      setEncouragement(data.message);
    } catch (err) {
      console.error('Failed to fetch encouragement');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {overwhelmMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-indigo-50/95 flex flex-col items-center justify-center p-8 text-indigo-900"
        >
          <button 
            onClick={toggleOverwhelmMode}
            className="absolute top-8 right-8 p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="max-w-2xl w-full flex flex-col items-center text-center space-y-12"
          >
            <div className="space-y-4">
              <Heart className="w-16 h-16 text-indigo-500 animate-pulse mx-auto" />
              <h1 className="text-4xl font-bold tracking-tight">Focus on this one thing.</h1>
              <p className="text-xl text-indigo-400 font-medium italic">"{encouragement}"</p>
            </div>

            <div className="w-full p-12 bg-white rounded-[40px] shadow-xl border-4 border-indigo-200">
              {nextTask ? (
                <div className="space-y-6">
                  <span className="px-4 py-1.5 bg-indigo-100 text-indigo-600 rounded-full text-sm font-bold uppercase tracking-wider">Your Next Step</span>
                  <h2 className="text-4xl font-extrabold">{nextTask.title}</h2>
                  {nextTask.task_steps?.[0] && (
                    <div className="p-6 bg-indigo-50 rounded-2xl border-2 border-dashed border-indigo-200">
                      <p className="text-lg font-medium text-indigo-600">Mini-step: {nextTask.task_steps[0].step_text}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold">No pending tasks!</h2>
                  <p className="text-indigo-500">Just breathe and enjoy the silence.</p>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="text-7xl font-mono font-bold tracking-tighter tabular-nums">
                {formatTime(timer)}
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="p-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  {timerRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </button>
                <button 
                   onClick={() => setTimer(120)}
                   className="p-4 bg-white text-indigo-600 rounded-full border-2 border-indigo-200 hover:bg-indigo-50 transition-colors"
                >
                  <RotateCcw className="w-8 h-8" />
                </button>
              </div>
            </div>
          </motion.div>

          <div className="absolute bottom-12 text-indigo-300 font-medium tracking-wide">
            NEUROASSIST CALM SPACE
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OverwhelmOverlay;
