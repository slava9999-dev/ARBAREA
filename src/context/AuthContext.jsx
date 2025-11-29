import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const loginWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const registerWithEmail = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const setupRecaptcha = (elementId) => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
        size: 'invisible',
        callback: () => {},
      });
    }
  };

  const clearRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.error('Error clearing recaptcha', e);
      }
      window.recaptchaVerifier = null;
    }
  };

  const loginWithPhone = async (phoneNumber, appVerifier) => {
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  };

  const loginWithTelegram = () => {
    return new Promise((resolve, reject) => {
      // Проверяем, загружен ли скрипт
      if (window.Telegram?.Login) {
        window.Telegram.Login.auth(
          { bot_id: '7686564619', request_access: true },
          (data) => {
            if (!data) {
              reject(new Error('Telegram Auth Failed'));
            } else {
              // Здесь мы должны создать/обновить пользователя в Firebase
              // Но так как Firebase не поддерживает Telegram Auth напрямую,
              // мы используем Custom Token (требует бэкенда) или просто сохраняем данные локально
              // Для MVP сохраним данные как "пользователя"
              const user = {
                uid: `tg_${data.id}`,
                displayName:
                  `${data.first_name} ${data.last_name || ''}`.trim(),
                photoURL: data.photo_url,
                providerId: 'telegram',
              };
              setUser(user); // Временно устанавливаем пользователя в контекст
              resolve({ user });
            }
          },
        );
      } else {
        // Если скрипт не загружен, открываем виджет в новом окне (fallback)
        // Но лучше просто показать инструкцию или кнопку
        alert('Для входа через Telegram используйте виджет на странице входа.');
        reject(new Error('Telegram Widget not loaded'));
      }
    });
  };

  const loginWithYandex = async () => {
    const provider = new OAuthProvider('yandex.ru');
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error('Yandex Auth Error:', e);
      throw e;
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        logout,
        loginWithEmail,
        registerWithEmail,
        setupRecaptcha,
        clearRecaptcha,
        loginWithPhone,
        loginWithTelegram,
        loginWithYandex,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
