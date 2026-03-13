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

// Chat conversation persistence functions
export const getConversations = async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('chat_conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createConversation = async (req, res) => {
  try {
    const { title } = req.body;
    const { data, error } = await req.supabase
      .from('chat_conversations')
      .insert({
        user_id: req.user.id,
        title: title || 'New Conversation',
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

export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Verify conversation belongs to user
    const { data: conversation } = await req.supabase
      .from('chat_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', req.user.id)
      .single();

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const { data, error } = await req.supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addMessageToConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { role, content } = req.body;

    // Verify conversation belongs to user
    const { data: conversation } = await req.supabase
      .from('chat_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', req.user.id)
      .single();

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const { data, error } = await req.supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation's updated_at timestamp
    await req.supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify conversation belongs to user
    const { data: conversation } = await req.supabase
      .from('chat_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', req.user.id)
      .single();

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Delete messages first (or use CASCADE in schema)
    await req.supabase
      .from('chat_messages')
      .delete()
      .eq('conversation_id', conversationId);

    // Delete conversation
    const { error } = await req.supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;
    res.json({ message: 'Conversation deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
