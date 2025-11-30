import OptimizedImage from '../ui/OptimizedImage';

const ProductCard = ({ product, categoryName, onOpenModal }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <OptimizedImage
          src={product.image}
          srcSet={product.image.startsWith('/images/products/') 
            ? `/images/products/thumbnails/${product.image.split('/').pop().replace('.webp', '_thumb.webp')} 400w, ${product.image} 1000w`
            : undefined}
          sizes="(max-width: 768px) 50vw, 25vw"
          alt={product.name}
          width={400}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-sm font-medium text-stone-800">
          <Star size={14} className="fill-amber-400 text-amber-400" />
          {product.rating}
        </div>
        <button
          type="button"
          onClick={() => onOpenModal(product)}
          aria-label={`Купить ${product.name}`}
          className="absolute bottom-4 right-4 bg-stone-900 text-white p-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-amber-600"
        >
          <ShoppingBag size={20} />
        </button>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-stone-800 mb-1">
          {product.name}
        </h3>
        <p className="text-stone-500 text-sm mb-3 capitalize">{categoryName}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-amber-700">
            {product.price.toLocaleString()} ₽
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
