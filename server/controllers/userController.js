import gamificationService from '../services/gamificationService.js';

export const getUserProfile = async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, neuro_profile, avatar, theme } = req.body;
    const { data, error } = await req.supabase
      .from('users')
      .update({ name, neuro_profile, avatar, theme, updated_at: new Date() })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserSettings = async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUserSettings = async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('user_settings')
      .update({ ...req.body, updated_at: new Date() })
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const completeOnboarding = async (req, res) => {
  try {
    const { neuro_profile, settings } = req.body;
    
    // Update profile
    await req.supabase
      .from('users')
      .update({ neuro_profile, onboarding_completed: true })
      .eq('id', req.user.id);

    // Update settings
    const { data, error } = await req.supabase
      .from('user_settings')
      .update({ ...settings, updated_at: new Date() })
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Onboarding complete', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check for daily streak bonus
    await gamificationService.checkStreakBonus(userId);

    const { data: user } = await req.supabase.from('users').select('*').eq('id', userId).single();
    const { count: taskCount } = await req.supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('completed', false);
    const { data: recentSessions } = await req.supabase.from('focus_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5);
    
    // Calculate total focus time for today
    const today = new Date().toISOString().split('T')[0];
    const { data: todaysSessions } = await req.supabase
      .from('focus_sessions')
      .select('duration')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00`);
    
    const totalFocusMinutes = (todaysSessions || []).reduce((sum, s) => sum + (s.duration || 0), 0);

    res.json({
      user,
      pendingTasks: taskCount || 0,
      recentSessions: recentSessions || [],
      xpToNextLevel: gamificationService.getXpToNextLevel(user.xp),
      totalFocusMinutes: totalFocusMinutes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const data = await gamificationService.getLeaderboard();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Delete from auth.users using service role client
    // Our schema.sql has ON DELETE CASCADE on all user_id references,
    // so deleting from auth.users (or public.users) will wipe everything.
    const { error } = await req.supabase.auth.admin.deleteUser(userId);

    if (error) throw error;

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Account deletion error:', err.message);
    res.status(500).json({ error: 'Failed to delete account. Please contact support.' });
  }
};
