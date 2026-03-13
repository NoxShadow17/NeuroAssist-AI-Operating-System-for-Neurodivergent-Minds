import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Eye, 
  Volume2, 
  Zap, 
  Palette, 
  Monitor, 
  Accessibility,
  Save,
  Bell,
  CheckCircle2,
  Trash2,
  Brain
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import api from '../lib/api';

const Settings = () => {
  const { profile, fetchProfile, updateProfile, updateProfileLocal, signOut } = useAuthStore();
  const { settings, fetchSettings, updateSettings } = useSettingsStore();
  const [localSettings, setLocalSettings] = useState(null);
  const [localProfile, setLocalProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "EXTREMELY IMPORTANT:\n\nThis will permanently delete your account and ALL your data (tasks, focus sessions, XP, and settings).\n\nThis action cannot be undone. Are you absolutely sure?"
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await api.delete('/users/profile');
      alert('Your account has been permanently deleted.');
      signOut();
    } catch (err) {
      console.error('Failed to delete account:', err);
      alert('Failed to delete account. Please try again or contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (profile) setLocalProfile(profile);
  }, [profile]);

  const handleUpdateSettings = (field, value) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = (field, value) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        updateSettings(localSettings),
        updateProfile(localProfile)
      ]);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings');
      alert('Failed to save some settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile || !localSettings || !localProfile) return <div className="p-8">Loading settings...</div>;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black dark:text-white">Sensory Settings</h1>
            <p className="text-slate-500 font-medium">Tailor NeuroAssist to your unique cognitive style.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? <Zap className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Preferences
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Account Panel */}
          <aside className="lg:col-span-1 space-y-8">
             <section className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border dark:border-slate-700 shadow-sm">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-3xl font-black text-indigo-600 mx-auto mb-4 border-4 border-indigo-50 overflow-hidden">
                  {localProfile.avatar && localProfile.avatar !== 'default' ? (
                    <img src={localProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    localProfile.name?.[0]?.toUpperCase()
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <input 
                      type="text"
                      value={localProfile.name}
                      onChange={(e) => handleUpdateProfile('name', e.target.value)}
                      className="text-xl font-bold dark:text-white bg-transparent border-b border-transparent focus:border-indigo-500 outline-none text-center w-full"
                    />
                    <p className="text-slate-400 text-sm font-medium">{profile.email}</p>
                  </div>

                  <div className="pt-2">
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 text-center">Avatar URL</label>
                    <input 
                      type="text"
                      placeholder="https://..."
                      value={localProfile.avatar === 'default' ? '' : localProfile.avatar}
                      onChange={(e) => handleUpdateProfile('avatar', e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs font-medium outline-none border dark:border-slate-700 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <div className="inline-block px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black rounded-full uppercase tracking-widest">
                    {profile.neuro_profile} Mode Active
                  </div>
                </div>
             </section>

             <div className="bg-slate-900 p-8 rounded-[40px] text-white">
                <Palette className="w-8 h-8 text-indigo-400 mb-4" />
                <h4 className="font-bold text-lg">Visual Theme</h4>
                <p className="text-sm text-slate-400 mt-1 mb-6">Choose an atmosphere that helps you focus.</p>
                <div className="grid grid-cols-2 gap-3">
                   {['calm-blue', 'indigo-night', 'forest-green', 'sunset'].map((t) => (
                     <button 
                        key={t}
                        onClick={() => {
                          handleUpdateProfile('theme', t);
                          updateProfileLocal({ theme: t });
                        }}
                        className={`p-3 rounded-xl border font-bold text-xs truncate transition-all ${localProfile.theme === t ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                     >
                       {t.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                     </button>
                   ))}
                </div>
             </div>
          </aside>

          {/* Detailed Settings Panel */}
          <main className="lg:col-span-2 space-y-8">
            {/* Neuro-Identity Selection */}
            <section className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border dark:border-slate-700 shadow-sm">
               <div className="flex items-center gap-3 mb-2">
                 <Brain className="w-6 h-6 text-indigo-500" />
                 <h2 className="text-xl font-black dark:text-white">Neuro-Identity</h2>
               </div>
               <p className="text-sm text-slate-400 mb-8 font-medium">Changed your mind? Switch your profile to retune the AI assistants.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   { id: 'adhd', label: 'ADHD', desc: 'Shorter steps, high-energy encouragement. ⚡' },
                   { id: 'autism', label: 'Autism', desc: 'Literal instructions, zero ambiguity logic. 🧩' },
                   { id: 'dyslexia', label: 'Dyslexia', desc: 'Simple vocabulary, clear headings, short text. 📖' },
                   { id: 'mixed', label: 'Mixed', desc: 'Balanced approach with supportive guidance. 🧠' }
                 ].map((p) => (
                   <button 
                     key={p.id}
                     onClick={() => handleUpdateProfile('neuro_profile', p.id)}
                     className={`p-6 rounded-3xl border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                       localProfile.neuro_profile === p.id 
                         ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' 
                         : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200'
                     }`}
                   >
                     <div className="flex items-center justify-between mb-2">
                        <h4 className="font-black dark:text-white uppercase tracking-wider text-sm">{p.label}</h4>
                        {localProfile.neuro_profile === p.id && (
                          <div className="p-1 bg-indigo-500 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                        )}
                     </div>
                     <p className="text-[10px] text-slate-500 leading-relaxed font-bold">{p.desc}</p>
                   </button>
                 ))}
               </div>
            </section>

            {/* Accessibility */}
            <section className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border dark:border-slate-700 shadow-sm">
               <div className="flex items-center gap-3 mb-8">
                 <Accessibility className="w-6 h-6 text-emerald-500" />
                 <h2 className="text-xl font-black dark:text-white">Cognitive Accessibility</h2>
               </div>
               
               <div className="space-y-8">
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="font-bold dark:text-white">Dyslexic-Friendly Font</p>
                       <p className="text-xs text-slate-400">Enable OpenDyslexic across the app.</p>
                    </div>
                    <button 
                      onClick={() => handleUpdateSettings('dyslexia_font', !localSettings.dyslexia_font)}
                      className={`w-14 h-7 rounded-full transition-colors relative ${localSettings.dyslexia_font ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                      <motion.div 
                        animate={{ x: localSettings.dyslexia_font ? 32 : 4 }}
                        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
                      />
                    </button>
                 </div>

                    <div>
                       <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Task Granularity</label>
                       <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border dark:border-slate-700/50">
                          {['micro', 'normal', 'macro'].map((val) => (
                            <button
                              key={val}
                              onClick={() => handleUpdateSettings('task_granularity', val)}
                              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                                localSettings.task_granularity === val 
                                  ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' 
                                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                              }`}
                            >
                              {val === 'micro' ? 'Micro' : val === 'normal' ? 'Normal' : 'High'}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>
            </section>

             {/* Danger Zone */}
             <section className="bg-red-50 dark:bg-red-900/10 p-8 rounded-[40px] border border-red-100 dark:border-red-900/30 shadow-sm">
               <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-red-600">Danger Zone</h3>
                    <p className="text-sm text-red-500/70 font-medium">Permanently delete your account and all data.</p>
                  </div>
                  <button 
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="px-6 py-3 bg-white dark:bg-slate-950 text-red-600 rounded-2xl font-bold shadow-sm border border-red-100 dark:border-red-900/30 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                  >
                    {isDeleting ? "Wiping..." : "Delete Account"}
                  </button>
               </div>
             </section>
          </main>
        </div>
      </div>
    </Layout>
  );
};
export default Settings;
