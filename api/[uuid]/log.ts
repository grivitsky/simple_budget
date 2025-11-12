import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserById } from '../../bot/lib/userService';
import { createSpendingFromMessage } from '../../bot/lib/spendingService';

/**
 * API endpoint for logging spendings via iPhone shortcuts
 * URL format: /api/{uuid}/log?message=...
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET and POST requests
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract UUID from URL path (Vercel dynamic route)
    // URL format: /api/{uuid}/log
    // In Vercel, dynamic route segments are available in req.query
    let uuid: string | undefined;
    
    // Try to get from query (Vercel dynamic route)
    if (req.query.uuid) {
      uuid = Array.isArray(req.query.uuid) ? req.query.uuid[0] : req.query.uuid;
    }
    
    // Fallback: parse from URL if not in query
    if (!uuid && req.url) {
      const urlMatch = req.url.match(/\/api\/([a-f0-9-]{36})\/log/);
      if (urlMatch) {
        uuid = urlMatch[1];
      }
    }
    
    if (!uuid || typeof uuid !== 'string') {
      return res.status(400).json({ 
        error: 'UUID is required in URL path. Format: /api/{uuid}/log?message=...',
        received: { query: req.query, url: req.url }
      });
    }

    // Get message from query parameter or request body
    const message = req.method === 'GET' 
      ? (req.query.message as string)
      : (req.body?.message || req.body?.text || req.body?.sms);

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('📱 Received SMS log request:', { uuid, messageLength: message.length });

    // Get user by UUID
    const user = await getUserById(uuid);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if AI features are enabled for this user
    if (!user.ai_features_enabled) {
      return res.status(403).json({ error: 'AI features are not enabled for this user' });
    }

    // Call OpenAI to extract transaction information
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not set');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const openaiPrompt = `You are an accountant assistant. Read the following SMS message from a bank or financial institution and extract the transaction information.

IMPORTANT: Return ONLY the transaction in this exact format, nothing else:
- If currency is mentioned (symbol or code): "Amount CurrencyCode SpendingName"
- If no currency is mentioned: "Amount SpendingName"

Currency symbol to code mapping:
- $ → USD
- € → EUR
- £ → GBP
- ¥ → JPY
- ₹ → INR
- ₽ → RUB
- ₺ → TRY
- zł → PLN
- kr → SEK (or other kr currencies)
- Other symbols: convert to 3-letter currency code if known

Examples:
- "You spent $50.00 at McDonald's" → "50.00 USD McDonald's"
- "Payment of 100.00 PLN to Biedronka" → "100.00 PLN Biedronka"
- "Transaction: 25.50 Coffee Shop" → "25.50 Coffee Shop"
- "Card payment 75.99 Grocery Store" → "75.99 Grocery Store"
- "Charged €30.50 at Starbucks" → "30.50 EUR Starbucks"
- "Withdrawal: 200.00" → "200.00 Withdrawal" (if no merchant name)

SMS Message:
${message}

Transaction (return ONLY the transaction, no explanation, no additional text):`;

    console.log('🤖 Calling OpenAI API...');
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using mini for cost efficiency, can be changed to gpt-4 if needed
        messages: [
          {
            role: 'system',
            content: 'You are a helpful accountant assistant that extracts transaction information from SMS messages. Always return only the transaction in the specified format, nothing else.',
          },
          {
            role: 'user',
            content: openaiPrompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent formatting
        max_tokens: 100,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', openaiResponse.status, errorText);
      return res.status(502).json({ 
        error: 'Failed to process message with AI',
        details: errorText,
      });
    }

    const openaiData = await openaiResponse.json();
    const extractedMessage = openaiData.choices?.[0]?.message?.content?.trim();

    if (!extractedMessage) {
      console.error('No content from OpenAI response:', openaiData);
      return res.status(502).json({ error: 'AI did not return a valid transaction' });
    }

    console.log('✅ OpenAI extracted:', extractedMessage);

    // Create spending from the extracted message
    const spending = await createSpendingFromMessage(user, extractedMessage);

    if (spending) {
      return res.status(200).json({
        success: true,
        message: 'Spending logged successfully',
        spending: {
          id: spending.id,
          amount: spending.spending_amount,
          currency: spending.currency_code,
          name: spending.spending_name,
        },
      });
    } else {
      return res.status(400).json({
        error: 'Failed to parse transaction from AI response',
        ai_response: extractedMessage,
      });
    }
  } catch (error) {
    console.error('Error processing SMS log:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

