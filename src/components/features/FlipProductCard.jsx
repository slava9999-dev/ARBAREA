import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
} from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ShoppingBag,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { project, spring } from '../../lib/motion';
import { useToast } from '../../context/ToastContext';
import { haptic } from '../../lib/haptics';
import { GOALS, reachGoal } from '../../lib/yandex-metrica';
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

  // Gallery Logic — sliding track with 1:1 drag tracking
  const images =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image];
  const [imgIndex, setImgIndex] = useState(0);
  const [showFullScreen, setShowFullScreen] = useState(false);

  const trackRef = useRef(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const x = useMotionValue(0);
  // Guards the card's navigation click against a just-finished drag.
  const dragMoved = useRef(false);
  const imgIndexRef = useRef(imgIndex);

  useEffect(() => {
    imgIndexRef.current = imgIndex;
  }, [imgIndex]);

  // Measure the viewport so slides and constraints track the real card size.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setTrackWidth(w);
      x.set(-imgIndexRef.current * w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [x]);

  /**
   * Animate the track to a slide, handing the gesture's release velocity to
   * the spring so drag → animation is seamless. Bounce only when the gesture
   * itself carried momentum (a flick), per the house motion rules.
   */
  const goTo = useCallback(
    (next, velocity = 0) => {
      const clamped = Math.max(0, Math.min(images.length - 1, next));
      if (clamped !== imgIndexRef.current) {
        haptic(8);
      }
      setImgIndex(clamped);
      if (trackWidth > 0) {
        const springToken =
          Math.abs(velocity) > 50 ? spring.momentum : spring.ui;
        animate(x, -clamped * trackWidth, { ...springToken, velocity });
      }
    },
    [images.length, trackWidth, x],
  );

  const paginate = useCallback(
    (direction) => {
      goTo(imgIndexRef.current + direction);
    },
    [goTo],
  );

  /** Momentum projection decides the landing slide, not the release point. */
  const handleDragEnd = useCallback(
    (_e, { offset, velocity }) => {
      const projected = offset.x + project(velocity.x);
      const threshold = trackWidth * 0.25;
      if (projected < -threshold) {
        goTo(imgIndexRef.current + 1, velocity.x);
      } else if (projected > threshold) {
        goTo(imgIndexRef.current - 1, velocity.x);
      } else {
        // Rubber-band back home, still carrying the finger's velocity.
        goTo(imgIndexRef.current, velocity.x);
      }
    },
    [goTo, trackWidth],
  );

  // Dynamic Price Calculation
  const basePrice = product.basePrice || product.price;
  const currentPrice = basePrice + (selectedSize?.priceMod || 0);

  const handleDetailsClick = (e) => {
    // Prevent navigation if we are clicking interactive elements
    e.stopPropagation();
    reachGoal(GOALS.PRODUCT_OPEN, { id: product.id, name: product.name });
    navigate(`/product/${product.id}`);
  };

  const handleBuy = (e) => {
    e.stopPropagation();
    haptic(12);
    onBuy({
      ...product,
      // Store original product ID for DB lookups (numeric or UUID)
      productId: product.id,
      // Composite ID for cart uniqueness (handles variants)
      id: `${product.id}-${selectedColor?.id || 'def'}-${selectedSize?.value || 'def'}`,
      name: `${product.name} ${selectedSize ? `(${selectedSize.label})` : ''} ${selectedColor ? `(${selectedColor.name})` : ''}`,
      price: currentPrice,
      image: images[0], // Ensure correct image is passed
    });
    reachGoal(GOALS.ADD_TO_CART, {
      id: product.id,
      name: product.name,
      price: currentPrice,
      source: 'card',
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
        // biome-ignore lint/a11y/useSemanticElements: <a> can't wrap the variant buttons or the drag-to-swipe gallery (invalid nesting / broken gesture), so role="link" with Enter+Space handling is the accessible equivalent.
        role="link"
        tabIndex={0}
        aria-label={`Просмотреть детали товара: ${product.name}`}
        // Clear the drag guard on every new touch, so only a genuine drag
        // (set in onDragStart) can suppress the navigation click.
        onPointerDown={() => {
          dragMoved.current = false;
        }}
        onClick={(e) => {
          if (dragMoved.current) return;
          handleDetailsClick(e);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleDetailsClick(e);
          }
        }}
      >
        {/* Image Container with 1:1 Swipe */}
        <div
          ref={trackRef}
          className="relative h-64 overflow-hidden bg-stone-900 group/image"
        >
          <motion.div
            className="flex h-full cursor-pointer"
            style={{ x }}
            drag="x"
            dragConstraints={{
              left: -(images.length - 1) * trackWidth,
              right: 0,
            }}
            dragElastic={0.15}
            dragMomentum={false}
            onDragStart={() => {
              dragMoved.current = true;
            }}
            onDragEnd={handleDragEnd}
          >
            {images.map((src) => (
              <img
                key={src}
                src={src}
                alt={product.name}
                loading="lazy"
                draggable={false}
                className="h-full w-full shrink-0 object-cover"
              />
            ))}
          </motion.div>

          {/* Navigation Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none">
              {images.map((img, idx) => (
                <div
                  key={img}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === imgIndex ? 'bg-white w-3' : 'bg-white/50 w-1.5'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute inset-0 z-10 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 pointer-events-none">
            {/* Navigation Arrows (desktop — touch users swipe the track) */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="pointer-events-auto absolute left-1 top-1/2 -translate-y-1/2 p-3 bg-black/60 text-white rounded-full hover:bg-black/80 active:scale-95 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    paginate(-1);
                  }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  className="pointer-events-auto absolute right-1 top-1/2 -translate-y-1/2 p-3 bg-black/60 text-white rounded-full hover:bg-black/80 active:scale-95 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    paginate(1);
                  }}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Maximize Button — always visible (touch has no hover) */}
          <button
            type="button"
            className="absolute top-2 left-2 p-3 bg-black/60 text-white rounded-lg hover:bg-black/80 active:scale-95 transition-all z-30"
            onClick={(e) => {
              e.stopPropagation();
              setShowFullScreen(true);
            }}
            aria-label="Открыть на весь экран"
          >
            <Maximize2 size={20} />
          </button>

          {product.isSold && (
            <div className="absolute bottom-3 left-3 bg-wood-bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold text-stone-400 border border-white/10 z-20 pointer-events-none shadow-lg">
              ПРОДАНО
            </div>
          )}
          <div className="absolute top-3 right-3 bg-gradient-to-br from-amber-500/90 to-amber-700/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-base font-bold text-white border border-amber-300/30 z-20 pointer-events-none shadow-lg shadow-amber-900/40">
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
                        reachGoal(GOALS.VARIANT_CHANGE, {
                          id: product.id,
                          type: 'color',
                          value: color.id,
                        });
                      }}
                      className={`relative w-5 h-5 rounded-full border transition-all before:absolute before:-inset-3 before:rounded-full before:content-[''] ${
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
                        reachGoal(GOALS.VARIANT_CHANGE, {
                          id: product.id,
                          type: 'size',
                          value: size.value,
                        });
                      }}
                      className={`relative px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border before:absolute before:-inset-2 before:rounded-lg before:content-[''] ${
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
              className="w-full bg-wood-bg-elevated text-wood-text-muted py-3 rounded-xl font-medium text-sm cursor-not-allowed border border-white/5"
            >
              Продано
            </button>
          ) : (
            <div className="flex gap-2 mt-auto pt-2">
              <button
                type="button"
                onClick={handleBuy}
                className="flex-[1.4] h-11 btn-primary rounded-lg flex items-center justify-center gap-1.5 shadow-wood-glow hover:shadow-wood-glow-lg text-xs font-bold uppercase tracking-tight px-2"
              >
                <ShoppingBag size={12} />
                <span className="whitespace-nowrap">В корзину</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  reachGoal(GOALS.PRODUCT_OPEN, {
                    id: product.id,
                    name: product.name,
                    source: 'quickview',
                  });
                  if (onOpenModal) onOpenModal(product);
                }}
                className="flex-1 h-11 bg-transparent text-wood-amber hover:bg-wood-amber/10 active:scale-95 transition-all duration-200 rounded-lg flex items-center justify-center gap-1.5 border border-wood-amber/40 hover:border-wood-amber text-xs font-bold uppercase tracking-tight px-2"
              >
                <span className="whitespace-nowrap">Подробнее</span>
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
