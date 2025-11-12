-- Update categories with new colors and properties
-- This script updates all categories with the new color scheme including dark mode support

-- Groceries
UPDATE categories 
SET 
  emoji = '🛒',
  color = '#4CAF50',
  text_color = '#419544',
  color_dark = '#70BF73',
  text_color_dark = '#5FA262',
  display_order = 1
WHERE name = 'Groceries';

-- Eating Out
UPDATE categories 
SET 
  emoji = '🍔',
  color = '#FF7043',
  text_color = '#D95F39',
  color_dark = '#FF8D69',
  text_color_dark = '#D97859',
  display_order = 2
WHERE name = 'Eating Out';

-- Transportation
-- First, ensure Transportation category exists
INSERT INTO categories (name, emoji, color, text_color, color_dark, text_color_dark, display_order)
VALUES ('Transportation', '🚗', '#03A9F4', '#0390CF', '#35BAF6', '#2D9ED1', 3)
ON CONFLICT (name) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  text_color = EXCLUDED.text_color,
  color_dark = EXCLUDED.color_dark,
  text_color_dark = EXCLUDED.text_color_dark,
  display_order = EXCLUDED.display_order;

-- Migrate spendings from "Transport" to "Transportation" if Transport exists
UPDATE spendings 
SET category_id = (SELECT id FROM categories WHERE name = 'Transportation')
WHERE category_id = (SELECT id FROM categories WHERE name = 'Transport')
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Transport');

-- Update Transport category if it still exists (for backward compatibility)
UPDATE categories 
SET 
  emoji = '🚗',
  color = '#03A9F4',
  text_color = '#0390CF',
  color_dark = '#35BAF6',
  text_color_dark = '#2D9ED1',
  display_order = 3
WHERE name = 'Transport';

-- Subscriptions
INSERT INTO categories (name, emoji, color, text_color, color_dark, text_color_dark, display_order)
VALUES ('Subscriptions', '🔁', '#8E24AA', '#791F90', '#A550BB', '#8C449F', 4)
ON CONFLICT (name) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  text_color = EXCLUDED.text_color,
  color_dark = EXCLUDED.color_dark,
  text_color_dark = EXCLUDED.text_color_dark,
  display_order = EXCLUDED.display_order;

-- Coffee
INSERT INTO categories (name, emoji, color, text_color, color_dark, text_color_dark, display_order)
VALUES ('Coffee', '☕', '#8D6E63', '#785E54', '#A48B82', '#8B766E', 5)
ON CONFLICT (name) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  text_color = EXCLUDED.text_color,
  color_dark = EXCLUDED.color_dark,
  text_color_dark = EXCLUDED.text_color_dark,
  display_order = EXCLUDED.display_order;

-- Housing
UPDATE categories 
SET 
  emoji = '🏠',
  color = '#229ED9',
  text_color = '#1D86B8',
  color_dark = '#4EB1E1',
  text_color_dark = '#4296BF',
  display_order = 6
WHERE name = 'Housing';

-- Dates
INSERT INTO categories (name, emoji, color, text_color, color_dark, text_color_dark, display_order)
VALUES ('Dates', '💘', '#E91E63', '#C61A54', '#ED4B82', '#C9406E', 7)
ON CONFLICT (name) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  text_color = EXCLUDED.text_color,
  color_dark = EXCLUDED.color_dark,
  text_color_dark = EXCLUDED.text_color_dark,
  display_order = EXCLUDED.display_order;

-- Healthcare
UPDATE categories 
SET 
  emoji = '🏥',
  color = '#F44336',
  text_color = '#CF392E',
  color_dark = '#F6695E',
  text_color_dark = '#D15950',
  display_order = 8
WHERE name = 'Healthcare';

-- Other
INSERT INTO categories (name, emoji, color, text_color, color_dark, text_color_dark, display_order)
VALUES ('Other', '🧩', '#9E9E9E', '#868686', '#B1B1B1', '#969696', 9)
ON CONFLICT (name) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  text_color = EXCLUDED.text_color,
  color_dark = EXCLUDED.color_dark,
  text_color_dark = EXCLUDED.text_color_dark,
  display_order = EXCLUDED.display_order;

-- Entertainment
UPDATE categories 
SET 
  emoji = '🎬',
  color = '#7C4DFF',
  text_color = '#6941D9',
  color_dark = '#9671FF',
  text_color_dark = '#8060D9',
  display_order = 10
WHERE name = 'Entertainment';

-- Clothing
-- First, ensure Clothing category exists
INSERT INTO categories (name, emoji, color, text_color, color_dark, text_color_dark, display_order)
VALUES ('Clothing', '👕', '#009688', '#008074', '#33ABA0', '#2B9188', 11)
ON CONFLICT (name) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  text_color = EXCLUDED.text_color,
  color_dark = EXCLUDED.color_dark,
  text_color_dark = EXCLUDED.text_color_dark,
  display_order = EXCLUDED.display_order;

-- Migrate spendings from "Shopping" to "Clothing" if Shopping exists
UPDATE spendings 
SET category_id = (SELECT id FROM categories WHERE name = 'Clothing')
WHERE category_id = (SELECT id FROM categories WHERE name = 'Shopping')
  AND EXISTS (SELECT 1 FROM categories WHERE name = 'Shopping');

-- Update Shopping category if it still exists (for backward compatibility)
UPDATE categories 
SET 
  emoji = '👕',
  color = '#009688',
  text_color = '#008074',
  color_dark = '#33ABA0',
  text_color_dark = '#2B9188',
  display_order = 11
WHERE name = 'Shopping';

-- Business
INSERT INTO categories (name, emoji, color, text_color, color_dark, text_color_dark, display_order)
VALUES ('Business', '💼', '#546E7A', '#475E68', '#768B95', '#64767F', 12)
ON CONFLICT (name) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  text_color = EXCLUDED.text_color,
  color_dark = EXCLUDED.color_dark,
  text_color_dark = EXCLUDED.text_color_dark,
  display_order = EXCLUDED.display_order;

-- Gifts
INSERT INTO categories (name, emoji, color, text_color, color_dark, text_color_dark, display_order)
VALUES ('Gifts', '🎁', '#FF4081', '#D9366E', '#FF669A', '#D95783', 13)
ON CONFLICT (name) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  text_color = EXCLUDED.text_color,
  color_dark = EXCLUDED.color_dark,
  text_color_dark = EXCLUDED.text_color_dark,
  display_order = EXCLUDED.display_order;

-- Travel
UPDATE categories 
SET 
  emoji = '✈️',
  color = '#00BCD4',
  text_color = '#00A0B4',
  color_dark = '#33C9DD',
  text_color_dark = '#2BABBC',
  display_order = 14
WHERE name = 'Travel';

-- Tax
INSERT INTO categories (name, emoji, color, text_color, color_dark, text_color_dark, display_order)
VALUES ('Tax', '🧾', '#FF9800', '#D98100', '#FFAD33', '#D9932B', 15)
ON CONFLICT (name) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  text_color = EXCLUDED.text_color,
  color_dark = EXCLUDED.color_dark,
  text_color_dark = EXCLUDED.text_color_dark,
  display_order = EXCLUDED.display_order;

-- Undefined (keep this last as it's the default)
UPDATE categories 
SET 
  emoji = '❔',
  color = '#607D8B',
  text_color = '#526A76',
  color_dark = '#8097A2',
  text_color_dark = '#6D808A',
  display_order = 0
WHERE name = 'Undefined';

