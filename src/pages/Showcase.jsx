import { useState } from 'react';
import { ChevronRight, Zap } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/mockData';
import FlipProductCard from '../components/features/FlipProductCard';
import SocialFooter from '../components/layout/SocialFooter';
import HeroSection from '../components/layout/HeroSection';

const Showcase = ({ onBuy }) => {
  const [activeCategory, setActiveCategory] = useState('Все');
  const filtered =
    activeCategory === 'Все'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);
  return (
    <div className="pb-24 pt-20 px-4">
      <HeroSection />
      <div className="mb-6">
        <h2 className="text-2xl font-serif text-stone-800 mb-2">Коллекция</h2>
      </div>
      <div className="mb-8 relative overflow-hidden rounded-2xl shadow-xl group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-800 to-stone-900" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10" />
        <div className="relative p-6 flex justify-between items-center text-white">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg mb-1">
              <Zap className="text-yellow-400 fill-yellow-400" size={20} /> 
              Покупка в 1 клик
            </div>
            <p className="text-stone-400 text-xs">Быстрый заказ без регистрации</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <ChevronRight className="text-white" />
          </div>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 mb-2 scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-5 py-2.5 rounded-full text-sm whitespace-nowrap ${activeCategory === c ? 'bg-stone-800 text-white' : 'bg-white border'}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div id="product-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filtered.map((p) => (
          <FlipProductCard key={p.id} product={p} onBuy={onBuy} />
        ))}
      </div>
      <SocialFooter />
    </div>
  );
};

export default Showcase;
