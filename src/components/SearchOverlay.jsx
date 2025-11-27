import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { PRODUCTS } from '../data/products';

export const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Сброс при открытии/закрытии
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Логика фильтрации (по названию или категории)
  const results =
    query.length > 0
      ? PRODUCTS.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase()),
        )
      : [];

  const handleNavigate = (id) => {
    navigate(`/product/${id}`);
    onClose();
    setQuery(''); // Очистить поле
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#1c1917]/98 backdrop-blur-xl flex flex-col pt-8 px-6"
        >
          {/* Header: Input + Close */}
          <div className="flex items-center gap-4 mb-10">
            <input
              type="text"
              placeholder="Поиск..."
              className="flex-1 bg-transparent border-none text-3xl font-serif text-white placeholder-stone-700 focus:outline-none focus:ring-0"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="button"
              onClick={onClose}
              className="p-3 rounded-full bg-stone-800 text-stone-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto space-y-4 pb-10">
            {results.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleNavigate(product.id)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 active:scale-[0.98] transition-all cursor-pointer"
              >
                <img
                  src={product.image}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover bg-stone-800"
                />
                <div className="flex-1">
                  <h4 className="text-base font-medium text-stone-100">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-amber-500 font-mono">
                      {product.price.toLocaleString()} ₽
                    </span>
                    {product.oldPrice && (
                      <span className="text-xs text-stone-600 line-through decoration-stone-600">
                        {product.oldPrice.toLocaleString()} ₽
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="text-stone-600" size={20} />
              </motion.div>
            ))}

            {query.length > 0 && results.length === 0 && (
              <div className="text-center mt-20 text-stone-600">
                <p>Ничего не найдено</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
