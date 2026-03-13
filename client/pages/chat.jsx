import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/layout/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Zap, 
  RefreshCw,
  PlusCircle,
  MessageCircle,
  Smile
} from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';

const AIChat = () => {
  const { profile } = useAuthStore();
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hi there! I'm your NeuroAssist companion. I'm here to help you break down tasks, plan your day, or just offer some support. How are you feeling right now?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await api.post('/companion/chat', { 
        messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having a little trouble connecting right now. Let's try again in a moment?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col space-y-4">
        <header className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
              <Bot className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black dark:text-white">AI Companion</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Supportive & Active</span>
              </div>
            </div>
          </div>
          <button 
             onClick={() => setMessages([messages[0]])}
             className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"
             title="Restart Conversation"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </header>

        <section className="flex-1 bg-white dark:bg-slate-800 rounded-[40px] shadow-xl border dark:border-slate-700 flex flex-col overflow-hidden">
          {/* Message Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth"
          >
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold ${
                      msg.role === 'user' 
                        ? 'bg-indigo-100 text-indigo-600' 
                        : 'bg-slate-900 text-indigo-400'
                    }`}>
                      {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className={`p-5 rounded-[28px] ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-100'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border dark:border-slate-800'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed font-medium">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="p-5 bg-slate-50 rounded-[28px] rounded-tl-none border">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Reply Suggestions */}
          <div className="px-6 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
            {[
              "Help me plan my day",
              "Break down a task",
              "I'm feeling overwhelmed",
              "Small win to share!"
            ].map((text, i) => (
              <button
                key={i}
                onClick={() => setInput(text)}
                className="whitespace-nowrap px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
              >
                {text}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSend}
            className="p-6 border-t dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-4"
          >
            <div className="flex-1 relative">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message NeuroAssist..."
                className="w-full p-4 pr-12 bg-slate-100 dark:bg-slate-900 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 transition-all dark:text-white"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors">
                <Smile className="w-6 h-6" />
              </button>
            </div>
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </section>

        <footer className="text-center">
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Powered by Groq Llama 3.3 70B • Neurodivergent Friendly Assistant</p>
        </footer>
      </div>
    </Layout>
  );
};

export default AIChat;
