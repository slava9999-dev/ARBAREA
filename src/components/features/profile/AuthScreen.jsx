/**
 * AuthScreen - Расширенный экран авторизации для России
 * Поддерживает: Email, Phone OTP, VK, Yandex, Google, Apple
 */

import {
  Loader2,
  Mail,
  Phone,
  User,
  Send,
  KeyRound,
  ChevronLeft,
} from 'lucide-react';
import { useState, lazy, Suspense } from 'react';
import { useAuth } from '../../../context/AuthContext';

// Lazy load VK ID Widget for performance
const VKIDWidget = lazy(() => import('./VKIDWidget'));

const AuthScreen = () => {
  const {
    loginWithGoogle,
    loginWithVK,
    loginWithYandex,
    loginWithApple,
    loginWithEmail,
    registerWithEmail,
    sendMagicLink,
    sendPhoneOtp,
    verifyPhoneOtp,
    resetPassword,
  } = useAuth();

  const [method, setMethod] = useState('main'); // main, email, phone, magic, reset
  const [emailMode, setEmailMode] = useState('login'); // login, register
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+7');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  const getErrorMessage = (error) => {
    console.error('Auth Error:', error);
    if (!error) return 'Произошла неизвестная ошибка';
    const msg = error.message || error.toString();

    if (msg.includes('Invalid login credentials'))
      return 'Неверный email или пароль';
    if (msg.includes('User already registered'))
      return 'Пользователь уже существует';
    if (msg.includes('Password should be'))
      return 'Пароль слишком простой (минимум 6 символов)';
    if (msg.includes('rate limit'))
      return 'Слишком много попыток. Подождите немного.';
    if (msg.includes('Supabase not configured'))
      return 'Регистрация временно недоступна (технические работы).';
    if (msg.includes('provider is not enabled'))
      return 'Данный способ входа временно недоступен.';
    if (msg.includes('Phone number')) return 'Неверный формат номера телефона';

    return 'Ошибка авторизации. Проверьте данные.';
  };

  const handleOAuth = async (provider) => {
    setError('');
    try {
      if (provider === 'google') await loginWithGoogle();
      if (provider === 'vk') await loginWithVK();
      if (provider === 'yandex') await loginWithYandex();
      if (provider === 'apple') await loginWithApple();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const handleEmail = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      if (emailMode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, { name });
        setMessage(
          '✅ Регистрация успешна! Проверьте почту и подтвердите email, чтобы войти.',
        );
      }
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await sendMagicLink(email);
      setMessage('Ссылка для входа отправлена на ваш Email!');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage('Ссылка для сброса пароля отправлена на Email!');
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
      // Remove spaces, brackets, dashes
      const formattedPhone = phone.replace(/[^\d+]/g, '');
      await sendPhoneOtp(formattedPhone);
      setShowOtpInput(true);
      setMessage('Код отправлен в SMS');
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
      const formattedPhone = phone.replace(/[^\d+]/g, '');
      await verifyPhoneOtp(formattedPhone, otp);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setMethod('main');
    setShowOtpInput(false);
    setError('');
    setMessage('');
  };

  // VK Icon Component
  const VKIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <title>VK</title>
      <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.57 4 8.097c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.847 2.45 2.27 4.596 2.853 4.596.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.27-1.422 2.18-3.608 2.18-3.608.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.778 1.202 1.253.745.848 1.32 1.558 1.473 2.05.17.488-.085.743-.576.743z" />
    </svg>
  );

  // Yandex Icon Component
  const YandexIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <title>Yandex</title>
      <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12zm11.5-6v3.757a11.4 11.4 0 0 0-3 5.743h2a9.5 9.5 0 0 1 1-3.5V18h2V6h-2z" />
    </svg>
  );

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 pb-32 text-center animate-fade-in bg-gradient-to-b from-wood-bg to-wood-bg-elevated">
      <div className="w-24 h-24 bg-gradient-to-br from-wood-amber/20 to-wood-amber/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-wood-amber/20 shadow-wood-glow">
        <User size={40} className="text-wood-amber" />
      </div>

      <h2 className="text-3xl font-serif font-bold mb-3 text-gradient-amber drop-shadow-wood-glow">
        Добро пожаловать
        <br />в Arbarea
      </h2>
      <p className="text-wood-text-secondary mb-10 text-sm leading-relaxed max-w-xs mx-auto">
        Войдите, чтобы отслеживать заказы и получить скидку 10%
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm mb-4 backdrop-blur-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-sm mb-4 backdrop-blur-sm">
          {message}
        </div>
      )}

      {/* ============ MAIN SCREEN ============ */}
      {method === 'main' && (
        <div className="space-y-3">
          {/* VK ID Widget - VK, Одноклассники, Mail.ru */}
          <div className="bg-white rounded-2xl p-3">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="animate-spin text-stone-400" size={20} />
                </div>
              }
            >
              <VKIDWidget
                onSuccess={() => {
                  // Refresh page to get new session
                  window.location.reload();
                }}
                onError={(err) => setError('Ошибка авторизации через VK ID')}
              />
            </Suspense>
          </div>

          {/* Email Option */}
          <button
            type="button"
            onClick={() => setMethod('email')}
            className="w-full bg-wood-bg-card border border-wood-amber/20 text-wood-text-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-wood-bg-elevated hover:border-wood-amber/40 active:scale-95 transition-all shadow-wood-sm"
          >
            <Mail size={20} />
            Войти через Email
          </button>

          <button
            type="button"
            onClick={() => setMethod('magic')}
            className="w-full mt-2 text-wood-text-muted text-xs py-2 hover:text-wood-amber transition-colors"
          >
            Войти без пароля (по ссылке на Email)
          </button>
        </div>
      )}

      {/* ============ EMAIL LOGIN/REGISTER ============ */}
      {method === 'email' && (
        <div className="space-y-4 text-left">
          {emailMode === 'register' && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              type="text"
              className="w-full p-4 bg-wood-bg-elevated border border-wood-amber/20 text-wood-text-primary rounded-2xl outline-none focus:border-wood-amber focus:shadow-wood-glow-sm placeholder-wood-text-muted"
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full p-4 bg-wood-bg-elevated border border-wood-amber/20 text-wood-text-primary rounded-2xl outline-none focus:border-wood-amber focus:shadow-wood-glow-sm placeholder-wood-text-muted"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full p-4 bg-wood-bg-elevated border border-wood-amber/20 text-wood-text-primary rounded-2xl outline-none focus:border-wood-amber focus:shadow-wood-glow-sm placeholder-wood-text-muted"
          />
          <button
            type="button"
            onClick={handleEmail}
            disabled={loading}
            className="w-full btn-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : emailMode === 'login' ? (
              'Войти'
            ) : (
              'Зарегистрироваться'
            )}
          </button>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() =>
                setEmailMode(emailMode === 'login' ? 'register' : 'login')
              }
              className="text-stone-400 text-sm py-2"
            >
              {emailMode === 'login'
                ? 'Нет аккаунта? Создать'
                : 'Есть аккаунт? Войти'}
            </button>
            {emailMode === 'login' && (
              <button
                type="button"
                onClick={() => setMethod('reset')}
                className="text-wood-amber text-sm py-2 hover:text-wood-amber-light"
              >
                Забыли пароль?
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={goBack}
            className="w-full text-stone-500 text-sm flex items-center justify-center gap-1"
          >
            <ChevronLeft size={16} /> Назад
          </button>
        </div>
      )}

      {/* ============ PASSWORD RESET ============ */}
      {method === 'reset' && (
        <div className="space-y-4 text-left">
          <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 mb-2">
            <p className="text-xs text-amber-200">
              <KeyRound size={14} className="inline mr-2" />
              Введите email и мы отправим ссылку для сброса пароля
            </p>
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ваш Email"
            type="email"
            className="w-full p-4 bg-stone-900 border border-stone-700 text-white rounded-xl outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={loading}
            className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-500"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Send size={18} /> Отправить ссылку
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMethod('email')}
            className="w-full text-stone-500 text-sm flex items-center justify-center gap-1"
          >
            <ChevronLeft size={16} /> Назад к входу
          </button>
        </div>
      )}

      {/* ============ MAGIC LINK ============ */}
      {method === 'magic' && (
        <div className="space-y-4 text-left">
          <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 mb-2">
            <p className="text-xs text-amber-200">
              💡 Мы отправим вам на почту волшебную ссылку. Просто нажмите на
              неё, чтобы войти без пароля.
            </p>
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ваш Email"
            type="email"
            className="w-full p-4 bg-stone-900 border border-stone-700 text-white rounded-xl outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={handleMagicLink}
            disabled={loading}
            className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-500"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Send size={18} /> Отправить ссылку
              </>
            )}
          </button>
          <button
            type="button"
            onClick={goBack}
            className="w-full text-stone-500 text-sm flex items-center justify-center gap-1"
          >
            <ChevronLeft size={16} /> Назад
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthScreen;
