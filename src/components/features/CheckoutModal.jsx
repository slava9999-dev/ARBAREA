import { useState } from 'react';
import { X, Loader2, Check, CreditCard } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import DiscountBanner from './DiscountBanner';
import { initPayment } from '../../lib/tinkoff';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { sendTelegramNotification } from '../../lib/telegram';

const CheckoutModal = ({ onClose }) => {
  const { cartItems, cartTotal, subtotal, discount } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState('form'); // form, processing, success
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
  });
  const [error, setError] = useState('');

  const saveOrderToFirestore = async (orderId, paymentUrl) => {
    try {
      const orderData = {
        orderId,
        userId: user?.uid || 'guest',
        userEmail: formData.email || user?.email || '',
        userPhone: formData.phone || user?.phoneNumber || '',
        userName: formData.name || user?.displayName || '',
        deliveryAddress: formData.address,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          selectedSize: item.selectedSize || null,
          selectedColor: item.selectedColor || null,
        })),
        subtotal,
        discount,
        total: cartTotal,
        status: 'pending_payment',
        paymentUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, 'orders'), orderData);
    } catch (_error) {
      // Не прерываем процесс оплаты, если не удалось сохранить в БД
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStep('processing');
    setError('');

    try {
      const orderId = `ORDER-${Date.now()}`;
      const description = `Заказ ${orderId} в Arbarea`;

      // Call Tinkoff API
      const paymentUrl = await initPayment(orderId, cartTotal, description, {
        email: formData.email,
        phone: formData.phone,
      });

      if (paymentUrl) {
        // Сохранение заказа в Firestore
        await saveOrderToFirestore(orderId, paymentUrl);

        // Send Telegram Notification
        const message = `
<b>Новый заказ!</b> 📦
<b>ID:</b> ${orderId}
<b>Имя:</b> ${formData.name}
<b>Телефон:</b> ${formData.phone}
<b>Email:</b> ${formData.email}
<b>Адрес:</b> ${formData.address}
<b>Сумма:</b> ${cartTotal} ₽

<b>Товары:</b>
${cartItems.map((item) => `- ${item.name} x${item.quantity}`).join('\n')}
`;
        await sendTelegramNotification(message);

        // Redirect to bank
        window.location.href = paymentUrl;
      } else {
        throw new Error('Ссылка на оплату не получена');
      }
    } catch (err) {
      console.error(err);
      setError(
        'Ошибка инициализации оплаты. Проверьте консоль или попробуйте позже.',
      );
      setStep('form');
    }
  };

  if (cartItems.length === 0 && step === 'form') return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1c1917] w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh] border border-white/5">
        <div className="p-4 flex justify-between items-center border-b border-white/5 shrink-0">
          <h3 className="font-serif font-bold text-lg text-white">
            {step === 'form'
              ? 'Оформление заказа'
              : step === 'success'
                ? 'Готово!'
                : 'Оплата'}
          </h3>
          {step !== 'processing' && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-white/5 rounded-full"
            >
              <X className="text-stone-400" size={20} />
            </button>
          )}
        </div>

        {step === 'form' && (
          <div className="overflow-y-auto p-6 custom-scrollbar">
            <DiscountBanner />

            <div className="mb-6 space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-stone-400 truncate max-w-[200px]">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium text-stone-200">
                    {(
                      (item.price || 0) * (item.quantity || 1)
                    ).toLocaleString()}{' '}
                    ₽
                  </span>
                </div>
              ))}
              <div className="border-t border-white/5 pt-2 mt-2 space-y-1">
                <div className="flex justify-between text-stone-400 text-sm">
                  <span>Сумма</span>
                  <span>{(subtotal || 0).toLocaleString()} ₽</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400 text-sm">
                    <span>Скидка (10%)</span>
                    <span>-{(discount || 0).toLocaleString()} ₽</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-white pt-1">
                  <span>Итого</span>
                  <span>{(cartTotal || 0).toLocaleString()} ₽</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 text-red-500 text-sm rounded-xl border border-red-500/20">
                  {error}
                </div>
              )}
              <input
                required
                placeholder="Ваше имя"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-4 bg-transparent border-b border-stone-700 text-white placeholder-stone-600 focus:border-amber-500 focus:outline-none transition-colors rounded-none px-0 py-3"
              />
              <input
                required
                type="tel"
                placeholder="Телефон"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full p-4 bg-transparent border-b border-stone-700 text-white placeholder-stone-600 focus:border-amber-500 focus:outline-none transition-colors rounded-none px-0 py-3"
              />
              <input
                type="email"
                placeholder="Email (для чека)"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full p-4 bg-transparent border-b border-stone-700 text-white placeholder-stone-600 focus:border-amber-500 focus:outline-none transition-colors rounded-none px-0 py-3"
              />
              <input
                required
                placeholder="Адрес доставки"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full p-4 bg-transparent border-b border-stone-700 text-white placeholder-stone-600 focus:border-amber-500 focus:outline-none transition-colors rounded-none px-0 py-3"
              />

              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 hover:bg-amber-500 transition-colors shadow-[0_0_20px_rgba(217,119,6,0.3)]"
              >
                <CreditCard size={18} />
                <span>Оплатить (Карта / СБП)</span>
              </button>
              <div className="text-center text-xs text-stone-500 mt-2">
                Безопасная оплата через Тинькофф
              </div>
            </form>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-12 text-center">
            <Loader2
              size={32}
              className="text-amber-500 animate-spin mx-auto mb-4"
            />
            <h3 className="font-bold text-white">Обработка платежа...</h3>
            <p className="text-stone-400 text-sm mt-2">
              Пожалуйста, не закрывайте окно
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
              <Check size={32} />
            </div>
            <h3 className="font-bold text-xl mb-2 text-white">
              Заказ оформлен!
            </h3>
            <p className="text-stone-400 text-sm mb-6">
              Мы свяжемся с вами в ближайшее время для подтверждения деталей.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-500 transition-colors shadow-[0_0_20px_rgba(217,119,6,0.3)]"
            >
              Отлично
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
