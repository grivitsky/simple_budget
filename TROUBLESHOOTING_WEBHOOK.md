# Troubleshooting Webhook 404 Error

If you're getting a 404 error when setting the Telegram webhook, follow these steps:

## 1. Verify Deployment

Make sure your latest changes are deployed to Vercel:
- Check Vercel dashboard for latest deployment
- Ensure the deployment succeeded (not failed)
- Wait a few minutes after deployment for functions to be available

## 2. Test the Endpoint Directly

Test if the endpoint is accessible:

```bash
# Test GET request (webhook verification)
curl https://your-project.vercel.app/api/telegram-webhook

# Should return: {"ok":true,"message":"Webhook endpoint is active"}
```

## 3. Check Function Files

Ensure these files exist:
- `api/telegram-webhook.ts` - Main webhook handler
- `bot/lib/` - All service files

## 4. Verify Environment Variables

In Vercel dashboard, ensure these are set:
- `TELEGRAM_BOT_TOKEN`
- `SUPABASE_URL` (or `VITE_SUPABASE_URL`)
- `SUPABASE_ANON_KEY` (or `VITE_SUPABASE_ANON_KEY`)

## 5. Check Vercel Function Logs

1. Go to Vercel dashboard
2. Navigate to your project
3. Click on "Functions" tab
4. Check for any errors in the function logs

## 6. Set Webhook Again

After verifying everything, set the webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-project.vercel.app/api/telegram-webhook"}'
```

## 7. Verify Webhook Status

Check if webhook is set correctly:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

Expected response should show:
- `url`: Your webhook URL
- `pending_update_count`: Number of pending updates
- No `last_error_message` field (or it should be empty)

## Common Issues

### Issue: Function not found
**Solution**: Ensure `api/telegram-webhook.ts` exists and has `export default async function handler`

### Issue: 404 on GET request
**Solution**: The function now handles GET requests for verification - this should work

### Issue: Deployment not updating
**Solution**: 
- Push changes to git
- Trigger a new deployment in Vercel
- Wait for deployment to complete

### Issue: Environment variables not set
**Solution**: Add them in Vercel dashboard → Settings → Environment Variables

