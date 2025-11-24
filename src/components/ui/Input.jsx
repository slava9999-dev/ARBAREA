// src/components/ui/Input.jsx
// Универсальный Input с поддержкой размеров и утилиты cn
import React from 'react';
import { cn } from '../../lib/utils';

const Input = ({
    className = '',
    size = 'md',
    type = 'text',
    ...props
}) => {
    const sizes = {
        sm: 'px-2 py-1 text-sm',
        md: 'px-3 py-2 text-base',
        lg: 'px-4 py-3 text-lg',
    };

    return (
        <input
            type={type}
            className={cn(
                'rounded-xl border border-stone-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-200 outline-none bg-stone-50 dark:bg-stone-800 dark:text-stone-100',
                sizes[size] || sizes.md,
                className
            )}
            {...props}
        />
    );
};

export default Input;
