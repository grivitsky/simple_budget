import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Debug: Log configuration status (remove in production)
console.log('Supabase Config:', {
  url: supabaseUrl ? '✓ Set' : '✗ Missing',
  key: supabaseAnonKey ? '✓ Set' : '✗ Missing',
  urlValue: supabaseUrl.slice(0, 20) + '...' // Show first 20 chars
});

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string; // UUID from Supabase
  telegram_id: number; // Telegram user ID
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  language_code: string | null;
  photo_url: string | null;
  ai_features_enabled: boolean;
  default_currency: string;
  created_at: string;
  updated_at: string;
}

export interface UserInsert {
  telegram_id: number;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  language_code?: string | null;
  photo_url?: string | null;
  ai_features_enabled?: boolean;
  default_currency?: string;
}

