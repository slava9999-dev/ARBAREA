import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const Button = ({
    children,
};

return (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
            'rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
            variants[variant],
            sizes[size],
            className
        )}
        disabled={isLoading}
        {...props}
    >
        {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
            children
        )}
    </motion.button>
);
};

export default Button;
