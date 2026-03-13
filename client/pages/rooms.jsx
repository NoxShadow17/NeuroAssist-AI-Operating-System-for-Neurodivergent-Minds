import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/layout/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Clock, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Plus,
  ArrowRight,
  Send,
  User,
  Zap,
  Trash2
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/api';

const FocusRooms = () => {
  const { profile } = useAuthStore();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [roomTimer, setRoomTimer] = useState(25 * 60);
  const socketRef = useRef(null);
  const [newRoomForm, setNewRoomForm] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [localMedia, setLocalMedia] = useState({ video: true, audio: false });

  useEffect(() => {
    fetchRooms();
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');
    // ... socket listener implementation ...
    
    socketRef.current.on('room-updated', ({ participants: pList }) => {
      setParticipants(pList);
    });

    socketRef.current.on('new-message', (msg) => {
      setMessages(prev => [...prev, msg].slice(-50));
    });

    socketRef.current.on('timer-state', ({ timer }) => {
      setRoomTimer(timer);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/focus-rooms');
      setRooms(data);
    } catch (err) {
      console.error('Failed to fetch rooms');
    }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      const { data } = await api.post('/focus-rooms/join-by-code', { room_code: joinCode });
      joinRoom(data.room);
    } catch (err) {
      alert('Room not found or inactive');
    }
  };

  const joinRoom = (room) => {
    setActiveRoom(room);
    socketRef.current.emit('join-room', {
      roomCode: room.room_code,
      userName: profile?.name,
      userId: profile?.id
    });
  };

  const leaveRoom = () => {
    if (activeRoom) {
      socketRef.current.emit('leave-room', {
        roomCode: activeRoom.room_code,
        userId: profile?.id
      });
      setActiveRoom(null);
      setMessages([]);
      setParticipants([]);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeRoom) return;
    socketRef.current.emit('send-message', {
      roomCode: activeRoom.room_code,
      message: inputMessage,
      userName: profile?.name
    });
    setInputMessage('');
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('Are you sure you want to delete this focus room?')) return;
    try {
      await api.delete(`/focus-rooms/${roomId}`);
      fetchRooms();
    } catch (err) {
      alert('Failed to delete room');
    }
  };

  if (activeRoom) {
    return (
      <Layout>
        <div className="h-full flex flex-col space-y-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button onClick={leaveRoom} className="text-slate-500 hover:text-indigo-600 font-bold transition-colors">← Leave Room</button>
               <h1 className="text-2xl font-black dark:text-white uppercase tracking-wider">{activeRoom.room_name}</h1>
               <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold ring-1 ring-indigo-100 dark:ring-indigo-900/50">#{activeRoom.room_code}</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-mono text-xl shadow-xl">
                 <Clock className="w-5 h-5 text-indigo-400" />
                 {Math.floor(roomTimer / 60)}:{(roomTimer % 60).toString().padStart(2, '0')}
               </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 h-[calc(100vh-250px)]">
            {/* Participants */}
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2">
               <AnimatePresence>
                 {participants.map((p) => (
                   <motion.div 
                     key={p.id}
                     initial={{ scale: 0.9, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="bg-white dark:bg-slate-800 rounded-[40px] border dark:border-slate-700 flex flex-col items-center justify-center p-8 space-y-4 shadow-sm relative overflow-hidden group"
                   >
                     <div className="relative">
                       <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-4 border-indigo-500/20 group-hover:border-indigo-500 transition-colors">
                         {p.avatar ? <img src={p.avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-slate-400" />}
                       </div>
                       <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-slate-800 rounded-full" />
                     </div>
                     <p className="font-black dark:text-white">{p.userName} {p.userId === profile?.id && '(You)'}</p>
                     
                     <div className="flex gap-2">
                        <button 
                          onClick={() => p.userId === profile?.id && setLocalMedia(prev => ({ ...prev, audio: !prev.audio }))}
                          className={`p-3 rounded-2xl transition-all ${p.userId === profile?.id ? 'hover:scale-110' : 'cursor-default'} ${localMedia.audio && p.userId === profile?.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}
                        >
                          {localMedia.audio && p.userId === profile?.id ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => p.userId === profile?.id && setLocalMedia(prev => ({ ...prev, video: !prev.video }))}
                          className={`p-3 rounded-2xl transition-all ${p.userId === profile?.id ? 'hover:scale-110' : 'cursor-default'} ${localMedia.video && p.userId === profile?.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}
                        >
                          {localMedia.video && p.userId === profile?.id ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                        </button>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
            </div>

            {/* Chat */}
            <div className="bg-white dark:bg-slate-800 rounded-[40px] border dark:border-slate-700 flex flex-col shadow-xl overflow-hidden">
               <div className="p-6 border-b dark:border-slate-700 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-black text-xs uppercase tracking-widest dark:text-white">Room Chat</h3>
                 </div>
                 <div className="px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-[10px] font-black dark:text-slate-400">
                    {messages.length} MSGS
                 </div>
               </div>
               <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
                 {messages.map((m, i) => (
                   <div key={i} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">{m.userName}</span>
                        <span className="text-[8px] text-slate-300">Just now</span>
                      </div>
                      <p className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl dark:text-slate-200 text-sm leading-relaxed border dark:border-slate-700/30">{m.message}</p>
                   </div>
                 ))}
                 {messages.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-4">
                      <MessageSquare className="w-12 h-12 mb-4" />
                      <p className="text-sm font-bold">No noise yet. Start the conversation!</p>
                   </div>
                 )}
               </div>
               <form onSubmit={sendMessage} className="p-6 bg-slate-50 dark:bg-slate-900/20 border-t dark:border-slate-700 flex gap-2">
                 <input 
                   type="text" 
                   value={inputMessage}
                   onChange={(e) => setInputMessage(e.target.value)}
                   placeholder="Type a message..."
                   className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-2xl outline-none text-sm dark:text-white shadow-inner border dark:border-slate-700"
                 />
                 <button className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-105 transition-transform">
                   <Send className="w-5 h-5" />
                 </button>
               </form>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gradient-to-br from-indigo-600 to-indigo-800 p-12 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-5xl font-black mb-4">Focus Rooms</h1>
            <p className="text-indigo-100 text-lg font-medium max-w-lg opacity-90">Virtual body doubling to boost your executive function. Work synchronously with others to stay on task.</p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleJoinByCode} className="flex bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
               <input 
                 value={joinCode}
                 onChange={(e) => setJoinCode(e.target.value)}
                 placeholder="Enter Room Code" 
                 className="bg-transparent px-4 py-2 outline-none text-white placeholder-indigo-200 font-bold w-40"
               />
               <button type="submit" className="px-6 py-2 bg-white text-indigo-600 rounded-xl font-black hover:bg-indigo-50 transition-colors">Join</button>
            </form>
            <button 
              onClick={() => setNewRoomForm(true)}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-2xl hover:bg-slate-800 transition-all transform hover:scale-105"
            >
              <Plus className="w-6 h-6" /> Create Room
            </button>
          </div>
          <Users className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {rooms.map((room) => (
             <motion.div 
               key={room.id}
               whileHover={{ y: -8 }}
               className="bg-white dark:bg-slate-800 p-10 rounded-[48px] border dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
             >
                {!room.is_public && (
                  <div className="absolute top-6 left-6 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full">Private</div>
                )}
                <div className="flex justify-between items-start mb-8">
                   <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-[24px] flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                      <Users className="w-8 h-8" />
                   </div>
                   <div className="flex flex-col items-end">
                      {profile && room.host_id === profile.id && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoom(room.id);
                          }}
                          className="p-2 mb-2 text-slate-300 hover:text-red-500 transition-colors"
                          title="Delete Room"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Participants</span>
                      <p className="text-3xl font-black dark:text-white">
                        {room.participants?.count || 0}
                        <span className="text-slate-300 dark:text-slate-600 text-xl">/{room.max_participants}</span>
                      </p>
                   </div>
                </div>
                <h3 className="text-2xl font-black dark:text-white mb-3 group-hover:text-indigo-600 transition-colors">{room.room_name}</h3>
                <p className="text-slate-500 font-medium line-clamp-2 mb-8 text-sm leading-relaxed">{room.description}</p>
                
                <div className="flex items-center justify-between pt-8 border-t dark:border-slate-700">
                   <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-tighter mb-1">
                         <Clock className="w-3.5 h-3.5" />
                         {room.timer_duration} Minute Cycle
                      </div>
                      <div className="flex items-center gap-3">
                        {room.video_enabled && <Video className="w-4 h-4 text-emerald-500" />}
                        {room.audio_enabled && <Mic className="w-4 h-4 text-emerald-500" />}
                      </div>
                   </div>
                   <button 
                      onClick={() => joinRoom(room)}
                      className="w-14 h-14 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-45"
                   >
                     <ArrowRight className="w-8 h-8" />
                   </button>
                </div>
             </motion.div>
           ))}

           {rooms.length === 0 && !newRoomForm && (
             <div className="col-span-full py-32 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[48px] border-2 border-dashed dark:border-slate-800">
                <Users className="w-16 h-16 mx-auto text-slate-300 mb-6" />
                <h4 className="text-xl font-black dark:text-slate-200 mb-2">The Lobby is Quiet</h4>
                <p className="text-slate-400 font-bold italic">No public rooms found. Start your own session!</p>
             </div>
           )}
        </section>

        {/* Create Room Modal */}
        <AnimatePresence>
          {newRoomForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 w-full max-w-xl p-10 rounded-[48px] shadow-2xl overflow-hidden relative"
              >
                  <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
                  <h2 className="text-3xl font-black mb-8 dark:text-white">Create Focus Space</h2>
                  <form className="space-y-6" onSubmit={async (e) => {
                    e.preventDefault();
                    const roomData = {
                      room_name: e.target.roomName.value,
                      description: e.target.desc.value,
                      is_public: e.target.visibility.value === 'public',
                      video_enabled: e.target.video.checked,
                      audio_enabled: e.target.audio.checked,
                      max_participants: 10,
                      timer_duration: 25
                    };
                    try {
                      const { data } = await api.post('/focus-rooms', roomData);
                      setNewRoomForm(false);
                      fetchRooms();
                      joinRoom(data);
                    } catch (err) {
                      alert('Failed to create room');
                    }
                  }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Room Name</label>
                          <input name="roomName" required className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 outline-none focus:ring-2 ring-indigo-500 dark:text-white font-bold" placeholder="Deep Work Nest" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Visibility</label>
                          <select name="visibility" className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 outline-none font-bold dark:text-white">
                             <option value="public">Public (Lobby Feed)</option>
                             <option value="private">Private (Invite Only)</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Description</label>
                        <textarea name="desc" className="w-full h-[126px] p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 outline-none focus:ring-2 ring-indigo-500 dark:text-white resize-none font-medium" placeholder="E.g. No-chat chill focus session" />
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl space-y-4 border dark:border-slate-700">
                       <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Media Permissions</h4>
                       <div className="flex gap-8">
                          <label className="flex items-center gap-3 cursor-pointer group">
                             <input type="checkbox" name="video" defaultChecked className="w-5 h-5 accent-indigo-600 rounded" />
                             <span className="text-sm font-black dark:text-white">Enable Video</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer group">
                             <input type="checkbox" name="audio" className="w-5 h-5 accent-indigo-600 rounded" />
                             <span className="text-sm font-black dark:text-white">Enable Audio</span>
                          </label>
                       </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button type="button" onClick={() => setNewRoomForm(false)} className="flex-1 py-5 font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest text-xs">Cancel</button>
                      <button type="submit" className="flex-2 px-12 py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-2xl shadow-indigo-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all">Launch Space</button>
                    </div>
                  </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default FocusRooms;
