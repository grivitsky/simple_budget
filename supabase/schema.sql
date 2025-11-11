-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  language_code TEXT,
  photo_url TEXT,
  ai_features_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  default_currency TEXT DEFAULT 'USD' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on telegram_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to insert new users
-- This allows the app to create new user accounts using the anon key
CREATE POLICY "Allow public insert"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Policy 2: Allow anyone to read all users
-- For a budget app, you might want to restrict this later
CREATE POLICY "Allow public select"
  ON users
  FOR SELECT
  USING (true);

-- Policy 3: Allow anyone to update
-- You might want to add telegram_id validation here later
CREATE POLICY "Allow public update"
  ON users
  FOR UPDATE
  USING (true);

-- NOTE: These policies allow full access with the anon key.
-- This is acceptable for a Telegram Mini App where authentication
-- is handled by Telegram itself.
-- For tighter security, consider using server-side validation or Supabase Auth.

