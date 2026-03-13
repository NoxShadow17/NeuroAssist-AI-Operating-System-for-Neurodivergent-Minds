import aiService from '../services/aiService.js';

export const refineText = async (req, res) => {
  try {
    const { text, mode } = req.body;
    if (!text || !mode) {
      return res.status(400).json({ error: 'Text and mode are required' });
    }

    // Get user profile for context
    const { data: user } = await req.supabase
      .from('users')
      .select('neuro_profile')
      .eq('id', req.user.id)
      .single();

    const refinedText = await aiService.refineWriting(text, mode, user?.neuro_profile);
    
    res.json({ refinedText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
