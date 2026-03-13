import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { useAuthStore } from '../store/useAuthStore';
import { useTaskStore } from '../store/useTaskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import api from '../lib/api';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Flame, 
  Target, 
  Clock, 
  ChevronRight,
  Brain,
  Zap,
  Timer
} from 'lucide-react';
import Link from 'next/link';

const Dashboard = () => {
  const { profile, fetchProfile } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchTasks();
    const loadStats = async () => {
      try {
        const { data } = await api.get('/users/dashboard');
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats');
      }
    };
    loadStats();
  }, []);

  if (!profile || !stats) return <div className="p-8">Loading dashboard...</div>;

  const pendingTasks = tasks.filter(t => !t.completed);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">
              Good afternoon, {profile.name}! 👋
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              You've earned <span className="text-indigo-500 font-bold">{stats.user.xp} XP</span> this week. Keep going!
            </p>
          </div>
          <div className="flex gap-3">
             <div className="px-4 py-2 bg-amber-50 rounded-2xl flex items-center gap-2 border border-amber-100">
               <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
               <span className="font-bold text-amber-700">{profile.streak} Day Streak</span>
             </div>
             <div className="px-4 py-2 bg-indigo-50 rounded-2xl flex items-center gap-2 border border-indigo-100">
               <Trophy className="w-5 h-5 text-indigo-500" />
               <span className="font-bold text-indigo-700">Lvl {profile.level}</span>
             </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border dark:border-slate-700">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold dark:text-white">Next Level</h3>
            <p className="text-slate-500 text-sm mb-4">{stats.xpToNextLevel} XP remaining</p>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(1 - stats.xpToNextLevel / 500) * 100}%` }}
                 className="h-full bg-indigo-500 rounded-full"
               />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border dark:border-slate-700">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold dark:text-white">Active Tasks</h3>
            <p className="text-4xl font-black mt-2 dark:text-white">{pendingTasks.length}</p>
            <Link href="/tasks" className="text-sm font-bold text-emerald-600 mt-4 flex items-center gap-1 hover:gap-2 transition-all">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border dark:border-slate-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold dark:text-white">Focus Time</h3>
            <p className="text-4xl font-black mt-2 dark:text-white">02:45 <span className="text-base font-medium text-slate-500">hrs</span></p>
            <p className="text-slate-500 text-sm mt-2">Today's total session time</p>
          </div>
        </div>

        {/* Main Content Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <section className="space-y-4">
            <h2 className="text-xl font-extrabold dark:text-white">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/brain-dump" className="group p-6 bg-slate-900 text-white rounded-[32px] hover:bg-slate-800 transition-colors">
                <Brain className="w-8 h-8 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-lg">Brain Dump</h4>
                <p className="text-slate-400 text-sm mt-1">Clear your mind</p>
              </Link>
              <Link href="/focus" className="group p-6 bg-indigo-600 text-white rounded-[32px] hover:bg-indigo-700 transition-colors">
                <Timer className="w-8 h-8 text-white/80 mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-lg">Focus Mode</h4>
                <p className="text-indigo-100 text-sm mt-1">Start pomodoro</p>
              </Link>
            </div>
          </section>

          {/* Up Next Task */}
          <section className="space-y-4">
            <h2 className="text-xl font-extrabold dark:text-white">Priority Task</h2>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-xl border-l-8 border-indigo-500 flex justify-between items-center group">
              {pendingTasks[0] ? (
                <div>
                   <span className="text-indigo-500 font-bold text-xs uppercase tracking-widest">{pendingTasks[0].category}</span>
                   <h3 className="text-2xl font-black mt-2 dark:text-white">{pendingTasks[0].title}</h3>
                   <p className="text-slate-500 mt-2 font-medium">Part of your overall {profile.neuro_profile === 'adhd' ? 'productivity quest' : 'daily routine'}.</p>
                </div>
              ) : (
                <p className="text-slate-500 font-medium">All caught up! Why not start a focus session?</p>
              )}
              <Link href="/tasks" className="w-14 h-14 bg-indigo-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <ChevronRight className="w-8 h-8" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
