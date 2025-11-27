import { Trash2 } from 'lucide-react';

const CartItem = ({ item, onRemove }) => {
  return (
    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl shadow-sm flex gap-4 relative animate-fade-in">
      <img
        src={item.image}
        className="w-20 h-20 rounded-lg object-cover bg-stone-800"
        alt={item.name}
      />
      <div>
        <div className="font-medium text-sm pr-8 text-white">{item.name}</div>
        <div className="text-xs text-stone-400 mt-1">
          {item.selectedSize?.label && (
            <span className="mr-2">{item.selectedSize.label}</span>
          )}
          {item.selectedColor?.name && <span>{item.selectedColor.name}</span>}
        </div>
        <div className="font-bold mt-1 text-amber-500 font-mono">
          {(item.price || 0).toLocaleString()} ₽
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Удалить из корзины"
          className="absolute top-4 right-4 text-stone-500 hover:text-red-500 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
