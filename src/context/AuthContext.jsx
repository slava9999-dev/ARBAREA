/**
 * Auth Context - Supabase Edition for Russia
 * Provides authentication via Email, Phone, Magic Link, VK and Yandex OAuth
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ========== Email Authentication ==========

  const loginWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const registerWithEmail = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // name, phone, etc.
      },
    });
    if (error) throw error;
    return data;
  };

  // ========== Magic Link (Email without password) ==========

  const sendMagicLink = async (email) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  };

  // ========== Phone Authentication (SMS OTP) ==========

  const sendPhoneOtp = async (phone) => {
    // Format phone to E.164 (+79991234567)
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    const { data, error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });
    if (error) throw error;
    return data;
  };

  const verifyPhoneOtp = async (phone, token) => {
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token,
      type: 'sms',
    });
    if (error) throw error;
    return data;
  };

  // ========== OAuth Providers ==========

  // Google OAuth
  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  };

  // VK (ВКонтакте) OAuth - популярно в России
  const loginWithVK = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'vk', // Requires VK app registration in Supabase
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  };

  // Yandex OAuth - популярно в России
  const loginWithYandex = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'yandex', // Requires Yandex OAuth app in Supabase
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  };

  // Apple OAuth (for iOS users)
  const loginWithApple = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  };

  // ========== Password Reset ==========

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
    return data;
  };

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  };

  // ========== Logout ==========

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // ========== Update Profile ==========

  const updateProfile = async (updates) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });
    if (error) throw error;
    return data;
  };

  // ========== Get Access Token (for API calls) ==========

  const getAccessToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token;
  };

  // ========== Check if user email is confirmed ==========

  const isEmailConfirmed = () => {
    return user?.email_confirmed_at != null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        // Email
        loginWithEmail,
        registerWithEmail,
        // Magic Link
        sendMagicLink,
        // Phone
        sendPhoneOtp,
        verifyPhoneOtp,
        // OAuth
        loginWithGoogle,
        loginWithVK,
        loginWithYandex,
        loginWithApple,
        // Password
        resetPassword,
        updatePassword,
        // General
        logout,
        updateProfile,
        getAccessToken,
        isEmailConfirmed,
        // Supabase client for direct access if needed
        supabase,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
