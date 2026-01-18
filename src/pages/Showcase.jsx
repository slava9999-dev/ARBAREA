import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useState } from 'react';
import FlipProductCard from '../components/features/FlipProductCard';
import HeroBanner from '../components/features/HeroBanner';
import SocialFooter from '../components/layout/SocialFooter';
import { SearchOverlay } from '../components/SearchOverlay';
import { useProducts } from '../context/ProductContext';

const Showcase = ({ onBuy, onOpenModal }) => {
  const { products, loading: productsLoading } = useProducts();
  const [activeCategory, setActiveCategory] = useState('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Filter logic
  const filtered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => {
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <h1 className="font-serif text-6xl md:text-8xl tracking-tight leading-none text-gradient-amber drop-shadow-wood-glow">
              Arbarea
            </h1>
            <div className="h-px w-32 mx-auto mt-4 bg-gradient-to-r from-transparent via-wood-amber to-transparent opacity-50" />
          </motion.div>

          {/* DESCRIPTOR */}
          <motion.p
            className="font-sans text-wood-amber-light text-xs md:text-sm mb-8 tracking-[0.2em] uppercase font-semibold"
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Мастерская эстетики
          </motion.p>

          {/* DESCRIPTION */}
          <motion.p
            className="font-sans text-stone-300 max-w-xl leading-relaxed mb-12 text-base md:text-lg font-light opacity-80"
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Глубина натурального дерева и тишина идеальной формы. Предметы
            интерьера, создающие атмосферу вашего дома.
          </motion.p>

          {/* ACTION BUTTON */}
          <motion.button
            type="button"
            onClick={() =>
              document
                .getElementById('catalog')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="btn-primary shadow-wood-glow hover:shadow-wood-glow-lg text-lg px-10 py-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Открыть каталог
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
                      relative whitespace-nowrap px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 rounded-xl
                      ${
                        activeCategory === cat.id
                          ? 'bg-wood-amber text-base shadow-wood-glow font-bold'
                          : 'bg-white/5 text-stone-400 border border-white/5 hover:bg-white/10 hover:text-wood-amber'
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
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Hero Banners */}
        <HeroBanner />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="h-full transition-transform duration-300 hover:scale-[1.02]"
            >
              <FlipProductCard
                product={p}
                onBuy={onBuy}
                onOpenModal={onOpenModal}
              />
            </div>
          ))}
        </div>

        <SocialFooter />
      </div>
    </div>
  );
};

export default Showcase;
