import { ArrowDown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * HeroSection – премиальная верхняя часть главной страницы.
 */
const HeroSection = () => {
  const scrollToProducts = () => {
    const el = document.getElementById('product-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full h-[500px] rounded-3xl overflow-hidden mb-10 group">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611486212557-88be5ff6f941?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent opacity-90" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white/90 text-xs font-medium mb-6 uppercase tracking-widest">
            <Sparkles size={12} />
            Est. 2024 • Handcrafted
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight">
            Искусство <br/>
            <span className="italic text-stone-200">живого дерева</span>
          </h1>
          
          <p className="text-stone-300 max-w-md mx-auto mb-8 text-sm md:text-base font-light leading-relaxed">
            Создаем эксклюзивные предметы интерьера, которые хранят тепло рук мастера и историю природы.
          </p>

          <button
            type="button"
            onClick={scrollToProducts}
            className="group relative px-8 py-4 bg-white text-stone-900 rounded-xl font-bold text-sm overflow-hidden transition-all hover:bg-stone-100 hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              Смотреть коллекцию <ArrowDown size={16} />
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
