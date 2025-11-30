import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

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
    });
    showToast('Товар добавлен в корзину', 'success');
  };

  return (
    <motion.div
      className={`
        relative group rounded-xl overflow-hidden
        bg-stone-800/40 backdrop-blur-sm
        border border-white/10
        shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]
        transition-all duration-300 ease-out
        h-full flex flex-col
      `}
      whileHover={{
        y: -4,
        boxShadow: '0 20px 30px rgba(217, 119, 6, 0.15)', // amber-glow
      }}
      onClick={handleDetailsClick}
    >
      {/* Image Container with Swipe */}
      <div className="relative h-64 overflow-hidden bg-stone-900 group/image">
        <motion.img
          key={imgIndex}
          src={images[imgIndex]}
          alt={product.name}
          className="w-full h-full object-cover absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          drag={images.length > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_e, { offset, velocity }) => {
            const swipe = Math.abs(offset.x) * velocity.x;
            if (swipe < -100) {
              paginate(1);
            } else if (swipe > 100) {
              paginate(-1);
            }
          }}

          style={{ cursor: 'pointer' }}
        />
        
        {/* Navigation Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
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

        {/* Navigation Arrows (Visible on hover) */}
        {images.length > 1 && (
           <>
             <button
               type="button"
               className="absolute left-1 top-1/2 -translate-y-1/2 p-1 bg-black/30 text-white rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity"
               onClick={(e) => {
                 e.stopPropagation();
                 paginate(-1);
               }}
             >
               <ChevronLeft size={16} />
             </button>
             <button
               type="button"
               className="absolute right-1 top-1/2 -translate-y-1/2 p-1 bg-black/30 text-white rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity"
               onClick={(e) => {
                 e.stopPropagation();
                 paginate(1);
               }}
             >
               <ChevronRight size={16} />
             </button>
           </>
        )}

        {product.isSold && (
          <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-white border border-stone-700 z-20">
            ПРОДАНО
          </div>
        )}
        <div className="absolute top-3 right-3 bg-stone-900/60 backdrop-blur px-2 py-1 rounded text-xs font-bold text-amber-500 border border-amber-500/20 z-20">
          {currentPrice.toLocaleString()} ₽
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow bg-stone-900/30 backdrop-blur-sm">
        <div className="text-[10px] text-stone-400 mb-1 uppercase tracking-widest font-bold">
          {product.category}
        </div>
        <h3 className="font-serif text-xl text-amber-600 leading-tight mb-2">
          {product.name}
        </h3>
        <p className="font-sans text-sm text-stone-300 line-clamp-2 mb-4 flex-grow">
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
                        ? 'border-amber-500 scale-110 ring-1 ring-amber-500 ring-offset-1 ring-offset-stone-900'
                        : 'border-stone-600'
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
                        ? 'bg-stone-700 text-white border-stone-500'
                        : 'bg-transparent text-stone-500 border-stone-700 hover:border-stone-500'
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
            className="w-full bg-stone-700 text-stone-400 py-3 rounded-lg font-medium tracking-wide cursor-not-allowed"
          >
            Продано
          </button>
        ) : (
          <div className="flex gap-2 mt-auto">
            <button
              type="button"
              onClick={handleBuy}
              className="flex-1 bg-amber-600 text-white hover:bg-amber-500 active:scale-95 transition-all duration-300 rounded-lg py-3 font-medium tracking-wide flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(217,119,6,0.3)] text-sm"
            >
              <ShoppingBag size={16} />
              В корзину
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenModal(product);
              }}
              className="flex-1 bg-stone-700 text-stone-200 hover:bg-stone-600 active:scale-95 transition-all duration-300 rounded-lg py-3 font-medium tracking-wide flex items-center justify-center text-sm border border-stone-600"
            >
              Подробнее
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FlipProductCard;
