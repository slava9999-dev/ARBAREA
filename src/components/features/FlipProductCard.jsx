import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

const FlipProductCard = ({ product, onBuy }) => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Variant State
  const [selectedColor, setSelectedColor] = useState(
    product.variants?.colors?.[0],
  );
  const [selectedSize, setSelectedSize] = useState(
    product.variants?.sizes?.[0],
  );

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
        bg-stone-800/40 backdrop-blur-md
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
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-stone-900">
        <motion.img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {product.isSold && (
          <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-white border border-stone-700">
            ПРОДАНО
          </div>
        )}
        <div className="absolute top-3 right-3 bg-stone-900/60 backdrop-blur px-2 py-1 rounded text-xs font-bold text-amber-500 border border-amber-500/20">
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
          <button
            type="button"
            onClick={handleBuy}
            className="w-full bg-amber-600 text-white hover:bg-amber-500 active:scale-95 transition-all duration-300 rounded-lg py-3 font-medium tracking-wide flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(217,119,6,0.3)]"
          >
            В корзину <ShoppingBag size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default FlipProductCard;
