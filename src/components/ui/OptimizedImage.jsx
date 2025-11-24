import React, { useState } from 'react';
import { motion } from 'framer-motion';

const OptimizedImage = ({ src, alt, className, width = 400 }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Optimize Unsplash URLs aggressively
    let optimizedSrc = src;
    if (src.includes('unsplash.com')) {
        // Remove existing parameters
        const baseUrl = src.split('?')[0];
        // Add optimized parameters: width, quality 60%, webp format
        optimizedSrc = `${baseUrl}?auto=format&fit=crop&w=${width}&q=60&fm=webp`;
    }

    return (
        <div className={`relative overflow-hidden bg-stone-100 ${className}`}>
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 animate-pulse bg-stone-200" />
            )}

            <motion.img
                src={optimizedSrc}
                alt={alt}
                loading="lazy"
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
                className={`w-full h-full object-cover ${className}`}
            />

            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-400 text-xs">
                    Нет фото
                </div>
            )}
        </div>
    );
};

export default OptimizedImage;
