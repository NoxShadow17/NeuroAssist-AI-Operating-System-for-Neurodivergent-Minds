-- Chat Persistence Tables
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Writing Session Persistence Tables
CREATE TABLE IF NOT EXISTS writing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  draft_text TEXT,
  refined_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, id)
);

-- Reading Material Persistence Tables
CREATE TABLE IF NOT EXISTS reading_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  font_size INTEGER DEFAULT 16,
  line_spacing DECIMAL(2,1) DEFAULT 1.5,
  dyslexia_friendly BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, id)
);

CREATE TABLE IF NOT EXISTS reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES reading_materials(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  bookmarked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_writing_sessions_user_id ON writing_sessions(user_id);
CREATE INDEX idx_reading_materials_user_id ON reading_materials(user_id);
CREATE INDEX idx_reading_sessions_user_id ON reading_sessions(user_id);
CREATE INDEX idx_reading_sessions_material_id ON reading_sessions(material_id);

-- Enable RLS (Row Level Security)
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Chat Conversations
CREATE POLICY "Users can read their own conversations" ON chat_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations" ON chat_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON chat_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON chat_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Chat Messages
CREATE POLICY "Users can read messages in their conversations" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE id = chat_messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add messages to their conversations" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE id = conversation_id 
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for Writing Sessions
CREATE POLICY "Users can read their own writing sessions" ON writing_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create writing sessions" ON writing_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own writing sessions" ON writing_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own writing sessions" ON writing_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Reading Materials
CREATE POLICY "Users can read their own reading materials" ON reading_materials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create reading materials" ON reading_materials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading materials" ON reading_materials
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading materials" ON reading_materials
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Reading Sessions
CREATE POLICY "Users can read their own reading sessions" ON reading_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create reading sessions" ON reading_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading sessions" ON reading_sessions
  FOR DELETE USING (auth.uid() = user_id);
