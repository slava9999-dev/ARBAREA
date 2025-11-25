
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex gap-4 bg-white p-4 rounded-xl shadow-sm mb-4"
    >
      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-stone-900">{item.name}</h3>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="text-stone-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <p className="text-sm text-stone-500">
            {item.selectedSize}, {item.selectedColor}
          </p>
        </div>

        <div className="flex justify-between items-end">
          <span className="font-bold text-amber-700">{item.price}</span>

          <div className="flex items-center gap-3 bg-stone-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() =>
                onUpdateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))
              }
              className="p-1 hover:bg-white rounded-md transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-medium w-4 text-center">
              {item.quantity || 1}
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateQuantity(item.id, (item.quantity || 1) + 1)
              }
              className="p-1 hover:bg-white rounded-md transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;
