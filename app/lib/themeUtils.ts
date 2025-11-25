import type { Category } from './categoryService';
import type { EarningsCategory } from './earningsCategoryService';

/**
 * Detect if Telegram WebApp is using dark theme
 * Checks if bg_color is dark (low brightness)
 */
export function isDarkTheme(): boolean {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.themeParams) {
    return false;
  }

  const bgColor = window.Telegram.WebApp.themeParams.bg_color;
  if (!bgColor) {
    return false;
  }

  // Convert hex to RGB
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate brightness (using relative luminance formula)
  // https://www.w3.org/TR/WCAG20/#relativeluminancedef
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // If brightness is less than 128, consider it dark
  return brightness < 128;
}

/**
 * Get category color based on current theme
 * Returns dark color if theme is dark, otherwise returns regular color
 */
export function getCategoryColor(category: Category | EarningsCategory): string {
  const dark = isDarkTheme();
  if (dark && category.color_dark) {
    return category.color_dark;
  }
  return category.color;
}

/**
 * Get category text color based on current theme
 * Returns dark text color if theme is dark, otherwise returns regular text color
 */
export function getCategoryTextColor(category: Category | EarningsCategory): string {
  const dark = isDarkTheme();
  if (dark && category.text_color_dark) {
    return category.text_color_dark;
  }
  return category.text_color;
}

