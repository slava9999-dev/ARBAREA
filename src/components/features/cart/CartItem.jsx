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
    <div
      className="relative flex gap-4 p-4 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01]"
      style={{
        background:
          'linear-gradient(180deg, rgba(42, 37, 32, 0.6) 0%, rgba(34, 30, 26, 0.7) 100%)',
        border: '1px solid rgba(201, 164, 92, 0.08)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Product Image */}
      <div className="relative shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-20 h-20 rounded-xl object-cover"
          style={{
            border: '1px solid rgba(201, 164, 92, 0.1)',
          }}
        />
        {/* Subtle image overlay */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, transparent 60%, rgba(0, 0, 0, 0.3) 100%)',
          }}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        {/* Name & Options */}
        <div>
          <h3 className="font-medium text-sm text-white line-clamp-2 pr-8 leading-snug">
            {item.name}
          </h3>
          {(item.selectedSize?.label || item.selectedColor?.name) && (
            <div className="flex items-center gap-2 mt-1">
              {item.selectedSize?.label && (
                <span className="text-[11px] text-stone-400 px-2 py-0.5 rounded-full bg-white/5">
                  {item.selectedSize.label}
                </span>
              )}
              {item.selectedColor?.name && (
                <span className="text-[11px] text-stone-400 px-2 py-0.5 rounded-full bg-white/5">
                  {item.selectedColor.name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Quantity & Price Row */}
        <div className="flex items-center justify-between mt-3">
          {/* Quantity Controls */}
          <div
            className="flex items-center gap-1 rounded-lg p-0.5"
            style={{
              background: 'rgba(26, 22, 20, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <button
              type="button"
              onClick={handleDecrease}
              disabled={quantity <= 1}
              aria-label="Уменьшить количество"
              className="w-8 h-8 flex items-center justify-center rounded-md text-stone-400 hover:text-wood-amber hover:bg-wood-amber/10 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-stone-400"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center font-mono text-white text-sm font-medium">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={quantity >= 99}
              aria-label="Увеличить количество"
              className="w-8 h-8 flex items-center justify-center rounded-md text-stone-400 hover:text-wood-amber hover:bg-wood-amber/10 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <div
              className="font-bold font-mono text-base"
              style={{
                background: 'linear-gradient(135deg, #dbb978 0%, #c9a45c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {itemTotal.toLocaleString()} ₽
            </div>
            {quantity > 1 && (
              <div className="text-[10px] text-stone-500 mt-0.5">
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
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default CartItem;
