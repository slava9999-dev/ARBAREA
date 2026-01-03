import { Lock, ShoppingBag, Sparkles } from 'lucide-react';
import CartItem from '../components/features/cart/CartItem';
import DiscountBanner from '../components/features/DiscountBanner';
import { PaymentTrustBlock } from '../components/ui/PaymentTrustBlock';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Cart = ({ cart, onRemove, onCheckout }) => {
  const { cartTotal, subtotal, discount } = useCart();
  const { user } = useAuth();

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-32 px-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            background:
              'linear-gradient(135deg, rgba(201, 164, 92, 0.1) 0%, rgba(201, 164, 92, 0.05) 100%)',
            border: '1px solid rgba(201, 164, 92, 0.15)',
          }}
        >
          <ShoppingBag size={32} className="text-wood-amber opacity-50" />
        </div>
        <h3 className="text-xl font-serif text-white mb-2">Корзина пуста</h3>
        <p className="text-stone-500 text-sm text-center max-w-[240px]">
          Добавьте изделия из нашей коллекции, чтобы оформить заказ
        </p>
      </div>
    );
  }

  return (
    <div className="pb-56 pt-6 px-4 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-serif text-white mb-1">Ваша корзина</h2>
        <p className="text-stone-500 text-sm">
          {cart.length}{' '}
          {cart.length === 1
            ? 'изделие'
            : cart.length < 5
              ? 'изделия'
              : 'изделий'}
        </p>
      </div>

      {/* Discount Banner */}
      <DiscountBanner />

      {/* Cart Items */}
      <div className="space-y-3 mb-8">
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

      {/* Trust Block */}
      <div className="mb-8">
        <PaymentTrustBlock variant="compact" />
      </div>

      {/* Fixed Checkout Panel */}
      <div
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-40 p-5 rounded-2xl"
        style={{
          background:
            'linear-gradient(180deg, rgba(42, 37, 32, 0.98) 0%, rgba(26, 22, 20, 0.99) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(201, 164, 92, 0.15)',
          boxShadow:
            '0 -8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Top glow line */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(201, 164, 92, 0.3), transparent)',
          }}
        />

        {/* Price Summary */}
        <div className="flex justify-between items-end mb-4">
          <div className="space-y-1">
            <div className="text-stone-400 text-sm">
              Сумма:{' '}
              <span className="text-stone-300">
                {(subtotal || 0).toLocaleString()} ₽
              </span>
            </div>
            {user && discount > 0 && (
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                <Sparkles size={12} />
                Скидка: -{(discount || 0).toLocaleString()} ₽
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-stone-500 text-[11px] uppercase tracking-wider mb-1">
              Итого
            </div>
            <div
              className="font-bold text-2xl font-mono leading-none"
              style={{
                background: 'linear-gradient(135deg, #dbb978 0%, #c9a45c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {(cartTotal || 0).toLocaleString()} ₽
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          type="button"
          onClick={onCheckout}
          aria-label="Оформить заказ"
          className="w-full py-4 rounded-xl font-semibold text-base flex justify-center items-center gap-2 transition-all duration-300 active:scale-[0.98]"
          style={{
            background:
              'linear-gradient(135deg, #a8834a 0%, #c9a45c 50%, #dbb978 100%)',
            color: '#1a1614',
            boxShadow:
              '0 0 24px rgba(201, 164, 92, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          <Lock size={18} />
          Оформить заказ
        </button>

        {/* Security note */}
        <p className="text-center text-stone-500 text-[11px] mt-3">
          Безопасная оплата • Гарантия качества
        </p>
      </div>
    </div>
  );
};

export default Cart;
