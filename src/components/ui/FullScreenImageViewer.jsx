import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const FullScreenImageViewer = ({ images, initialIndex = 0, onClose }) => {
  const dialogRef = useRef(null);
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  // Lock body scroll and handle dialog
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    const handleCancel = (e) => {
      e.preventDefault();
      onClose();
    };

    dialog?.addEventListener('cancel', handleCancel);

    return () => {
      document.body.style.overflow = 'auto';
      dialog?.removeEventListener('cancel', handleCancel);
    };
  }, [onClose]);

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
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center touch-none w-full h-full border-none p-0 backdrop:bg-black/95"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full h-full flex flex-col items-center justify-center"
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

        {/* Main Image Container */}
        <div
          className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
          }}
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
          onKeyDown={(e) => e.stopPropagation()}
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
      </motion.div>
    </dialog>,
    document.body,
  );
};

export default FullScreenImageViewer;
