import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { useState } from 'react';

const ProductCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [direction, setDirection] = useState(0);

  // Объединяем видео и изображения, если видео есть
  // Но пока лучше видео показывать отдельной иконкой или первым слайдом?
  // В текущем дизайне видео показывается иконкой. Оставим так.
  // Этот компонент только для изображений.

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 5000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    let newIndex = currentIndex + newDirection;
    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;
    setCurrentIndex(newIndex);
  };

  const openLightbox = (e) => {
    e.stopPropagation(); // Чтобы не сработал флип
    setIsLightboxOpen(true);
  };

  return (
    <>
      <div className="relative w-full h-full bg-stone-200 dark:bg-stone-800 overflow-hidden group/carousel touch-pan-x">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 200, damping: 25 },
              opacity: { duration: 0.15 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
            onDragStart={(e) => e.stopPropagation()}
            onDragEnd={(_e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute w-full h-full object-cover select-none"
            alt={`Slide ${currentIndex + 1}`}
            style={{ touchAction: 'pan-x' }}
          />
        </AnimatePresence>

        {/* Навигация (стрелки) - видны при ховере */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-black/50 rounded-full opacity-70 hover:opacity-100 transition-opacity z-10"
              onClick={(e) => {
                e.stopPropagation();
                paginate(-1);
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-black/50 rounded-full opacity-70 hover:opacity-100 transition-opacity z-10"
              onClick={(e) => {
                e.stopPropagation();
                paginate(1);
              }}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Индикаторы */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, idx) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: index is stable for indicators
                key={`indicator-${idx}`}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}

        {/* Кнопка увеличения */}
        <button
          type="button"
          onClick={openLightbox}
          className="absolute top-3 right-3 p-1.5 bg-black/30 backdrop-blur rounded-full text-white opacity-70 hover:opacity-100 transition-opacity z-10 hover:bg-black/50"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-white p-2 z-50"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X size={32} />
            </button>

            <button
              type="button"
              className="w-full h-full flex items-center justify-center relative bg-transparent border-none p-0 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence initial={false} custom={direction}>
                <motion.img
                  key={currentIndex}
                  src={images[currentIndex]}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(_e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);
                    if (swipe < -swipeConfidenceThreshold) paginate(1);
                    else if (swipe > swipeConfidenceThreshold) paginate(-1);
                  }}
                  className="absolute max-w-full max-h-full object-contain"
                />
              </AnimatePresence>

              {/* Навигация в лайтбоксе */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/75 hover:text-white z-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      paginate(-1);
                    }}
                  >
                    <ChevronLeft size={40} />
                  </button>
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/75 hover:text-white z-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      paginate(1);
                    }}
                  >
                    <ChevronRight size={40} />
                  </button>
                </>
              )}
            </button>

            {/* Индикаторы в лайтбоксе */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
              {images.map((_, idx) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: index is stable for indicators
                  key={`lightbox-indicator-${idx}`}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCarousel;
