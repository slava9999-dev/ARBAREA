/**
 * Supabase Client Configuration
 * Replaces Firebase for auth and database
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials not configured. App will run in simple mode.',
  );
  // Mock client to prevent crashes
  supabaseClient = {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      getUser: async () => ({ data: { user: null } }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signInWithPassword: async () => ({
        error: { message: 'Supabase not configured' },
      }),
      signUp: async () => ({ error: { message: 'Supabase not configured' } }),
      signInWithOtp: async () => ({
        error: { message: 'Supabase not configured' },
      }),
      verifyOtp: async () => ({
        error: { message: 'Supabase not configured' },
      }),
      signInWithOAuth: async () => ({
        error: { message: 'Supabase not configured' },
      }),
      signOut: async () => ({ error: null }),
      updateUser: async () => ({
        error: { message: 'Supabase not configured' },
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({ single: async () => ({ data: null, error: null }) }),
        order: () => ({ data: [], error: null }),
      }),
    }),
  };
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase = supabaseClient;

// Helper to get current user
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Helper to get session
export const getSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};

export default supabase;
