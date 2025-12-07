import { motion } from 'framer-motion';
import { Download, Truck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const HeroBanner = () => {
  const { user } = useAuth();

  const handleInstallClick = () => {
    // Trigger PWA install prompt
    const event = new CustomEvent('show-pwa-install');
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-3 mb-6">
      {/* Free Shipping Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 rounded-2xl p-4 overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-400/20"
      >
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
            <Truck size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-base leading-tight mb-1">
              {user ? '🎉 Бесплатная доставка!' : 'Бесплатная доставка для вас!'}
            </h3>
            <p className="text-xs text-white/95 leading-relaxed">
              {user 
                ? 'Вы получаете бесплатную доставку на все заказы'
                : 'Зарегистрируйтесь и получите бесплатную доставку по России'
              }
            </p>
          </div>
        </div>
      </motion.div>

      {/* Install PWA Banner */}
      {!window.matchMedia('(display-mode: standalone)').matches && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative bg-gradient-to-br from-amber-600 via-amber-500 to-orange-600 rounded-2xl p-4 overflow-hidden shadow-[0_0_30px_rgba(217,119,6,0.3)] border border-amber-400/20"
        >
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full blur-2xl" />
          </div>

          <div className="relative flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <Download size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-base leading-tight mb-1">
                Установите приложение
              </h3>
              <p className="text-xs text-white/95 leading-relaxed mb-2">
                Быстрый доступ с главного экрана вашего телефона
              </p>
              <button
                type="button"
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-white/30 hover:bg-white/30 transition-all"
              >
                <Download size={14} />
                Установить
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* New Product Badge (if needed) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-3 overflow-hidden shadow-lg"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="relative flex items-center gap-2">
          <Sparkles size={18} className="text-white animate-pulse" />
          <p className="text-white text-sm font-bold">
            Новинка: Панно "Горные Вершины" 🏔️
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroBanner;
