import { supabase } from './supabase';

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
 * Get all earnings for a user
 */
export async function getUserEarnings(userId: string): Promise<Earning[]> {
  try {
    const { data, error } = await supabase
      .from('earnings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching earnings:', error);
      return [];
    }

    return data as Earning[];
  } catch (error) {
    console.error('Unexpected error in getUserEarnings:', error);
    return [];
  }
}

/**
 * Get earnings for a user within a date range
 */
export async function getUserEarningsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Earning[]> {
  try {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    const { data, error } = await supabase
      .from('earnings')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startISO)
      .lte('created_at', endISO)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching earnings by date range:', error);
      return [];
    }

    return data as Earning[];
  } catch (error) {
    console.error('Unexpected error in getUserEarningsByDateRange:', error);
    return [];
  }
}

/**
 * Get start date for period
 */
export function getPeriodStartDate(period: 'week' | 'month' | 'year'): Date {
  const now = new Date();
  const start = new Date(now);

  switch (period) {
    case 'week': {
      // Get closest Monday (start of week)
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      break;
    }
    case 'month': {
      // First day of current month
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    }
    case 'year': {
      // First day of current year
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
    }
  }

  return start;
}

/**
 * Get end date for period (now)
 */
export function getPeriodEndDate(): Date {
  return new Date();
}

/**
 * Update an earning entry
 */
export async function updateEarning(
  earningId: string,
  updates: {
    earning_name?: string;
    earning_amount?: number;
    currency_code?: string;
    category_id?: string | null;
    exchange_rate?: number;
    amount_in_base_currency?: number;
  }
): Promise<Earning | null> {
  try {
    const { data, error } = await supabase
      .from('earnings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', earningId)
      .select()
      .single();

    if (error) {
      console.error('Error updating earning:', error);
      return null;
    }

    return data as Earning;
  } catch (error) {
    console.error('Unexpected error in updateEarning:', error);
    return null;
  }
}

/**
 * Delete an earning entry
 */
export async function deleteEarning(earningId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('earnings')
      .delete()
      .eq('id', earningId);

    if (error) {
      console.error('Error deleting earning:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in deleteEarning:', error);
    return false;
  }
}

/**
 * Get earning by ID
 */
export async function getEarningById(earningId: string): Promise<Earning | null> {
  try {
    const { data, error } = await supabase
      .from('earnings')
      .select('*')
      .eq('id', earningId)
      .single();

    if (error) {
      console.error('Error fetching earning:', error);
      return null;
    }

    return data as Earning;
  } catch (error) {
    console.error('Unexpected error in getEarningById:', error);
    return null;
  }
}

