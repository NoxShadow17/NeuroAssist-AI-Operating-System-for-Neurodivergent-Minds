import React from 'react';
import Head from 'next/head';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import OverwhelmOverlay from './OverwhelmOverlay';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
  const { overwhelmMode, settings, dyslexiaMode } = useSettingsStore();
  const { profile } = useAuthStore();

  const theme = overwhelmMode ? 'overwhelm' : (profile?.theme || 'indigo-night');

  return (
    <div 
      data-theme={theme}
      className={`min-h-screen bg-background text-foreground transition-colors duration-500 
        ${settings?.dark_mode ? 'dark' : ''} 
        ${dyslexiaMode ? 'dyslexic-font' : ''}`}
    >
      <Head>
        <title>NeuroAssist | AI Operating System for Neurodivergent Minds</title>
        <meta name="description" content="AI-powered assistant for ADHD, Autism, Dyslexia and Executive Dysfunction" />
      </Head>

      <Navbar />
      
      <div className="flex pt-16">
        <Sidebar className="hidden md:block" />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={overwhelmMode ? 'overwhelm' : 'normal'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <OverwhelmOverlay />
    </div>
  );
};

export default Layout;
