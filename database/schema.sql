-- NeuroAssist Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  neuro_profile TEXT CHECK (neuro_profile IN ('adhd', 'autism', 'dyslexia', 'mixed')),
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  last_active DATE DEFAULT CURRENT_DATE,
  avatar TEXT DEFAULT 'default',
  theme TEXT DEFAULT 'calm-blue',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER SETTINGS (sensory preferences)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  animation_intensity INTEGER DEFAULT 5 CHECK (animation_intensity BETWEEN 0 AND 10),
  color_contrast INTEGER DEFAULT 5 CHECK (color_contrast BETWEEN 0 AND 10),
  sound_level INTEGER DEFAULT 5 CHECK (sound_level BETWEEN 0 AND 10),
  motion_reduction BOOLEAN DEFAULT FALSE,
  dyslexia_font BOOLEAN DEFAULT FALSE,
  letter_spacing INTEGER DEFAULT 0,
  text_size INTEGER DEFAULT 16,
  dark_mode BOOLEAN DEFAULT TRUE,
  notification_frequency TEXT DEFAULT 'normal' CHECK (notification_frequency IN ('low', 'normal', 'high')),
  task_granularity TEXT DEFAULT 'micro' CHECK (task_granularity IN ('micro', 'normal', 'macro')),
  focus_duration INTEGER DEFAULT 25,
  break_duration INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT DEFAULT 'general',
  completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TASK STEPS (AI-decomposed micro-steps)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  step_text TEXT NOT NULL,
  step_order INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  estimated_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BRAIN DUMPS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.brain_dumps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  organized_output JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FOCUS SESSIONS (Pomodoro)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL,
  session_type TEXT DEFAULT 'focus' CHECK (session_type IN ('focus', 'break', 'room')),
  xp_gained INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT TRUE,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FOCUS ROOMS (Body Doubling)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.focus_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code TEXT UNIQUE NOT NULL,
  room_name TEXT NOT NULL,
  host_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  max_participants INTEGER DEFAULT 10,
  timer_duration INTEGER DEFAULT 25,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROOM PARTICIPANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.room_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES public.focus_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- ============================================================
-- XP EVENTS (audit log)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.xp_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_dumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own data
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage own settings" ON public.user_settings;
CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;
CREATE POLICY "Users can manage own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own steps" ON public.task_steps;
CREATE POLICY "Users can manage own steps" ON public.task_steps FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own dumps" ON public.brain_dumps;
CREATE POLICY "Users can manage own dumps" ON public.brain_dumps FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own sessions" ON public.focus_sessions;
CREATE POLICY "Users can manage own sessions" ON public.focus_sessions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own xp" ON public.xp_events;
CREATE POLICY "Users can manage own xp" ON public.xp_events FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view rooms" ON public.focus_rooms;
CREATE POLICY "Anyone can view rooms" ON public.focus_rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Room host can update" ON public.focus_rooms;
CREATE POLICY "Room host can update" ON public.focus_rooms FOR UPDATE USING (auth.uid() = host_id);

DROP POLICY IF EXISTS "Users can create rooms" ON public.focus_rooms;
CREATE POLICY "Users can create rooms" ON public.focus_rooms FOR INSERT WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "Anyone can view participants" ON public.room_participants;
CREATE POLICY "Anyone can view participants" ON public.room_participants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own participation" ON public.room_participants;
CREATE POLICY "Users can manage own participation" ON public.room_participants FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update streak on login
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last_active DATE;
  v_current_streak INTEGER;
BEGIN
  SELECT last_active, streak INTO v_last_active, v_current_streak
  FROM public.users WHERE id = p_user_id;

  IF v_last_active = CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE public.users SET streak = streak + 1, last_active = CURRENT_DATE WHERE id = p_user_id;
  ELSIF v_last_active < CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE public.users SET streak = 1, last_active = CURRENT_DATE WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
