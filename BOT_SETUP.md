# Telegram Bot Setup Guide

This guide will help you set up the Telegram bot backend that receives messages and logs spendings.

## Prerequisites

- Telegram account
- Supabase project (already set up)
- Vercel account (for deployment)

## Step 1: Create Telegram Bot

1. Open Telegram and find [@BotFather](https://t.me/BotFather)
2. Send `/newbot` to create a new bot
3. Follow the prompts:
   - Enter bot name (e.g., "Budget Tracker Bot")
   - Enter username (e.g., "my_budget_bot")
4. **Copy the bot token** - you'll need this for environment variables

## Step 2: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

   - **Name**: `TELEGRAM_BOT_TOKEN`
     **Value**: Your bot token from BotFather
     **Environments**: Production, Preview, Development

   - **Name**: `SUPABASE_URL` (or use existing `VITE_SUPABASE_URL`)
     **Value**: Your Supabase project URL
     **Environments**: Production, Preview, Development

   - **Name**: `SUPABASE_ANON_KEY` (or use existing `VITE_SUPABASE_ANON_KEY`)
     **Value**: Your Supabase anon key
     **Environments**: Production, Preview, Development

## Step 3: Deploy to Vercel

The bot webhook is automatically deployed as a Vercel serverless function at:
```
https://your-project.vercel.app/api/telegram-webhook
```

After deployment, note your Vercel project URL.

## Step 4: Set Telegram Webhook

After deployment, configure Telegram to send updates to your webhook:

### Option A: Using curl

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-project.vercel.app/api/telegram-webhook"}'
```

### Option B: Using Browser

Visit this URL (replace with your values):
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-project.vercel.app/api/telegram-webhook
```

### Option C: Verify Webhook

Check if webhook is set correctly:
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

## Step 5: Test the Bot

1. Open Telegram and find your bot (search for the username you created)
2. Start a conversation with the bot
3. Send a test message:
   - `10.12 $ Food`
   - `10.12 USD Food`
   - `10.12 Food` (uses your default currency)

4. You should receive a confirmation message:
   - `✅ Logged: 10.12 USD - Food`

5. Check your Supabase `spendings` table to verify the entry was created

## Supported Message Formats

- `"10.12 $ Food"` - Amount + currency symbol + name
- `"10.12 USD Food"` - Amount + currency code + name
- `"10.12 Food"` - Amount + name (uses user's default currency)
- `"10,50 € Restaurant"` - Supports comma as decimal separator

## Troubleshooting

### Bot doesn't respond

1. **Check webhook is set**: Visit `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
2. **Check environment variables**: Ensure `TELEGRAM_BOT_TOKEN` is set in Vercel
3. **Check Vercel logs**: Go to Vercel dashboard → Deployments → Functions → View logs

### "User authentication failed"

- Ensure Supabase credentials are correctly set
- Check that the `users` table exists and RLS policies allow inserts

### "Failed to parse spending"

- Check message format matches supported patterns
- Ensure currency code exists in `currencies` table
- Check that exchange rates are populated (run the Edge Function)

### Webhook verification fails

- Ensure your Vercel deployment is live
- Check that the `/api/telegram-webhook` endpoint is accessible
- Verify HTTPS is enabled (Telegram requires HTTPS for webhooks)

## Local Development

For local testing, use ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Start local server (if you have one)
# Then tunnel it
ngrok http 3000

# Set webhook to ngrok URL
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://your-ngrok-url.ngrok.io/api/telegram-webhook"
```

## Architecture

- **Webhook Endpoint**: `api/telegram-webhook.ts` (Vercel serverless function)
- **Services**: `bot/lib/` - All service functions adapted for Node.js
- **Database**: Supabase (shared with Mini App frontend)

## Next Steps

- The bot is now ready to receive and log spendings
- Users can send messages to log expenses
- All spendings are stored in the `spendings` table
- Exchange rates are automatically fetched from the `currencies` table
- Categories are automatically matched based on spending name

