import { Heart, ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    addToCart({ ...product, quantity: 1 });
    showToast('Добавлено в корзину', 'success');
  };

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-32 px-6">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{
            background:
              'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',
            border: '1px solid rgba(236, 72, 153, 0.2)',
          }}
        >
          <Heart size={40} className="text-pink-500" />
        </div>
        <h2 className="text-xl font-serif font-bold text-white mb-2">
          Избранное пусто
        </h2>
        <p className="text-stone-400 text-sm text-center mb-8 max-w-xs">
          Нажмите ♡ на товаре, чтобы добавить его в избранное
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-2xl transition-all flex items-center gap-2"
        >
          <ShoppingBag size={18} />К каталогу
        </button>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-32 px-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center border border-stone-700 text-stone-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-serif font-bold text-white">
            Избранное
          </h2>
          <p className="text-stone-500 text-xs">
            {wishlist.length}{' '}
            {wishlist.length === 1
              ? 'изделие'
              : wishlist.length < 5
                ? 'изделия'
                : 'изделий'}
          </p>
        </div>
      </div>

      {/* Items Grid */}
      <div className="space-y-4">
        <AnimatePresence>
          {wishlist.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="flex gap-4 p-4 rounded-2xl bg-stone-800/50 border border-white/5"
            >
              <button
                type="button"
                onClick={() => navigate(`/product/${item.id}`)}
                className="shrink-0"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover border border-white/5"
                />
              </button>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div
                    className="font-medium text-sm text-white line-clamp-2 leading-snug cursor-pointer hover:text-amber-400 transition-colors"
                    onClick={() => navigate(`/product/${item.id}`)}
                    onKeyDown={() => {}}
                    role="button"
                    tabIndex={0}
                  >
                    {item.name}
                  </div>
                  <p className="text-amber-500 font-bold text-sm mt-1 font-mono">
                    {(item.price || 0).toLocaleString()} ₽
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 bg-amber-600/20 text-amber-400 text-xs font-bold py-2 rounded-xl hover:bg-amber-600/30 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag size={14} />В корзину
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-stone-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    aria-label="Удалить из избранного"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Wishlist;
