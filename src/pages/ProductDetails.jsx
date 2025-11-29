import {
  ArrowLeft,
  Check,
  Heart,
  Share2,
  ShoppingBag,
  Star,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductCarousel from '../components/features/ProductCarousel';
import TactileButton from '../components/ui/TactileButton';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { PRODUCTS } from '../data/products';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    // Find product by ID (handle both string and number IDs)
    const found = PRODUCTS.find((p) => String(p.id) === id);
    if (found) {
      setProduct(found);
      // Set default variants
      if (found.variants?.colors?.length > 0) {
        setSelectedColor(found.variants.colors[0]);
      }
      if (found.variants?.sizes?.length > 0) {
        setSelectedSize(found.variants.sizes[0]);
      }
    }
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900">
        <div className="text-center">
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">
            Товар не найден
          </h2>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-amber-600 hover:underline"
          >
            Вернуться в каталог
          </button>
        </div>
      </div>
    );
  }

  // Calculate dynamic price
  const basePrice = product.basePrice || product.price;
  const currentPrice = basePrice + (selectedSize?.priceMod || 0);

  const handleAddToCart = () => {
    addToCart({
      ...product,
      id: `${product.id}-${selectedColor?.id || 'def'}-${selectedSize?.value || 'def'}`,
      name: `${product.name} ${selectedSize ? `(${selectedSize.label})` : ''} ${selectedColor ? `(${selectedColor.name})` : ''}`,
      price: currentPrice,
      selectedColor,
      selectedSize,
      quantity: 1,
    });
    showToast('Товар добавлен в корзину', 'success');
  };

  const images =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image];

  return (
    <div className="min-h-screen bg-[#1c1917] text-stone-200 pb-24 animate-fade-in">
      {/* Header / Navigation */}
      <div className="fixed top-0 left-0 right-0 z-40 p-4 flex justify-between items-center pointer-events-none">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="pointer-events-auto p-3 bg-black/50 backdrop-blur-md rounded-full shadow-sm text-stone-100 hover:bg-black transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          type="button"
          className="pointer-events-auto p-3 bg-black/50 backdrop-blur-md rounded-full shadow-sm text-stone-100 hover:bg-black transition-colors"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: product.name,
                text: product.description,
                url: window.location.href,
              });
            } else {
              showToast('Ссылка скопирована', 'success');
              navigator.clipboard.writeText(window.location.href);
            }
          }}
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* Image Gallery */}
      <div className="h-[50vh] w-full bg-stone-800 relative">
        <ProductCarousel images={images} />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#1c1917] to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="px-6 -mt-10 relative z-10">
        <div className="bg-[#1c1917] rounded-t-3xl p-6 shadow-xl border-t border-white/5">
          {/* Category & Rating */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
              {product.category}
            </span>
            <div className="flex items-center gap-1 bg-stone-800 px-2 py-1 rounded-lg border border-white/5">
              <Star size={12} className="fill-amber-500 text-amber-500" />
              <span className="text-xs font-bold text-stone-300">
                {product.rating || '5.0'}
              </span>
            </div>
          </div>

          {/* Title & Price */}
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white leading-tight mb-4">
            {product.name}
          </h1>

          <div className="flex justify-between items-center mb-8">
            <div className="text-3xl font-mono text-amber-500">
              {currentPrice.toLocaleString()}{' '}
              <span className="text-lg text-stone-500 font-sans">₽</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const isAdded = toggleWishlist(product);
                showToast(
                  isAdded ? 'Добавлено в избранное' : 'Удалено из избранного',
                  'success',
                );
              }}
              className={`p-3 rounded-full transition-all ${
                isInWishlist(product.id)
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
              }`}
            >
              <Heart
                size={24}
                fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {/* Variants Selection */}
          {(product.variants?.colors || product.variants?.sizes) && (
            <div className="space-y-6 mb-8 border-t border-white/10 pt-6">
              {/* Colors */}
              {product.variants?.colors && (
                <div>
                  <span className="text-xs font-bold uppercase text-stone-500 mb-3 block">
                    Цвет
                  </span>
                  <div className="flex gap-3">
                    {product.variants.colors.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`
                          group relative w-12 h-12 rounded-full border-2 transition-all
                          ${
                            selectedColor?.id === color.id
                              ? 'border-amber-500 scale-110 shadow-[0_0_15px_rgba(217,119,6,0.3)]'
                              : 'border-stone-700 hover:scale-105'
                          }
                        `}
                        style={{ backgroundColor: color.hex }}
                      >
                        {selectedColor?.id === color.id && (
                          <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
                            <Check size={16} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-stone-400 font-medium">
                    {selectedColor?.name}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.variants?.sizes && (
                <div>
                  <span className="text-xs font-bold uppercase text-stone-500 mb-3 block">
                    Размер
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.sizes.map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`
                          px-4 py-2 rounded-xl text-sm font-bold transition-all border
                          ${
                            selectedSize?.value === size.value
                              ? 'bg-amber-600 text-white border-amber-600 shadow-lg'
                              : 'bg-stone-800 border-stone-700 text-stone-400 hover:border-stone-500'
                          }
                        `}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="prose prose-invert prose-sm max-w-none mb-8">
            <h3 className="text-lg font-serif font-bold mb-2 text-stone-200">
              О товаре
            </h3>
            <p className="text-stone-400 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Action Button */}
          <div className="sticky bottom-4 z-20">
            {product.isSold ? (
              <button
                type="button"
                disabled
                className="w-full py-4 bg-stone-800 text-stone-500 font-bold rounded-2xl cursor-not-allowed border border-stone-700"
              >
                Продано
              </button>
            ) : (
              <TactileButton
                onClick={handleAddToCart}
                className="w-full py-4 text-base bg-amber-600 text-white shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:bg-amber-500 border-none"
              >
                <div className="flex items-center justify-between w-full px-4">
                  <span>Добавить в корзину</span>
                  <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg">
                    <span className="font-mono">
                      {currentPrice.toLocaleString()} ₽
                    </span>
                    <ShoppingBag size={18} />
                  </div>
                </div>
              </TactileButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
