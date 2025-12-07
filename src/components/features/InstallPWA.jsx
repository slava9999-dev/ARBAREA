import { Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      return; // Already installed
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // Don't show for 7 days after dismissal
      }
    }

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 10 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
    };

    // Listen for custom event from HeroBanner button
    const customHandler = () => {
      if (deferredPrompt) {
        handleInstall();
      } else {
        setShowPrompt(true);
        if (iOS) {
          setShowIOSInstructions(true);
        }
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('show-pwa-install', customHandler);

    // For iOS, show instructions after 10 seconds
    if (iOS) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('show-pwa-install', customHandler);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // iOS - show instructions
      setShowIOSInstructions(true);
      return;
    }

    // Android/Desktop
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      {showIOSInstructions ? (
        // iOS Instructions Modal
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1c1917] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-serif font-bold text-white">
                  Установка на iPhone
                </h3>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="p-1 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="text-stone-400" size={20} />
                </button>
              </div>

              <div className="space-y-4 text-stone-300 text-sm">
                <p className="leading-relaxed">
                  Чтобы добавить Arbarea на главный экран:
                </p>
                
                <ol className="space-y-3 list-decimal list-inside">
                  <li className="leading-relaxed">
                    Нажмите кнопку <span className="inline-flex items-center px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded font-medium">Поделиться</span> внизу экрана
                  </li>
                  <li className="leading-relaxed">
                    Прокрутите вниз и выберите <span className="font-bold text-white">"На экран Домой"</span>
                  </li>
                  <li className="leading-relaxed">
                    Нажмите <span className="font-bold text-white">"Добавить"</span>
                  </li>
                </ol>

                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-amber-400 text-xs leading-relaxed">
                    После установки приложение будет работать как обычное приложение с иконкой на рабочем столе!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full mt-6 bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-500 transition-all"
              >
                Понятно
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        // Install Prompt Banner
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-[150] max-w-md mx-auto"
        >
          <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative p-4">
              <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1.5 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="text-stone-400" size={16} />
              </button>

              <div className="flex items-start gap-4 pr-6">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-serif font-bold text-2xl">A</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-bold text-white text-base mb-1">
                    Установить Arbarea
                  </h4>
                  <p className="text-stone-400 text-xs leading-relaxed mb-3">
                    Добавьте приложение на главный экран для быстрого доступа
                  </p>

                  <button
                    type="button"
                    onClick={handleInstall}
                    className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-amber-500 transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)]"
                  >
                    <Download size={16} />
                    {isIOS ? 'Как установить' : 'Установить'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPWA;
