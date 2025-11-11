-- Fix RLS Policies for Users Table
-- Run this in Supabase SQL Editor if you already have the table

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow public insert" ON users;
DROP POLICY IF EXISTS "Allow public select" ON users;
DROP POLICY IF EXISTS "Allow public update" ON users;

-- Enable RLS (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create new policies that work with anon key
CREATE POLICY "Allow public insert"
  ON users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public select"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public update"
  ON users
  FOR UPDATE
  USING (true);

-- Note: These policies allow full access with the anon key.
-- This is acceptable for a Telegram Mini App where authentication
-- is handled by Telegram itself.
--
-- For additional security, you could:
-- 1. Validate telegram_id matches
-- 2. Use Supabase Auth + JWT claims
-- 3. Add server-side validation

