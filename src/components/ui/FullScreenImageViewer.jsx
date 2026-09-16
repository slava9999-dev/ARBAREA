import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { haptic } from '../../lib/haptics';
import { project, spring } from '../../lib/motion';

const FullScreenImageViewer = ({ images, initialIndex = 0, onClose }) => {
  const dialogRef = useRef(null);
  const [index, setIndex] = useState(initialIndex);

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
    haptic(8);
    setIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    haptic(8);
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImage = images[index];

  return createPortal(
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center touch-none w-full h-full border-none p-0 backdrop:bg-black/95"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
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
          onKeyDown={(e) => e.stopPropagation()}
          role="presentation"
        >
          <motion.img
            key={index}
            src={currentImage}
            alt={`Full screen view ${index + 1}`}
            className="max-w-full max-h-full object-contain"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring.ui}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            dragMomentum={false}
            onDragEnd={(_e, { offset, velocity }) => {
              // Momentum projection decides the landing, not the release
              // point: offset + where the flick is still heading.
              const projected = offset.x + project(velocity.x);
              const threshold = window.innerWidth * 0.2;
              if (projected < -threshold) {
                handleNext();
              } else if (projected > threshold) {
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
