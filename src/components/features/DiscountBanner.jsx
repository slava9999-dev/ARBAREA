import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DiscountBanner = () => {
  const { user } = useAuth();

  // Don't show banner if user is already logged in
  if (user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-4 py-3 rounded-xl shadow-lg mb-4"
    >
      <div className="flex items-center gap-3">
        <Sparkles size={24} className="flex-shrink-0 animate-pulse" />
        <div className="flex-1">
          <p className="font-bold text-sm">
            Зарегистрируйтесь и получите скидку 10%!
          </p>
          <p className="text-xs text-white/90 mt-0.5">
            Войдите через телефон, Google или Email и экономьте на каждом заказе
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default DiscountBanner;
