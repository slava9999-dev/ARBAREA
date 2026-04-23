import { motion } from 'framer-motion';
import { Sparkles, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSimpleAuth } from '../../context/SimpleAuthContext';

const DiscountBanner = () => {
  const { user, discount } = useSimpleAuth();
  const navigate = useNavigate();

  // Show active discount for registered users
  if (user) {
    if (!discount) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-amber-600/20 via-amber-500/15 to-orange-600/20 text-white px-4 py-3 rounded-2xl mb-4 overflow-hidden border border-amber-500/20"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
            <Sparkles size={20} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-amber-400">
              Ваша скидка {discount}% применена!
            </p>
            <p className="text-xs text-stone-400">
              Скидка уже учтена в итоговой сумме
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show registration CTA for guests
  return (
    <motion.button
      type="button"
      onClick={() => navigate('/profile')}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      className="relative w-full bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 text-white px-4 py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-4 overflow-hidden border border-emerald-400/20 text-left"
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl" />
      </div>

      <div className="relative flex items-center gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
          <Gift size={24} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-base leading-tight mb-1">
            Скидка 10% на все!
          </p>
          <p className="text-xs text-white/90 leading-relaxed">
            Зарегистрируйтесь за 10 секунд — введите имя и телефон
          </p>
        </div>
      </div>
    </motion.button>
  );
};

export default DiscountBanner;
