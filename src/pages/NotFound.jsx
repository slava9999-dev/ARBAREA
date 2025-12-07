import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1c1917] flex flex-col items-center justify-center px-6 text-center">
      {/* Animated 404 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative mb-8"
      >
        <h1 className="text-[120px] md:text-[180px] font-serif font-bold bg-gradient-to-b from-amber-400 via-amber-600 to-amber-800 bg-clip-text text-transparent leading-none">
          404
        </h1>
        <div className="absolute inset-0 bg-amber-500/10 blur-3xl -z-10" />
      </motion.div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="max-w-md"
      >
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
          Страница не найдена
        </h2>
        <p className="text-stone-400 mb-8 leading-relaxed">
          Похоже, вы забрели в неизведанные уголки нашей мастерской. 
          Эта страница не существует или была перемещена.
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-sm"
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-all"
        >
          <ArrowLeft size={18} />
          Назад
        </button>
        
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-500 transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)] border-2 border-amber-500"
        >
          <Home size={18} />
          На главную
        </button>
      </motion.div>

      {/* Decorative wood grain pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-900/50 to-transparent pointer-events-none" />
      
      {/* Floating decorative elements */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/4 left-10 w-8 h-8 bg-amber-500/20 rounded-lg blur-sm"
      />
      <motion.div
        animate={{
          y: [0, 10, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/3 right-12 w-6 h-6 bg-amber-600/20 rounded-full blur-sm"
      />
    </div>
  );
};

export default NotFound;
