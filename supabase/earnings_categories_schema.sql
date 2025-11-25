-- Create earnings_categories table (same structure as categories)
CREATE TABLE IF NOT EXISTS earnings_categories (
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
CREATE INDEX IF NOT EXISTS idx_earnings_categories_name ON earnings_categories(name);
CREATE INDEX IF NOT EXISTS idx_earnings_categories_display_order ON earnings_categories(display_order);

-- Create updated_at trigger function (if not already exists)
CREATE OR REPLACE FUNCTION update_earnings_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_earnings_categories_updated_at
  BEFORE UPDATE ON earnings_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_earnings_categories_updated_at();

-- Enable Row Level Security
ALTER TABLE earnings_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to earnings_categories
CREATE POLICY "Allow public select earnings_categories"
  ON earnings_categories
  FOR SELECT
  USING (true);

-- Insert default earnings categories
INSERT INTO earnings_categories (name, emoji, color, text_color, display_order) VALUES
  ('Undefined', '❔', '#9E9E9E', '#FFFFFF', 0),
  ('Job', '💼', '#546E7A', '#FFFFFF', 1),
  ('Freelance', '🖥️', '#7C4DFF', '#FFFFFF', 2),
  ('Side Hustle', '⚡', '#FF9800', '#FFFFFF', 3),
  ('Dividends', '📈', '#4CAF50', '#FFFFFF', 4),
  ('Passive Income', '💰', '#00BCD4', '#FFFFFF', 5)
ON CONFLICT (name) DO NOTHING;

