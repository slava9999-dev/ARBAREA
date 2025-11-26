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
      {/* 1. Hero Section (Cinematic) */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        {/* Background Image */}
        <img 
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop" 
          className="absolute inset-0 h-full w-full object-cover opacity-60 animate-scale-up"
          alt="Arbarea Interior" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-stone-900/20 to-stone-900" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4 animate-fade-in">
          <span className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-amber-500">
            Arbarea Studio
          </span>
          <h1 className="mb-6 font-serif text-5xl font-medium text-white drop-shadow-lg leading-tight">
            Handcrafted <br /> <span className="italic text-stone-300">Luxury</span>
          </h1>
          <p className="mb-8 max-w-md font-sans text-sm text-stone-200/90">
            Nature's Finest. Your Home. <br/>
            Exclusive wooden panels and interior masterpieces.
          </p>
          <button 
            type="button"
            onClick={() => document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary"
          >
            Explore Collection
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
