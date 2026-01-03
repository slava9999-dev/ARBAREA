import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../../context/CartContext';

const CartItem = ({ item, onRemove }) => {
  const { updateQuantity } = useCart();
  const quantity = item.quantity || 1;
  const itemTotal = (item.price || 0) * quantity;

  const handleDecrease = () => {
    if (quantity > 1) {
      updateQuantity(item.id, quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < 99) {
      updateQuantity(item.id, quantity + 1);
    }
  };

  return (
    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl shadow-sm flex gap-4 relative animate-fade-in">
      {/* Product Image */}
      <img
        src={item.image}
        className="w-20 h-20 rounded-lg object-cover bg-stone-800 shrink-0"
        alt={item.name}
      />

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm pr-8 text-white line-clamp-2">
          {item.name}
        </div>

        {/* Size & Color */}
        {(item.selectedSize?.label || item.selectedColor?.name) && (
          <div className="text-xs text-stone-400 mt-1">
            {item.selectedSize?.label && (
              <span className="mr-2">{item.selectedSize.label}</span>
            )}
            {item.selectedColor?.name && <span>{item.selectedColor.name}</span>}
          </div>
        )}

        {/* Quantity Controls & Price */}
        <div className="flex items-center justify-between mt-3">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2 bg-stone-800/50 rounded-lg p-1">
            <button
              type="button"
              onClick={handleDecrease}
              disabled={quantity <= 1}
              aria-label="Уменьшить количество"
              className="w-8 h-8 flex items-center justify-center rounded-md text-stone-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-mono text-white text-sm">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={quantity >= 99}
              aria-label="Увеличить количество"
              className="w-8 h-8 flex items-center justify-center rounded-md text-stone-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Item Total Price */}
          <div className="text-right">
            <div className="font-bold text-amber-500 font-mono">
              {itemTotal.toLocaleString()} ₽
            </div>
            {quantity > 1 && (
              <div className="text-[10px] text-stone-500">
                {(item.price || 0).toLocaleString()} ₽ × {quantity}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Удалить из корзины"
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-stone-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default CartItem;
