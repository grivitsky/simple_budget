import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrCreateUser } from '../bot/lib/userService';
import { createSpendingFromMessage } from '../bot/lib/spendingService';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    date: number;
    text?: string;
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle GET requests (for webhook verification)
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, message: 'Webhook endpoint is active' });
  }

  // Only allow POST requests for actual webhook updates
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update: TelegramUpdate = req.body;

    // Verify bot token (optional security check)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not set');
      return res.status(500).json({ error: 'Bot token not configured' });
    }

    // Handle webhook verification (Telegram sends this initially)
    if (update.update_id === undefined && req.query.setWebhook) {
      return res.status(200).json({ ok: true });
    }

    // Process message
    if (update.message?.text && update.message.from) {
      const messageText = update.message.text.trim();
      const telegramUser = update.message.from;

      // Skip bot messages
      if (telegramUser.is_bot) {
        return res.status(200).json({ ok: true });
      }

      // Get or create user
      const user = await getOrCreateUser({
        id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        language_code: telegramUser.language_code,
      });

      if (!user) {
        console.error('Failed to get or create user');
        return res.status(500).json({ error: 'User authentication failed' });
      }

      // Create spending from message
      console.log('📨 Processing message:', messageText);
      const spending = await createSpendingFromMessage(user, messageText);
      console.log('📊 Parsing result:', spending ? 'Success' : 'Failed');

      if (spending) {
        // Send success response to user via Telegram Bot API
        const chatId = update.message.chat.id;
        const responseText = `✅ Logged: ${spending.spending_amount} ${spending.currency_code} - ${spending.spending_name}`;
        
        // Send confirmation message (optional - you can remove this if not needed)
        try {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: responseText,
            }),
          });
        } catch (error) {
          console.error('Error sending confirmation message:', error);
          // Don't fail the request if confirmation message fails
        }

        return res.status(200).json({ 
          ok: true, 
          spending: {
            id: spending.id,
            amount: spending.spending_amount,
            currency: spending.currency_code,
            name: spending.spending_name,
          }
        });
      } else {
        // Send error message to user
        const chatId = update.message.chat.id;
        const errorText = `❌ Could not parse spending. Format: "10.12 $ Food" or "10.12 USD Food" or "10.12 Food"`;
        
        try {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: errorText,
            }),
          });
        } catch (error) {
          console.error('Error sending error message:', error);
        }

        return res.status(200).json({ ok: true, error: 'Failed to parse spending' });
      }
    }

    // Acknowledge update even if we don't process it
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

