import { supabase } from './supabase';
import { getCurrencyByCode } from './currencyService';
import { matchCategoryByName, getUndefinedCategory } from './categoryService';
import type { User } from './supabase';

export interface Spending {
  id: string;
  user_id: string;
  spending_name: string;
  category_id: string | null;
  spending_amount: number;
  currency_code: string;
  exchange_rate: number;
  amount_in_base_currency: number;
  created_at: string;
  updated_at: string;
}

export interface SpendingInsert {
  user_id: string;
  spending_name: string;
  category_id?: string | null;
  spending_amount: number;
  currency_code: string;
  exchange_rate: number;
  amount_in_base_currency: number;
}

/**
 * Currency symbol to code mapping
 */
const CURRENCY_SYMBOL_MAP: Record<string, string> = {
  '$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
  '₹': 'INR',
  '₽': 'RUB',
  '₺': 'TRY',
  'zł': 'PLN',
  'kr': 'SEK', // Could be SEK, NOK, DKK - defaulting to SEK
  'R$': 'BRL',
  'C$': 'CAD',
  'A$': 'AUD',
  'MX$': 'MXN',
  'S$': 'SGD',
  'HK$': 'HKD',
};

/**
 * Parse Telegram message to extract spending information
 * Supports formats:
 * - "10.12 $ Food"
 * - "10.12 USD Food"
 * - "10.12 Food" (uses user's default currency)
 */
export function parseSpendingMessage(message: string): {
  amount: number | null;
  currency: string | null;
  spendingName: string | null;
} {
  const trimmed = message.trim();
  if (!trimmed) {
    return { amount: null, currency: null, spendingName: null };
  }

  // Pattern: number (with . or , as decimal) + optional currency + text
  // Matches: "10.12 $ Food", "10,50 EUR Food", "100 Food", etc.
  const pattern = /^([\d.,]+)\s*(?:\$|€|£|¥|₹|₽|₺|zł|kr|R\$|C\$|A\$|MX\$|S\$|HK\$|[A-Z]{3})?\s*(.+)$/i;
  const match = trimmed.match(pattern);

  if (!match) {
    // Try simpler pattern: just number and text (no currency)
    const simplePattern = /^([\d.,]+)\s+(.+)$/;
    const simpleMatch = trimmed.match(simplePattern);
    
    if (simpleMatch) {
      const amountStr = simpleMatch[1].replace(',', '.');
      const amount = parseFloat(amountStr);
      const spendingName = simpleMatch[2].trim();
      
      if (!isNaN(amount) && spendingName) {
        return { amount, currency: null, spendingName };
      }
    }
    
    return { amount: null, currency: null, spendingName: null };
  }

  const amountStr = match[1].replace(',', '.');
  const amount = parseFloat(amountStr);
  const currencySymbol = match[2]?.trim().toUpperCase() || null;
  const spendingName = match[3]?.trim() || null;

  if (isNaN(amount)) {
    return { amount: null, currency: null, spendingName: null };
  }

  // Convert currency symbol to code
  let currencyCode: string | null = null;
  if (currencySymbol) {
    // Check if it's a symbol
    if (CURRENCY_SYMBOL_MAP[currencySymbol]) {
      currencyCode = CURRENCY_SYMBOL_MAP[currencySymbol];
    } else if (currencySymbol.length === 3) {
      // Assume it's a currency code (USD, EUR, etc.)
      currencyCode = currencySymbol;
    }
  }

  return { amount, currency: currencyCode, spendingName };
}

/**
 * Create a spending entry from a Telegram message
 */
export async function createSpendingFromMessage(
  user: User,
  message: string
): Promise<Spending | null> {
  try {
    // Parse the message
    const parsed = parseSpendingMessage(message);
    
    if (!parsed.amount || !parsed.spendingName) {
      console.error('Failed to parse spending message:', message);
      return null;
    }

    // Determine currency (use parsed or user's default)
    const currencyCode = parsed.currency || user.default_currency || 'USD';

    // Get currency with exchange rate
    const currency = await getCurrencyByCode(currencyCode);
    if (!currency) {
      console.error('Currency not found:', currencyCode);
      return null;
    }

    // Get exchange rate from currency
    // Fetch currency with exchange rate
    const { data: currencyData, error: currencyError } = await supabase
      .from('currencies')
      .select('exchange_rate_to_usd')
      .eq('code', currencyCode)
      .single();

    if (currencyError || !currencyData?.exchange_rate_to_usd) {
      console.error('Error fetching exchange rate:', currencyError);
      return null;
    }

    const exchangeRate = typeof currencyData.exchange_rate_to_usd === 'number' 
      ? currencyData.exchange_rate_to_usd 
      : parseFloat(currencyData.exchange_rate_to_usd.toString());
    if (isNaN(exchangeRate) || exchangeRate === 0) {
      console.error('Invalid exchange rate:', exchangeRate);
      return null;
    }

    // Calculate amount in base currency (USD)
    const amountInBaseCurrency = parsed.amount / exchangeRate;

    // Match category
    const category = await matchCategoryByName(parsed.spendingName);
    const categoryId = category?.id || null;

    // Create spending entry
    const spendingData: SpendingInsert = {
      user_id: user.id,
      spending_name: parsed.spendingName,
      category_id: categoryId,
      spending_amount: parsed.amount,
      currency_code: currencyCode,
      exchange_rate: exchangeRate,
      amount_in_base_currency: parseFloat(amountInBaseCurrency.toFixed(2)),
    };

    const { data: createdSpending, error: createError } = await supabase
      .from('spendings')
      .insert([spendingData])
      .select()
      .single();

    if (createError) {
      console.error('Error creating spending:', createError);
      return null;
    }

    console.log('✅ Spending created:', createdSpending);
    return createdSpending as Spending;
  } catch (error) {
    console.error('Unexpected error in createSpendingFromMessage:', error);
    return null;
  }
}

/**
 * Get all spendings for a user
 */
export async function getUserSpendings(userId: string): Promise<Spending[]> {
  try {
    const { data, error } = await supabase
      .from('spendings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching spendings:', error);
      return [];
    }

    return data as Spending[];
  } catch (error) {
    console.error('Unexpected error in getUserSpendings:', error);
    return [];
  }
}

