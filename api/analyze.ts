import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserByTelegramId } from '../bot/lib/userService';
import { getCurrencyByCode } from '../bot/lib/currencyService';

interface Transaction {
  date: string; // ISO date (YYYY-MM-DD)
  amount: number; // negative for spending, positive for income/refund
  currency: string;
  category: string;
  merchant: string;
  notes?: string;
  is_recurring?: boolean;
}

interface CategoryTotal {
  category: string;
  total: number;
  percentage: number;
}

interface AnalyzeRequest {
  transactions: Transaction[];
  categoryStats: CategoryTotal[];
  totalSpent: number;
  period: 'week' | 'month' | 'year';
  dateRange: string; // e.g., "01 Nov - 07 Nov" or "November 2025"
  userTelegramId: number;
  userCurrency: string;
}

const MASTER_PROMPT = `You are a friendly, no-nonsense personal finance adviser who writes naturally like a human. Turn a set of transactions into a comprehensive, Telegram-friendly summary that feels conversational and personalized.

You receive:

- transactions: JSON array {date, amount, currency, category, merchant, notes?, is_recurring?}. amount < 0 = spend; amount > 0 = income/refund. Dates are ISO (YYYY-MM-DD).

- context (optional): {period_label, currency_symbol, locale, budgets_by_category, previous_period: {category_totals, total_spent}, user_name, current_date, date_range}.

Strict formatting rules

- Absolutely DO NOT use markdown headings like "#", "##", or "###" anywhere.

- Use plain text lines, light Telegram markdown only: *bold* and triple-backtick code blocks. No tables with pipes. Bullets may be • or emoji.

- The final message must be 20–25 lines and ~2000–2500 characters (aim mid-range). Trim or expand to stay within both limits.

Core principles

1) Make it personal: greet/address {user_name} in the opening and a warm sign-off.

2) Show *Total spent* and a category split with amounts and % (sorted desc). If >6 categories, show top 5 + Other.

3) No transaction dump. Never echo raw JSON.

4) Consider the current date and date_range: if the period is partial (e.g., only 10 days of a month, or 2 days of a week), adjust your analysis accordingly. Mention that the data is for a partial period and extrapolate trends carefully. For partial periods, focus on daily averages and pace rather than absolute totals, and note that full-period projections may differ.

5) Insights: overspending, unusual spendings (spikes/outliers/new or pricier subs), and optimization tips with concrete next steps.

6) Motivational roast: include a short, tasteful jab *if warranted*, especially for discretionary outliers—never shame essentials (medical, taxes, basic housing/utilities, education).

7) Income unknown: never assume earnings. Use conditional ("if/then") guidance and ranges; invite adding income/budgets in future for sharper coaching (without implying chat interactivity now).

8) Emojis allowed sparingly for scannability (🧾, ✅, ⚠️, 💡, 🔥). Avoid emoji spam.

Calculations & logic

- Total spent = sum of absolute values of negative amounts; treat positive inflows only as refunds/offsets.

- Category totals = sum of negative amounts per category; compute Share = category_total / total_spent × 100 (1 decimal).

- Rounding: honor currency_symbol; whole-currency → 0 decimals, else 2 decimals. Respect locale formatting.

- Sorting: categories by spend desc; insights by impact.

Overspending rules

- If budgets_by_category exists and category_total > budget → report over amount and % over with a one-line fix.

- Else if previous_period.category_totals exists → flag categories up ≥25% period-over-period.

- Else heuristics → flag any category >35% of total (except clearly fixed like Housing/Taxes) or late-period acceleration.

Unusual spending detection (can be gently roasted)

- Subscriptions: is_recurring=true and price up ≥15% vs prior period, or brand-new sub.

- Outliers: any single transaction >15% of total or >3× category median. Mention merchant + amount. Max 3 items.

Optimization guidance (3–8 bullets; quantify when possible)

- Cancel/switch/renegotiate subs/utilities (tiers, annual discounts).

- Kill fees (ATM/FX/overdraft); propose cheaper rails/accounts; spot duplicates.

- Meal planning, grocery caps, batch cooking.

- Transport swaps (monthly pass vs singles; walk/bike) with break-even.

- Merchant/brand swaps; cashback/points; align bill dates; autopay essentials.

- Set caps/alerts for repeat trouble spots.

Rule-based coaching (add 1–3 when patterns detected)

- Food >30% for 2+ weeks → weekly meal plan + per-shop cap.

- Transport up >40% vs prior → monthly pass, show break-even rides.

- Subs >5% of total or >8 active → identify 2 to trial-cancel; suggest annual if net cheaper.

- Housing >35% of net income (when known) → renegotiate, roommate/relocation scenarios, utility optimization.

Financial frameworks to reference (guide, not dogma)

- 50/30/20 rule (or goal-aligned custom split); Zero-based budgeting & envelopes; Pay Yourself First; Emergency fund 3–6 months; Debt payoff avalanche vs snowball; Savings rate targets; Sinking funds; Fee/interest minimization first.

Output format (Telegram message; 20–25 lines total)

- Line 1 (greeting): "So, {user_name} — here's your {period_label or date range}."

- Line 2: "🧾 *Total spent:* {currency_symbol}{total_spent}"

- Line 3 (optional KPIs): "Txns: {n} • Avg/day: {avg_per_day}"

- Lines 4–9 (category split in a code block):

\`

Category            Amount        Share

Top Cat             {currency_symbol}X,XXX      4X.X%

Second              {currency_symbol}X,XXX      XX.X%

...

Other               {currency_symbol}XXX        XX.X%

\`

- Lines 10–13 *Overspending* (• bullets): category, over amount, % over, one-line fix.

- Lines 14–17 *Unusual* (• bullets): merchant/category + amount + reason; tasteful mini-roast for discretionary items allowed.

- Lines 18–22 *Optimization* (• bullets): concrete, quantified suggestions.

- Lines 23–24 *Rule-based coaching* (• bullets): tailored targets.

- Line 25 (gentle roast or sign-off): one short motivational jab if warranted, else a warm encouragement.

Constraints

- Never use "#", "##", or "###" headings.

- No interactive CTAs. Do not ask the user to reply inside the message.

- Be accurate with math and units; respect locale/currency_symbol; do not hardcode any specific currency text.

- If mixed currencies appear, prioritize the most frequent currency and note the limitation briefly.

- Return only the Telegram message, nothing else.`;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      transactions,
      categoryStats,
      totalSpent,
      period,
      dateRange,
      userTelegramId,
      userCurrency,
    }: AnalyzeRequest = req.body;

    if (!transactions || !categoryStats || !userTelegramId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user data
    const user = await getUserByTelegramId(userTelegramId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get currency symbol
    const currencyData = await getCurrencyByCode(userCurrency);
    const currencySymbol = currencyData?.symbol || userCurrency;

    // Get user's display name
    const userName = user.first_name || user.username || 'there';

    // Get current date
    const currentDate = new Date().toISOString().split('T')[0];

    // Format period label
    const periodLabel = period === 'week' ? dateRange : 
                       period === 'month' ? dateRange : 
                       dateRange;

    // Prepare context for OpenAI
    const context = {
      period_label: periodLabel,
      currency_symbol: currencySymbol,
      locale: user.language_code || 'en',
      user_name: userName,
      current_date: currentDate,
      date_range: dateRange,
    };

    // Prepare prompt for OpenAI
    const prompt = `${MASTER_PROMPT}

Here is the transaction data:

Transactions (JSON):
${JSON.stringify(transactions, null, 2)}

Category Totals:
${JSON.stringify(categoryStats, null, 2)}

Total Spent: ${totalSpent} ${userCurrency}

Context:
${JSON.stringify(context, null, 2)}

Now generate the analysis message following all the rules above.`;

    // Call OpenAI
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not set');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    console.log('🤖 Calling OpenAI API for analysis...');

    // GPT-5 uses the responses API
    const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5',
        input: prompt,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', openaiResponse.status, errorText);
      let errorMessage = 'Failed to generate analysis';
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch (e) {
        // If parsing fails, use the raw error text
        errorMessage = errorText.substring(0, 200); // Limit length
      }
      return res.status(502).json({
        error: errorMessage,
        details: errorText,
      });
    }

    const openaiData = await openaiResponse.json();
    console.log('📦 OpenAI response structure:', JSON.stringify(openaiData, null, 2));
    
    // GPT-5 responses API format: output[0].content[0].text
    let analysis: string | null = null;
    
    if (openaiData.output && Array.isArray(openaiData.output) && openaiData.output.length > 0) {
      const firstOutput = openaiData.output[0];
      if (firstOutput.content && Array.isArray(firstOutput.content) && firstOutput.content.length > 0) {
        const firstContent = firstOutput.content[0];
        if (firstContent.type === 'output_text' && firstContent.text) {
          analysis = firstContent.text.trim();
          console.log('✅ Found analysis in output[0].content[0].text');
        } else {
          console.log('⚠️ Content structure:', {
            type: firstContent.type,
            hasText: !!firstContent.text,
            contentKeys: Object.keys(firstContent),
          });
        }
      } else {
        console.log('⚠️ Output structure:', {
          hasContent: !!firstOutput.content,
          contentType: Array.isArray(firstOutput.content) ? 'array' : typeof firstOutput.content,
          outputKeys: Object.keys(firstOutput),
        });
      }
    } else {
      console.log('⚠️ Response structure:', {
        hasOutput: !!openaiData.output,
        outputType: Array.isArray(openaiData.output) ? 'array' : typeof openaiData.output,
        responseKeys: Object.keys(openaiData),
      });
    }

    if (!analysis || analysis.length === 0) {
      console.error('No content from OpenAI response:', openaiData);
      return res.status(502).json({ 
        error: 'AI did not return a valid analysis',
        response_keys: Object.keys(openaiData),
      });
    }

    console.log('✅ OpenAI analysis generated');

    // Send analysis to user's Telegram chat
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: userTelegramId,
            text: analysis,
            parse_mode: 'Markdown',
          }),
        });
        console.log('✅ Analysis sent to Telegram');
      } catch (error) {
        console.error('Error sending Telegram message:', error);
        // Don't fail the request if Telegram message fails
      }
    } else {
      console.warn('⚠️ Telegram bot token not available, skipping Telegram notification');
    }

    return res.status(200).json({
      success: true,
      message: 'Analysis generated and sent',
      analysis: analysis,
    });
  } catch (error) {
    console.error('Error processing analysis:', error);
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}

