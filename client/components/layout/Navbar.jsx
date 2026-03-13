import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Brain, Bell, Settings, LogOut, User, AlertCircle } from 'lucide-react';

const Navbar = () => {
  const { profile, signOut } = useAuthStore();
  const { overwhelmMode, toggleOverwhelmMode } = useSettingsStore();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-background border-b dark:border-slate-800 z-40 px-4 md:px-8 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <Brain className="w-8 h-8 text-indigo-500" />
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          NeuroAssist
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Overwhelm Button */}
        <button
          onClick={toggleOverwhelmMode}
          className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all ${
            overwhelmMode 
              ? 'bg-purple-600 text-white shadow-lg' 
              : 'bg-red-50 text-red-600 hover:bg-red-100'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          {overwhelmMode ? "I'm Okay Now" : "I'm Overwhelmed"}
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

        {profile && (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-medium dark:text-slate-200">{profile.name}</span>
              <span className="text-xs text-slate-500">Lvl {profile.level} | {profile.xp} XP</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-indigo-200">
              {profile.name?.[0]?.toUpperCase()}
            </div>
            <button 
              onClick={signOut}
              className="p-2 text-slate-500 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
