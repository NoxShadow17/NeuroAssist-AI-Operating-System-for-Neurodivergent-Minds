import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/layout/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenTool, 
  Sparkles, 
  Mic, 
  MicOff, 
  Eraser, 
  Copy, 
  Check, 
  Wand2,
  Type,
  AlignLeft,
  MessageSquarePlus,
  ArrowRight,
  Zap,
  RotateCcw
} from 'lucide-react';
import api from '../lib/api';

const WritingSupport = () => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [refinedText, setRefinedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setText(transcript);
        setError(null);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'network') {
          setError('Network error: Speech recognition requires an internet connection.');
        } else if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please check your browser settings.');
        } else {
          setError(`Speech error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    setError(null);
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError('Could not start microphone. Is it already in use?');
      }
    }
  };

  const handleRefine = async (mode) => {
    if (!text.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const { data } = await api.post('/writing/refine', { text, mode });
      setRefinedText(data.refinedText);
    } catch (err) {
      console.error('Failed to refine text');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(refinedText || text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-black dark:text-white flex items-center gap-3">
              <PenTool className="text-indigo-500" />
              Writing Lab
            </h1>
            <p className="text-slate-500 font-medium">Turn messy thoughts into clear communication.</p>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={() => { setText(''); setRefinedText(''); }}
               className="p-3 text-slate-400 hover:text-red-500 rounded-2xl transition-colors"
             >
               <RotateCcw className="w-5 h-5" />
             </button>
             <button 
               onClick={handleCopy}
               className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
             >
               {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
               {copied ? 'Copied!' : 'Copy Result'}
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <AlignLeft className="w-4 h-4" />
                Raw Thoughts
              </h3>
              <button 
                onClick={toggleListening}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black transition-all ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                {isListening ? 'Listening...' : 'Voice Mode'}
              </button>
            </div>
            <div className="relative flex-1 min-h-[400px]">
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setError(null); }}
                placeholder="Start typing your messy thoughts or use Voice Mode... 'I want to say that the project is late but because we had those bugs and I'm really sorry...'"
                className="w-full h-full p-8 bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl shadow-indigo-100/20 dark:shadow-none border-2 border-transparent focus:border-indigo-500 outline-none text-xl font-medium dark:text-white transition-all resize-none"
              />
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-6 left-6 right-6 p-4 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-2xl text-sm font-bold border border-red-200 dark:border-red-800 flex items-center gap-3 backdrop-blur-md"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* AI Refine Side */}
          <div className="flex flex-col space-y-4">
             <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                AI Refinement
             </h3>
             
             <div className="bg-white dark:bg-slate-800 rounded-[40px] border dark:border-slate-700 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[400px]">
                {/* Tools Header */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b dark:border-slate-700 grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleRefine('simplify')}
                    disabled={isProcessing || !text.trim()}
                    className="flex flex-col items-center gap-1 p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all group"
                  >
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter">Simplify</span>
                  </button>


                  <button 
                    onClick={() => handleRefine('expand')}
                    disabled={isProcessing || !text.trim()}
                    className="flex flex-col items-center gap-1 p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all group"
                  >
                    <div className="p-2 bg-amber-50 dark:bg-amber-900 rounded-xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                      <MessageSquarePlus className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter">Expand</span>
                  </button>
                </div>

                {/* Result Area */}
                <div className="flex-1 p-8 relative">
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent animate-spin rounded-full" />
                      <p className="font-bold text-indigo-600 animate-pulse uppercase tracking-[0.2em] text-xs">AI is polishing...</p>
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {refinedText ? (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-xl font-medium dark:text-slate-200 leading-relaxed whitespace-pre-wrap"
                      >
                        {refinedText}
                      </motion.div>
                    ) : (
                      <div key="placeholder" className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 grayscale p-10">
                        <Wand2 className="w-16 h-16 text-indigo-500" />
                        <div>
                          <p className="text-xl font-bold">Waiting for your magic</p>
                          <p className="text-sm font-medium">Select a tool above to refine your writing</p>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WritingSupport;
