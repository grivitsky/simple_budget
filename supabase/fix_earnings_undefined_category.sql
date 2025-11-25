-- Fix: Ensure "Undefined" category exists in earnings_categories
-- This should be run if the category is missing

-- First, check if it exists
DO $$
DECLARE
  category_exists BOOLEAN;
  undefined_id UUID;
BEGIN
  SELECT EXISTS(SELECT 1 FROM earnings_categories WHERE name = 'Undefined') INTO category_exists;
  
  IF NOT category_exists THEN
    RAISE NOTICE 'Undefined category does not exist. Creating it...';
    
    INSERT INTO earnings_categories (name, emoji, color, text_color, display_order) 
    VALUES ('Undefined', '❔', '#9E9E9E', '#FFFFFF', 0)
    RETURNING id INTO undefined_id;
    
    RAISE NOTICE 'Created Undefined category with ID: %', undefined_id;
  ELSE
    SELECT id INTO undefined_id FROM earnings_categories WHERE name = 'Undefined' LIMIT 1;
    RAISE NOTICE 'Undefined category already exists with ID: %', undefined_id;
  END IF;
END $$;

-- Verify it was created/exists
SELECT * FROM earnings_categories WHERE name = 'Undefined';

-- Improve the trigger function to handle edge cases better
CREATE OR REPLACE FUNCTION set_default_earning_category()
RETURNS TRIGGER AS $$
DECLARE
  undefined_category_id UUID;
BEGIN
  -- Only set if category_id is NULL
  IF NEW.category_id IS NULL THEN
    -- Try to get Undefined category
    SELECT id INTO undefined_category_id
    FROM earnings_categories
    WHERE name = 'Undefined'
    LIMIT 1;
    
    -- If found, set it
    IF undefined_category_id IS NOT NULL THEN
      NEW.category_id := undefined_category_id;
    ELSE
      -- Log warning if category doesn't exist (but don't fail the insert)
      RAISE WARNING 'Undefined earnings category not found. Earnings will be created without category.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verify trigger is still active
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'set_default_earning_category_trigger';

