import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';
import { useSimpleAuth } from '../../context/SimpleAuthContext';

const DiscountBanner = () => {
  const { user } = useSimpleAuth();

  // Don't show banner if user is already logged in
  if (user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 text-white px-4 py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-4 overflow-hidden border border-emerald-400/20"
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl" />
      </div>

      <div className="relative flex items-center gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
          <Truck size={24} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-base leading-tight mb-1">
            Бесплатная доставка!
          </p>
          <p className="text-xs text-white/95 leading-relaxed">
            Зарегистрируйтесь и получите бесплатную доставку на все заказы по
            России
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default DiscountBanner;
