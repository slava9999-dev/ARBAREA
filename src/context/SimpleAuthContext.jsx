/**
 * Simple Auth Context — Phone-Only Registration
 *
 * Flow: User enters name + phone → saved to Supabase `users` table → done.
 * No OTP, no password, no external verification.
 * Phone number IS the identity. Session persisted via localStorage.
 * Registered users get 10% discount automatically.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const SimpleAuthContext = createContext({});
export const useSimpleAuth = () => useContext(SimpleAuthContext);

// Discount granted to every registered user (percent)
const DEFAULT_DISCOUNT = 10;

// Build a self-contained user profile for local-only mode (no backend).
const buildLocalUser = (phone, name) => ({
  id: `local-${phone}`,
  phone,
  name,
  email: '',
  discount: DEFAULT_DISCOUNT,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

// LocalStorage key for persisting user session
const STORAGE_KEY = 'arbarea_user';

// Build a session locally (merging any cached profile for the same phone).
// Used both in local-only mode and as a fallback if the backend is
// unavailable, so registration always succeeds for the customer.
const buildSessionUser = (phone, name) => {
  try {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (cached?.phone === phone) {
      return { ...cached, name, updated_at: new Date().toISOString() };
    }
  } catch {
    // Ignore corrupted cache and fall through to a fresh profile.
  }
  return buildLocalUser(phone, name);
};

/**
 * Normalize phone to E.164 format (+7XXXXXXXXXX)
 * Handles: 8XXXXXXXXXX, 7XXXXXXXXXX, +7XXXXXXXXXX, raw digits
 */
const normalizePhone = (raw) => {
  // Strip all non-digit characters
  let digits = raw.replace(/\D/g, '');

  // Handle 8-prefix (Russia local): 89991234567 → 79991234567
  if (digits.length === 11 && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`;
  }

  // Ensure 11-digit format starting with 7
  if (digits.length === 10) {
    digits = `7${digits}`;
  }

  if (digits.length !== 11 || !digits.startsWith('7')) {
    return null; // Invalid
  }

  return `+${digits}`;
};

export const SimpleAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Initial Session Restore ──────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(stored);
        if (!parsed?.phone) {
          localStorage.removeItem(STORAGE_KEY);
          setLoading(false);
          return;
        }

        // Local-only mode: trust the cached session, no DB round-trip.
        if (!isSupabaseConfigured) {
          setUser(parsed);
          setLoading(false);
          return;
        }

        // Validate session against DB (user might have been deleted)
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('phone', parsed.phone)
          .maybeSingle();

        if (error) {
          console.error('Session restore DB error:', error);
          // Use cached data as fallback (offline support)
          setUser(parsed);
        } else if (data) {
          // Refresh local cache with latest DB data
          setUser(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } else {
          // User was deleted from DB → clear session
          localStorage.removeItem(STORAGE_KEY);
          setUser(null);
        }
      } catch (error) {
        console.error('Session restore error:', error);
        // Graceful degradation: clear corrupted data
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ─── Register / Login ─────────────────────────────────────────
  const register = useCallback(async (name, rawPhone) => {
    const phone = normalizePhone(rawPhone);
    if (!phone) {
      throw new Error(
        'Неверный формат номера. Введите номер в формате +7 (XXX) XXX-XX-XX',
      );
    }

    if (!name || name.trim().length < 2) {
      throw new Error('Пожалуйста, введите ваше имя (минимум 2 символа)');
    }

    const trimmedName = name.trim();

    const persist = (userData) => {
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      return userData;
    };

    // Local-only mode: register without a backend so the flow never breaks.
    if (!isSupabaseConfigured) {
      return persist(buildSessionUser(phone, trimmedName));
    }

    // Backend mode: try to persist to Supabase, but never block the customer.
    // Any backend problem (schema mismatch, RLS, network) degrades to a local
    // session so registration always completes.
    try {
      const { data: existing, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();

      if (checkError) throw checkError;

      let userData;

      if (existing) {
        // Returning user — update name if it was 'Гость' and login
        if (existing.name === 'Гость' && trimmedName !== 'Гость') {
          const { data: updated, error: updateError } = await supabase
            .from('users')
            .update({ name: trimmedName, updated_at: new Date().toISOString() })
            .eq('phone', phone)
            .select()
            .single();

          userData = updateError ? existing : updated;
        } else {
          userData = existing;
        }
      } else {
        // New user — create profile
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              phone,
              name: trimmedName,
              discount: DEFAULT_DISCOUNT,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (insertError) {
          // Race condition: another request created the user — fetch it.
          if (insertError.code === '23505') {
            const { data: raceUser } = await supabase
              .from('users')
              .select('*')
              .eq('phone', phone)
              .single();
            userData = raceUser;
          } else {
            throw insertError;
          }
        } else {
          userData = newUser;
        }
      }

      if (!userData) throw new Error('Empty user payload from backend');

      return persist(userData);
    } catch (error) {
      console.error('Registration backend error, using local session:', error);
      return persist(buildSessionUser(phone, trimmedName));
    }
  }, []);

  // ─── Update Profile ───────────────────────────────────────────
  const updateProfile = useCallback(
    async (updates) => {
      if (!user?.phone) {
        throw new Error('Пользователь не авторизован');
      }

      // Normalize phone if being updated
      const safeUpdates = { ...updates, updated_at: new Date().toISOString() };
      if (safeUpdates.phone) {
        const normalized = normalizePhone(safeUpdates.phone);
        if (!normalized) {
          throw new Error('Неверный формат номера телефона');
        }
        safeUpdates.phone = normalized;
      }

      // Local-only mode: persist profile changes to localStorage.
      if (!isSupabaseConfigured) {
        const merged = { ...user, ...safeUpdates };
        setUser(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }

      const { data, error } = await supabase
        .from('users')
        .update(safeUpdates)
        .eq('phone', user.phone)
        .select()
        .single();

      if (error) {
        console.error('Update profile error:', error);
        throw new Error('Не удалось обновить профиль');
      }

      setUser(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    },
    [user],
  );

  // ─── Logout ───────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // ─── Computed ─────────────────────────────────────────────────
  const isRegistered = !!user;
  const discount = user?.discount || 0;

  return (
    <SimpleAuthContext.Provider
      value={{
        user,
        loading,
        isRegistered,
        discount,
        register,
        updateProfile,
        logout,
      }}
    >
      {!loading && children}
    </SimpleAuthContext.Provider>
  );
};
