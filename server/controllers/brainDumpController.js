import aiService from '../services/aiService.js';
import gamificationService from '../services/gamificationService.js';

export const getBrainDumps = async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('brain_dumps')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const processBrainDump = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    // Get user profile and settings
    const { data: user } = await req.supabase
      .from('users')
      .select('neuro_profile')
      .eq('id', req.user.id)
      .single();

    const { data: settings } = await req.supabase
      .from('user_settings')
      .select('task_granularity')
      .eq('user_id', req.user.id)
      .single();

    const organized = await aiService.organizeBrainDump(text, user.neuro_profile, settings?.task_granularity || 'micro');

    // Save to database
    const { data, error } = await req.supabase
      .from('brain_dumps')
      .insert({
        user_id: req.user.id,
        raw_text: text,
        organized_output: organized
      })
      .select()
      .single();

    if (error) throw error;

    // Award XP
    const xpResult = await gamificationService.awardXP(req.user.id, 'brain_dump_organized');

    res.status(201).json({ data, xpResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
