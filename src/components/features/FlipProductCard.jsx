import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Maximize2,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import FullScreenImageViewer from '../ui/FullScreenImageViewer';

const FlipProductCard = ({ product, onBuy, onOpenModal }) => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Variant State
  const [selectedColor, setSelectedColor] = useState(
    product.variants?.colors?.[0],
  );
  const [selectedSize, setSelectedSize] = useState(
    product.variants?.sizes?.[0],
  );

  // Gallery Logic
  const images =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image];
  const [imgIndex, setImgIndex] = useState(0);
  const [showFullScreen, setShowFullScreen] = useState(false);

  const paginate = (newDirection) => {
    setImgIndex((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = images.length - 1;
      if (next >= images.length) next = 0;
      return next;
    });
  };

  // Dynamic Price Calculation
  const basePrice = product.basePrice || product.price;
  const currentPrice = basePrice + (selectedSize?.priceMod || 0);

  const handleDetailsClick = (e) => {
    // Prevent navigation if we are clicking interactive elements
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const handleBuy = (e) => {
    e.stopPropagation();
    onBuy({
      ...product,
      id: `${product.id}-${selectedColor?.id || 'def'}-${selectedSize?.value || 'def'}`,
      name: `${product.name} ${selectedSize ? `(${selectedSize.label})` : ''} ${selectedColor ? `(${selectedColor.name})` : ''}`,
      price: currentPrice,
      image: images[0], // Ensure correct image is passed
    });
    showToast('Товар добавлен в корзину', 'success');
  };

  return (
    <>
      <motion.div
        className={`
          relative group rounded-2xl overflow-hidden
          bg-gradient-to-br from-wood-bg-card to-wood-bg-elevated
          border border-wood-amber/10
          shadow-wood-md
          transition-all duration-300 ease-out
          h-full flex flex-col
          touch-manipulation
          hover:border-wood-amber/30
        `}
        whileHover={{
          y: -4,
          boxShadow:
            '0 20px 40px rgba(201, 164, 92, 0.2), 0 0 60px rgba(201, 164, 92, 0.1)',
        }}
        onClick={handleDetailsClick}
      >
        {/* Image Container with Swipe */}
        <div className="relative h-64 overflow-hidden bg-stone-900 group/image">
          <motion.img
            key={imgIndex}
            src={images[imgIndex]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ cursor: 'pointer' }}
          />

          {/* Navigation Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none">
              {images.map((img, idx) => (
                <div
                  key={img}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === imgIndex ? 'bg-white w-3' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute inset-0 z-10 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-1 top-1/2 -translate-y-1/2 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 active:scale-95 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    paginate(-1);
                  }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 active:scale-95 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    paginate(1);
                  }}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Maximize Button */}
            <button
              type="button"
              className="absolute top-2 left-2 p-2 bg-black/60 text-white rounded-lg hover:bg-black/80 active:scale-95 transition-all z-30"
              onClick={(e) => {
                e.stopPropagation();
                setShowFullScreen(true);
              }}
            >
              <Maximize2 size={18} />
            </button>
          </div>

          {product.isSold && (
            <div className="absolute bottom-3 left-3 bg-wood-bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold text-stone-400 border border-white/10 z-20 pointer-events-none shadow-lg">
              ПРОДАНО
            </div>
          )}
          <div className="absolute top-3 right-3 bg-wood-bg-card/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-sm font-bold text-gradient-amber border border-wood-amber/20 z-20 pointer-events-none shadow-wood-glow">
            {currentPrice.toLocaleString()} ₽
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow bg-gradient-to-b from-wood-bg-card to-wood-bg-elevated">
          <div className="text-[10px] text-wood-text-muted mb-1 uppercase tracking-widest font-bold">
            {product.category}
          </div>
          <h3 className="font-serif text-xl text-wood-amber leading-tight mb-2">
            {product.name}
          </h3>
          <p className="font-sans text-sm text-wood-text-secondary line-clamp-2 mb-4 flex-grow">
            {product.description}
          </p>

          {/* Variants (Compact) */}
          {(product.variants?.colors || product.variants?.sizes) && (
            <div className="flex flex-wrap gap-3 mb-4">
              {product.variants?.colors && (
                <div className="flex gap-2">
                  {product.variants.colors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedColor(color);
                      }}
                      className={`w-5 h-5 rounded-full border transition-all ${
                        selectedColor?.id === color.id
                          ? 'border-wood-amber scale-110 ring-2 ring-wood-amber/50 ring-offset-2 ring-offset-wood-bg-card shadow-wood-glow'
                          : 'border-white/20'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      aria-label={`Select color ${color.name}`}
                    />
                  ))}
                </div>
              )}

              {product.variants?.sizes && (
                <div className="flex gap-1">
                  {product.variants.sizes.map((size) => (
                    <button
                      key={size.value}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSize(size);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all border ${
                        selectedSize?.value === size.value
                          ? 'bg-wood-amber text-wood-bg border-wood-amber shadow-wood-glow-sm'
                          : 'bg-transparent text-wood-text-muted border-white/10 hover:border-wood-amber/50 hover:text-wood-amber'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {product.isSold ? (
            <button
              type="button"
              disabled
              className="w-full bg-wood-bg-elevated text-wood-text-muted py-2.5 rounded-xl font-medium text-sm cursor-not-allowed border border-white/5"
            >
              Продано
            </button>
          ) : (
            <div className="flex gap-2 mt-auto">
              <button
                type="button"
                onClick={handleBuy}
                className="flex-1 h-9 btn-primary rounded-full flex items-center justify-center gap-1 shadow-wood-glow hover:shadow-wood-glow-lg active:scale-95 transition-all duration-200 text-[11px] font-semibold px-2"
              >
                <ShoppingBag size={14} />
                <span>Купить</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenModal) onOpenModal(product);
                }}
                className="flex-1 h-9 bg-wood-bg-elevated text-wood-text-primary hover:bg-wood-bg-card active:scale-95 transition-all duration-200 rounded-full flex items-center justify-center gap-1 border border-wood-amber/30 hover:border-wood-amber/60 text-[11px] font-medium px-2"
              >
                <Maximize2 size={14} />
                <span>Детали</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showFullScreen && (
          <FullScreenImageViewer
            images={images}
            initialIndex={imgIndex}
            onClose={() => setShowFullScreen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default FlipProductCard;
