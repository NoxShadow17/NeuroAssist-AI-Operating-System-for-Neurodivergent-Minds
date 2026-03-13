import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import { Brain, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (isLogin) {
        result = await supabase.auth.signInWithPassword({ email, password });
      } else {
        result = await supabase.auth.signUp({ email, password });
      }

      const { data, error } = result;

      if (error) {
        console.error('Supabase Auth Error:', error.message, error.status);
        throw error;
      }
      
      console.log('Auth Success:', data);
      // No manual redirect needed, _app.jsx handles it
    } catch (err) {
      if (err.message === 'Email not confirmed') {
        setError('Please check your email to confirm your account, or disable "Email Confirmation" in your Supabase Dashboard settings.');
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 md:p-8">
      {/* Decorative background elements for mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none lg:hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl overflow-hidden border dark:border-slate-800">
        {/* Left side: Hero - Visible on Desktop */}
        <div className="hidden lg:flex bg-slate-900 items-center justify-center p-20 relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -ml-48 -mb-48" />
          
          <div className="relative z-10 max-w-lg space-y-12">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
                <Brain className="w-10 h-10 text-indigo-600" />
              </div>
              <span className="text-3xl font-black tracking-tight">NeuroAssist</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-6xl font-black leading-tight">
                An OS for your <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">unique mind.</span>
              </h1>
              <p className="text-xl text-slate-400 font-medium leading-relaxed">
                Designed specifically for ADHD, Autism, and Dyslexia. 
                Reduce overwhelm with AI-powered task decomposition.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <Sparkles className="text-indigo-400 mb-2" />
                  <p className="text-sm font-bold">AI Decomposer</p>
                  <p className="text-xs text-slate-500 mt-1">Break big goals into tiny wins.</p>
               </div>
               <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <Brain className="text-purple-400 mb-2" />
                  <p className="text-sm font-bold">Brain Organizer</p>
                  <p className="text-xs text-slate-500 mt-1">Messy thoughts to structured plans.</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right side: Auth Form */}
        <div className="flex items-center justify-center p-8 md:p-16 bg-white dark:bg-slate-900">
          <div className="w-full max-w-md space-y-10">
            {/* Mobile Logo */}
            <div className="lg:hidden flex flex-col items-center gap-4 mb-8">
              <div className="w-20 h-20 bg-slate-900 rounded-[32px] flex items-center justify-center shadow-xl">
                <Brain className="w-10 h-10 text-indigo-400" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">NeuroAssist</h1>
            </div>

            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-500 font-medium">
                {isLogin ? "Ready to find your focus?" : "Start your neuro-inclusive journey today."}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 italic">
                  ⚠️ {error}
                </div>
              )}
              
              <div className="space-y-3">
                <div className="relative group">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                   <input 
                     type="email" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required 
                     placeholder="Email address"
                     className="w-full p-4 pl-12 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold dark:text-white" 
                   />
                </div>
                <div className="relative group">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                   <input 
                     type="password" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required 
                     placeholder="Password"
                     className="w-full p-4 pl-12 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold dark:text-white" 
                   />
                </div>
              </div>

              <button 
                 type="submit"
                 disabled={loading}
                 className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
              >
                {loading ? "Aligning stars..." : isLogin ? "Sign In" : "Get Started"} <ArrowRight />
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-black text-slate-300 bg-white dark:bg-slate-900 px-4">OR</div>
            </div>

            <div className="flex flex-col gap-4">
               <button 
                type="button" 
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm"
               >
                  <Sparkles className="w-5 h-5 text-indigo-500" /> Continue with Google
               </button>
            </div>

            <p className="text-center font-bold text-slate-500 text-sm">
              {isLogin ? "New here?" : "Already a member?"}{' '}
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-600 dark:text-indigo-400 font-black hover:underline underline-offset-4"
              >
                {isLogin ? 'Create free account' : 'Sign in here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
