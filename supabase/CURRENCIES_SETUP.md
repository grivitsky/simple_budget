# Currencies Table Setup Guide

## Overview

The SettingsPage now loads currencies from the database instead of using hardcoded values. This allows for easier management and includes currency symbols.

## Setup Instructions

### 1. Run the SQL Script

Go to your Supabase SQL Editor and run the entire `currencies_schema.sql` file:

1. Open your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click "New Query"
4. Copy and paste the contents of `supabase/currencies_schema.sql`
5. Click **Run**

This will:
- Create the `currencies` table with fields: `id`, `code`, `name`, `symbol`, `display_order`, `created_at`
- Set up indexes for performance
- Enable Row Level Security with public read access
- Insert 23 default currencies with their symbols

### 2. Verify the Setup

After running the script, you can verify by:

1. Go to **Table Editor** in Supabase
2. Find the `currencies` table
3. You should see 23 currencies with codes like USD, EUR, GBP, etc.

### 3. How It Works

**In the App:**
- When user opens Settings, currencies are loaded from the database
- User's current default currency is displayed (from `users.default_currency`)
- When user selects a currency, it updates `users.default_currency` in the database
- The modal closes automatically after successful update

**Database Structure:**
```sql
currencies table:
├── id (UUID, primary key)
├── code (TEXT, unique) - e.g., "USD", "EUR"
├── name (TEXT) - e.g., "US Dollar", "Euro"
├── symbol (TEXT) - e.g., "$", "€"
├── display_order (INTEGER) - for sorting
└── created_at (TIMESTAMP)
```

### 4. User Data Display

The SettingsPage now displays:
- **Avatar**: User's photo from `users.photo_url`, or initials (first letter of first_name + first letter of last_name) if no photo
- **Name**: User's full name from `users.first_name` and `users.last_name`
- **Currency**: User's default currency from `users.default_currency`

### 5. Currency Selection

The currency modal displays each currency with:
- **Symbol** (left side) - e.g., "$", "€", "£"
- **Currency Name** (main text) - e.g., "US Dollar"
- **Currency Code** (subtext) - e.g., "USD"
- **Radio button** (right side) - shows current selection

When user selects a currency:
1. Visual selection updates immediately
2. Database is updated via `updateUserSettings()`
3. Modal closes after 300ms delay
4. Console logs success/failure

### 6. Adding More Currencies

To add more currencies, run this SQL in Supabase:

```sql
INSERT INTO currencies (code, name, symbol, display_order) VALUES
  ('KRW', 'South Korean Won', '₩', 24),
  ('THB', 'Thai Baht', '฿', 25),
  ('RUB', 'Russian Ruble', '₽', 26)
ON CONFLICT (code) DO NOTHING;
```

### 7. Security

- RLS is enabled on the `currencies` table
- Public read access is allowed (currencies are non-sensitive data)
- No insert/update/delete access via anon key (currencies are managed server-side)

### 8. Troubleshooting

**If currencies don't load:**
1. Check browser console for errors
2. Verify the table exists in Supabase
3. Ensure RLS policy allows SELECT
4. Verify Supabase credentials in environment variables

**If currency update doesn't work:**
1. Check that the `users` table has proper RLS policies
2. Verify `updateUserSettings` function is working
3. Check browser console for error messages

