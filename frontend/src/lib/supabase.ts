import { createClient, SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js';

// Retrieve credentials from Vite env or local storage overrides
export const getSupabaseConfig = () => {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

  let localUrl = '';
  let localKey = '';
  try {
    if (typeof window !== 'undefined') {
      localUrl = localStorage.getItem('mv_supabase_url') || '';
      localKey = localStorage.getItem('mv_supabase_anon_key') || '';
    }
  } catch {
    // Ignore storage errors
  }

  const url = localUrl || envUrl || '';
  const anonKey = localKey || envKey || '';

  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes('your-project') &&
    !anonKey.includes('your-anon-key') &&
    url.startsWith('https://')
  );

  return { url, anonKey, isConfigured };
};

// Singleton Supabase instance
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey, isConfigured } = getSupabaseConfig();

  // If not configured yet, use dummy fallback URL so createClient does not crash on app launch
  const effectiveUrl = isConfigured ? url : 'https://dummyproject.supabase.co';
  const effectiveKey = isConfigured ? anonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

  supabaseInstance = createClient(effectiveUrl, effectiveKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'mv_supabase_auth'
    }
  });

  return supabaseInstance;
};

export const supabase = getSupabase();

/**
 * Save Supabase credentials dynamically (e.g. from developer setup modal)
 */
export const saveSupabaseCredentials = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mv_supabase_url', url.trim());
    localStorage.setItem('mv_supabase_anon_key', anonKey.trim());
    // Reset instance to re-initialize with new keys
    supabaseInstance = null;
  }
};

/**
 * Clear custom Supabase credentials from local storage
 */
export const clearSupabaseCredentials = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mv_supabase_url');
    localStorage.removeItem('mv_supabase_anon_key');
    supabaseInstance = null;
  }
};

/**
 * Trigger OAuth Sign In (Google or GitHub) via Supabase
 */
export const signInWithOAuth = async (provider: 'google' | 'github') => {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    throw new Error('Supabase is not configured yet. Please provide your Supabase URL and Anon Key.');
  }

  const client = getSupabase();
  const redirectTo = `${window.location.origin}/auth/callback`;

  const { data, error } = await client.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Sign In with Email & Password via Supabase Auth
 */
export const signInWithSupabaseEmail = async (email: string, password: string) => {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    throw new Error('Supabase is not configured yet.');
  }

  const client = getSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

/**
 * Sign Up with Email & Password via Supabase Auth
 */
export const signUpWithSupabaseEmail = async (
  email: string,
  password: string,
  metadata?: { name?: string; phone?: string; role?: string }
) => {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    throw new Error('Supabase is not configured yet.');
  }

  const client = getSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });

  if (error) throw error;
  return data;
};

/**
 * Sign Out from Supabase Auth
 */
export const signOutSupabase = async () => {
  try {
    const client = getSupabase();
    await client.auth.signOut();
  } catch (err) {
    console.warn('Supabase sign-out warning:', err);
  }
};

/**
 * Convert Supabase Auth User object to App User object
 */
export const formatSupabaseUser = (sbUser: SupabaseAuthUser): import('../types').User => {
  const metadata = sbUser.user_metadata || {};
  const name =
    metadata.full_name ||
    metadata.name ||
    sbUser.email?.split('@')[0] ||
    'Customer User';

  const role = (metadata.role as import('../types').Role) || 'CUSTOMER';

  return {
    id: sbUser.id,
    email: sbUser.email || '',
    name,
    phone: sbUser.phone || metadata.phone || '+91 98765 43210',
    role,
    roleProfileId: sbUser.id
  };
};
