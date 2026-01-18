import { Play, ShoppingBag, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { COLORS, SIZES } from '../../lib/constants';
import { ecommerceAdd } from '../../lib/yandex-metrica';
import OptimizedImage from '../ui/OptimizedImage';
import TactileButton from '../ui/TactileButton';

const BuyModal = ({ product, onClose, onAddToCart }) => {
  const dialogRef = useRef(null);
  const [selectedSize, setSelectedSize] = useState(
    product.hasOptions ? SIZES[0] : null,
  );
  const [selectedColor, setSelectedColor] = useState(
    product.hasOptions ? 'bronze' : null,
  );
  const [activeMedia, setActiveMedia] = useState(0); // 0 - main image, 1+ - gallery, -1 - video

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    // Handle Esc key via the native cancel event
    const handleCancel = (e) => {
      e.preventDefault();
      onClose();
    };

    dialog?.addEventListener('cancel', handleCancel);
    return () => dialog?.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  const handleAddToCart = () => {
    // ... same logic ...
    const itemToAdd = {
      ...product,
      productId: product.id,
      id: `${product.id}::${selectedColor || 'def'}::${selectedSize || 'def'}`,
      price: currentPrice,
      selectedSize,
      selectedColor,
      selectedColorName: selectedColor ? COLORS[selectedColor].name : null,
    };

    ecommerceAdd({
      id: product.id,
      name: `${product.name}${selectedSize ? ` (${selectedSize})` : ''}`,
      price: currentPrice,
      category: product.category || 'Декор',
      quantity: 1,
    });

    onAddToCart(itemToAdd);
    onClose();
  };

  if (!product) return null;

  const currentPrice =
    selectedSize === '80 см'
      ? product.price + 500
      : selectedSize === '100 см'
        ? product.price + 1000
        : product.price;

  const mediaList = [product.image, ...(product.gallery || [])];

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 border-none w-full h-full backdrop:bg-black/40"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === dialogRef.current) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      aria-labelledby="modal-title"
    >
      <div className="bg-white dark:bg-stone-900 w-full sm:w-[450px] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
        <div className="p-4 flex justify-between items-center border-b border-stone-100 dark:border-stone-800 shrink-0">
          <h3
            id="modal-title"
            className="font-serif font-bold text-lg text-stone-800 dark:text-stone-100"
          >
            Детали заказа
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть модальное окно"
            className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
          >
            <X className="text-stone-400" size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-0 custom-scrollbar">
          {/* Галерея */}
          <div className="relative w-full h-64 bg-stone-100 dark:bg-stone-800">
            {activeMedia === -1 && product.video ? (
              product.video.endsWith('.mp4') ||
              product.video.endsWith('.webm') ? (
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
                <iframe
                  src={product.video}
                  className="w-full h-full object-cover"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="Product Video"
                />
              )
            ) : (
              <OptimizedImage
                src={mediaList[activeMedia] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}

            {/* Миниатюры */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {mediaList.map((img, idx) => (
                <button
                  type="button"
                  key={img}
                  onClick={() => setActiveMedia(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${activeMedia === idx ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
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
                  className={`w-12 h-12 rounded-lg bg-stone-900/80 flex items-center justify-center border-2 transition-all shrink-0 ${activeMedia === -1 ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <Play size={16} className="text-white fill-white" />
                </button>
              )}
            </div>
          </div>

          <div className="p-6 pb-24">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-800 dark:text-stone-100 mb-1">
                  {product.name}
                </h2>
                <div className="text-stone-500 dark:text-stone-400 text-sm">
                  {product.category}
                </div>
              </div>
              <div className="text-xl font-bold text-stone-800 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-lg">
                {(currentPrice || 0).toLocaleString()} ₽
              </div>
            </div>

            <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed mb-6">
              {product.description}
            </p>

            {product.hasOptions && (
              <div className="mb-8 space-y-5 p-5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-100 dark:border-stone-700">
                <div>
                  <div className="text-xs font-bold uppercase text-stone-500 dark:text-stone-400 mb-3">
                    Размер
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((size) => (
                      <button
                        type="button"
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${selectedSize === size ? 'bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-800 dark:border-stone-100 shadow-md' : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-600 hover:border-stone-400'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase text-stone-500 dark:text-stone-400 mb-3">
                    Цвет
                  </div>
                  <div className="flex gap-3">
                    {Object.entries(COLORS).map(([key, val]) => (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setSelectedColor(key)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${selectedColor === key ? 'border-stone-800 dark:border-stone-100 scale-110' : 'border-transparent hover:scale-105'}`}
                        title={val.name}
                      >
                        <div
                          className={`w-9 h-9 rounded-full ${val.class} shadow-sm`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-stone-500 dark:text-stone-400 font-medium">
                    Выбрано:{' '}
                    {selectedColor ? COLORS[selectedColor].name : 'Не выбрано'}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div className="space-y-3 pt-2">
                <TactileButton
                  onClick={handleAddToCart}
                  variant="primary"
                  className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
                >
                  <ShoppingBag size={18} />
                  <span>Добавить в корзину</span>
                </TactileButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default BuyModal;
