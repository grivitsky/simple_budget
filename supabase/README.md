# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Project Settings > API

## 2. Set Up Database

Run the SQL from `schema.sql` in your Supabase SQL Editor:
- Go to your Supabase dashboard
- Navigate to SQL Editor
- Copy and paste the contents of `schema.sql`
- Click "Run"

This will create:
- `users` table with all necessary fields
- Indexes for performance
- Row Level Security policies
- Auto-update triggers for `updated_at`

## 3. Configure Environment Variables

Create a `.env` file in the project root with:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with your actual Supabase project URL and anon key.

## 4. Row Level Security (RLS)

The schema includes RLS policies. For development, you might want to temporarily disable RLS:

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

For production, keep RLS enabled and configure policies as needed.

## 5. Users Table Schema

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| telegram_id | BIGINT | Telegram user ID (unique) |
| username | TEXT | Telegram username (nullable) |
| first_name | TEXT | User's first name |
| last_name | TEXT | User's last name |
| language_code | TEXT | Telegram language code |
| photo_url | TEXT | Profile photo URL |
| ai_features_enabled | BOOLEAN | AI features toggle (default: false) |
| default_currency | TEXT | User's default currency (default: 'PLN') |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

## 6. Testing

After setup, the app will automatically:
1. Check if user exists when opening the Telegram Mini App
2. Create new user account if not found
3. Store all available Telegram user data
4. Set default values for AI features (off) and currency (PLN)

