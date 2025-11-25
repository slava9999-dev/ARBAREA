
import { Trash2 } from 'lucide-react';

const CartItem = ({ item, onRemove }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm flex gap-4 relative">
      <img
        src={item.image}
        className="w-20 h-20 rounded-lg object-cover bg-stone-200"
        alt={item.name}
      />
      <div>
        <div className="font-medium text-sm pr-8">{item.name}</div>
        <div className="text-xs text-stone-400 mt-1">
          {item.selectedSize} {item.selectedColorName}
        </div>
        <div className="font-bold mt-1">{(item.price || 0).toLocaleString()} ₽</div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Удалить из корзины"
          className="absolute top-4 right-4 text-stone-300 hover:text-red-400"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
