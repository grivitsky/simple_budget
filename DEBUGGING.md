# Debugging Authentication Issues

## How to Debug

### 1. Check Browser Console

Open your browser DevTools (F12 or Right-click → Inspect) and look for these logs:

#### Expected Success Flow:
```
Supabase Config: { url: '✓ Set', key: '✓ Set', urlValue: 'https://...' }
Telegram user data: { id: 123456789, first_name: '...', ... }
🔍 Checking user with telegram_id: 123456789
👤 Creating new user...
📝 User data to insert: { telegram_id: 123456789, ... }
✅ New user created: { id: '...', telegram_id: 123456789, ... }
User authenticated: { id: '...', telegram_id: 123456789, ... }
```

### 2. Common Issues & Solutions

#### Issue: "✗ Missing" for URL or Key
**Problem:** Environment variables not set

**Solution:**
- **Local dev:** Check `.env` file exists in project root
- **Vercel:** Go to Settings → Environment Variables and verify both are set

#### Issue: "No Telegram user data available"
**Problem:** Not running in Telegram Mini App environment

**Solution:**
- Test in actual Telegram Mini App (not regular browser)
- For development, you can temporarily mock the data in App.tsx:
```typescript
const telegramUser = tg.initDataUnsafe?.user || {
  id: 123456789,
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser'
};
```

#### Issue: "❌ Error creating user"
**Problem:** Database permission or connection issue

**Check the error details in console:**

**Error: "new row violates row-level security policy"**
- RLS is blocking the insert
- Solution: Run in Supabase SQL Editor:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

**Error: "relation 'users' does not exist"**
- Table not created
- Solution: Run the SQL from `supabase/schema.sql`

**Error: "duplicate key value violates unique constraint"**
- User already exists (but fetch failed)
- Solution: Check Supabase Table Editor for existing user

**Error: "Failed to fetch" or "NetworkError"**
- Cannot connect to Supabase
- Solution: Check URL is correct and project is active

### 3. Verify Environment Variables

Run this in your terminal:
```bash
# Check if .env file exists
ls -la .env

# Print variables (local dev only, never commit)
cat .env
```

Should see:
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Test Supabase Connection

Add this temporary test in `App.tsx` (remove after testing):
```typescript
// Add after imports
import { supabase } from './lib/supabase';

// Add inside useEffect, before authentication
const testConnection = async () => {
  console.log('🧪 Testing Supabase connection...');
  const { data, error } = await supabase
    .from('users')
    .select('count')
    .limit(1);
  
  if (error) {
    console.error('❌ Connection test failed:', error);
  } else {
    console.log('✅ Connection test passed');
  }
};
testConnection();
```

### 5. Check Supabase Project

In Supabase Dashboard:

**Table Editor:**
- Go to Table Editor
- Check if `users` table exists
- Check table structure matches schema

**SQL Editor:**
```sql
-- Check if table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'users';

-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- Try manual insert
INSERT INTO users (telegram_id, first_name, default_currency, ai_features_enabled)
VALUES (999999999, 'Test User', 'PLN', false);
```

**Logs:**
- Go to Logs → PostgREST logs
- Look for errors when app tries to connect

### 6. Test in Development

For local testing without Telegram:

**Option A: Mock Telegram data**
```typescript
// In App.tsx useEffect
const telegramUser = {
  id: Date.now(), // Unique ID for testing
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
  language_code: 'en'
};
console.log('🧪 Using mock user:', telegramUser);
const userData = await getOrCreateUser(telegramUser);
```

**Option B: Use Telegram Web?**
- Install Telegram Desktop or Web
- Open BotFather → create Mini App
- Test there

### 7. Network Inspection

In DevTools → Network tab:
- Filter by `supabase`
- Look for requests to your Supabase URL
- Check status codes:
  - `200/201` = Success
  - `401` = Unauthorized (check keys)
  - `404` = Not found (table missing?)
  - `500` = Server error (check Supabase logs)

## Checklist

- [ ] `.env` file exists and has both variables
- [ ] Supabase URL and key are correct
- [ ] SQL schema has been run in Supabase
- [ ] `users` table exists in Table Editor
- [ ] Testing in Telegram Mini App (or mocking data)
- [ ] Browser console shows detailed logs
- [ ] No errors in Network tab
- [ ] Supabase project is active (not paused)

## Quick Fixes

### If RLS is the issue:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### If table is missing:
Run `supabase/schema.sql` in SQL Editor

### If environment variables are wrong:
```bash
# Delete and recreate .env
rm .env
echo "VITE_SUPABASE_URL=https://your-url.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=your-key" >> .env

# Restart dev server
npm run dev
```

## Still Not Working?

Share these details:
1. Console logs (full output)
2. Network tab screenshot
3. Supabase Table Editor screenshot
4. Environment (Telegram/Browser, Local/Vercel)
5. Any error messages

