# 🧠 NeuroAssist - AI OS for Neurodivergent Minds

NeuroAssist is a production-quality full-stack platform designed to support neurodivergent individuals (ADHD, Autism, Dyslexia, Executive Dysfunction) using Groq AI.

## 🚀 Features

- **AI Task Decomposer**: Break overwhelming goals into sub-5-minute micro-steps.
- **Brain Dump Organizer**: Structure messy thoughts into prioritized tasks and schedules.
- **Overwhelm Mode**: One-click isolation of the next step with calming UI and timer.
- **Pomodoro Focus Timer**: Gamified deep work with XP rewards and history.
- **Focus Rooms**: Real-time body doubling with shared timers and chat (Socket.IO).
- **Reading Mode**: Dyslexia-friendly interface with OpenDyslexic font and TTS.
- **Sensory Dashboard**: Adjustable animation intensity, motion, and contrast.
- **AI Companion**: Supportive Llama 3.3-powered chat assistant.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, Tailwind CSS, Framer Motion, Zustand.
- **Backend**: Node.js, Express, Socket.IO.
- **AI**: Groq API (Llama 3.3-70B & 3.1-8B).
- **Database**: Supabase (PostgreSQL).
- **Auth**: Supabase Auth.

---

## 🏃 Local Setup

### 1. Database
Run the SQL in `/database/schema.sql` in your Supabase SQL Editor.

### 2. Backend Server
```bash
cd server
npm install
npm run dev
```
*Make sure `.env` contains your Groq and Supabase keys (pre-configured).*

### 3. Frontend Client
```bash
cd client
npm install
npm run dev
```
*Open [http://localhost:3000](http://localhost:3000)*

---

## 📁 Project Structure

- `/client`: Next.js frontend pages, stores, and components.
- `/server`: Express API, AI services, and Socket.IO handlers.
- `/database`: PostgreSQL schema and RLS policies.

---

## 📝 Deployment

1. **Backend**: Deploy to Render/Heroku. Set all `.env` variables.
2. **Frontend**: Deploy to Vercel/Netlify. Set `NEXT_PUBLIC_API_URL` to your backend URL.
3. **Supabase**: Ensure RLS is enabled and SQL schema is applied.
