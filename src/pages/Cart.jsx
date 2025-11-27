import { ShoppingBag, Lock } from 'lucide-react';
import CartItem from '../components/features/cart/CartItem';
import DiscountBanner from '../components/features/DiscountBanner';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import { PaymentTrustBlock } from '../components/ui/PaymentTrustBlock';

const Cart = ({ cart, onRemove, onCheckout }) => {
  const { cartTotal, subtotal, discount } = useCart();
  const { user } = useAuth();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen pb-24 text-stone-500">
        <ShoppingBag size={48} className="mb-4 opacity-20" />
        <p>Корзина пуста</p>
      </div>
    );
  }

  return (
    <div className="pb-32 pt-20 px-4">
      <h2 className="text-2xl font-serif text-white mb-6">Ваша корзина</h2>

      <DiscountBanner />

      <div className="space-y-4">
        {cart.map((item) => (
          <CartItem key={item.id} item={item} onRemove={() => onRemove(item)} />
        ))}
      </div>

      <div className="fixed bottom-20 left-0 right-0 bg-[#1c1917]/90 backdrop-blur-xl p-6 z-30 border-t border-white/5">
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between text-stone-400">
            <span>Сумма:</span>
            <span>{(subtotal || 0).toLocaleString()} ₽</span>
          </div>
          {user && discount > 0 && (
            <div className="flex justify-between text-green-400 font-medium">
              <span>Скидка клиента (10%):</span>
              <span>-{(discount || 0).toLocaleString()} ₽</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-xl text-amber-500 font-mono pt-2 border-t border-white/5">
            <span>Итого:</span>
            <span>{(cartTotal || 0).toLocaleString()} ₽</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onCheckout}
          className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold flex justify-center gap-2 active:scale-95 transition-transform hover:bg-amber-500 shadow-[0_0_20px_rgba(217,119,6,0.3)]"
        >
          <Lock size={18} /> Оформить заказ
        </button>
        <div className="mt-6">
          <PaymentTrustBlock variant="compact" />
        </div>
      </div>
    </div>
  );
};

export default Cart;
