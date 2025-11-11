-- Create currencies table
CREATE TABLE IF NOT EXISTS currencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_currencies_code ON currencies(code);
CREATE INDEX IF NOT EXISTS idx_currencies_display_order ON currencies(display_order);

-- Enable Row Level Security
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;

-- Allow public read access to currencies
CREATE POLICY "Allow public select currencies"
  ON currencies
  FOR SELECT
  USING (true);

-- Insert default currencies with symbols
INSERT INTO currencies (code, name, symbol, display_order) VALUES
  ('USD', 'US Dollar', '$', 1),
  ('EUR', 'Euro', '€', 2),
  ('GBP', 'British Pound', '£', 3),
  ('JPY', 'Japanese Yen', '¥', 4),
  ('CHF', 'Swiss Franc', 'CHF', 5),
  ('AUD', 'Australian Dollar', 'A$', 6),
  ('CAD', 'Canadian Dollar', 'C$', 7),
  ('CNY', 'Chinese Yuan', '¥', 8),
  ('INR', 'Indian Rupee', '₹', 9),
  ('BRL', 'Brazilian Real', 'R$', 10),
  ('MXN', 'Mexican Peso', 'MX$', 11),
  ('ZAR', 'South African Rand', 'R', 12),
  ('SGD', 'Singapore Dollar', 'S$', 13),
  ('HKD', 'Hong Kong Dollar', 'HK$', 14),
  ('SEK', 'Swedish Krona', 'kr', 15),
  ('NOK', 'Norwegian Krone', 'kr', 16),
  ('DKK', 'Danish Krone', 'kr', 17),
  ('PLN', 'Polish Zloty', 'zł', 18),
  ('CZK', 'Czech Koruna', 'Kč', 19),
  ('HUF', 'Hungarian Forint', 'Ft', 20),
  ('RON', 'Romanian Leu', 'lei', 21),
  ('BGN', 'Bulgarian Lev', 'лв', 22),
  ('TRY', 'Turkish Lira', '₺', 23)
ON CONFLICT (code) DO NOTHING;

