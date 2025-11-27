import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserByTelegramId } from '../bot/lib/userService';
import { getCurrencyByCode } from '../bot/lib/currencyService';
import { MASTER_PROMPT } from './analyzePrompt';

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
  incomeCategoryStats?: CategoryTotal[];
  totalSpent: number;
  totalIncome?: number;
  netDifference?: number; // income - expenses (positive = savings, negative = deficit)
  incomeToExpensesRatio?: number; // income / expenses ratio
  period: 'week' | 'month' | 'year';
  dateRange: string; // e.g., "01 Nov - 07 Nov" or "November 2025"
  userTelegramId: number;
  userCurrency: string;
}

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
      incomeCategoryStats,
      totalSpent,
      totalIncome,
      netDifference,
      incomeToExpensesRatio,
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

    // Split transactions into spending and earnings
    const spendingTransactions = transactions.filter(t => t.amount < 0);
    const earningsTransactions = transactions.filter(t => t.amount > 0);

    // Prepare context for OpenAI
    const context = {
      period: period,
      period_label: periodLabel,
      currency_symbol: currencySymbol,
      locale: user.language_code || 'en',
      user_name: userName,
      current_date: currentDate,
      date_range: dateRange,
    };

    // Format expenses by category with total and percentage
    const expensesByCategory: Record<string, { total: number; percentage: number }> = {};
    categoryStats.forEach(stat => {
      expensesByCategory[stat.category] = {
        total: stat.total,
        percentage: stat.percentage,
      };
    });

    // Format income by category with total and percentage
    const incomeByCategory: Record<string, { total: number; percentage: number }> = {};
    if (incomeCategoryStats && incomeCategoryStats.length > 0) {
      incomeCategoryStats.forEach(stat => {
        incomeByCategory[stat.category] = {
          total: stat.total,
          percentage: stat.percentage,
        };
      });
    }

    // Calculate savings rate if income is available
    const savingsRate = totalIncome && totalIncome > 0 
      ? ((netDifference || 0) / totalIncome) * 100 
      : undefined;

    // Calculate average spent per day
    const daysInPeriod = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const avgSpentPerDay = totalSpent / daysInPeriod;

    // Prepare aggregates object
    const aggregates = {
      expenses_by_category: expensesByCategory,
      income_by_category: incomeByCategory,
      totals: {
        total_spent: totalSpent,
        total_income: totalIncome || 0,
        net_difference: netDifference || 0,
        income_to_expenses_ratio: incomeToExpensesRatio || 0,
      },
    };

    // Prepare prompt for OpenAI
    const prompt = `${MASTER_PROMPT}

Here is the transaction data:

Spending Transactions (JSON) - all amounts are negative:
${JSON.stringify(spendingTransactions, null, 2)}

Earnings Transactions (JSON) - all amounts are positive:
${JSON.stringify(earningsTransactions, null, 2)}

Aggregates:
${JSON.stringify(aggregates, null, 2)}

Additional metrics:
- Savings rate: ${savingsRate !== undefined ? `${savingsRate.toFixed(1)}%` : 'N/A (no income data)'}
- Average spent per day: ${avgSpentPerDay.toFixed(2)} ${userCurrency}
- Total spending transactions: ${spendingTransactions.length}
- Total earnings transactions: ${earningsTransactions.length}

Context:
${JSON.stringify(context, null, 2)}

Now generate the analysis message following all the rules above. Use the aggregates provided to show category splits with percentages. Review spending and earnings transactions separately to provide comprehensive insights. Include insights about both expenses and income when income data is available. When net difference and income-to-expenses ratio are provided, include analysis of savings/deficit and financial health based on the ratio.`;

    // Call OpenAI
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not set');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    console.log('🤖 Calling OpenAI API for analysis...');

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.1',
        messages: [{ role: 'user', content: prompt }],
        max_completion_tokens: 8000,
        reasoning_effort: 'medium',
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
    
    // Log the full message structure for debugging
    const message = openaiData.choices?.[0]?.message;
    console.log('OpenAI response message structure:', JSON.stringify(message, null, 2));
    
    const analysis = message?.content?.trim();

    if (!analysis) {
      console.error('No content from OpenAI response. Full response:', JSON.stringify(openaiData, null, 2));
      return res.status(502).json({ 
        error: 'AI did not return a valid analysis',
        finish_reason: openaiData.choices?.[0]?.finish_reason,
        usage: openaiData.usage,
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

