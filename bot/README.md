# Telegram Bot Backend

This bot receives messages from users in Telegram chat, parses spending entries, and logs them to the Supabase database.

## Setup

### 1. Environment Variables

Add these to your Vercel project (Settings → Environment Variables):

- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token from BotFather
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key

Alternatively, you can use the `VITE_` prefixed variables if they're already set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 2. Get Bot Token

1. Open Telegram and find [@BotFather](https://t.me/BotFather)
2. Send `/newbot` to create a new bot
3. Follow the prompts to name your bot
4. Copy the bot token

### 3. Set Webhook

After deploying to Vercel, set your webhook URL:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-project.vercel.app/api/telegram-webhook"}'
```

Or use the Telegram Bot API directly:
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-project.vercel.app/api/telegram-webhook
```

### 4. Test

Send a message to your bot in Telegram:
- `10.12 $ Food`
- `10.12 USD Food`
- `10.12 Food` (uses your default currency)

The bot will:
1. Parse the message
2. Get or create your user account
3. Log the spending to the database
4. Send a confirmation message back

## Message Formats

Supported formats:
- `"10.12 $ Food"` - Amount + symbol + name
- `"10.12 USD Food"` - Amount + code + name
- `"10.12 Food"` - Amount + name (uses user's default currency)
- `"10,50 € Restaurant"` - Supports comma as decimal separator

## Architecture

- **Webhook Endpoint**: `api/telegram-webhook.ts` (Vercel serverless function)
- **Services**: `bot/lib/` - Adapted services for Node.js environment
- **Database**: Supabase (shared with Mini App)

## Local Development

For local testing, use a tool like ngrok to tunnel to your local server:

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 3000

# Use the ngrok URL for webhook
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://your-ngrok-url.ngrok.io/api/telegram-webhook"
```

