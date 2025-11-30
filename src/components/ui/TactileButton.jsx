import { motion } from 'framer-motion';

const TactileButton = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
}) => {
  const handleTap = (e) => {
    if (!disabled && window.navigator?.vibrate) {
      window.navigator.vibrate(10);
    }
    if (onClick && !disabled) {
      onClick(e);
    }
  };

  const variants = {
    primary:
      'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white shadow-[0_0_20px_rgba(28,25,23,0.3)] dark:shadow-[0_0_20px_rgba(245,245,244,0.3)] hover:shadow-[0_0_30px_rgba(28,25,23,0.5)] dark:hover:shadow-[0_0_30px_rgba(245,245,244,0.5)]',
    glass: 'glass-panel text-white hover:bg-stone-800/60 shadow-[0_0_15px_rgba(120,113,108,0.2)] hover:shadow-[0_0_25px_rgba(120,113,108,0.4)]',
    secondary:
      'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700 shadow-[0_0_15px_rgba(168,162,158,0.2)] dark:shadow-[0_0_15px_rgba(41,37,36,0.3)] hover:shadow-[0_0_25px_rgba(168,162,158,0.3)] dark:hover:shadow-[0_0_25px_rgba(41,37,36,0.5)]',
  };

  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.95 }}
      onClick={handleTap}
      disabled={disabled}
      className={`
                relative overflow-hidden rounded-xl font-bold text-sm 
                flex items-center justify-center gap-2 transition-colors 
                px-6 py-3
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className}
                ${variants[variant] || variants.primary}
            `}
    >
      {children}
    </motion.button>
  );
};

export default TactileButton;
