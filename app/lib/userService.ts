import { supabase, User, UserInsert } from './supabase';

/**
 * Get or create user based on Telegram WebApp data
 * This function checks if a user exists by telegram_id, and creates one if not
 */
export async function getOrCreateUser(telegramUser: any): Promise<User | null> {
  try {
    const telegramId = telegramUser.id;

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      console.error('Error fetching user:', fetchError);
      return null;
    }

    // If user exists, return it
    if (existingUser) {
      console.log('Existing user found:', existingUser);
      return existingUser as User;
    }

    // Create new user
    const newUser: UserInsert = {
      telegram_id: telegramId,
      username: telegramUser.username || null,
      first_name: telegramUser.first_name || null,
      last_name: telegramUser.last_name || null,
      language_code: telegramUser.language_code || null,
      photo_url: telegramUser.photo_url || null,
      ai_features_enabled: false, // Default: AI features off
      default_currency: 'PLN', // Default currency
    };

    const { data: createdUser, error: createError } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return null;
    }

    console.log('New user created:', createdUser);
    return createdUser as User;
  } catch (error) {
    console.error('Unexpected error in getOrCreateUser:', error);
    return null;
  }
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  telegramId: number,
  updates: {
    ai_features_enabled?: boolean;
    default_currency?: string;
  }
): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('telegram_id', telegramId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user settings:', error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Unexpected error in updateUserSettings:', error);
    return null;
  }
}

/**
 * Get user by telegram ID
 */
export async function getUserByTelegramId(telegramId: number): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Unexpected error in getUserByTelegramId:', error);
    return null;
  }
}

