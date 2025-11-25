import { supabase } from './supabase';

export interface EarningsCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  text_color: string;
  color_dark: string | null;
  text_color_dark: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get all earnings categories ordered by display_order
 */
export async function getAllEarningsCategories(): Promise<EarningsCategory[]> {
  try {
    const { data, error } = await supabase
      .from('earnings_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching earnings categories:', error);
      return [];
    }

    return data as EarningsCategory[];
  } catch (error) {
    console.error('Unexpected error in getAllEarningsCategories:', error);
    return [];
  }
}

/**
 * Get earnings category by name (case-insensitive)
 */
export async function getEarningsCategoryByName(name: string): Promise<EarningsCategory | null> {
  try {
    const { data, error } = await supabase
      .from('earnings_categories')
      .select('*')
      .ilike('name', name)
      .single();

    if (error) {
      console.error('Error fetching earnings category:', error);
      return null;
    }

    return data as EarningsCategory;
  } catch (error) {
    console.error('Unexpected error in getEarningsCategoryByName:', error);
    return null;
  }
}

/**
 * Get "Undefined" earnings category (default)
 */
export async function getUndefinedEarningsCategory(): Promise<EarningsCategory | null> {
  return getEarningsCategoryByName('Undefined');
}

/**
 * Try to match earning name to a category
 * Uses strict matching - only matches when there's a clear indication
 * Defaults to "Undefined" category for all transactions
 */
export async function matchEarningsCategoryByName(_earningName: string): Promise<EarningsCategory | null> {
  try {
    // For now, always return "Undefined" category
    // Automatic category matching is disabled to prevent false matches
    // Users can manually categorize transactions later
    return getUndefinedEarningsCategory();
  } catch (error) {
    console.error('Unexpected error in matchEarningsCategoryByName:', error);
    return getUndefinedEarningsCategory();
  }
}

