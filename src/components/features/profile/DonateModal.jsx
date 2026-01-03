import { Coffee, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { useSimpleAuth } from '../../../context/SimpleAuthContext';
import { initPayment } from '../../../lib/tinkoff';

const DonateModal = ({ onClose }) => {
  const { user } = useSimpleAuth();
  const [amount, setAmount] = useState('100');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const quickAmounts = [100, 300, 500, 1000];

  const handleDonate = async () => {
    const donateAmount = Number.parseInt(amount, 10);

    if (!donateAmount || donateAmount < 10) {
      setError('Минимальная сумма доната — 10₽');
      return;
    }

    if (donateAmount > 100000) {
      setError('Максимальная сумма доната — 100,000₽');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const orderId = `DONATE-${Date.now()}`;
      const description = `Донат мастеру Arbarea ${donateAmount}₽`;

      const items = [
        {
          id: `donate-${donateAmount}`,
          name: `Донат мастеру ${donateAmount}₽`,
          quantity: 1,
          price: donateAmount,
        },
      ];

      const paymentUrl = await initPayment(orderId, items, description, {
        email: user?.email || '',
        phone: user?.phoneNumber || '',
      });

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        setError('Ошибка инициализации оплаты');
      }
    } catch (err) {
      console.error('Donation error:', err);
      setError('Не удалось инициировать донат. Попробуйте позже.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-stone-900 rounded-3xl shadow-2xl max-w-md w-full p-6 relative border border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Coffee size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white font-serif mb-2">
            Угостить мастера
          </h2>
          <p className="text-stone-400 text-sm">
            Поддержите создание уникальных изделий из дерева
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setAmount(amt.toString())}
              className={`p-3 rounded-xl border transition-all ${
                amount === amt.toString()
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'bg-stone-800 border-stone-700 text-stone-300 hover:border-amber-500/50'
              }`}
            >
              {amt}₽
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label
            htmlFor="donate-amount"
            className="block text-sm text-stone-400 mb-2"
          >
            Или введите свою сумму:
          </label>
          <div className="relative">
            <input
              id="donate-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="100"
              min="10"
              max="100000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
              ₽
            </span>
          </div>
          {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
        </div>

        <button
          type="button"
          onClick={handleDonate}
          disabled={isProcessing || !amount}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-4 rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Обработка...
            </>
          ) : (
            `Поддержать на ${amount || '0'}₽`
          )}
        </button>

        <p className="text-center text-stone-500 text-xs mt-4">
          Безопасная оплата через Т-Банк
        </p>
      </div>
    </div>
  );
};

export default DonateModal;
