import { Loader2, Mail, Phone, User, Send } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

const AuthScreen = () => {
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    sendMagicLink,
    sendPhoneOtp,
    verifyPhoneOtp,
  } = useAuth();
  
  const [method, setMethod] = useState('main'); // main, email, phone, magic
  const [emailMode, setEmailMode] = useState('login'); // login, register
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+7');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  const getErrorMessage = (error) => {
    console.error('Auth Error:', error);
    if (!error) return 'Произошла неизвестная ошибка';
    const msg = error.message || error.toString();
    
    if (msg.includes('Invalid login credentials')) return 'Неверный email или пароль';
    if (msg.includes('User already registered')) return 'Пользователь уже существует';
    if (msg.includes('Password should be')) return 'Пароль слишком простой (минимум 6 символов)';
    if (msg.includes('rate limit')) return 'Слишком много попыток. Подождите немного.';
    
    return 'Ошибка авторизации. Проверьте данные.';
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await loginWithGoogle();
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
        await registerWithEmail(email, password);
        setMessage('Подтвердите регистрацию по ссылке в письме!');
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

  const handleSendCode = async () => {
    setError('');
    setLoading(true);
    try {
      // Remove spaces, brackets, dashes
      const formattedPhone = phone.replace(/[^\d+]/g, '');
      await sendPhoneOtp(formattedPhone);
      setShowOtpInput(true);
      setMessage('Код отправлен в SMS/WhatsApp');
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
        Войдите, чтобы отслеживать заказы и сохранять товары в избранное
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl text-sm mb-4">
          {message}
        </div>
      )}

      {method === 'main' && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full bg-white text-stone-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-stone-200 active:scale-95 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Войти через Google
          </button>

          <div className="pt-4 grid grid-cols-2 gap-3 items-center">
            <button
              type="button"
              onClick={() => setMethod('phone')}
              className="bg-stone-800 border border-stone-700 text-stone-200 py-3 rounded-xl flex items-center justify-center hover:bg-stone-700 active:scale-95 transition-all h-14"
            >
              <Phone size={20} />
            </button>
            <button
              type="button"
              onClick={() => setMethod('email')}
              className="bg-stone-800 border border-stone-700 text-stone-200 py-3 rounded-xl flex items-center justify-center hover:bg-stone-700 active:scale-95 transition-all h-14"
            >
              <Mail size={20} />
            </button>
          </div>
          
          <button
            type="button"
            onClick={() => setMethod('magic')}
            className="w-full mt-2 text-stone-400 text-xs py-2 hover:text-white transition-colors"
          >
            Войти без пароля (по ссылке на Email)
          </button>
        </div>
      )}

      {method === 'email' && (
        <div className="space-y-4 text-left">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full p-4 bg-stone-900 border border-stone-700 text-white rounded-xl outline-none focus:border-amber-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full p-4 bg-stone-900 border border-stone-700 text-white rounded-xl outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={handleEmail}
            disabled={loading}
            className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-500"
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
            onClick={() => {
              setMethod('main');
              setError('');
              setMessage('');
            }}
            className="w-full text-stone-500 text-sm"
          >
            Назад
          </button>
        </div>
      )}

      {method === 'magic' && (
        <div className="space-y-4 text-left">
          <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 mb-2">
            <p className="text-xs text-amber-200">
              💡 Мы отправим вам на почту волшебную ссылку. Просто нажмите на неё, чтобы войти без пароля.
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
            {loading ? <Loader2 className="animate-spin" /> : <><Send size={18}/> Отправить ссылку</>}
          </button>
          <button
            type="button"
            onClick={() => setMethod('main')}
            className="w-full text-stone-500 text-sm"
          >
            Назад
          </button>
        </div>
      )}

      {method === 'phone' && (
        <div className="space-y-4 text-left">
          {!showOtpInput ? (
            <>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 000-00-00"
                type="tel"
                className="w-full p-4 bg-stone-900 border border-stone-700 text-white rounded-xl outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={loading}
                className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-500"
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
                className="w-full p-4 bg-stone-900 border border-stone-700 text-white rounded-xl outline-none focus:border-amber-500 text-center tracking-widest text-xl"
              />
              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={loading}
                className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-500"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Подтвердить'}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              setMethod('main');
              setShowOtpInput(false);
              setError('');
            }}
            className="w-full text-stone-500 text-sm"
          >
            Назад
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthScreen;
