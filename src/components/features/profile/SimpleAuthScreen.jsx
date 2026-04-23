/**
 * SimpleAuthScreen — Phone-Only Registration
 *
 * Minimal, premium UX:
 * 1. User enters name + phone number (+7)
 * 2. Clicks "Получить скидку 10%"
 * 3. Instantly registered, session created
 *
 * No OTP, no password, no email verification.
 */

import { useState } from 'react';
import { Gift, Loader2, Phone, User, Sparkles } from 'lucide-react';
import { useSimpleAuth } from '../../../context/SimpleAuthContext';

const SimpleAuthScreen = () => {
  const { register } = useSimpleAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+7 ');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ─── Phone Input Formatting ───────────────────────────────────
  const handlePhoneChange = (e) => {
    let val = e.target.value;

    // Always keep +7 prefix
    if (!val.startsWith('+7')) {
      val = `+7 ${val.replace(/^\+?7?\s?/, '')}`;
    }

    // Allow only digits, spaces, parentheses, dashes after +7
    const afterPrefix = val.slice(2).replace(/[^\d\s()-]/g, '');

    // Limit to reasonable length (+7 + 10 digits + formatting = ~18 chars)
    if (afterPrefix.replace(/\D/g, '').length > 10) return;

    setPhone(`+7${afterPrefix}`);
  };

  const handlePhoneFocus = () => {
    if (!phone || phone.trim() === '' || phone === '+7') {
      setPhone('+7 ');
    }
  };

  // ─── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await register(name, phone);
      setSuccess('Добро пожаловать! Ваша скидка 10% активирована ✨');
    } catch (err) {
      setError(err.message || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  // ─── Validation ───────────────────────────────────────────────
  const phoneDigits = phone.replace(/\D/g, '');
  const isPhoneValid = phoneDigits.length === 11 && phoneDigits.startsWith('7');
  const isNameValid = name.trim().length >= 2;
  const canSubmit = isNameValid && isPhoneValid && !loading;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-32 animate-fade-in">
      {/* Decorative Glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(217, 119, 6, 0.4) 0%, transparent 70%)',
        }}
      />

      {/* Icon */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 bg-amber-500/10 rounded-full animate-pulse" />
        <div className="relative w-full h-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-full flex items-center justify-center border border-amber-500/20 shadow-[0_0_40px_rgba(217,119,6,0.15)]">
          <Gift size={40} className="text-amber-500" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-3xl font-serif font-bold text-white mb-2 text-center">
        Скидка 10%
      </h2>
      <p className="text-stone-400 text-sm text-center mb-8 max-w-xs leading-relaxed">
        Зарегистрируйтесь за 10 секунд и получите персональную скидку на все
        изделия
      </p>

      {/* Status Messages */}
      {error && (
        <div className="w-full max-w-sm mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl animate-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {success && (
        <div className="w-full max-w-sm mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-2xl animate-in slide-in-from-top-2 flex items-center gap-3">
          <Sparkles size={20} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Registration Form */}
      {!success && (
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
          {/* Name Input */}
          <div className="space-y-2">
            <label
              htmlFor="auth-name"
              className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"
            >
              <User size={12} />
              Ваше имя
            </label>
            <input
              id="auth-name"
              type="text"
              placeholder="Иван"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 bg-stone-800/50 border border-stone-700/50 text-white placeholder-stone-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all rounded-2xl text-lg"
              required
              autoComplete="given-name"
            />
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <label
              htmlFor="auth-phone"
              className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"
            >
              <Phone size={12} />
              Номер телефона
            </label>
            <input
              id="auth-phone"
              type="tel"
              inputMode="tel"
              placeholder="+7 (999) 000-00-00"
              value={phone}
              onFocus={handlePhoneFocus}
              onChange={handlePhoneChange}
              className="w-full p-4 bg-stone-800/50 border border-stone-700/50 text-white placeholder-stone-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all rounded-2xl text-lg font-mono tracking-wide"
              required
              autoComplete="tel"
            />
            {phoneDigits.length > 1 && !isPhoneValid && (
              <p className="text-[11px] text-stone-500 ml-1">
                Введите 10 цифр после +7
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-stone-700 disabled:to-stone-700 disabled:text-stone-500 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(217,119,6,0.3)] disabled:shadow-none flex items-center justify-center gap-3 text-lg active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={22} />
                <span>Регистрация...</span>
              </>
            ) : (
              <>
                <Sparkles size={22} />
                <span>Получить скидку 10%</span>
              </>
            )}
          </button>

          {/* Legal */}
          <p className="text-center text-[10px] text-stone-600 pt-2 leading-relaxed">
            Нажимая кнопку, вы соглашаетесь с{' '}
            <a
              href="/legal"
              className="text-stone-500 underline underline-offset-2 hover:text-amber-500 transition-colors"
            >
              условиями оферты
            </a>
          </p>
        </form>
      )}
    </div>
  );
};

export default SimpleAuthScreen;
