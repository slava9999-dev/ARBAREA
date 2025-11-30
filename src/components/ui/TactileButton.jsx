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
      'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white border-2 border-stone-700 hover:border-stone-600',
    glass: 'glass-panel text-white hover:bg-stone-800/60 border-2 border-white/20 hover:border-white/30',
    secondary:
      'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700 border-2 border-stone-300 dark:border-stone-600 hover:border-stone-400 dark:hover:border-stone-500',
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
