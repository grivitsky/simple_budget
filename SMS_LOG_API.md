# SMS Log API Endpoint

This API endpoint allows you to log spending transactions from SMS messages (e.g., bank notifications) using iPhone Shortcuts and OpenAI.

## Overview

The endpoint processes SMS messages through OpenAI to extract transaction information, then logs it into the database using the same logic as the Telegram bot.

## Endpoint

```
GET/POST /api/{uuid}/log?message={sms_text}
```

### URL Parameters

- `{uuid}` - The user's UUID (from the `users` table `id` field)
- `message` - The SMS text to process (query parameter for GET, or in body for POST)

## Setup

### 1. Environment Variables

Add the following environment variable to your Vercel project:

- `OPENAI_API_KEY` - Your OpenAI API key (get it from https://platform.openai.com/api-keys)

### 2. Enable AI Features for User

Before using this endpoint, the user must have `ai_features_enabled = true` in the database:

```sql
UPDATE users 
SET ai_features_enabled = true 
WHERE id = 'user-uuid-here';
```

Or enable it via the Mini App settings (if you add a toggle in the future).

## Usage

### GET Request (Recommended for iPhone Shortcuts)

```
GET https://your-project.vercel.app/api/{user-uuid}/log?message=You%20spent%20$50.00%20at%20McDonald's
```

### POST Request

```bash
curl -X POST "https://your-project.vercel.app/api/{user-uuid}/log" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "You spent $50.00 at McDonald's"
  }'
```

### iPhone Shortcuts Setup

1. **Create a new Shortcut** in the Shortcuts app
2. **Add "Get Contents of URL"** action
3. **Set URL to**: `https://your-project.vercel.app/api/{your-uuid}/log?message={Shortcut Input}`
   - Replace `{your-uuid}` with your actual user UUID
   - The `{Shortcut Input}` will be automatically replaced with the SMS text
4. **Set Method to**: GET
5. **Add "Show Result"** action to see the response (optional)

### Example SMS Messages

The endpoint works with various SMS formats:

- "You spent $50.00 at McDonald's"
- "Payment of 100.00 PLN to Biedronka"
- "Transaction: 25.50 Coffee Shop"
- "Card payment 75.99 Grocery Store"
- "Your card ending in 1234 was charged $30.00 at Starbucks"

## How It Works

1. **Receives SMS text** from the request
2. **Validates user** by UUID and checks if AI features are enabled
3. **Calls OpenAI API** with a prompt to extract transaction information
4. **Parses OpenAI response** (format: "Amount Currency SpendingName" or "Amount SpendingName")
5. **Logs transaction** using the same `createSpendingFromMessage` function as the Telegram bot
6. **Returns success/error** response

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Spending logged successfully",
  "spending": {
    "id": "spending-uuid",
    "amount": 50.00,
    "currency": "USD",
    "name": "McDonald's"
  }
}
```

### Error Responses

**User not found:**
```json
{
  "error": "User not found"
}
```

**AI features not enabled:**
```json
{
  "error": "AI features are not enabled for this user"
}
```

**Missing message:**
```json
{
  "error": "Message is required"
}
```

**AI parsing failed:**
```json
{
  "error": "Failed to parse transaction from AI response",
  "ai_response": "extracted text from OpenAI"
}
```

## OpenAI Model

The endpoint uses `gpt-4o-mini` by default for cost efficiency. You can change this in `api/[uuid]/log.ts` if needed:

```typescript
model: 'gpt-4o-mini', // Change to 'gpt-4' for better accuracy
```

## Security Notes

- The endpoint requires a valid user UUID
- AI features must be enabled for the user
- The OpenAI API key is stored securely in Vercel environment variables
- User authentication is based on UUID (consider adding API key authentication in the future)

## Troubleshooting

1. **404 Error**: Check that the UUID in the URL is correct
2. **403 Error**: Ensure `ai_features_enabled = true` for the user
3. **502 Error**: Check that `OPENAI_API_KEY` is set in Vercel environment variables
4. **400 Error**: Verify the message parameter is included and not empty

## Finding Your User UUID

To find your user UUID:

1. Go to Supabase Dashboard > Table Editor > `users` table
2. Find your user by `telegram_id` or `username`
3. Copy the `id` field (UUID format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

Or query via SQL:

```sql
SELECT id, first_name, last_name, telegram_id 
FROM users 
WHERE telegram_id = YOUR_TELEGRAM_ID;
```

