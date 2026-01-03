/**
 * Simple Auth Context - Phone-based registration
 * No email confirmation required
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const SimpleAuthContext = createContext({});
export const useSimpleAuth = () => useContext(SimpleAuthContext);

export const SimpleAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('arbarea_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('arbarea_user');
      }
    }
    setLoading(false);
  }, []);

  // Register with name + phone
  const register = async (name, phone) => {
    try {
      // Format phone to E.164
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      // Check if phone already exists
      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('phone', formattedPhone)
        .single();

      if (existing) {
        throw new Error('Этот номер телефона уже зарегистрирован');
      }

      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: name.trim(),
          phone: formattedPhone,
        })
        .select()
        .single();

      if (error) throw error;

      // Save to localStorage
      localStorage.setItem('arbarea_user', JSON.stringify(data));
      setUser(data);

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Login with phone (if user exists)
  const login = async (phone) => {
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', formattedPhone)
        .single();

      if (error || !data) {
        throw new Error('Пользователь с таким номером не найден');
      }

      localStorage.setItem('arbarea_user', JSON.stringify(data));
      setUser(data);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('User not logged in');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      localStorage.setItem('arbarea_user', JSON.stringify(data));
      setUser(data);

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('arbarea_user');
    setUser(null);
  };

  return (
    <SimpleAuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        updateProfile,
        logout,
      }}
    >
      {!loading && children}
    </SimpleAuthContext.Provider>
  );
};
