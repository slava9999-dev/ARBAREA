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
      {/* HERO SECTION: Oiled Walnut Concept */}
      <div className="relative h-[88vh] w-full overflow-hidden bg-stone-900">
        
        {/* 1. BACKGROUND TEXTURE (Animated) */}
        <div className="absolute inset-0 animate-slow-zoom">
          <img 
            src="https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=2574&auto=format&fit=crop" 
            alt="Premium Walnut Texture" 
            className="h-full w-full object-cover opacity-90"
          />
        </div>

        {/* 2. LIGHTING & ATMOSPHERE (Overlays) */}
        {/* Общее затемнение для контраста текста */}
        <div className="absolute inset-0 bg-stone-950/50" />
        
        {/* Градиент снизу: Плавный переход в основной фон приложения */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917] via-[#1c1917]/40 to-transparent" />
        
        {/* Радиальный свет по центру (Spotlight effect) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(217,119,6,0.15),transparent_70%)] pointer-events-none" />


        {/* 3. CONTENT */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6 pt-20">
          
          {/* Тонкая золотая линия */}
          <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-amber-500/80 to-transparent mb-8 animate-fade-in-up" />

          {/* Надзаголовок */}
          <span className="mb-6 text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] text-amber-500 drop-shadow-lg animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Authorial Studio
          </span>
          
          {/* Главный заголовок */}
          <h1 className="mb-6 font-serif text-5xl md:text-7xl font-light text-white leading-[1.05] drop-shadow-2xl animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            Living <br />
            <span className="italic text-stone-300">Texture</span>
          </h1>
          
          {/* Подпись */}
          <p className="mb-12 max-w-sm font-sans text-sm md:text-base text-stone-200/90 font-light leading-relaxed animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            Тактильная эстетика натурального дерева. <br/>
            Создано вручную, чтобы стать частью вашей истории.
          </p>

          {/* Кнопка с эффектом стекла */}
          <button 
            type="button"
            onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative overflow-hidden rounded-full px-10 py-4 backdrop-blur-md bg-white/5 border border-white/20 transition-all duration-300 hover:bg-white/10 hover:border-amber-500/50 animate-fade-in-up" 
            style={{animationDelay: '0.8s'}}
          >
            <span className="relative z-10 text-xs font-bold tracking-[0.2em] uppercase text-white group-hover:text-amber-100 transition-colors">
              Смотреть каталог
            </span>
            {/* Glow effect on hover */}
            <div className="absolute inset-0 -z-10 bg-amber-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
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
