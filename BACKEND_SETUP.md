# Backend Setup Guide

## Prerequisites

- Supabase account (create at [supabase.com](https://supabase.com))
- Node.js and npm installed

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - Name: `simple-budget` (or your preferred name)
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
4. Wait for project to finish setting up (~2 minutes)

## Step 2: Get API Credentials

1. In your Supabase dashboard, go to **Project Settings** (gear icon)
2. Click on **API** in the left sidebar
3. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

## Step 3: Set Up Environment Variables

### For Vercel Production

Add environment variables in Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add `VITE_SUPABASE_URL` with your Supabase URL
3. Add `VITE_SUPABASE_ANON_KEY` with your anon key
4. Select all environments (Production, Preview, Development)

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed instructions.

### For Local Development

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace the values with your actual Supabase credentials.

**Note:** `.env` is already in `.gitignore`

## Step 4: Create Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire content of `supabase/schema.sql`
4. Paste into the SQL editor
5. Click "Run" or press `Ctrl/Cmd + Enter`

This creates:
- `users` table with all required fields
- Indexes for performance
- Row Level Security policies
- Auto-update trigger for `updated_at`

## Step 5: Configure Row Level Security (Optional for Development)

RLS is disabled by default in our schema so the Telegram Mini App can talk directly to Supabase.  
When you're ready to harden security, you can:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- add RLS policies
```

## Step 6: Test the Setup

1. Start the development server:
```bash
npm run dev
```

2. Open the app in Telegram:
   - Your app should connect to Telegram WebApp
   - Check browser console for logs:
     - "Telegram user data: {...}"
     - "User authenticated: {...}" or "New user created: {...}"

3. Verify in Supabase:
   - Go to **Table Editor** > **users**
   - You should see a new row with your Telegram data

## How It Works

### Authentication Flow

1. **App Opens** → Telegram Mini App initializes
2. **Get User Data** → `window.Telegram.WebApp.initDataUnsafe.user` provides:
   - `id` (Telegram user ID)
   - `username`
   - `first_name`
   - `last_name`
   - `language_code`
   - `photo_url`
3. **Check Database** → Query users by `telegram_id`
4. **Create or Return**:
   - If user exists → Return existing user
   - If new user → Create account with defaults:
     - `ai_features_enabled: false`
     - `default_currency: 'USD'`

### User Object Structure

```typescript
{
  id: "uuid",                    // Supabase UUID
  telegram_id: 123456789,        // Telegram user ID
  username: "john_doe",          // Telegram username
  first_name: "John",            // User's first name
  last_name: "Doe",              // User's last name
  language_code: "en",           // Telegram language
  photo_url: "https://...",      // Profile photo
  ai_features_enabled: false,    // AI toggle
  default_currency: "USD",       // Default currency
  created_at: "2025-01-01...",  // Creation timestamp
  updated_at: "2025-01-01..."   // Last update timestamp
}
```

## Troubleshooting

### "No Telegram user data available"
- **Cause**: Running outside Telegram environment
- **Solution**: Test in actual Telegram Mini App or use mock data for development

### "Error creating user" or "Error fetching user"
- **Cause**: Database connection or permission issues
- **Check**:
  1. Environment variables are correctly set
  2. Supabase project is active
  3. Schema was created successfully
  4. RLS is currently disabled (expected)

### Check Database Directly

```sql
-- View all users
SELECT * FROM users;

-- Find specific user by Telegram ID
SELECT * FROM users WHERE telegram_id = 123456789;

-- Check if user exists
SELECT COUNT(*) FROM users WHERE telegram_id = 123456789;
```

## Next Steps

- **Update Settings Page**: Connect to `updateUserSettings` function
- **Add Transactions Table**: Store user transactions
- **Add Categories Table**: Custom user categories
- **Add Budgets Table**: Budget tracking per user

