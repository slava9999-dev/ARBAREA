import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1c1917]">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer Ring */}
        <motion.div
          className="absolute inset-0 border-4 border-amber-900/30 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />

        {/* Middle Ring */}
        <motion.div
          className="absolute inset-2 border-4 border-amber-700/50 rounded-full"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
            delay: 0.2,
          }}
        />

        {/* Inner Core - Gold */}
        <motion.div
          className="w-12 h-12 bg-amber-500 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center"
          animate={{
            scale: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        >
          <div className="w-2 h-2 bg-[#1c1917] rounded-full" />
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
