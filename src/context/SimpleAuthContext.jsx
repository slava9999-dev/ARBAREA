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

        if (session?.user) {
          // Fetch additional data from public.users
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('phone', session.user.phone)
            .single();

          setUser({ ...session.user, ...profile });
        } else {
          setUser(null);
        }
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
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Optimistically set user
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('phone', session.user.phone)
          .single();

        setUser({ ...session.user, ...profile });
      } else {
        setUser(null);
        localStorage.removeItem('arbarea_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 1. Send OTP to phone
  const sendOTP = async (phone) => {
    try {
      // Basic formatting to E.164
      let formattedPhone = phone.replace(/\D/g, '');
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.length === 11) {
          formattedPhone = `+7${formattedPhone.slice(1)}`;
        } else {
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

  // 2. Verify OTP code and Sync Profile
  const verifyOTP = async (phone, token, name = '') => {
    try {
      let formattedPhone = phone.replace(/\D/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone =
          formattedPhone.length === 11
            ? `+7${formattedPhone.slice(1)}`
            : `+${formattedPhone}`;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: 'sms',
      });

      if (error) throw error;

      // Sync with public.users table
      if (data.user) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('phone', formattedPhone)
          .single();

        if (!existingUser) {
          // Create profile if doesn't exist
          const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert([
              {
                phone: formattedPhone,
                name: name || 'Гость',
                email: data.user.email || null,
              },
            ])
            .select()
            .single();

          if (!insertError) {
            setUser({ ...data.user, ...newProfile });
          }
        } else if (name && existingUser.name === 'Гость') {
          // Update name if it was 'Гость'
          const { data: updatedProfile } = await supabase
            .from('users')
            .update({ name })
            .eq('phone', formattedPhone)
            .select()
            .single();

          setUser({ ...data.user, ...updatedProfile });
        } else {
          setUser({ ...data.user, ...existingUser });
        }
      }

      return data.user;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  };

  // Update Profile
  const updateProfile = async (updates) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          phone: user.phone,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      setUser((prev) => ({ ...prev, ...data }));
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
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
        updateProfile,
        logout,
      }}
    >
      {!loading && children}
    </SimpleAuthContext.Provider>
  );
};
