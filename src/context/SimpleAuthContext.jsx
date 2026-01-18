/**
 * Simple Auth Context - Supabase Phone Auth
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const SimpleAuthContext = createContext({});
export const useSimpleAuth = () => useContext(SimpleAuthContext);

export const SimpleAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial session check
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // Mirror to localStorage for extra stability if needed, though supabase-js does this
      if (currentUser) {
        localStorage.setItem('arbarea_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('arbarea_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 1. Send OTP to phone
  const sendOTP = async (phone) => {
    try {
      // Basic formatting to E.164 if not already
      let formattedPhone = phone.replace(/\D/g, '');
      if (!formattedPhone.startsWith('+')) {
        // Assume +7 if it has 11 digits starting with 8 or 7
        if (formattedPhone.length === 11) {
          if (formattedPhone.startsWith('8')) {
            formattedPhone = `+7${formattedPhone.slice(1)}`;
          } else if (formattedPhone.startsWith('7')) {
            formattedPhone = `+${formattedPhone}`;
          }
        } else {
          // If less than 11 digits, just prefix with +
          formattedPhone = `+${formattedPhone}`;
        }
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  };

  // 2. Verify OTP code
  const verifyOTP = async (phone, token) => {
    try {
      let formattedPhone = phone.replace(/\D/g, '');
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.length === 11) {
          if (formattedPhone.startsWith('8')) {
            formattedPhone = `+7${formattedPhone.slice(1)}`;
          } else if (formattedPhone.startsWith('7')) {
            formattedPhone = `+${formattedPhone}`;
          }
        } else {
          formattedPhone = `+${formattedPhone}`;
        }
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: 'sms',
      });

      if (error) throw error;

      // User state is updated via onAuthStateChange listener
      return data.user;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('arbarea_user');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <SimpleAuthContext.Provider
      value={{
        user,
        loading,
        sendOTP,
        verifyOTP,
        logout,
      }}
    >
      {!loading && children}
    </SimpleAuthContext.Provider>
  );
};
