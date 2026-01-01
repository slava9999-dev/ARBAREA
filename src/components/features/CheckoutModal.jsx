import {
  CreditCard,
  Loader2,
  X,
  MapPin,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useState, lazy, Suspense, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import { sendTelegramNotification } from '../../lib/telegram';
import { initPayment } from '../../lib/tinkoff';
import { reachGoal, ecommercePurchase } from '../../lib/yandex-metrica';
import DiscountBanner from './DiscountBanner';

// Lazy load delivery selector for performance
const DeliverySelector = lazy(() => import('./DeliverySelector'));

const CheckoutModal = ({ onClose }) => {
  const { cartItems, subtotal } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState('form'); // form, processing, success
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    phone: user?.phone || '',
    address: '',
    email: user?.email || '',
  });
  const [error, setError] = useState('');
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [selectedDeliveryData, setSelectedDeliveryData] = useState(null);

  // Calculate total with delivery
  const deliveryPrice = selectedDeliveryData?.price || 0;
  const cartTotal = subtotal + deliveryPrice;

  // 🎯 YANDEX METRICA: Track checkout start
  useEffect(() => {
    reachGoal('CHECKOUT_START', {
      cart_total: subtotal,
      items_count: cartItems.length,
    });
  }, [subtotal, cartItems.length]);

  const saveOrderToDatabase = async (orderId, paymentUrl) => {
    try {
      const orderData = {
        order_id: orderId,
        user_id: user?.id || null,
        user_email: formData.email,
        user_phone: formData.phone,
        user_name: formData.name,
        delivery_address: selectedDeliveryData?.address || formData.address,
        delivery_method: selectedDeliveryData?.service?.name || 'Не выбрано',
        delivery_price: deliveryPrice,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          selectedSize: item.selectedSize || null,
          selectedColor: item.selectedColor || null,
        })),
        subtotal,
        shipping: deliveryPrice,
        total: cartTotal,
        status: 'pending_payment',
        payment_url: paymentUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('orders').insert([orderData]);
      if (error) {
        console.error('Error saving order:', error);
      }
    } catch (_error) {
      // Don't interrupt payment if database save fails
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate delivery selection
    if (!selectedDeliveryData) {
      setError('Пожалуйста, выберите способ доставки');
      return;
    }

    setStep('processing');
    setError('');

    try {
      const orderId = `ORDER-${Date.now()}`;
      const description = `Заказ ${orderId} в Arbarea`;

      const items = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity || 1,
      }));

      // Get access token if user is logged in
      let token = null;
      if (user) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        token = session?.access_token;
      }

      const paymentUrl = await initPayment(
        orderId,
        items,
        description,
        {
          email: formData.email,
          phone: formData.phone,
        },
        token,
        selectedDeliveryData?.service?.id,
      );

      if (paymentUrl) {
        await saveOrderToDatabase(orderId, paymentUrl);

        const escapeHtml = (text) => {
          if (!text) return '';
          return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        };

        const message = `
<b>Новый заказ!</b> 📦
<b>ID:</b> ${orderId}
<b>Имя:</b> ${escapeHtml(formData.name)}
<b>Телефон:</b> ${escapeHtml(formData.phone)}
<b>Email:</b> ${escapeHtml(formData.email)}
<b>Доставка:</b> ${escapeHtml(selectedDeliveryData?.service?.name || 'Не указано')}
<b>Адрес:</b> ${escapeHtml(selectedDeliveryData?.address || formData.address)}
<b>Сумма:</b> ${cartTotal} ₽

<b>Товары:</b>
${cartItems.map((item) => `- ${escapeHtml(item.name)} x${item.quantity}`).join('\n')}
`;
        await sendTelegramNotification(message, token);

        // 🎯 YANDEX METRICA: Track purchase before redirect
        ecommercePurchase({
          orderId,
          total: cartTotal,
          shipping: deliveryPrice,
          items: cartItems.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category || 'Декор',
            quantity: item.quantity || 1,
          })),
        });

        window.location.href = paymentUrl;
      } else {
        throw new Error('Ссылка на оплату не получена');
      }
    } catch (err) {
      console.error(err);
      setError('Ошибка инициализации оплаты. Попробуйте позже.');
      setStep('form');
    }
  };

  const handleDeliverySelect = (deliveryData) => {
    setSelectedDeliveryData(deliveryData);
    // Also update address in form if courier
    if (deliveryData?.service?.id === 'courier') {
      setFormData((prev) => ({ ...prev, address: deliveryData.address || '' }));
    }
  };

  if (cartItems.length === 0 && step === 'form') return null;

  return (
    <>
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

              {/* Shopping List Summary */}
              <div className="mb-8 space-y-2">
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-3">
                  Ваш заказ
                </p>
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
              </div>

              {/* Delivery Selection Button */}
              <div className="mb-8">
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-4">
                  Способ доставки
                </p>
                <button
                  type="button"
                  onClick={() => setIsDeliveryModalOpen(true)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                    selectedDeliveryData
                      ? 'bg-amber-500/10 border-amber-500'
                      : 'bg-stone-800/30 border-white/10 hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {selectedDeliveryData ? (
                      <>
                        <span
                          className="text-2xl w-12 h-12 flex items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: `${selectedDeliveryData.service.color}20`,
                          }}
                        >
                          {selectedDeliveryData.service.logo}
                        </span>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white">
                            {selectedDeliveryData.service.name}
                          </p>
                          <p className="text-xs text-stone-400 truncate max-w-[180px]">
                            {selectedDeliveryData.address}
                          </p>
                          <p
                            className={`text-xs font-bold mt-1 ${selectedDeliveryData.price === 0 ? 'text-emerald-400' : 'text-amber-500'}`}
                          >
                            {selectedDeliveryData.price === 0
                              ? 'Бесплатно'
                              : `${selectedDeliveryData.price} ₽`}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-stone-700/50 rounded-xl flex items-center justify-center">
                          <MapPin className="text-stone-400" size={24} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white">
                            Выберите способ доставки
                          </p>
                          <p className="text-xs text-stone-500">
                            СДЭК, Boxberry, Почта России...
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <ChevronRight className="text-stone-500" size={20} />
                </button>
              </div>

              {/* Total Summary */}
              <div className="mb-8 p-4 bg-stone-900/50 rounded-2xl border border-white/5">
                <div className="space-y-2">
                  <div className="flex justify-between text-stone-400 text-xs">
                    <span>Сумма товаров</span>
                    <span>{(subtotal || 0).toLocaleString()} ₽</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span
                      className={
                        deliveryPrice === 0
                          ? 'text-emerald-400'
                          : 'text-stone-400'
                      }
                    >
                      Доставка{' '}
                      {selectedDeliveryData
                        ? `(${selectedDeliveryData.service.name})`
                        : ''}
                    </span>
                    <span
                      className={
                        deliveryPrice === 0
                          ? 'text-emerald-400 font-bold'
                          : 'text-stone-400'
                      }
                    >
                      {!selectedDeliveryData
                        ? 'Не выбрана'
                        : deliveryPrice === 0
                          ? 'Бесплатно'
                          : `${deliveryPrice.toLocaleString()} ₽`}
                    </span>
                  </div>
                  <div className="h-px bg-white/5 my-2" />
                  <div className="flex justify-between font-bold text-lg text-white">
                    <span>К оплате</span>
                    <span className="text-amber-500">
                      {(cartTotal || 0).toLocaleString()} ₽
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/10 text-red-500 text-sm rounded-xl border border-red-500/20">
                    {error}
                  </div>
                )}
                <div className="space-y-1">
                  <label htmlFor="name" className="text-xs text-stone-400 ml-1">
                    Ваше имя
                  </label>
                  <input
                    id="name"
                    required
                    placeholder="Иван Иванов"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full p-4 bg-stone-800/50 border-b border-stone-700 text-white placeholder-stone-600 focus:border-amber-500 focus:outline-none transition-colors rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="phone"
                    className="text-xs text-stone-400 ml-1"
                  >
                    Телефон
                  </label>
                  <input
                    id="phone"
                    required
                    type="tel"
                    placeholder="+7 (999) 000-00-00"
                    value={formData.phone}
                    onFocus={() => {
                      if (!formData.phone)
                        setFormData({ ...formData, phone: '+7' });
                    }}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (!val.startsWith('+7'))
                        val = `+7${val.replace(/^\+7/, '')}`;
                      if (/^[\d\s()+-]*$/.test(val)) {
                        setFormData({ ...formData, phone: val });
                      }
                    }}
                    className="w-full p-4 bg-stone-800/50 border-b border-stone-700 text-white placeholder-stone-600 focus:border-amber-500 focus:outline-none transition-colors rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="text-xs text-stone-400 ml-1"
                  >
                    Email (для чека)
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="example@mail.ru"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full p-4 bg-stone-800/50 border-b border-stone-700 text-white placeholder-stone-600 focus:border-amber-500 focus:outline-none transition-colors rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedDeliveryData}
                  className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 hover:bg-amber-500 transition-all border-2 border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-500 transition-all border-2 border-amber-500"
              >
                Отлично
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Selector Modal */}
      <Suspense fallback={null}>
        <DeliverySelector
          isOpen={isDeliveryModalOpen}
          onClose={() => setIsDeliveryModalOpen(false)}
          onSelect={handleDeliverySelect}
          isFreeShipping={!!user}
        />
      </Suspense>
    </>
  );
};

export default CheckoutModal;
