import { Loader2, Mail, Phone, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

import TelegramLoginButton from './TelegramLoginButton';


const AuthScreen = () => {
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    loginWithPhone,
    setupRecaptcha,
    clearRecaptcha,
    loginWithCustomToken,
  } = useAuth();
  const [method, setMethod] = useState('main'); // main, email, phone
  const [emailMode, setEmailMode] = useState('login'); // login, register
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, [clearRecaptcha]);

  useEffect(() => {
    if (method !== 'phone') {
      clearRecaptcha();
    }
  }, [method, clearRecaptcha]);

  const getErrorMessage = (error) => {
    console.error('Auth Error Details:', error);
    if (error.code === 'auth/operation-not-allowed')
      return 'Этот метод входа отключен в настройках Firebase Console.';
    if (error.code === 'auth/invalid-email') return 'Некорректный Email.';
    if (error.code === 'auth/user-disabled')
      return 'Пользователь заблокирован.';
    if (error.code === 'auth/user-not-found') return 'Пользователь не найден.';
    if (error.code === 'auth/wrong-password') return 'Неверный пароль.';
    if (error.code === 'auth/email-already-in-use')
      return 'Email уже используется.';
    if (error.code === 'auth/weak-password') return 'Пароль слишком простой.';
    if (error.code === 'auth/invalid-phone-number')
      return 'Некорректный номер телефона.';
    if (error.code === 'auth/missing-verification-code')
      return 'Введите код из SMS.';
    if (error.code === 'auth/invalid-verification-code')
      return 'Неверный код из SMS.';
    return error.message || 'Произошла ошибка авторизации.';
  };

  const handleGoogle = async () => {
    setError('');
    // setLoading(true); // Removed to prevent popup blocking
    try {
      await loginWithGoogle();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async () => {
    setError('');
    setLoading(true);
    try {
      if (emailMode === 'login') await loginWithEmail(email, password);
      else await registerWithEmail(email, password);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    setError('');
    setLoading(true);
    try {
      setupRecaptcha('recaptcha-container');
      const appVerifier = window.recaptchaVerifier;
      // Sanitize phone number: remove spaces, dashes, parentheses
      const formattedPhone = phone.replace(/[\s()-]/g, '');
      const confirmation = await loginWithPhone(formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramAuth = async (telegramUser) => {
    try {
      console.log('🔵 Telegram auth started:', telegramUser);
      setLoading(true);
      
      console.log('🔵 Sending request to /api/auth-telegram...');
      const response = await fetch('/api/auth-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telegramUser),
      });

      console.log('🔵 Response status:', response.status);
      const data = await response.json();
      console.log('🔵 Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка авторизации Telegram');
      }

      console.log('🔵 Logging in with custom token...');
      await loginWithCustomToken(data.token);
      console.log('✅ Telegram auth successful!');
    } catch (err) {
      console.error('❌ Telegram Login Error:', err);
      setError(err.message || 'Ошибка входа через Telegram');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 pb-32 text-center animate-fade-in">
      <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <User size={40} className="text-stone-400" />
      </div>

      <h2 className="text-2xl font-serif font-bold mb-3 text-white">
        Добро пожаловать
        <br />в Arbarea
      </h2>
      <p className="text-stone-300 mb-10 text-sm leading-relaxed max-w-xs mx-auto">
        Войдите, чтобы отслеживать заказы, копить бонусы и вступить в закрытый
        клуб
      </p>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      {method === 'main' && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full bg-stone-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-stone-700 active:scale-95 transition-all border-2 border-stone-700 hover:border-stone-600"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Войти через Google
              </span>
            )}
          </button>

          <div className="pt-4 grid grid-cols-2 gap-3 items-center">
            <button
              type="button"
              onClick={() => setMethod('phone')}
              className="bg-stone-800 border border-stone-700 text-stone-200 py-3 rounded-xl flex items-center justify-center hover:bg-stone-700 active:scale-95 transition-all h-14 shadow-neon-stone"
            >
              <Phone size={20} />
            </button>
            <button
              type="button"
              onClick={() => setMethod('email')}
              className="bg-stone-800 border border-stone-700 text-stone-200 py-3 rounded-xl flex items-center justify-center hover:bg-stone-700 active:scale-95 transition-all h-14 shadow-neon-stone"
            >
              <Mail size={20} />
            </button>
          </div>

          <div className="mt-6">
             <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200 dark:border-stone-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-stone-900 text-stone-400 dark:text-stone-500">или</span>
                </div>
             </div>
             <TelegramLoginButton onAuth={handleTelegramAuth} botName="Arbarea_bot" />
          </div>
        </div>
      )}

      {method === 'email' && (
        <div className="space-y-4 text-left">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-4 bg-stone-50 text-stone-900 rounded-xl outline-none border focus:border-stone-300"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full p-4 bg-stone-50 text-stone-900 rounded-xl outline-none border focus:border-stone-300"
          />
          <button
            type="button"
            onClick={handleEmail}
            disabled={loading}
            className="w-full bg-stone-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : emailMode === 'login' ? (
              'Войти'
            ) : (
              'Зарегистрироваться'
            )}
          </button>
          <button
            type="button"
            onClick={() =>
              setEmailMode(emailMode === 'login' ? 'register' : 'login')
            }
            className="w-full text-stone-400 text-sm py-2"
          >
            {emailMode === 'login'
              ? 'Нет аккаунта? Создать'
              : 'Есть аккаунт? Войти'}
          </button>
          <button
            type="button"
            onClick={() => setMethod('main')}
            className="w-full text-stone-400 text-sm"
          >
            Назад
          </button>
        </div>
      )}

      {method === 'phone' && (
        <div className="space-y-4 text-left">
          {!confirmationResult ? (
            <>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 000-00-00"
                className="w-full p-4 bg-stone-50 text-stone-900 rounded-xl outline-none border focus:border-stone-300"
              />
              <div id="recaptcha-container"></div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={loading}
                className="w-full bg-stone-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  'Отправить код'
                )}
              </button>
            </>
          ) : (
            <>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Код из SMS"
                className="w-full p-4 bg-stone-50 text-stone-900 rounded-xl outline-none border focus:border-stone-300 text-center tracking-widest text-xl"
              />
              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={loading}
                className="w-full bg-stone-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Подтвердить'}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setMethod('main')}
            className="w-full text-stone-400 text-sm"
          >
            Назад
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthScreen;
