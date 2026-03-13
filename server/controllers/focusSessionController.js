import gamificationService from '../services/gamificationService.js';

export const getFocusSessions = async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const logFocusSession = async (req, res) => {
  try {
    const { duration, session_type } = req.body;
    
    // Award XP based on duration (1 XP per minute roughly, adjusted by type)
    const reason = session_type === 'focus' ? 'focus_session_complete' : 'room_session';
    const xpResult = await gamificationService.awardXP(req.user.id, reason);

    const { data, error } = await req.supabase
      .from('focus_sessions')
      .insert({
        user_id: req.user.id,
        duration,
        session_type,
        xp_gained: xpResult.xpGained,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ session: data, xpResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
