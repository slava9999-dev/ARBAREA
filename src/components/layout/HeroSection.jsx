import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

/**
 * HeroSection – премиальная верхняя часть главной страницы.
 * Стиль "Тихая роскошь" (Quiet Luxury).
 */
const HeroSection = () => {
  const scrollToProducts = () => {
    const el = document.getElementById('product-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full h-[600px] rounded-[2.5rem] overflow-hidden mb-16 group isolate shadow-2xl">
      {/* Background: Deep, rich, animated */}
      <div className="absolute inset-0 bg-[#1a1816]">
        {/* Animated Light Beams */}
        <motion.div
          animate={{
            opacity: [0.4, 0.6, 0.4],
            rotate: [0, 5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
          className="absolute -top-[50%] -left-[20%] w-[150%] h-[150%] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#3d342b_100%)] blur-[120px] opacity-50"
        />

        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-gradient-to-t from-[#2c241b] to-transparent blur-[100px] opacity-30"
        />

        {/* Grain Texture */}
        <div className="absolute inset-0 opacity-[0.07] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Elegant Badge */}
          <motion.div
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            animate={{ opacity: 1, letterSpacing: '0.3em' }}
            transition={{ delay: 0.5, duration: 1.5 }}
            className="text-[#8a8175] text-[10px] uppercase font-medium mb-8 tracking-[0.3em]"
          >
            Est. 2024 • Handcrafted in Russia
          </motion.div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-serif text-[#e8e6e3] mb-8 leading-[1.1] tracking-tight">
            <span className="block">Искусство</span>
            <span className="block italic font-light text-[#b0a89e]">
              живого дерева
            </span>
          </h1>

          {/* Divider */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="h-[1px] bg-[#5c544a] mx-auto mb-8"
          />

          {/* Description */}
          <p className="text-[#9c948a] max-w-md mx-auto mb-12 text-sm md:text-base font-light leading-relaxed tracking-wide">
            Создаем предметы интерьера, которые становятся{' '}
            <br className="hidden md:block" />
            частью истории вашего дома.
          </p>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: '#f0efed' }}
            whileTap={{ scale: 0.98 }}
            onClick={scrollToProducts}
            className="group relative px-10 py-5 bg-[#e8e6e3] text-[#1a1816] rounded-full font-bold text-xs uppercase tracking-[0.15em] overflow-hidden transition-all shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)]"
          >
            <span className="relative z-10 flex items-center gap-3">
              Смотреть коллекцию{' '}
              <ArrowDown
                size={14}
                className="opacity-60 group-hover:translate-y-1 transition-transform"
              />
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
