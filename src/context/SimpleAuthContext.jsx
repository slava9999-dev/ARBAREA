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
import { supabase } from '../lib/supabase';

const SimpleAuthContext = createContext({});
export const useSimpleAuth = () => useContext(SimpleAuthContext);

// LocalStorage key for persisting user session
const STORAGE_KEY = 'arbarea_user';

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

    // Check if user already exists
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (checkError) {
      console.error('DB check error:', checkError);
      throw new Error('Ошибка подключения к базе данных. Попробуйте позже.');
    }

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

        if (updateError) {
          console.error('Update error:', updateError);
          userData = existing; // Fallback to existing data
        } else {
          userData = updated;
        }
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
            discount: 10, // 10% discount for all registered users
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        // Handle unique constraint violation (race condition)
        if (insertError.code === '23505') {
          // Another request created the user — fetch it
          const { data: raceUser } = await supabase
            .from('users')
            .select('*')
            .eq('phone', phone)
            .single();
          userData = raceUser;
        } else {
          throw new Error('Ошибка регистрации. Попробуйте позже.');
        }
      } else {
        userData = newUser;
      }
    }

    if (!userData) {
      throw new Error('Не удалось создать профиль');
    }

    // Persist session
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

    return userData;
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
