import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Type, 
  AlignLeft, 
  Volume2, 
  Highlighter, 
  Settings2,
  Play,
  Pause,
  Maximize2
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';

const ReadingMode = () => {
  const [text, setText] = useState('');
  const [isReadingMode, setIsReadingMode] = useState(false);
  const { dyslexiaMode } = useSettingsStore();
  const [readerDyslexiaFont, setReaderDyslexiaFont] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [letterSpacing, setLetterSpacing] = useState(0.12);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Initialize local font based on global setting but allow local override
  useEffect(() => {
    setReaderDyslexiaFont(dyslexiaMode);
  }, [dyslexiaMode]);

  const toggleDyslexia = () => setReaderDyslexiaFont(!readerDyslexiaFont);

  const handleSpeak = () => {
    if (!text) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black dark:text-white">Dyslexia Reading Mode</h1>
            <p className="text-slate-500 font-medium">Transform any text into a more comfortable reading experience.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSpeak}
              className={`p-4 rounded-2xl transition-all shadow-lg ${isSpeaking ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
              {isSpeaking ? <Pause /> : <Volume2 />}
            </button>
            <button 
              onClick={() => setIsReadingMode(!isReadingMode)}
              className={`px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${isReadingMode ? 'bg-slate-900 text-white' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white'}`}
            >
              {isReadingMode ? 'Exit Reader' : 'Toggle Fullscreen'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <aside className="lg:col-span-1 space-y-6">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border dark:border-slate-700">
               <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                 <Settings2 className="w-4 h-4" /> Text Settings
               </h3>
               
               <div className="space-y-8">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-bold dark:text-white">Dyslexic Font</span>
                    <button 
                      onClick={toggleDyslexia}
                      className={`w-12 h-6 rounded-full transition-colors relative ${readerDyslexiaFont ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                      <motion.div 
                        animate={{ x: readerDyslexiaFont ? 26 : 2 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                 </div>

                 <div className="space-y-3">
                   <div className="flex justify-between text-xs font-bold text-slate-400">
                     <span>TEXT SIZE</span>
                     <span>{fontSize}px</span>
                   </div>
                   <input 
                     type="range" min="14" max="42" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))}
                     className="w-full accent-indigo-600"
                   />
                 </div>

                 <div className="space-y-3">
                   <div className="flex justify-between text-xs font-bold text-slate-400">
                     <span>LINE HEIGHT</span>
                     <span>{lineHeight}</span>
                   </div>
                   <input 
                     type="range" min="1.2" max="3" step="0.1" value={lineHeight} onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                     className="w-full accent-indigo-600"
                   />
                 </div>

                 <div className="space-y-3">
                   <div className="flex justify-between text-xs font-bold text-slate-400">
                     <span>CHARACTER SPACING</span>
                     <span>{letterSpacing}em</span>
                   </div>
                   <input 
                     type="range" min="0" max="0.5" step="0.01" value={letterSpacing} onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
                     className="w-full accent-indigo-600"
                   />
                 </div>
               </div>
             </div>

             <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-[32px] text-white">
                <Highlighter className="w-8 h-8 mb-4 opacity-50" />
                <h4 className="font-black text-lg">Pro Tip</h4>
                <p className="text-sm text-amber-50 font-medium mt-1 leading-relaxed">
                  The OpenDyslexic font uses heavy bottoms to give letters "gravity" and prevent them from rotating in your mind.
                </p>
             </div>
          </aside>

          {/* Reader Area */}
          <section className="lg:col-span-3 space-y-6">
             {!isReadingMode && (
               <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-sm border dark:border-slate-700">
                 <textarea 
                   value={text}
                   onChange={(e) => setText(e.target.value)}
                   placeholder="Paste your text here (news articles, assignments, emails...)"
                   className="w-full h-80 bg-transparent text-xl outline-none resize-none dark:text-white"
                 />
               </div>
             )}

             {isReadingMode && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className={`bg-white dark:bg-slate-800 p-12 md:p-20 rounded-[48px] shadow-2xl border dark:border-slate-700 overflow-y-auto max-h-[80vh] ${readerDyslexiaFont ? 'dyslexic-font' : ''}`}
                 style={{
                   fontSize: `${fontSize}px`,
                   lineHeight: lineHeight,
                   letterSpacing: `${letterSpacing}em`,
                 }}
               >
                 {text.split('\n').map((para, i) => (
                   <p key={i} className="mb-8">{para}</p>
                 ))}
                 {!text && <p className="text-slate-400 italic text-center py-20">No text to display. Exit mode and paste some text first.</p>}
               </motion.div>
             )}

             <div className="flex justify-center">
                <button 
                  onClick={() => setIsReadingMode(!isReadingMode)}
                  className="flex items-center gap-3 px-12 py-5 bg-slate-900 text-white rounded-full font-black text-lg hover:scale-105 transition-transform"
                >
                  {isReadingMode ? <Maximize2 className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                  {isReadingMode ? 'Adjust Settings' : 'Immersive Reading'}
                </button>
             </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default ReadingMode;
