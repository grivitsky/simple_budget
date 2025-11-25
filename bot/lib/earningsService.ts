import { supabase } from './supabase';
import { getCurrencyByCode } from './currencyService';
import { matchEarningsCategoryByName, getUndefinedEarningsCategory, getAllEarningsCategories } from './earningsCategoryService';
import type { User } from './supabase';

export interface Earning {
  id: string;
  user_id: string;
  earning_name: string;
  category_id: string | null;
  earning_amount: number;
  currency_code: string;
  exchange_rate: number;
  amount_in_base_currency: number;
  created_at: string;
  updated_at: string;
}

export interface EarningInsert {
  user_id: string;
  earning_name: string;
  category_id?: string | null;
  earning_amount: number;
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
 * Parse Telegram message to extract earning information
 * Same logic as spending parsing but for income
 */
export function parseEarningMessage(message: string): {
  amount: number | null;
  currency: string | null;
  earningName: string | null;
} {
  const trimmed = message.trim();
  if (!trimmed) {
    console.log('❌ Empty message');
    return { amount: null, currency: null, earningName: null };
  }

  console.log('🔍 Parsing earning message:', trimmed);

  // Try pattern WITHOUT currency FIRST (most common case)
  // This prevents false matches when earning name could be mistaken for currency
  const patternWithoutCurrency = /^([\d.,]+)\s+(.+)$/;
  const matchWithoutCurrency = trimmed.match(patternWithoutCurrency);
  
  console.log('📝 Pattern without currency match:', matchWithoutCurrency ? 'Yes' : 'No');

  if (matchWithoutCurrency) {
    const amountStr = matchWithoutCurrency[1].replace(',', '.');
    const amount = parseFloat(amountStr);
    const potentialEarningName = matchWithoutCurrency[2].trim();

    // Check if the text after amount starts with a known currency symbol/code
    // If it does, it's likely a currency, so try the currency pattern instead
    const upperText = potentialEarningName.toUpperCase();
    const startsWithKnownCurrency = 
      potentialEarningName.match(/^(\$|€|£|¥|₹|₽|₺|zł|kr|R\$|C\$|A\$|MX\$|S\$|HK\$)/i) ||
      (upperText.length >= 3 && /^[A-Z]{3}\s/.test(upperText));

    if (!startsWithKnownCurrency && !isNaN(amount) && potentialEarningName) {
      console.log('✅ Parsed (no currency):', { amount, earningName: potentialEarningName });
      return { amount, currency: null, earningName: potentialEarningName };
    }
    // If it starts with currency, fall through to currency pattern
  }

  // Try pattern WITH currency: number + optional space + currency + space + text
  // Handles: "10.12 $ Job", "10.12$ Job", "10.12 $Job", "10.12 USD Job"
  // Note: Requires space after currency to avoid false matches
  const patternWithCurrency = /^([\d.,]+)\s*(\$|€|£|¥|₹|₽|₺|zł|kr|R\$|C\$|A\$|MX\$|S\$|HK\$|[A-Z]{3})\s+(.+)$/i;
  const matchWithCurrency = trimmed.match(patternWithCurrency);
  
  console.log('💰 Pattern with currency match:', matchWithCurrency ? 'Yes' : 'No');

  if (matchWithCurrency) {
    const amountStr = matchWithCurrency[1].replace(',', '.');
    const amount = parseFloat(amountStr);
    const currencySymbol = matchWithCurrency[2].trim();
    const earningName = matchWithCurrency[3].trim();

    if (!isNaN(amount) && earningName) {
      // Convert currency symbol to code
      let currencyCode: string | null = null;
      const upperSymbol = currencySymbol.toUpperCase();
      if (CURRENCY_SYMBOL_MAP[upperSymbol]) {
        currencyCode = CURRENCY_SYMBOL_MAP[upperSymbol];
      } else if (upperSymbol.length === 3) {
        currencyCode = upperSymbol;
      }

      console.log('✅ Parsed (with currency):', { amount, currency: currencyCode, earningName });
      return { amount, currency: currencyCode, earningName };
    } else {
      console.log('❌ Invalid amount or earning name:', { amount, earningName });
    }
  }

  // No match found
  console.log('❌ No pattern matched for:', trimmed);
  return { amount: null, currency: null, earningName: null };
}

/**
 * Create an earning entry from a Telegram message
 */
export async function createEarningFromMessage(
  user: User,
  message: string
): Promise<Earning | null> {
  try {
    // Parse the message
    const parsed = parseEarningMessage(message);
    
    if (!parsed.amount || !parsed.earningName) {
      console.error('Failed to parse earning message:', message);
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

    // Match category (always returns Undefined category as default)
    // We MUST always have a category ID - never leave it as null
    let categoryId: string | null = null;
    
    try {
      // Try to get category from matching function
      const category = await matchEarningsCategoryByName(parsed.earningName);
      categoryId = category?.id || null;
      
      // If still null, try direct lookup
      if (!categoryId) {
        const undefinedCategory = await getUndefinedEarningsCategory();
        categoryId = undefinedCategory?.id || null;
      }
      
      // If still null, try getting all categories and finding Undefined
      if (!categoryId) {
        console.warn('⚠️ Could not get Undefined category by name, trying all categories...');
        const allCategories = await getAllEarningsCategories();
        const undefinedCategory = allCategories.find(cat => 
          cat.name.toLowerCase() === 'undefined'
        );
        categoryId = undefinedCategory?.id || null;
      }
      
      // If STILL null, query database directly as last resort
      if (!categoryId) {
        console.warn('⚠️ Could not get Undefined category from service, querying database directly...');
        const { data: directCategory, error: directError } = await supabase
          .from('earnings_categories')
          .select('id')
          .eq('name', 'Undefined')
          .single();
        
        if (!directError && directCategory) {
          categoryId = directCategory.id;
          console.log('✅ Found Undefined category via direct query:', categoryId);
        } else {
          console.error('❌ Could not find Undefined earnings category in database. Error:', directError);
          console.error('❌ Please ensure the earnings_categories table has an "Undefined" category.');
        }
      } else {
        console.log('✅ Category ID for earning:', categoryId);
      }
    } catch (error) {
      console.error('❌ Error getting category:', error);
    }
    
    // Final check: if we still don't have a category ID, log a warning
    // The database trigger should handle it, but we prefer to set it in code
    if (!categoryId) {
      console.warn('⚠️ Proceeding with NULL category_id - database trigger should set it to Undefined');
    }

    // Create earning entry
    const earningData: EarningInsert = {
      user_id: user.id,
      earning_name: parsed.earningName,
      category_id: categoryId,
      earning_amount: parsed.amount,
      currency_code: currencyCode,
      exchange_rate: exchangeRate,
      amount_in_base_currency: parseFloat(amountInBaseCurrency.toFixed(2)),
    };

    const { data: createdEarning, error: createError } = await supabase
      .from('earnings')
      .insert([earningData])
      .select()
      .single();

    if (createError) {
      console.error('Error creating earning:', createError);
      return null;
    }

    console.log('✅ Earning created:', createdEarning);
    return createdEarning as Earning;
  } catch (error) {
    console.error('Unexpected error in createEarningFromMessage:', error);
    return null;
  }
}

