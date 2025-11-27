import { useState } from 'react';
import { PRODUCTS } from '../data/products';
import FlipProductCard from '../components/features/FlipProductCard';
import SocialFooter from '../components/layout/SocialFooter';

const Showcase = ({ onBuy }) => {
  const [activeCategory] = useState('Все');
  
  // Filter logic (can be expanded later)
  const filtered = activeCategory === 'Все' 
    ? PRODUCTS 
    : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 1. Hero Section (Premium Wood Texture) */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        {/* 1. TEXTURE LAYER with Slow Zoom Animation */}
        <div className="absolute inset-0 animate-slow-zoom">
          <img 
            src="https://images.unsplash.com/photo-1543425626-4b63897d23d9?q=80&w=2574&auto=format&fit=crop" 
            alt="Arbarea Texture" 
            className="h-full w-full object-cover opacity-80"
          />
        </div>

        {/* 2. ATMOSPHERE LAYERS (Gradients) */}
        {/* Затемнение всего фона для читаемости */}
        <div className="absolute inset-0 bg-stone-900/40" />
        {/* Плавный переход в контент снизу */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917] via-[#1c1917]/60 to-transparent" />
        {/* Виньетка по краям */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(28,25,23,0.8)_100%)]" />

        {/* 3. CONTENT */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
          
          {/* Декоративная линия */}
          <div className="h-16 w-[1px] bg-gradient-to-b from-transparent to-amber-500/50 mb-6" />

          <span className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-amber-500 drop-shadow-lg">
            Est. 2024
          </span>
          
          <h1 className="mb-6 font-serif text-5xl md:text-7xl font-light text-white leading-[1.1] drop-shadow-2xl">
            Arbarea <br />
            <span className="italic text-stone-400">Tactile</span>
          </h1>
          
          <p className="mb-10 max-w-sm font-sans text-sm text-stone-300/80 leading-relaxed font-light">
            Искусство видеть форму в хаосе природы. 
            Премиальные изделия из массива для тех, кто понимает тишину.
          </p>

          <button 
            type="button"
            onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full border border-white/20 transition-all hover:border-amber-500/50"
          >
            <div className="absolute inset-0 w-0 bg-amber-600/20 transition-all duration-[250ms] ease-out group-hover:w-full" />
            <span className="relative text-sm font-bold tracking-widest uppercase text-white group-hover:text-amber-100">
              Коллекция
            </span>
          </button>
        </div>
      </div>

      {/* 2. Catalog (Overlapping Grid) */}
      <div id="catalog" className="-mt-20 relative z-10 px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((p) => (
            <div key={p.id} className="glass-panel p-2 transition-transform duration-300 hover:scale-[1.02]">
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
