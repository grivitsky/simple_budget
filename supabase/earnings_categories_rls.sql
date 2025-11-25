-- Fix RLS policies for earnings_categories table
-- This allows the API to read categories (needed for setting default category on earnings)

-- Enable Row Level Security (if not already enabled)
ALTER TABLE earnings_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public select earnings_categories" ON earnings_categories;
DROP POLICY IF EXISTS "Allow public select earnings categories" ON earnings_categories;
DROP POLICY IF EXISTS "Allow public insert earnings categories" ON earnings_categories;
DROP POLICY IF EXISTS "Allow public update earnings categories" ON earnings_categories;

-- Policy: Allow anyone to read earnings categories (needed for API operations)
-- This is safe because categories are public reference data
CREATE POLICY "Allow public select earnings_categories"
  ON earnings_categories
  FOR SELECT
  USING (true);

-- Verify the policy was created
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
WHERE tablename = 'earnings_categories';

-- Test query to verify it works
SELECT name, id FROM earnings_categories WHERE name = 'Undefined' LIMIT 1;

