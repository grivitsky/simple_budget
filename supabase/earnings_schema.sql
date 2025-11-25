-- Create earnings table (same structure as spendings)
CREATE TABLE IF NOT EXISTS earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  earning_name TEXT NOT NULL,
  category_id UUID REFERENCES earnings_categories(id) ON DELETE SET NULL,
  earning_amount NUMERIC(18, 2) NOT NULL,
  currency_code TEXT NOT NULL REFERENCES currencies(code) ON UPDATE CASCADE,
  exchange_rate NUMERIC(18, 6) NOT NULL,
  amount_in_base_currency NUMERIC(18, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_earnings_user_id ON earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_earnings_category_id ON earnings(category_id);
CREATE INDEX IF NOT EXISTS idx_earnings_currency_code ON earnings(currency_code);
CREATE INDEX IF NOT EXISTS idx_earnings_created_at ON earnings(created_at);
CREATE INDEX IF NOT EXISTS idx_earnings_user_created ON earnings(user_id, created_at DESC);

-- Create updated_at trigger function (if not already exists)
CREATE OR REPLACE FUNCTION update_earnings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_earnings_updated_at
  BEFORE UPDATE ON earnings
  FOR EACH ROW
  EXECUTE FUNCTION update_earnings_updated_at();

-- Function to set default category to "Undefined" if not provided
CREATE OR REPLACE FUNCTION set_default_earning_category()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category_id IS NULL THEN
    SELECT id INTO NEW.category_id
    FROM earnings_categories
    WHERE name = 'Undefined'
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set default category
CREATE TRIGGER set_default_earning_category_trigger
  BEFORE INSERT ON earnings
  FOR EACH ROW
  EXECUTE FUNCTION set_default_earning_category();

-- Enable Row Level Security
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own earnings
CREATE POLICY "Users can view their own earnings"
  ON earnings
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE telegram_id = current_setting('app.telegram_id', true)::BIGINT
    )
  );

-- Policy: Users can insert their own earnings
CREATE POLICY "Users can insert their own earnings"
  ON earnings
  FOR INSERT
  WITH CHECK (true);

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

