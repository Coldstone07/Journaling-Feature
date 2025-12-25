-- Migration: Create journal_entries table with proper schema and indexes
-- Run this in your Supabase SQL Editor

-- Create journal_entries table with all required fields
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  voice_transcription TEXT,
  emotional_analysis JSONB DEFAULT '{}',
  ai_insights JSONB DEFAULT '{}',
  synchronicity_tags TEXT[] DEFAULT '{}',
  shadow_work_prompts TEXT[] DEFAULT '{}',
  mood TEXT,
  themes TEXT[] DEFAULT '{}',
  triggers TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX idx_journal_entries_user_created ON journal_entries(user_id, created_at DESC);
CREATE INDEX idx_journal_entries_mood ON journal_entries(mood) WHERE mood IS NOT NULL;
CREATE INDEX idx_journal_entries_themes ON journal_entries USING GIN(themes);
CREATE INDEX idx_journal_entries_triggers ON journal_entries USING GIN(triggers);
CREATE INDEX idx_journal_entries_sync_tags ON journal_entries USING GIN(synchronicity_tags);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_journal_entries_updated_at 
    BEFORE UPDATE ON journal_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE journal_entries IS 'Stores user journal entries with AI analysis and emotional insights';
COMMENT ON COLUMN journal_entries.emotional_analysis IS 'JSONB field containing AI-generated emotional analysis';
COMMENT ON COLUMN journal_entries.ai_insights IS 'JSONB field containing AI-generated insights and suggestions';
COMMENT ON COLUMN journal_entries.synchronicity_tags IS 'Array of synchronicity-related tags';
COMMENT ON COLUMN journal_entries.shadow_work_prompts IS 'Array of shadow work prompts generated from content';
COMMENT ON COLUMN journal_entries.themes IS 'Array of identified themes from the journal entry';
COMMENT ON COLUMN journal_entries.triggers IS 'Array of identified emotional triggers';