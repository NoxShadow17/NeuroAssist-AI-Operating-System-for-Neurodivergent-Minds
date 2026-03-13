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

// Writing session persistence functions
export const getWritingSessions = async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('writing_sessions')
      .select('id, title, draft_text, refined_text, created_at, updated_at')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createWritingSession = async (req, res) => {
  try {
    const { title, draftText } = req.body;
    const { data, error } = await req.supabase
      .from('writing_sessions')
      .insert({
        user_id: req.user.id,
        title: title || 'Untitled Writing',
        draft_text: draftText || '',
        refined_text: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getWritingSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const { data, error } = await req.supabase
      .from('writing_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Writing session not found' });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateWritingSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { draftText, title } = req.body;

    // Verify session belongs to user
    const { data: session } = await req.supabase
      .from('writing_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', req.user.id)
      .single();

    if (!session) {
      return res.status(404).json({ error: 'Writing session not found' });
    }

    const { data, error } = await req.supabase
      .from('writing_sessions')
      .update({
        draft_text: draftText !== undefined ? draftText : undefined,
        title: title !== undefined ? title : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const saveRefinedText = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { refinedText } = req.body;

    // Verify session belongs to user
    const { data: session } = await req.supabase
      .from('writing_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', req.user.id)
      .single();

    if (!session) {
      return res.status(404).json({ error: 'Writing session not found' });
    }

    const { data, error } = await req.supabase
      .from('writing_sessions')
      .update({
        refined_text: refinedText,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteWritingSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Verify session belongs to user
    const { data: session } = await req.supabase
      .from('writing_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', req.user.id)
      .single();

    if (!session) {
      return res.status(404).json({ error: 'Writing session not found' });
    }

    const { error } = await req.supabase
      .from('writing_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
    res.json({ message: 'Writing session deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
