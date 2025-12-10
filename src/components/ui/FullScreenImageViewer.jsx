import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const FullScreenImageViewer = ({ images, initialIndex = 0, onClose }) => {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleNext = (e) => {
    e?.stopPropagation();
    setIndex((prev) => (prev + 1) % images.length);
    setScale(1);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setIndex((prev) => (prev - 1 + images.length) % images.length);
    setScale(1);
  };

  const currentImage = images[index];

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center touch-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 z-50 flex gap-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-2 bg-white/10 rounded-full text-white backdrop-blur-md active:bg-white/20"
        >
          <X size={24} />
        </button>
      </div>

      <div className="absolute top-4 left-4 z-50 text-white font-mono text-sm">
        {index + 1} / {images.length}
      </div>

      {/* Main Image */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <motion.img
          key={index}
          src={currentImage}
          alt={`Full screen view ${index + 1}`}
          className="max-w-full max-h-full object-contain"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: scale }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          drag
          dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
          dragElastic={0.1}
          onDragEnd={(_e, { offset, velocity }) => {
            const swipe = Math.abs(offset.x) * velocity.x;
            if (swipe < -100) {
              handleNext();
            } else if (swipe > 100) {
              handlePrev();
            }
          }}
        />
      </div>

      {/* Footer / Navigation */}
      <div 
        className="absolute bottom-10 inset-x-0 flex items-center justify-center gap-8 z-50"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="p-3 bg-white/10 rounded-full text-white backdrop-blur-md active:bg-white/20"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-3 bg-white/10 rounded-full text-white backdrop-blur-md active:bg-white/20"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}
      </div>
    </motion.div>,
    document.body
  );
};

export default FullScreenImageViewer;
