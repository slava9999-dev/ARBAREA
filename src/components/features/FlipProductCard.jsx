import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, ShoppingBag, Play } from 'lucide-react';
import ProductCarousel from './ProductCarousel';
import TactileButton from '../ui/TactileButton';

const FlipProductCard = ({ product, onBuy }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Собираем все изображения для карусели
    const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

    const handleFlip = (e) => {
        e.stopPropagation();
        if (isAnimating) return;
        setIsFlipped(!isFlipped);
        if (window.navigator?.vibrate) window.navigator.vibrate(10);
    };

    return (
        <div className="h-[420px] w-full perspective-1000 group">
            <motion.div
                className="relative w-full h-full"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationComplete={() => setIsAnimating(false)}
                style={{
                    transformStyle: "preserve-3d",
                    willChange: "transform",
                    pointerEvents: isAnimating ? "none" : "auto"
                }}
            >
                {/* Front */}
                <div className="absolute inset-0 bg-white dark:bg-stone-900 rounded-2xl shadow-md border border-stone-100 dark:border-stone-800 overflow-hidden flex flex-col"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                    <div className="relative h-72 bg-stone-200 dark:bg-stone-800">
                        <ProductCarousel
                            images={images}
                            productName={product.name}
                        />

                        {/* Иконка видео */}
                        {product.video && (
                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1 z-20 pointer-events-none">
                                <Play size={10} fill="currentColor" /> Видео
                            </div>
                        )}

                        <div className="absolute top-3 right-12 bg-white/90 dark:bg-stone-800/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-stone-800 dark:text-stone-100 shadow-sm z-20 pointer-events-none">
                            {product.price.toLocaleString()} ₽
                        </div>

                        {product.isSold && (
                            <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg z-20 pointer-events-none border border-stone-700">
                                ПРОДАНО
                            </div>
                        )}

                        {/* Кнопка переворота */}
                        <button
                            onClick={handleFlip}
                            className="absolute bottom-3 right-3 bg-stone-800/80 backdrop-blur p-2 rounded-full text-white hover:bg-stone-700 transition-colors z-30 shadow-lg"
                            aria-label="Перевернуть карточку"
                        >
                            <RotateCw size={16} />
                        </button>
                    </div>

                    <div className="p-4 flex flex-col justify-between flex-grow bg-white dark:bg-stone-900 relative z-10">
                        <div onClick={handleFlip} className="cursor-pointer">
                            <div className="text-[10px] text-stone-400 mb-1 uppercase tracking-widest font-bold">{product.category}</div>
                            <h3 className="text-lg font-medium text-stone-800 dark:text-stone-100 leading-tight font-serif line-clamp-2">{product.name}</h3>
                        </div>
                        <div
                            onClick={handleFlip}
                            className="w-full py-2 text-center text-stone-400 text-xs border-t border-stone-100 dark:border-stone-800 mt-2 cursor-pointer hover:text-stone-600 transition-colors"
                        >
                            Подробнее о товаре
                        </div>
                    </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 bg-stone-800 dark:bg-stone-800 rounded-2xl shadow-xl p-6 flex flex-col justify-between"
                    style={{
                        transform: "rotateY(180deg)",
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                    }}
                >
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <div className="text-[10px] text-stone-400 uppercase tracking-widest">Описание</div>
                            <button onClick={handleFlip} className="text-stone-400 hover:text-white transition-colors">
                                <RotateCw size={16} />
                            </button>
                        </div>
                        <h3 className="text-white font-serif text-lg mb-3 line-clamp-2">{product.name}</h3>
                        <p className="text-stone-300 text-sm leading-relaxed font-light line-clamp-[10]">
                            {product.description}
                        </p>
                        {product.hasOptions && (
                            <div className="mt-4 flex gap-2">
                                <div className="px-2 py-1 bg-stone-700 rounded text-[10px] text-stone-300">Размеры</div>
                                <div className="px-2 py-1 bg-stone-700 rounded text-[10px] text-stone-300">Цвета</div>
                            </div>
                        )}
                    </div>

                    {/* Container for the button to ensure it's clickable and visible */}
                    <div className="relative z-10" style={{ transform: "translateZ(1px)" }}>
                        {product.isSold ? (
                            <button
                                disabled
                                className="w-full bg-stone-600 text-stone-300 py-3 rounded-xl font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2 shadow-none opacity-80"
                            >
                                Продано
                            </button>
                        ) : (
                            <TactileButton
                                onClick={(e) => { e.stopPropagation(); onBuy(product); }}
                                variant="primary"
                                className="w-full py-3"
                            >
                                В корзину <ShoppingBag size={16} />
                            </TactileButton>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default FlipProductCard;
