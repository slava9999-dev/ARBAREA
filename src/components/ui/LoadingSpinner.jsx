import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer Ring - Tree Ring Effect */}
        <motion.div
          className="absolute inset-0 border-4 border-stone-200 dark:border-stone-800 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Middle Ring */}
        <motion.div
          className="absolute inset-2 border-4 border-stone-300 dark:border-stone-700 rounded-full"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.2,
          }}
        />

        {/* Inner Core - Heartwood */}
        <motion.div
          className="w-12 h-12 bg-stone-800 dark:bg-stone-100 rounded-full shadow-lg flex items-center justify-center"
          animate={{
            scale: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="w-2 h-2 bg-stone-100 dark:bg-stone-900 rounded-full" />
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
