import { supabase } from './supabase';

export interface Category {
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
 * Get all categories ordered by display_order
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data as Category[];
  } catch (error) {
    console.error('Unexpected error in getAllCategories:', error);
    return [];
  }
}

/**
 * Get category by name (case-insensitive)
 */
export async function getCategoryByName(name: string): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .ilike('name', name)
      .single();

    if (error) {
      console.error('Error fetching category:', error);
      return null;
    }

    return data as Category;
  } catch (error) {
    console.error('Unexpected error in getCategoryByName:', error);
    return null;
  }
}

/**
 * Get "Undefined" category (default)
 */
export async function getUndefinedCategory(): Promise<Category | null> {
  return getCategoryByName('Undefined');
}

/**
 * Try to match spending name to a category
 * Uses strict matching - only matches when there's a clear indication
 * Defaults to "Undefined" category for all transactions
 */
export async function matchCategoryByName(spendingName: string): Promise<Category | null> {
  try {
    // For now, always return "Undefined" category
    // Automatic category matching is disabled to prevent false matches
    // Users can manually categorize transactions later
    return getUndefinedCategory();
  } catch (error) {
    console.error('Unexpected error in matchCategoryByName:', error);
    return getUndefinedCategory();
  }
}

