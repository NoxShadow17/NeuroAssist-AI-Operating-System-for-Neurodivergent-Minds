import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const XP_REWARDS = {
  task_step_complete: 10,
  task_complete: 50,
  focus_session_complete: 30,
  brain_dump_organized: 20,
  daily_login: 15,
  streak_bonus: 25,
};

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000, 7000];

export const calculateLevel = (xp) => {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, 10);
};

export const getXpToNextLevel = (xp) => {
  const level = calculateLevel(xp);
  if (level >= 10) return 0;
  return LEVEL_THRESHOLDS[level] - xp;
};

export const awardXP = async (userId, reason) => {
  const xpAmount = XP_REWARDS[reason] || 10;

  // Log XP event
  await supabase.from('xp_events').insert({
    user_id: userId,
    xp_amount: xpAmount,
    reason,
  });

  // Get current user data
  const { data: user } = await supabase
    .from('users')
    .select('xp, level, streak')
    .eq('id', userId)
    .single();

  if (!user) return null;

  const newXp = user.xp + xpAmount;
  const newLevel = calculateLevel(newXp);
  const leveledUp = newLevel > user.level;

  // Update user XP and level
  const { data: updated } = await supabase
    .from('users')
    .update({ xp: newXp, level: newLevel })
    .eq('id', userId)
    .select()
    .single();

  return {
    xpGained: xpAmount,
    newXp,
    newLevel,
    leveledUp,
    xpToNextLevel: getXpToNextLevel(newXp),
  };
};

export const getLeaderboard = async (limit = 10) => {
  const { data } = await supabase
    .from('users')
    .select('id, name, xp, level, streak, avatar')
    .order('xp', { ascending: false })
    .limit(limit);

  return data || [];
};

export const checkStreakBonus = async (userId) => {
  const { data: user } = await supabase
    .from('users')
    .select('streak, last_active')
    .eq('id', userId)
    .single();

  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];
  const lastActive = user.last_active;

  if (lastActive === today) return null; // Already logged in today

  // Update streak
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const isStreak = lastActive === yesterday;
  const newStreak = isStreak ? user.streak + 1 : 1;

  await supabase
    .from('users')
    .update({ streak: newStreak, last_active: today })
    .eq('id', userId);

  // Award streak bonus if streak > 1
  let bonusResult = null;
  if (newStreak > 1) {
    bonusResult = await awardXP(userId, 'streak_bonus');
  }

  return { streak: newStreak, isStreak, bonusResult };
};

export default { awardXP, calculateLevel, getXpToNextLevel, getLeaderboard, checkStreakBonus };
