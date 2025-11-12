import { supabase } from './supabase';
import { getCurrencyByCode } from './currencyService';
import { matchCategoryByName } from './categoryService';
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
  'kr': 'SEK',
  'R$': 'BRL',
  'C$': 'CAD',
  'A$': 'AUD',
  'MX$': 'MXN',
  'S$': 'SGD',
  'HK$': 'HKD',
};

/**
 * Parse Telegram message to extract spending information
 */
export function parseSpendingMessage(message: string): {
  amount: number | null;
  currency: string | null;
  spendingName: string | null;
} {
  const trimmed = message.trim();
  if (!trimmed) {
    console.log('❌ Empty message');
    return { amount: null, currency: null, spendingName: null };
  }

  console.log('🔍 Parsing message:', trimmed);

  // Try pattern with currency first: number + optional space + currency + optional space + text
  // Handles: "10.12 $ Food", "10.12$ Food", "10.12 $Food", "10.12$Food", "10.12 USD Food"
  const patternWithCurrency = /^([\d.,]+)\s*(\$|€|£|¥|₹|₽|₺|zł|kr|R\$|C\$|A\$|MX\$|S\$|HK\$|[A-Z]{3})\s*(.+)$/i;
  const matchWithCurrency = trimmed.match(patternWithCurrency);
  
  console.log('💰 Pattern with currency match:', matchWithCurrency ? 'Yes' : 'No');

  if (matchWithCurrency) {
    const amountStr = matchWithCurrency[1].replace(',', '.');
    const amount = parseFloat(amountStr);
    const currencySymbol = matchWithCurrency[2].trim();
    const spendingName = matchWithCurrency[3].trim();

    if (!isNaN(amount) && spendingName) {
      // Convert currency symbol to code
      let currencyCode: string | null = null;
      const upperSymbol = currencySymbol.toUpperCase();
      if (CURRENCY_SYMBOL_MAP[upperSymbol]) {
        currencyCode = CURRENCY_SYMBOL_MAP[upperSymbol];
      } else if (upperSymbol.length === 3) {
        currencyCode = upperSymbol;
      }

      console.log('✅ Parsed (with currency):', { amount, currency: currencyCode, spendingName });
      return { amount, currency: currencyCode, spendingName };
    } else {
      console.log('❌ Invalid amount or spending name:', { amount, spendingName });
    }
  }

  // Try pattern without currency: number + text
  const patternWithoutCurrency = /^([\d.,]+)\s+(.+)$/;
  const matchWithoutCurrency = trimmed.match(patternWithoutCurrency);
  
  console.log('📝 Pattern without currency match:', matchWithoutCurrency ? 'Yes' : 'No');

  if (matchWithoutCurrency) {
    const amountStr = matchWithoutCurrency[1].replace(',', '.');
    const amount = parseFloat(amountStr);
    const spendingName = matchWithoutCurrency[2].trim();

    if (!isNaN(amount) && spendingName) {
      console.log('✅ Parsed (no currency):', { amount, spendingName });
      return { amount, currency: null, spendingName };
    }
  }

  // No match found
  console.log('❌ No pattern matched for:', trimmed);
  return { amount: null, currency: null, spendingName: null };


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

    // Get exchange rate from currency
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

