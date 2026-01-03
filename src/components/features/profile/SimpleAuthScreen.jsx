/**
 * SimpleAuthScreen - Упрощенная регистрация (имя + телефон)
 */

import { useState } from 'react';
import { Loader2, User, Phone as PhoneIcon, LogIn } from 'lucide-react';
import { useSimpleAuth } from '../../../context/SimpleAuthContext';

const SimpleAuthScreen = () => {
  const { register, login } = useSimpleAuth();
  const [mode, setMode] = useState('register'); // register | login
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+7');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          throw new Error('Введите ваше имя');
        }
        if (phone.length < 11) {
          throw new Error('Введите корректный номер телефона');
        }
        await register(name, phone);
        setSuccess('✅ Регистрация успешна! Добро пожаловать!');
      } else {
        if (phone.length < 11) {
          throw new Error('Введите корректный номер телефона');
        }
        await login(phone);
        setSuccess('✅ Вход выполнен!');
      }
    } catch (err) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 pb-32 text-center animate-fade-in bg-gradient-to-b from-wood-bg to-wood-bg-elevated">
      <div className="w-24 h-24 bg-gradient-to-br from-wood-amber/20 to-wood-amber/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-wood-amber/20 shadow-wood-glow">
        <User size={40} className="text-wood-amber" />
      </div>

      <h2 className="text-3xl font-serif font-bold mb-3 text-gradient-amber drop-shadow-wood-glow">
        {mode === 'register' ? 'Регистрация' : 'Вход'}
        <br />в Arbarea
      </h2>
      <p className="text-wood-text-secondary mb-10 text-sm leading-relaxed max-w-xs mx-auto">
        {mode === 'register'
          ? 'Создайте аккаунт и получите скидку 10%'
          : 'Войдите, чтобы отслеживать заказы'}
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm mb-4 backdrop-blur-sm max-w-sm mx-auto">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-sm mb-4 backdrop-blur-sm max-w-sm mx-auto">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 text-left max-w-sm mx-auto w-full"
      >
        {mode === 'register' && (
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="text-xs text-wood-text-muted ml-3 uppercase tracking-wider font-bold"
            >
              Ваше имя
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Иванов"
              className="w-full p-4 bg-wood-bg-elevated border border-wood-amber/20 text-wood-text-primary rounded-2xl outline-none focus:border-wood-amber focus:shadow-wood-glow-sm placeholder-wood-text-muted"
              required
            />
          </div>
        )}

        <div className="space-y-1">
          <label
            htmlFor="phone"
            className="text-xs text-wood-text-muted ml-3 uppercase tracking-wider font-bold"
          >
            Номер телефона
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onFocus={() => {
              if (!phone || phone === '') setPhone('+7');
            }}
            onChange={(e) => {
              let val = e.target.value;
              if (!val.startsWith('+7')) val = `+7${val.replace(/^\+7/, '')}`;
              if (/^[\d\s()+-]*$/.test(val)) {
                setPhone(val);
              }
            }}
            placeholder="+7 (999) 000-00-00"
            className="w-full p-4 bg-wood-bg-elevated border border-wood-amber/20 text-wood-text-primary rounded-2xl outline-none focus:border-wood-amber focus:shadow-wood-glow-sm placeholder-wood-text-muted"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : mode === 'register' ? (
            <>
              <PhoneIcon size={20} /> Зарегистрироваться
            </>
          ) : (
            <>
              <LogIn size={20} /> Войти
            </>
          )}
        </button>

        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'register' ? 'login' : 'register');
              setError('');
              setSuccess('');
            }}
            className="text-wood-text-muted text-sm hover:text-wood-amber transition-colors"
          >
            {mode === 'register'
              ? 'Уже есть аккаунт? Войти'
              : 'Нет аккаунта? Зарегистрироваться'}
          </button>
        </div>
      </form>

      <p className="text-wood-text-muted text-xs mt-8 max-w-xs mx-auto">
        Регистрируясь, вы соглашаетесь с условиями использования и политикой
        конфиденциальности
      </p>
    </div>
  );
};

export default SimpleAuthScreen;
