import { supabase, User, UserInsert } from './supabase';

/**
 * Get or create user based on Telegram user data
 */
export async function getOrCreateUser(telegramUser: {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  photo_url?: string;
}): Promise<User | null> {
  try {
    const telegramId = telegramUser.id;
    console.log('🔍 Checking user with telegram_id:', telegramId);

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching user:', {
        code: fetchError.code,
        message: fetchError.message,
      });
      return null;
    }

    // If user exists, return it
    if (existingUser) {
      console.log('✅ Existing user found');
      return existingUser as User;
    }

    console.log('👤 Creating new user...');

    // Create new user
    const newUser: UserInsert = {
      telegram_id: telegramId,
      username: telegramUser.username || null,
      first_name: telegramUser.first_name || null,
      last_name: telegramUser.last_name || null,
      language_code: telegramUser.language_code || null,
      photo_url: telegramUser.photo_url || null,
      ai_features_enabled: false,
      default_currency: 'USD',
    };

    const { data: createdUser, error: createError } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating user:', {
        code: createError.code,
        message: createError.message,
      });
      return null;
    }

    console.log('✅ New user created');
    return createdUser as User;
  } catch (error) {
    console.error('❌ Unexpected error in getOrCreateUser:', error);
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

