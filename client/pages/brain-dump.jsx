import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, 
  Send, 
  Bot, 
  RefreshCw, 
  Save, 
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import api from '../lib/api';
import { useTaskStore } from '../store/useTaskStore';

import { useRouter } from 'next/router';

const BrainDump = () => {
  const router = useRouter();
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const { addTask } = useTaskStore();

  const handleProcess = async () => {
    if (!text.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const { data } = await api.post('/brain-dump', { text });
      setResult(data.data.organized_output);
    } catch (err) {
      console.error('Failed to process brain dump');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartNow = async (taskTitle) => {
    if (!taskTitle) return;
    await addTask({ 
      title: taskTitle, 
      category: 'Focus', 
      priority: 'high' 
    });
    router.push(`/focus?task=${encodeURIComponent(taskTitle)}`);
  };

  const handleSaveTasks = async () => {
    if (!result) return;
    
    // Aggregating all tasks from all categories
    const allTasks = result.categories.flatMap(c => 
      c.tasks.map(t => ({ ...t, category_name: c.name }))
    );

    // Defining priority ranks
    const priorityOrder = { high: 0, medium: 1, low: 2 };

    // Sorting by priority
    const sortedTasks = allTasks.sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    for (const t of sortedTasks) {
      await addTask({ 
        title: t.title, 
        category: t.category_name || 'Imported', 
        priority: t.priority 
      });
    }

    setResult(null);
    setText('');
    alert('Tasks saved to your planner in order of priority!');
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <header className="text-center space-y-2">
          <div className="w-16 h-16 bg-slate-900 dark:bg-slate-800 rounded-[32px] flex items-center justify-center mx-auto mb-4">
            <BrainCircuit className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-black dark:text-white">Brain Dump Organizer</h1>
          <p className="text-slate-500 text-lg font-medium">Get the thoughts out of your head and into a plan.</p>
        </header>

        <section className="bg-white dark:bg-slate-800 p-8 rounded-[48px] shadow-2xl shadow-indigo-100 dark:shadow-none border dark:border-slate-700">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Just type everything... 'I need to clean my room, get groceries, finish the report, and call my mom. I'm also worried about the meeting...'"
            className="w-full h-48 bg-transparent text-xl font-medium outline-none resize-none dark:text-white transition-all"
          />
          <div className="flex justify-between items-center mt-6 pt-6 border-t dark:border-slate-700">
            <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI will categorize, prioritize, and schedule these for you.
            </p>
            <button
              onClick={handleProcess}
              disabled={!text.trim() || isProcessing}
              className="flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Organize Thoughts
            </button>
          </div>
        </section>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="bg-indigo-600 p-8 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-indigo-300" />
                    Here's Your Plan
                  </h2>
                  <p className="text-indigo-100 font-medium opacity-90">{result.encouragement}</p>
                </div>
                <button 
                  onClick={handleSaveTasks}
                  className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black shadow-lg hover:scale-105 transition-transform whitespace-nowrap"
                >
                  Save to Planner
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Categories & Tasks */}
                 <div className="space-y-6">
                   <h3 className="text-xl font-black dark:text-white flex items-center gap-3">
                     <Save className="w-6 h-6 text-emerald-500" />
                     Categorized Tasks
                   </h3>
                   {result.categories.map((cat, i) => (
                     <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border dark:border-slate-700 shadow-sm">
                       <div className="flex items-center gap-2 mb-4">
                         <span className="text-2xl">{cat.emoji}</span>
                         <h4 className="font-extrabold text-lg dark:text-white">{cat.name}</h4>
                       </div>
                       <div className="space-y-2">
                         {cat.tasks.map((task, j) => (
                           <div key={j} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                             <div className="flex items-center gap-2">
                               <CheckCircle2 className="w-4 h-4 text-slate-300" />
                               <span className="font-semibold text-sm dark:text-slate-300">{task.title}</span>
                             </div>
                             <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md ${
                               task.priority === 'high' ? 'bg-red-100 text-red-600' : 
                               task.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                             }`}>
                               {task.priority}
                             </span>
                           </div>
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>

                 {/* Top Priority & Schedule */}
                 <div className="space-y-8">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-8 rounded-[40px] border-2 border-amber-200 border-dashed">
                      <h4 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-3">One Step at a Time</h4>
                      <h3 className="text-2xl font-black text-amber-900 dark:text-amber-200">
                        {(() => {
                          const allTasks = result.categories.flatMap(c => c.tasks);
                          const highPriorityTask = allTasks.find(t => t.priority === 'high');
                          // If there's a high priority task that isn't the AI's topPriority, we might want to prioritize it
                          // but usually the AI is good if prompted. This is a safe fallback.
                          return highPriorityTask ? highPriorityTask.title : result.topPriority;
                        })()}
                      </h3>
                      <button 
                        onClick={() => {
                          const allTasks = result.categories.flatMap(c => c.tasks);
                          const highPriorityTask = allTasks.find(t => t.priority === 'high');
                          const targetTask = highPriorityTask ? highPriorityTask.title : result.topPriority;
                          handleStartNow(targetTask);
                        }}
                        className="mt-6 flex items-center gap-2 font-bold text-amber-600 hover:gap-3 transition-all"
                      >
                        Start this now <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border dark:border-slate-700">
                      <h3 className="text-xl font-black dark:text-white flex items-center gap-3 mb-6">
                        <Clock className="w-6 h-6 text-indigo-500" />
                        Suggested Schedule
                      </h3>
                      <div className="space-y-6">
                        {result.suggestedSchedule.map((sched, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="flex flex-col items-center">
                               <div className="w-3 h-3 rounded-full bg-indigo-500" />
                               {i < result.suggestedSchedule.length - 1 && <div className="w-0.5 h-full bg-indigo-100 dark:bg-indigo-900" />}
                            </div>
                            <div className="pb-6">
                              <h5 className="font-black text-indigo-600 mb-2 uppercase text-xs tracking-widest">{sched.time}</h5>
                              <div className="flex flex-wrap gap-2">
                                {sched.tasks.map((t, j) => (
                                  <span key={j} className="px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm font-medium border dark:border-slate-700">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default BrainDump;
