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
  signInWithCustomToken,
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

        loginWithYandex,
        loginWithCustomToken: (token) => signInWithCustomToken(auth, token),
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
