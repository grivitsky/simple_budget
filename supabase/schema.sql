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

-- Create policy: Users can read their own data
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  USING (telegram_id = current_setting('app.telegram_id', true)::BIGINT);

-- Create policy: Users can update their own data
CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  USING (telegram_id = current_setting('app.telegram_id', true)::BIGINT);

-- Create policy: Allow insert for new users (service role)
CREATE POLICY "Allow insert for authenticated users"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Note: For development, you might want to temporarily disable RLS:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

