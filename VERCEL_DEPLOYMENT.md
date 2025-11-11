# Vercel Deployment with Supabase

## Environment Variables Setup

### For Vercel Production

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | Production, Preview, Development |

4. Click "Save" for each variable

### For Local Development

Create a `.env` file in the project root for local testing:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note:** `.env` is already in `.gitignore` and won't be committed.

## Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Add Supabase authentication"
git push origin main
```

### 2. Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect Vite configuration
4. Add environment variables (see above)
5. Click "Deploy"

**Option B: Via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

### 3. Verify Deployment

1. Open the deployed URL
2. Check browser console for:
   - "Telegram user data: {...}"
   - "User authenticated: {...}"
3. Verify in Supabase Table Editor that user was created

## Configuration Files

Your `vercel.json` is already configured:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Testing in Telegram

### 1. Set up Bot

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Create new bot: `/newbot`
3. Follow prompts to name your bot
4. Get bot token

### 2. Create Mini App

1. Message [@BotFather](https://t.me/botfather)
2. Send `/newapp`
3. Select your bot
4. Enter app details:
   - **Short name**: `simplebudget` (lowercase, no spaces)
   - **Title**: `Simple Budget`
   - **Description**: `Track your expenses`
   - **Photo**: Upload app icon (640x360px)
   - **Web App URL**: Your Vercel URL (e.g., `https://your-app.vercel.app`)

### 3. Test

1. Open your bot in Telegram
2. Tap "Menu" button or send command
3. Select your Mini App
4. App should load and authenticate automatically

## Environment-Specific URLs

You can set different Supabase projects for different environments:

**Production:**
```
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod_key
```

**Preview/Staging:**
```
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=staging_key
```

**Development:**
Use local `.env` file with development Supabase project.

## Troubleshooting

### Build Fails on Vercel

**Check:**
- All dependencies are in `package.json`
- `npm run build` works locally
- TypeScript has no errors

### Authentication Fails in Production

**Check:**
1. Environment variables are set correctly in Vercel
2. Supabase URL is accessible (not localhost)
3. Anon key matches your Supabase project
4. Browser console for error messages

### "No Telegram user data available"

**This is normal** when:
- Testing directly via Vercel URL (not in Telegram)
- Not opened as Telegram Mini App

**Solution:**
- Always test via Telegram Mini App
- For development, can mock user data

## Security Notes

✅ **Safe to commit:**
- Supabase URL (public)
- Supabase Anon Key (public, RLS protected)

❌ **Never commit:**
- `.env` file
- Supabase Service Role Key
- Database passwords

✅ **Vercel automatically:**
- Encrypts environment variables
- Injects them at build time
- Keeps them secure

## Monitoring

### Check Logs

**Vercel:**
- Go to your project → Deployments → Select deployment
- View "Functions" logs and "Runtime Logs"

**Supabase:**
- Database → Logs → Database queries
- Auth → Logs (if using Supabase Auth)

### Check Database

```sql
-- Count users
SELECT COUNT(*) FROM users;

-- Recent users
SELECT telegram_id, first_name, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- Check AI features
SELECT ai_features_enabled, COUNT(*) 
FROM users 
GROUP BY ai_features_enabled;
```

## Next Steps

1. ✅ Set environment variables in Vercel
2. ✅ Deploy to production
3. ✅ Create Telegram Mini App
4. ✅ Test authentication
5. 🔜 Add more features (transactions, budgets, etc.)

