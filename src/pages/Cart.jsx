import { Lock, ShoppingBag } from 'lucide-react';
import CartItem from '../components/features/cart/CartItem';
import DiscountBanner from '../components/features/DiscountBanner';
import { PaymentTrustBlock } from '../components/ui/PaymentTrustBlock';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

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
    <div className="pb-52 pt-20 px-4">
      <h2 className="text-2xl font-serif text-white mb-6">Ваша корзина</h2>

      <DiscountBanner />

      <div className="space-y-4">
        {cart.map((item) => (
          <CartItem key={item.id} item={item} onRemove={() => onRemove(item)} />
        ))}
      </div>

      <div className="mt-8 mb-8">
        <PaymentTrustBlock variant="compact" />
      </div>

      {/* Fixed checkout panel - positioned above mobile nav with safe area */}
      <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-4 right-4 bg-[#1c1917]/95 backdrop-blur-xl p-4 z-40 border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex justify-between items-end mb-3">
          <div className="space-y-1 text-sm">
            <div className="text-stone-400">
              Сумма: {(subtotal || 0).toLocaleString()} ₽
            </div>
            {user && discount > 0 && (
              <div className="text-green-400 text-xs">
                Скидка: -{(discount || 0).toLocaleString()} ₽
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-stone-500 text-xs mb-1">Итого к оплате</div>
            <div className="font-bold text-2xl text-amber-500 font-mono leading-none">
              {(cartTotal || 0).toLocaleString()} ₽
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onCheckout}
          aria-label="Оформить заказ"
          className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 active:scale-95 transition-transform hover:bg-amber-500 shadow-[0_0_20px_rgba(217,119,6,0.3)] text-lg"
        >
          <Lock size={20} /> Оформить заказ
        </button>
      </div>
    </div>
  );
};

export default Cart;
