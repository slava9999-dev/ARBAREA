import {
  Check,
  ChevronRight,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Suspense, lazy, useEffect, useState } from 'react';
import DiscountBanner from '../components/features/DiscountBanner';
import CartItem from '../components/features/cart/CartItem';
import { PaymentTrustBlock } from '../components/ui/PaymentTrustBlock';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { sendTelegramNotification } from '../lib/telegram';
import { initPayment } from '../lib/tinkoff';
import { ecommercePurchase, reachGoal } from '../lib/yandex-metrica';

// Lazy load delivery selector
const DeliverySelector = lazy(
  () => import('../components/features/DeliverySelectorWithMap'),
);

const Cart = ({ cart, onRemove }) => {
  const { cartTotal, subtotal, discount } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState('form'); // form | processing | success
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
  });

  // Delivery
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const deliveryPrice = selectedDelivery?.price || 0;
  const finalTotal = subtotal + deliveryPrice - discount;

  // 🎯 YANDEX METRICA: Track checkout start
  useEffect(() => {
    if (cart.length > 0) {
      reachGoal('CHECKOUT_START', {
        cart_total: subtotal,
        items_count: cart.length,
      });
    }
  }, [subtotal, cart.length]);

  const handleDeliverySelect = (deliveryData) => {
    setSelectedDelivery(deliveryData);
    if (deliveryData?.service?.id === 'courier' || deliveryData?.address) {
      setFormData((prev) => ({
        ...prev,
        address: deliveryData.address || prev.address,
      }));
    }
  };

  const handlePayment = async () => {
    if (!selectedDelivery) {
      setError('Пожалуйста, выберите способ доставки');
      showToast('Выберите способ доставки', 'error');
      document
        .getElementById('delivery-section')
        ?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!formData.name || !formData.phone) {
      setError('Заполните контактные данные');
      showToast('Заполните обязательные поля', 'error');
      return;
    }

    setStep('processing');
    setError('');

    try {
      const orderId = `ORDER-${Date.now()}`;
      const description = `Заказ ${orderId} в Arbarea`;

      const items = cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity || 1,
      }));

      // Get token if auth
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
          name: formData.name,
        },
        token,
        selectedDelivery?.service?.id,
        selectedDelivery?.address || formData.address,
      );

      if (paymentUrl) {
        // Prepare Telegram Message
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
<b>Доставка:</b> ${escapeHtml(selectedDelivery?.service?.name || 'Не указано')}
<b>Адрес:</b> ${escapeHtml(selectedDelivery?.address || formData.address)}
<b>Сумма:</b> ${finalTotal} ₽

<b>Товары:</b>
${cart.map((item) => `- ${escapeHtml(item.name)} x${item.quantity}`).join('\n')}
`;
        await sendTelegramNotification(message, token);

        // Track Purchase
        ecommercePurchase({
          orderId,
          total: finalTotal,
          shipping: deliveryPrice,
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category || 'Декор',
            quantity: item.quantity || 1,
          })),
        });

        // Redirect
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

  // Empty State
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-32 px-6">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{
            background:
              'radial-gradient(circle, rgba(201, 164, 92, 0.15) 0%, transparent 70%)',
            border: '1px solid rgba(201, 164, 92, 0.1)',
          }}
        >
          <ShoppingBag size={40} className="text-wood-amber opacity-60" />
        </div>
        <h3 className="text-2xl font-serif text-white mb-3">Корзина пуста</h3>
        <p className="text-stone-500 text-base text-center max-w-[280px] leading-relaxed">
          Наполните её уникальными изделиями из нашей мастерской
        </p>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-6 px-4 min-h-screen max-w-lg mx-auto">
      {/* SUCCESS STATE */}
      {step === 'success' && (
        <div className="bg-[#1c1917] rounded-3xl p-8 text-center border border-wood-amber/20 mt-20">
          <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
            <Check size={32} />
          </div>
          <h3 className="font-serif text-2xl text-white mb-2">
            Заказ оформлен!
          </h3>
          <p className="text-stone-400 mb-6">
            Мы свяжемся с вами в ближайшее время.
          </p>
          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            className="btn-primary w-full"
          >
            В каталог
          </button>
        </div>
      )}

      {/* FORM STATE */}
      {step !== 'success' && (
        <>
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-serif text-white mb-1">Корзина</h2>
            <p className="text-stone-500 text-sm font-medium">
              {cart.length} {cart.length === 1 ? 'изделие' : 'изделия'}
            </p>
          </div>

          <DiscountBanner />

          {/* Items List */}
          <div className="space-y-4 mb-10">
            {cart.map((item, index) => (
              <div
                key={item.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CartItem item={item} onRemove={() => onRemove(item)} />
              </div>
            ))}
          </div>

          <div className="w-full h-px bg-white/5 mb-10" />

          {/* CHECKOUT FORM INLINE */}
          <div className="space-y-8 mb-8">
            <h3 className="text-xl font-serif text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-wood-amber/20 text-wood-amber text-xs flex items-center justify-center font-bold border border-wood-amber/20">
                1
              </span>
              Контактные данные
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="contact-name"
                  className="text-xs text-stone-500 ml-3 uppercase tracking-wider font-bold"
                >
                  Имя
                </label>
                <input
                  id="contact-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Иван Иванов"
                  className="input-premium w-full bg-[#2a2520] border-transparent focus:bg-[#1a1614]"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="contact-phone"
                  className="text-xs text-stone-500 ml-3 uppercase tracking-wider font-bold"
                >
                  Телефон
                </label>
                <input
                  id="contact-phone"
                  type="tel"
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
                  placeholder="+7 (999) 000-00-00"
                  className="input-premium w-full bg-[#2a2520] border-transparent focus:bg-[#1a1614]"
                />
              </div>
            </div>

            <div className="w-full h-px bg-white/5" />

            <h3 className="text-xl font-serif text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-wood-amber/20 text-wood-amber text-xs flex items-center justify-center font-bold border border-wood-amber/20">
                2
              </span>
              Доставка
            </h3>

            <div id="delivery-section" className="space-y-4 mb-12">
              {/* Address Input for Auto-Map Center if needed, though delivery map usually handles it */}
              <div className="space-y-1">
                <label
                  htmlFor="client-address"
                  className="text-xs text-stone-500 ml-3 uppercase tracking-wider font-bold"
                >
                  Адрес клиента
                </label>
                <input
                  id="client-address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="г. Москва, ул. Примерная 1..."
                  className="input-premium w-full bg-[#2a2520] border-transparent focus:bg-[#1a1614] mb-2"
                />
              </div>

              {/* Delivery Selector Button (Accordion Trigger) */}
              <button
                type="button"
                onClick={() => setIsDeliveryOpen(true)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                  selectedDelivery
                    ? 'bg-[#2a2520] border-wood-amber/50 shadow-wood-glow'
                    : 'bg-[#2a2520] border-white/5 hover:border-wood-amber/30'
                }`}
              >
                <div className="flex items-center gap-4 z-10 relative">
                  {selectedDelivery ? (
                    <>
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg shadow-inner"
                        style={{
                          background: `${selectedDelivery.service.color}15`,
                          color: selectedDelivery.service.color,
                        }}
                      >
                        {selectedDelivery.service.logo}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-white text-sm">
                          {selectedDelivery.service.name}
                        </div>
                        <div className="text-xs text-stone-400 max-w-[180px] truncate">
                          {selectedDelivery.address}
                        </div>
                        <div
                          className={`text-xs font-bold mt-0.5 ${selectedDelivery.price === 0 ? 'text-emerald-400' : 'text-wood-amber'}`}
                        >
                          {selectedDelivery.price === 0
                            ? 'Бесплатно'
                            : `${selectedDelivery.price} ₽`}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-stone-400">
                        <MapPin size={20} />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-stone-300">
                          Выбрать способ доставки
                        </div>
                        <div className="text-xs text-stone-500">
                          СДЭК, Почта, Boxberry...
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <ChevronRight
                  className="text-stone-500 z-10 relative"
                  size={20}
                />
              </button>

              {/* Delivery Modal/Sheet */}
              <Suspense
                fallback={
                  <div className="h-10 animate-pulse bg-white/5 rounded-xl" />
                }
              >
                <DeliverySelector
                  isOpen={isDeliveryOpen}
                  onClose={() => setIsDeliveryOpen(false)}
                  onSelect={handleDeliverySelect}
                  isFreeShipping={!!user}
                  initialAddress={formData.address}
                />
              </Suspense>
            </div>
          </div>

          {/* PAYMENT SECTION - Now inline after delivery */}
          <div className="mt-8 space-y-4">
            <div className="bg-[#2a2520]/90 backdrop-blur-xl border border-wood-amber/20 rounded-2xl p-4 shadow-wood-md">
              {error && (
                <div className="text-red-400 text-xs text-center mb-3 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                  {error}
                </div>
              )}

              <div className="flex justify-between items-center mb-4 px-2">
                <div className="text-sm text-stone-400">
                  Итого к оплате:
                  {deliveryPrice > 0 && (
                    <span className="block text-[10px] text-stone-500">
                      + доставка {deliveryPrice} ₽
                    </span>
                  )}
                </div>
                <div className="text-2xl font-serif font-bold text-gradient-amber">
                  {finalTotal.toLocaleString()} ₽
                </div>
              </div>

              <button
                type="button"
                onClick={step === 'form' ? handlePayment : null}
                disabled={step === 'processing'}
                className="btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-2"
              >
                {step === 'processing' ? (
                  <>
                    <Loader2 className="animate-spin" /> Обработка...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} /> Оплатить онлайн
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
