import { Check, CreditCard, Play, ShoppingBag, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useToast } from '../../context/ToastContext';
import { GOALS, reachGoal } from '../../lib/yandex-metrica';
import { haptic } from '../../lib/haptics';
import OptimizedImage from '../ui/OptimizedImage';

/**
 * Quick-buy modal. Uses the same data-driven variant model
 * (`product.variants.colors` / `product.variants.sizes` with `priceMod`)
 * as the product card, product page and the payment server — so a product
 * is priced identically everywhere.
 */
const BuyModal = ({ product, onClose, onAddToCart }) => {
  const dialogRef = useRef(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const colors = product?.variants?.colors || [];
  const sizes = product?.variants?.sizes || [];

  const [selectedColor, setSelectedColor] = useState(colors[0] || null);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || null);
  const [activeMedia, setActiveMedia] = useState(0); // 0+ media index, -1 video

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    const handleCancel = (e) => {
      e.preventDefault();
      onClose();
    };

    dialog?.addEventListener('cancel', handleCancel);
    return () => dialog?.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  if (!product) return null;

  const basePrice = product.basePrice || product.price;
  const currentPrice = basePrice + (selectedSize?.priceMod || 0);

  const mediaList =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image];

  const buildCartItem = () => ({
    ...product,
    productId: product.id,
    id: `${product.id}-${selectedColor?.id || 'def'}-${selectedSize?.value || 'def'}`,
    name: `${product.name}${selectedSize ? ` (${selectedSize.label})` : ''}${
      selectedColor ? ` (${selectedColor.name})` : ''
    }`,
    price: currentPrice,
    image: mediaList[0],
    selectedColor,
    selectedSize,
    quantity: 1,
  });

  const handleAddToCart = () => {
    haptic(12);
    onAddToCart(buildCartItem());
    reachGoal(GOALS.ADD_TO_CART, {
      id: product.id,
      name: product.name,
      price: currentPrice,
      source: 'quickbuy',
    });
    showToast('Товар добавлен в корзину', 'success');
    onClose();
  };

  const handleBuyNow = () => {
    haptic(15);
    onAddToCart(buildCartItem());
    reachGoal(GOALS.BUY_NOW, {
      id: product.id,
      name: product.name,
      price: currentPrice,
    });
    onClose();
    navigate('/cart');
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 border-none w-full h-full backdrop:bg-black/60"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      aria-labelledby="buy-modal-title"
    >
      <div
        data-testid="product-modal"
        className="bg-[#1c1917] text-stone-200 w-full sm:w-[450px] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[92vh] border border-wood-amber/15"
      >
        <div className="p-4 flex justify-between items-center border-b border-white/5 shrink-0">
          <h3
            id="buy-modal-title"
            className="font-serif font-bold text-lg text-white"
          >
            Быстрый заказ
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="p-1.5 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="text-stone-400" size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-0 custom-scrollbar">
          {/* Gallery */}
          <div className="relative w-full h-64 bg-stone-900">
            {activeMedia === -1 && product.video ? (
              <video
                src={product.video}
                className="w-full h-full object-cover"
                controls
                playsInline
                autoPlay
                loop
              >
                <track kind="captions" src="" label="No captions" />
              </video>
            ) : (
              <OptimizedImage
                src={mediaList[activeMedia] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}

            {/* Thumbnails */}
            <div className="absolute bottom-3 left-3 right-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {mediaList.map((img, idx) => (
                <button
                  type="button"
                  key={img}
                  onClick={() => setActiveMedia(idx)}
                  className={`w-11 h-11 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    activeMedia === idx
                      ? 'border-wood-amber scale-110 shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              {product.video && (
                <button
                  type="button"
                  onClick={() => setActiveMedia(-1)}
                  className={`w-11 h-11 rounded-lg bg-black/70 flex items-center justify-center border-2 transition-all shrink-0 ${
                    activeMedia === -1
                      ? 'border-wood-amber scale-110 shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Play size={16} className="text-white fill-white" />
                </button>
              )}
            </div>
          </div>

          <div className="p-6 pb-28">
            <div className="flex justify-between items-start gap-3 mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-wood-amber mb-1">
                  {product.category}
                </div>
                <h2 className="font-serif text-2xl font-bold text-white leading-tight">
                  {product.name}
                </h2>
              </div>
              <div className="text-xl font-bold text-wood-amber bg-wood-amber/10 border border-wood-amber/20 px-3 py-1.5 rounded-xl whitespace-nowrap">
                {(currentPrice || 0).toLocaleString()} ₽
              </div>
            </div>

            <p className="text-stone-400 text-sm leading-relaxed mb-6 line-clamp-4">
              {product.description}
            </p>

            {(colors.length > 0 || sizes.length > 0) && (
              <div className="mb-6 space-y-5 p-5 bg-stone-800/40 rounded-2xl border border-white/5">
                {sizes.length > 0 && (
                  <div>
                    <div className="text-xs font-bold uppercase text-stone-400 mb-3">
                      Размер
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button
                          type="button"
                          key={size.value}
                          onClick={() => {
                            setSelectedSize(size);
                            reachGoal(GOALS.VARIANT_CHANGE, {
                              id: product.id,
                              type: 'size',
                              value: size.value,
                            });
                          }}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                            selectedSize?.value === size.value
                              ? 'bg-wood-amber text-stone-900 border-wood-amber shadow-wood-glow'
                              : 'bg-stone-800 text-stone-300 border-white/10 hover:border-wood-amber/50'
                          }`}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {colors.length > 0 && (
                  <div>
                    <div className="text-xs font-bold uppercase text-stone-400 mb-3">
                      Цвет:{' '}
                      <span className="text-stone-200">
                        {selectedColor?.name}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      {colors.map((color) => (
                        <button
                          type="button"
                          key={color.id}
                          onClick={() => {
                            setSelectedColor(color);
                            reachGoal(GOALS.VARIANT_CHANGE, {
                              id: product.id,
                              type: 'color',
                              value: color.id,
                            });
                          }}
                          aria-label={`Цвет: ${color.name}`}
                          className={`relative w-11 h-11 rounded-full border-2 transition-all ${
                            selectedColor?.id === color.id
                              ? 'border-wood-amber scale-110 shadow-wood-glow'
                              : 'border-white/15 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        >
                          {selectedColor?.id === color.id && (
                            <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow">
                              <Check size={16} strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sticky actions */}
        <div className="p-4 border-t border-white/5 bg-[#1c1917] shrink-0 flex gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-white/5 text-stone-200 border border-white/10 hover:border-wood-amber/40 active:scale-[0.98] transition-all"
          >
            <ShoppingBag size={18} />
            <span>В корзину</span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-[1.3] btn-primary py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-wood-glow active:scale-[0.98] transition-all"
          >
            <CreditCard size={18} />
            <span>Оформить заказ</span>
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default BuyModal;
