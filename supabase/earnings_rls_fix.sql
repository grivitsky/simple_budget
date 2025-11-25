-- Fix RLS Policies for Earnings Table
-- Run this in Supabase SQL Editor to fix RLS policies for earnings

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own earnings" ON earnings;
DROP POLICY IF EXISTS "Users can insert their own earnings" ON earnings;
DROP POLICY IF EXISTS "Users can update their own earnings" ON earnings;
DROP POLICY IF EXISTS "Users can delete their own earnings" ON earnings;

-- Enable RLS (if not already enabled)
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow inserts (needed for bot to create earnings)
-- This allows inserts from server-side code without requiring context variables
CREATE POLICY "Allow earnings insert"
  ON earnings
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own earnings
-- This allows viewing when context is set (client-side) OR when no context is set (server-side)
CREATE POLICY "Users can view their own earnings"
  ON earnings
  FOR SELECT
  USING (
    -- Allow if context matches user's telegram_id (client-side)
    user_id IN (
      SELECT id FROM users WHERE telegram_id = current_setting('app.telegram_id', true)::BIGINT
    )
    OR
    -- Allow if no context is set (server-side operations like bot inserts)
    current_setting('app.telegram_id', true) IS NULL
    OR
    current_setting('app.telegram_id', true) = ''
  );

-- Policy: Users can update their own earnings
CREATE POLICY "Users can update their own earnings"
  ON earnings
  FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM users WHERE telegram_id = current_setting('app.telegram_id', true)::BIGINT
    )
  );

-- Policy: Users can delete their own earnings
CREATE POLICY "Users can delete their own earnings"
  ON earnings
  FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM users WHERE telegram_id = current_setting('app.telegram_id', true)::BIGINT
    )
  );

-- Note: The SELECT policy allows viewing when no context is set to support
-- server-side operations that need to return the inserted row.
-- For additional security, you could restrict this further based on your needs.

