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
 * Uses fuzzy matching - checks if spending name contains category name or vice versa
 */
export async function matchCategoryByName(spendingName: string): Promise<Category | null> {
  try {
    const categories = await getAllCategories();
    const lowerSpendingName = spendingName.toLowerCase().trim();

    // Try exact match first
    for (const category of categories) {
      if (category.name.toLowerCase() === lowerSpendingName) {
        return category;
      }
    }

    // Try partial match (spending name contains category name)
    for (const category of categories) {
      const lowerCategoryName = category.name.toLowerCase();
      if (lowerSpendingName.includes(lowerCategoryName) || lowerCategoryName.includes(lowerSpendingName)) {
        return category;
      }
    }

    // Try keyword matching (common keywords)
    const keywordMap: Record<string, string> = {
      'food': 'Eating Out',
      'restaurant': 'Eating Out',
      'eat': 'Eating Out',
      'dining': 'Eating Out',
      'cafe': 'Eating Out',
      'coffee': 'Eating Out',
      'house': 'Housing',
      'rent': 'Housing',
      'home': 'Housing',
      'car': 'Transport',
      'taxi': 'Transport',
      'uber': 'Transport',
      'bus': 'Transport',
      'train': 'Transport',
      'grocery': 'Groceries',
      'supermarket': 'Groceries',
      'pharmacy': 'Healthcare',
      'doctor': 'Healthcare',
      'medicine': 'Healthcare',
      'movie': 'Entertainment',
      'cinema': 'Entertainment',
      'game': 'Entertainment',
      'shopping': 'Shopping',
      'store': 'Shopping',
      'bill': 'Utilities',
      'electricity': 'Utilities',
      'water': 'Utilities',
      'internet': 'Utilities',
      'flight': 'Travel',
      'hotel': 'Travel',
      'school': 'Education',
      'course': 'Education',
      'book': 'Education',
    };

    for (const [keyword, categoryName] of Object.entries(keywordMap)) {
      if (lowerSpendingName.includes(keyword)) {
        return getCategoryByName(categoryName);
      }
    }

    // No match found, return undefined category
    return getUndefinedCategory();
  } catch (error) {
    console.error('Unexpected error in matchCategoryByName:', error);
    return getUndefinedCategory();
  }
}

