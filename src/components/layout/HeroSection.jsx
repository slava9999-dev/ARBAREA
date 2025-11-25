import { ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * HeroSection – премиальная верхняя часть главной страницы.
 * Изысканный, современный дизайн с живой анимацией фона.
 */
const HeroSection = () => {
  const scrollToProducts = () => {
    const el = document.getElementById('product-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full h-[550px] rounded-[2rem] overflow-hidden mb-12 group isolate">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 bg-stone-900">
        {/* Animated Gradient Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-900/40 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -30, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-stone-700/30 rounded-full blur-[80px]"
        />
        
        {/* Noise Texture Overlay for "Material" feel */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-stone-300 text-[10px] font-medium mb-8 uppercase tracking-[0.2em]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
            Premium Woodworking
          </motion.div>
          
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-[1.1] tracking-tight">
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
              Эстетика
            </span>
            <span className="block font-light italic text-stone-400">
              природы
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-stone-400 max-w-lg mx-auto mb-10 text-sm md:text-base font-light leading-relaxed tracking-wide">
            Создаем предметы интерьера, где каждая линия <br className="hidden md:block"/>
            подчеркивает уникальный характер живого дерева.
          </p>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={scrollToProducts}
            className="group relative px-8 py-4 bg-white text-stone-950 rounded-full font-bold text-xs uppercase tracking-widest overflow-hidden transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Перейти в каталог <ArrowDown size={14} />
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
