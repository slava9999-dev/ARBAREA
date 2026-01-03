import { motion } from 'framer-motion';
import { ShoppingBag, Star } from 'lucide-react';
import OptimizedImage from '../ui/OptimizedImage';

const ProductCard = ({ product, categoryName, onOpenModal }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl overflow-hidden bg-[#2a2520] border border-white/5 transition-all duration-300 hover:shadow-wood-md hover:border-wood-amber/20"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <OptimizedImage
          src={product.image}
          srcSet={
            product.image.startsWith('/images/products/')
              ? `/images/products/thumbnails/${product.image.split('/').pop().replace('.webp', '_thumb.webp')} 400w, ${product.image} 1000w`
              : undefined
          }
          sizes="(max-width: 768px) 50vw, 25vw"
          alt={product.name}
          width={400}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-xs font-medium text-white shadow-sm">
          <Star size={12} className="fill-wood-amber text-wood-amber" />
          {product.rating}
        </div>

        {/* Quick Buy Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenModal(product);
          }}
          aria-label={`Купить ${product.name}`}
          className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-wood-amber to-wood-amber-dark text-[#1a1614] shadow-wood-glow translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out hover:scale-110 active:scale-95"
        >
          <ShoppingBag size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 relative">
        {/* Subtle top border on content area */}
        <div className="absolute top-0 inset-x-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <h3 className="text-base font-serif font-medium text-stone-100 truncate mb-1">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <p className="text-xs text-stone-500 capitalize font-medium tracking-wide">
            {categoryName}
          </p>
          <span className="font-mono font-bold text-sm text-gradient-amber">
            {product.price.toLocaleString()} ₽
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
