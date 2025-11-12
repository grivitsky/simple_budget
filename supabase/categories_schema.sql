-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  emoji TEXT NOT NULL,
  color TEXT NOT NULL,
  text_color TEXT NOT NULL,
  color_dark TEXT,
  text_color_dark TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- Create updated_at trigger function (if not already exists)
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories
CREATE POLICY "Allow public select categories"
  ON categories
  FOR SELECT
  USING (true);

-- Insert default categories
INSERT INTO categories (name, emoji, color, text_color, display_order) VALUES
  ('Undefined', '❔', '#9E9E9E', '#FFFFFF', 0),
  ('Eating Out', '🍔', '#61B5F7', '#2E9DF4', 1),
  ('Housing', '🏠', '#FF6B6B', '#E74C3C', 2),
  ('Transport', '🚗', '#4ECDC4', '#2C9A91', 3),
  ('Groceries', '🛒', '#95E1D3', '#6BC4A8', 4),
  ('Healthcare', '💊', '#F38181', '#E74C3C', 5),
  ('Entertainment', '🎬', '#AA96DA', '#8B7AB8', 6),
  ('Shopping', '👕', '#FCBAD3', '#E91E63', 7),
  ('Utilities', '📱', '#FFF176', '#F9A825', 8),
  ('Travel', '✈️', '#A8D8EA', '#0288D1', 9),
  ('Education', '🎓', '#FFB6B9', '#E91E63', 10)
ON CONFLICT (name) DO NOTHING;

