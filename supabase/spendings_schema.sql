-- Create spendings table
CREATE TABLE IF NOT EXISTS spendings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spending_name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  spending_amount NUMERIC(18, 2) NOT NULL,
  currency_code TEXT NOT NULL REFERENCES currencies(code) ON UPDATE CASCADE,
  exchange_rate NUMERIC(18, 6) NOT NULL,
  amount_in_base_currency NUMERIC(18, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_spendings_user_id ON spendings(user_id);
CREATE INDEX IF NOT EXISTS idx_spendings_category_id ON spendings(category_id);
CREATE INDEX IF NOT EXISTS idx_spendings_currency_code ON spendings(currency_code);
CREATE INDEX IF NOT EXISTS idx_spendings_created_at ON spendings(created_at);
CREATE INDEX IF NOT EXISTS idx_spendings_user_created ON spendings(user_id, created_at DESC);

-- Create updated_at trigger function (if not already exists)
CREATE OR REPLACE FUNCTION update_spendings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_spendings_updated_at
  BEFORE UPDATE ON spendings
  FOR EACH ROW
  EXECUTE FUNCTION update_spendings_updated_at();

-- Function to set default category to "Undefined" if not provided
CREATE OR REPLACE FUNCTION set_default_category()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category_id IS NULL THEN
    SELECT id INTO NEW.category_id
    FROM categories
    WHERE name = 'Undefined'
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set default category
CREATE TRIGGER set_default_category_trigger
  BEFORE INSERT ON spendings
  FOR EACH ROW
  EXECUTE FUNCTION set_default_category();

-- Enable Row Level Security
ALTER TABLE spendings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own spendings
CREATE POLICY "Users can view their own spendings"
  ON spendings
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE telegram_id = current_setting('app.telegram_id', true)::BIGINT
    )
  );

-- Policy: Users can insert their own spendings
CREATE POLICY "Users can insert their own spendings"
  ON spendings
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own spendings
CREATE POLICY "Users can update their own spendings"
  ON spendings
  FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM users WHERE telegram_id = current_setting('app.telegram_id', true)::BIGINT
    )
  );

-- Policy: Users can delete their own spendings
CREATE POLICY "Users can delete their own spendings"
  ON spendings
  FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM users WHERE telegram_id = current_setting('app.telegram_id', true)::BIGINT
    )
  );

-- Note: For development, you might want to temporarily disable RLS:
-- ALTER TABLE spendings DISABLE ROW LEVEL SECURITY;

