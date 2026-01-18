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
      // Robust cleaning: remove non-numeric chars
      let formattedPhone = phone.replace(/\D/g, '');

      // Ensure it starts with +7 if it's 11 digits (7..., 8...)
      // Or just add + if it's missing but has right length
      if (formattedPhone.length === 11) {
        if (formattedPhone.startsWith('8')) {
          formattedPhone = `7${formattedPhone.slice(1)}`;
        }
      }

      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }

      console.log('Sending OTP to:', formattedPhone); // Debug log

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
      if (formattedPhone.length === 11) {
        if (formattedPhone.startsWith('8')) {
          formattedPhone = `7${formattedPhone.slice(1)}`;
        }
      }

      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }

      console.log('Verifying OTP for:', formattedPhone, 'Token:', token); // Debug log

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: 'sms',
      });

      if (error) throw error;

      console.log('Auth successful, user:', data.user?.id); // Debug log

      // Sync with public.users table
      if (data.user) {
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('*')
          .eq('phone', formattedPhone)
          .single();

        // Handle potential "PGRST116" error (no rows) gracefully
        // or just rely on existingUser being null if we suppress error?
        // Supabase JS often returns data: null, error: { ... } if no rows found.

        if (!existingUser) {
          console.log('Creating new user profile...');
          // Create profile if doesn't exist
          const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert([
              {
                phone: formattedPhone,
                name: name || 'Гость',
                // email: data.user.email || null, // Email might not be present for phone auth
              },
            ])
            .select()
            .single();

          if (insertError) {
            console.error('Error creating profile:', insertError);
            // If insert fails (maybe concurrent insert?), try to fetch again?
            // For now just set session user.
            setUser(data.user);
          } else {
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
