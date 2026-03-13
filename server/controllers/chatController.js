import aiService from '../services/aiService.js';

export const getChatResponse = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Get user profile and settings for context
    const { data: user } = await req.supabase
      .from('users')
      .select('neuro_profile, name')
      .eq('id', req.user.id)
      .single();

    const response = await aiService.chatResponse(messages, user.neuro_profile);

    res.json({ message: response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEncouragement = async (req, res) => {
  try {
    const { data: user } = await req.supabase
      .from('users')
      .select('neuro_profile')
      .eq('id', req.user.id)
      .single();

    const message = await aiService.generateEncouragement(user.neuro_profile);
    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
