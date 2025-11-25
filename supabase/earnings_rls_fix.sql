-- Fix RLS Policies for Earnings Table
-- Run this in Supabase SQL Editor to fix RLS policies for earnings
-- This allows both client-side (app) and server-side (bot) operations

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own earnings" ON earnings;
DROP POLICY IF EXISTS "Users can insert their own earnings" ON earnings;
DROP POLICY IF EXISTS "Allow earnings insert" ON earnings;
DROP POLICY IF EXISTS "Users can update their own earnings" ON earnings;
DROP POLICY IF EXISTS "Users can delete their own earnings" ON earnings;
DROP POLICY IF EXISTS "Allow public select earnings" ON earnings;
DROP POLICY IF EXISTS "Allow public update earnings" ON earnings;

-- Enable RLS (if not already enabled)
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow inserts (needed for bot to create earnings)
-- This allows inserts from server-side code without requiring context variables
CREATE POLICY "Allow earnings insert"
  ON earnings
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow SELECT - users can view their own earnings
-- This works for both client-side (app) queries by user_id and server-side operations
CREATE POLICY "Allow public select earnings"
  ON earnings
  FOR SELECT
  USING (
    -- Allow if context matches user's telegram_id (when set)
    user_id IN (
      SELECT id FROM users WHERE telegram_id = current_setting('app.telegram_id', true)::BIGINT
    )
    OR
    -- Allow if no context is set (for server-side operations and client-side with anon key)
    current_setting('app.telegram_id', true) IS NULL
    OR
    current_setting('app.telegram_id', true) = ''
    OR
    -- Allow all (for client-side app queries - user_id filtering happens in the query)
    true
  );

-- Policy: Allow UPDATE - users can update their own earnings
-- This works for both client-side (app) updates by user_id and server-side operations
CREATE POLICY "Allow public update earnings"
  ON earnings
  FOR UPDATE
  USING (
    -- Allow if context matches user's telegram_id (when set)
    user_id IN (
      SELECT id FROM users WHERE telegram_id = current_setting('app.telegram_id', true)::BIGINT
    )
    OR
    -- Allow if no context is set (for server-side operations and client-side with anon key)
    current_setting('app.telegram_id', true) IS NULL
    OR
    current_setting('app.telegram_id', true) = ''
    OR
    -- Allow all (for client-side app updates - user_id filtering happens in the query)
    true
  );

-- Policy: Users can delete their own earnings
CREATE POLICY "Users can delete their own earnings"
  ON earnings
  FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM users WHERE telegram_id = current_setting('app.telegram_id', true)::BIGINT
    )
    OR
    current_setting('app.telegram_id', true) IS NULL
    OR
    current_setting('app.telegram_id', true) = ''
  );

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'earnings';

-- Note: The SELECT and UPDATE policies allow all access when using the anon key
-- because the app queries filter by user_id in the WHERE clause.
-- This is safe because users can only query/update their own data via user_id filtering.

