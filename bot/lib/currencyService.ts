import { supabase } from './supabase';

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  display_order: number;
  exchange_rate_to_usd?: number | null;
  created_at: string;
}

/**
 * Get all currencies ordered by display_order
 */
export async function getAllCurrencies(): Promise<Currency[]> {
  try {
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching currencies:', error);
      return [];
    }

    return data as Currency[];
  } catch (error) {
    console.error('Unexpected error in getAllCurrencies:', error);
    return [];
  }
}

/**
 * Get currency by code
 */
export async function getCurrencyByCode(code: string): Promise<Currency | null> {
  try {
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      console.error('Error fetching currency:', error);
      return null;
    }

    return data as Currency;
  } catch (error) {
    console.error('Unexpected error in getCurrencyByCode:', error);
    return null;
  }
}

