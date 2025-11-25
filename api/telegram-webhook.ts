import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrCreateUser } from '../bot/lib/userService';
import { createSpendingFromMessage } from '../bot/lib/spendingService';
import { createEarningFromMessage } from '../bot/lib/earningsService';
import { formatSpendingConfirmation, formatEarningConfirmation } from '../bot/lib/quotes';

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

      // Handle /start command
      if (messageText === '/start') {
        const chatId = update.message.chat.id;
        const userName = user.first_name || user.username || 'there';
        const welcomeMessage = `👋 Welcome to *Frugalista - Budget Tracking*, ${userName}!

I help you track your expenses and income quickly and easily. Just send me your transactions in one of these formats:

*Expenses:*
• \`10.12 $ Food\`
• \`10.12 USD Food\`
• \`10.12 Food\` (uses your default currency)

*Income:*
• \`+10.12 $ Job\`
• \`+10.12 USD Freelance\`
• \`+10.12 Salary\` (uses your default currency)

I'll automatically log your transactions and send you a confirmation with a motivational quote! 💪

You can also:
• View your transactions in the Mini App
• Organize transactions by category
• See spending and income statistics and insights

Ready to start tracking? Just send me a transaction! 📊`;

        try {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: welcomeMessage,
              parse_mode: 'Markdown',
            }),
          });
        } catch (error) {
          console.error('Error sending welcome message:', error);
        }

        return res.status(200).json({ ok: true, message: 'Welcome message sent' });
      }

      // Check if this is an income transaction (starts with "+")
      // Handle both "+10.12 $ Job" and "+ 10.12 $ Job" formats
      const trimmedMessage = messageText.trim();
      const isIncome = trimmedMessage.startsWith('+');
      let messageToProcess = trimmedMessage;
      
      if (isIncome) {
        // Remove the "+" and any space immediately after it
        messageToProcess = trimmedMessage.replace(/^\+\s*/, '').trim();
        
        // Validate that we have content after stripping the "+"
        if (!messageToProcess) {
          const chatId = update.message.chat.id;
          const errorText = `❌ Invalid income format. Please include amount and name. Format: "+10.12 $ Job" or "+10.12 USD Job" or "+10.12 Job"`;
          
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
          
          return res.status(200).json({ ok: true, error: 'Invalid income format' });
        }
      }

      // Create spending or earning from message
      console.log('📨 Processing message:', messageText);
      console.log('💰 Transaction type:', isIncome ? 'Income' : 'Expense');
      console.log('📝 Message to process:', messageToProcess);
      
      let spending = null;
      let earning = null;
      
      if (isIncome) {
        // Only try to create earning for income transactions
        earning = await createEarningFromMessage(user, messageToProcess);
        console.log('📊 Income parsing result:', earning ? 'Success' : 'Failed');
        if (!earning) {
          console.error('❌ Failed to parse income. Original:', messageText, 'Processed:', messageToProcess);
        }
      } else {
        // Only try to create spending for expense transactions
        spending = await createSpendingFromMessage(user, messageToProcess);
        console.log('📊 Expense parsing result:', spending ? 'Success' : 'Failed');
        if (!spending) {
          console.error('❌ Failed to parse expense. Original:', messageText, 'Processed:', messageToProcess);
        }
      }

      if (spending || earning) {
        // Send success response to user via Telegram Bot API
        const chatId = update.message.chat.id;
        
        // Get user's display name for personalized quote
        const userName = user.first_name || user.username || 'there';
        
        // Format confirmation message with quote
        const responseText = spending
          ? formatSpendingConfirmation(
              spending.spending_amount,
              spending.currency_code,
              spending.spending_name,
              userName
            )
          : formatEarningConfirmation(
              earning!.earning_amount,
              earning!.currency_code,
              earning!.earning_name,
              userName
            );
        
        // Send confirmation message
        try {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: responseText,
              parse_mode: 'Markdown', // Enable markdown for italic quotes
            }),
          });
        } catch (error) {
          console.error('Error sending confirmation message:', error);
          // Don't fail the request if confirmation message fails
        }

        return res.status(200).json({ 
          ok: true, 
          ...(spending ? {
            spending: {
              id: spending.id,
              amount: spending.spending_amount,
              currency: spending.currency_code,
              name: spending.spending_name,
            }
          } : {
            earning: {
              id: earning!.id,
              amount: earning!.earning_amount,
              currency: earning!.currency_code,
              name: earning!.earning_name,
            }
          })
        });
      } else {
        // Send error message to user
        const chatId = update.message.chat.id;
        const errorText = `❌ Could not parse transaction. Format: "10.12 $ Food" or "10.12 USD Food" or "10.12 Food" for expenses, or "+10.12 $ Job" for income`;
        
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

        return res.status(200).json({ ok: true, error: 'Failed to parse transaction' });
      }
    }

    // Acknowledge update even if we don't process it
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

