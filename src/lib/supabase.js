/**
 * Supabase Client Configuration
 * Replaces Firebase for auth and database
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Strict validation
const isValidUrl = (url) =>
  typeof url === 'string' && url.trim().length > 0 && url.startsWith('http');
const isValidKey = (key) => typeof key === 'string' && key.trim().length > 0;

let supabaseClient;
const isConfigured = isValidUrl(supabaseUrl) && isValidKey(supabaseAnonKey);

// Exported so the app can gracefully degrade to local-only mode (no backend)
// instead of crashing when Supabase is not configured.
export const isSupabaseConfigured = isConfigured;

console.log(
  '🔌 Supabase Config Status:',
  isConfigured ? 'Valid' : 'Invalid/Missing',
);

/**
 * Builds a fully chainable no-op query builder.
 *
 * The previous mock only implemented a subset of methods (`single`, `order`),
 * so any call to `maybeSingle`, `update`, `in`, etc. threw
 * "... is not a function" and broke auth/checkout. This builder responds to
 * every PostgREST-style method, is awaitable, and resolves to an empty result
 * so callers can fall back to their local logic without crashing.
 */
const createMockQueryBuilder = () => {
  const result = { data: null, error: null };
  const builder = {
    // Mimics a PostgREST query builder, which is itself a thenable.
    // biome-ignore lint/suspicious/noThenProperty: intentional thenable to mirror Supabase's awaitable query builder
    then: (resolve) => Promise.resolve(result).then(resolve),
    catch: () => Promise.resolve(result),
    finally: (cb) => Promise.resolve(result).finally(cb),
  };
  const chainable = [
    'select',
    'insert',
    'update',
    'upsert',
    'delete',
    'eq',
    'neq',
    'in',
    'gt',
    'gte',
    'lt',
    'lte',
    'like',
    'ilike',
    'is',
    'order',
    'limit',
    'range',
    'filter',
    'match',
  ];
  for (const method of chainable) {
    builder[method] = () => builder;
  }
  const terminal = ['single', 'maybeSingle', 'csv'];
  for (const method of terminal) {
    builder[method] = async () => result;
  }
  return builder;
};

// Mock realtime channel: chainable .on()/.subscribe() returning an
// unsubscribe-able handle, so components that set up subscriptions
// (e.g. order history) don't crash in local-only mode.
const createMockChannel = () => {
  const channel = {
    on: () => channel,
    subscribe: () => channel,
    unsubscribe: () => {},
  };
  return channel;
};

const createMockClient = () => ({
  channel: () => createMockChannel(),
  removeChannel: () => {},
  removeAllChannels: () => {},
  rpc: async () => ({ data: null, error: null }),
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: null }),
      download: async () => ({ data: null, error: null }),
      remove: async () => ({ data: null, error: null }),
      list: async () => ({ data: [], error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      createSignedUrl: async () => ({ data: null, error: null }),
    }),
  },
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signInWithPassword: async () => ({
      data: { user: null, session: null },
      error: { message: 'Supabase not configured' },
    }),
    signUp: async () => ({
      data: { user: null, session: null },
      error: { message: 'Supabase not configured' },
    }),
    signInWithOtp: async () => ({
      data: {},
      error: { message: 'Supabase not configured' },
    }),
    verifyOtp: async () => ({
      data: {},
      error: { message: 'Supabase not configured' },
    }),
    signInWithOAuth: async () => ({
      data: {},
      error: { message: 'Supabase not configured' },
    }),
    signOut: async () => ({ error: null }),
    updateUser: async () => ({
      data: { user: null },
      error: { message: 'Supabase not configured' },
    }),
  },
  from: () => createMockQueryBuilder(),
});

if (!isConfigured) {
  console.warn(
    '⚠️ Supabase credentials not configured or invalid. App will run in local-only mode.',
  );
  supabaseClient = createMockClient();
} else {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  } catch (e) {
    console.error('❌ Failed to initialize Supabase client:', e);
    // Fallback to a complete mock so the UI keeps working.
    supabaseClient = createMockClient();
  }
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
