import { useState } from 'react';
import { LogIn, Loader2, X } from 'lucide-react';
import { useSimpleAuth } from '../../../context/SimpleAuthContext';

const SimpleAuthScreen = ({ onClose }) => {
  const { sendOTP, verifyOTP } = useSimpleAuth();
  const [step, setStep] = useState('phone'); // phone, code
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Basic validation
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 11) {
        throw new Error('Введите корректный номер телефона (11 цифр)');
      }

      await sendOTP(phone);
      setStep('code');
      setSuccess('Код отправлен на ваш номер');
    } catch (err) {
      setError(err.message || 'Произошла ошибка при отправке кода');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (otp.length < 6) {
        throw new Error('Введите 6-значный код');
      }
      await verifyOTP(phone, otp);
      setSuccess('✅ Вход выполнен!');
      // Short delay before closing
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Неверный код или срок его действия истек');
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 w-full h-full border-none"
      open
    >
      <div className="bg-[#1c1917] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/5 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <LogIn className="text-amber-500" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white">Вход</h2>
              <p className="text-xs text-stone-500">
                Доступ к заказам и скидкам
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-stone-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-2xl animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-500 text-sm rounded-2xl animate-in slide-in-from-top-2">
              {success}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="phone-input"
                  className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1"
                >
                  Номер телефона
                </label>
                <input
                  id="phone-input"
                  type="tel"
                  placeholder="+7 (999) 000-00-00"
                  value={phone}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (!val.startsWith('+7') && val.length > 0)
                      val = `+7${val}`;
                    setPhone(val);
                  }}
                  className="w-full p-4 bg-stone-800/50 border border-stone-700/50 text-white placeholder-stone-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all rounded-2xl text-lg"
                  required
                />
                <p className="text-[10px] text-stone-600 ml-1">
                  Мы отправим SMS с кодом подтверждения
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 11}
                className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  'Получить код'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2 text-center">
                <label
                  htmlFor="otp-input"
                  className="text-xs font-bold text-stone-500 uppercase tracking-widest"
                >
                  Введите код из SMS
                </label>
                <input
                  id="otp-input"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-4 bg-stone-800/50 border border-stone-700/50 text-white placeholder-stone-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all rounded-2xl text-3xl tracking-[0.5em] text-center font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs text-amber-500 hover:underline mt-2"
                >
                  Изменить номер
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  'Подтвердить'
                )}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-[10px] text-stone-600 uppercase tracking-tighter">
            Нажимая кнопку, вы соглашаетесь с условиями оферты
          </p>
        </div>
      </div>
    </dialog>
  );
};

export default SimpleAuthScreen;
