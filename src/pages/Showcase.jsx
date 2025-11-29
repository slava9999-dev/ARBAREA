import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useState } from 'react';
import FlipProductCard from '../components/features/FlipProductCard';
import SocialFooter from '../components/layout/SocialFooter';
import { SearchOverlay } from '../components/SearchOverlay';
import { PRODUCTS } from '../data/products';

const Showcase = ({ onBuy }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Filter logic
  const filtered =
    activeCategory === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => {
          if (activeCategory === 'wall-panels') return p.category === 'Панно';
          if (activeCategory === 'bathroom') return p.category === 'Для ванной';
          if (activeCategory === 'kitchen')
            return p.category === 'Для кухни' || p.category === 'accessories';
          if (activeCategory === 'light') return p.category === 'Свет';
          return true;
        });

  return (
    <div className="min-h-screen bg-background pb-24">
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <div className="relative w-full overflow-hidden bg-linen-dark min-h-screen flex items-center justify-center">
        {/* 1. BACKGROUND IMAGE (Optional, can be removed if CSS pattern is enough) */}
        {/* Keeping it as a subtle overlay if needed, but reducing opacity */}

        <div className="absolute inset-0 z-0 bg-gradient-to-t from-stone-900 via-stone-900/50 to-transparent pointer-events-none" />

        {/* 2. CONTENT LAYER */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-24">
          {/* LOGO */}
          <motion.h1
            className="font-serif text-7xl md:text-9xl bg-gradient-to-r from-amber-200 via-amber-500 to-amber-700 bg-clip-text text-transparent mb-6 drop-shadow-2xl"
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            Arbarea
          </motion.h1>

          {/* DESCRIPTOR */}
          <motion.p
            className="font-sans text-amber-600 text-lg md:text-xl mb-8 tracking-wide font-medium"
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Эстетика, к которой хочется прикоснуться
          </motion.p>

          {/* DESCRIPTION */}
          <motion.p
            className="font-sans text-stone-300 max-w-2xl leading-relaxed mb-12 text-base md:text-lg font-light opacity-90"
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Глубина натурального дерева и тишина идеальной формы.
            <br className="hidden md:block" />
            Предметы интерьера, создающие атмосферу.
          </motion.p>

          {/* ACTION BUTTON */}
          <motion.button
            type="button"
            onClick={() =>
              document
                .getElementById('catalog')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="bg-amber-600 text-white hover:bg-amber-500 active:scale-95 transition-all duration-300 rounded-lg px-8 py-4 font-medium tracking-wide shadow-[0_0_20px_rgba(217,119,6,0.3)]"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Перейти в каталог
          </motion.button>
        </div>
      </div>

      {/* 2. Catalog (Overlapping Grid) */}
      <div id="catalog" className="-mt-20 relative z-10 px-4 pb-24">
        {/* STICKY CATEGORY NAV */}
        <div className="sticky top-0 z-40 w-full -mx-4 px-4 mb-6 border-b border-white/5 bg-[#1c1917]/80 backdrop-blur-xl transition-all duration-300">
          <div className="flex items-center justify-between py-4">
            <div className="flex w-full overflow-x-auto scrollbar-hide">
              <div className="flex gap-3">
                {[
                  { id: 'all', label: 'Все товары' },
                  { id: 'wall-panels', label: 'Панно' },
                  { id: 'bathroom', label: 'Для ванной' },
                  { id: 'kitchen', label: 'Для кухни' },
                  { id: 'light', label: 'Свет' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`
                      relative whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-300
                      ${
                        activeCategory === cat.id
                          ? 'bg-amber-600 text-white shadow-[0_0_20px_rgba(217,119,6,0.3)] border border-amber-500'
                          : 'bg-white/5 text-stone-300 border border-white/10 hover:bg-white/10 hover:border-white/20'
                      }
                    `}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Button (Icon only) */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="ml-4 p-2.5 text-stone-400 hover:text-white bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
              aria-label="Поиск"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Декоративная линия градиента снизу панели */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="h-full transition-transform duration-300 hover:scale-[1.02]"
            >
              <FlipProductCard product={p} onBuy={onBuy} />
            </div>
          ))}
        </div>

        <SocialFooter />
      </div>
    </div>
  );
};

export default Showcase;
