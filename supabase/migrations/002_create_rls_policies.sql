-- Migration: Set up Row Level Security (RLS) policies for journal_entries
-- Run this AFTER creating the journal_entries table

-- Enable RLS on the journal_entries table
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can only view their own journal entries
CREATE POLICY "Users can view own journal entries"
ON journal_entries
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Users can only insert journal entries for themselves
CREATE POLICY "Users can insert own journal entries"
ON journal_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can only update their own journal entries
CREATE POLICY "Users can update own journal entries"
ON journal_entries
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can only delete their own journal entries
CREATE POLICY "Users can delete own journal entries"
ON journal_entries
FOR DELETE
USING (auth.uid() = user_id);

-- Additional security: Create a policy for service role access (for AI processing)
-- This allows server-side functions to access entries when needed
CREATE POLICY "Service role full access"
ON journal_entries
FOR ALL
USING (
  -- Only allow if it's a service role or the user owns the record
  auth.jwt()->>'role' = 'service_role' OR 
  auth.uid() = user_id
)
WITH CHECK (
  auth.jwt()->>'role' = 'service_role' OR 
  auth.uid() = user_id
);

-- Create a function to check if user can access journal entry
CREATE OR REPLACE FUNCTION user_can_access_journal_entry(entry_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM journal_entries 
    WHERE id = entry_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;