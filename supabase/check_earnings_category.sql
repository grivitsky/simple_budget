-- Check if "Undefined" category exists in earnings_categories
SELECT * FROM earnings_categories WHERE name = 'Undefined';

-- If it doesn't exist, insert it:
INSERT INTO earnings_categories (name, emoji, color, text_color, display_order) 
VALUES ('Undefined', '❔', '#9E9E9E', '#FFFFFF', 0)
ON CONFLICT (name) DO NOTHING;

-- Test the trigger function directly
-- This simulates what happens when inserting an earning with NULL category_id
DO $$
DECLARE
  test_category_id UUID;
BEGIN
  SELECT id INTO test_category_id
  FROM earnings_categories
  WHERE name = 'Undefined'
  LIMIT 1;
  
  IF test_category_id IS NULL THEN
    RAISE NOTICE 'ERROR: Undefined category not found!';
  ELSE
    RAISE NOTICE 'SUCCESS: Undefined category found with ID: %', test_category_id;
  END IF;
END $$;

-- Check the trigger function code
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'set_default_earning_category';

