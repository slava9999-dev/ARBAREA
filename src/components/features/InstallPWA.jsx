import { Download, X, Share } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Компонент установки PWA.
 * Гарантирует обратную связь пользователю:
 * 1. Пытается вызвать нативный промпт.
 * 2. Если браузер или ОС блокирует (или уже отклонено) - показывает ручную инструкцию.
 */
const InstallPWA = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const deferredPromptRef = useRef(null);

  useEffect(() => {
    // 1. Платформа
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // 2. Уже установлено?
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      navigator.standalone === true;
    
    if (isStandalone) {
      console.log('App is already installed');
      return; 
    }

    // 3. Слушаем событие браузера
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setShowBanner(true); // Показываем баннер, так как установка возможна
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 4. Таймер для случаев, когда событие не приходит (iOS, Desktop Manual, Samsung Internet иногда)
    // Показываем баннер все равно, чтобы кнопка была доступна. При нажатии разберемся.
    const fallbackTimer = setTimeout(() => {
      if (!deferredPromptRef.current) {
        setShowBanner(true);
      }
    }, 4000);

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    // A. iOS - всегда инструкция
    if (isIOS) {
      setShowInstructions(true);
      return;
    }

    // B. Android - пробуем нативно
    const prompt = deferredPromptRef.current;
    if (prompt) {
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        
        if (outcome === 'accepted') {
          setShowBanner(false);
        } else {
          console.log('User dismissed install prompt');
        }
      } catch (err) {
        console.error('Install failed:', err);
        // Если нативный вызов упал (редко, но бывает) -> показываем инструкцию
        setShowInstructions(true);
      } finally {
        deferredPromptRef.current = null;
      }
    } else {
      // C. Android без промпта (событие не пришло или заблокировано) -> Инструкция
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowInstructions(false);
    // Не сохраняем отказ, чтобы при рефреше можно было попробовать снова (удобнее для юзера)
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      {showInstructions ? (
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
                  {isIOS ? 'Установка на iPhone' : 'Как установить'}
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
                {isIOS ? (
                  <>
                    <p>Нажмите "Поделиться" и выберите "На экран Домой":</p>
                    <ol className="space-y-3">
                      <li className="flex items-center gap-3"><Share size={16} className="text-blue-400" /> 1. Нажмите "Поделиться"</li>
                      <li className="flex items-center gap-3"><span className="font-bold text-white">+</span> 2. "На экран Домой"</li>
                      <li className="flex items-center gap-3"><span className="font-bold text-white">Add</span> 3. Нажмите "Добавить"</li>
                    </ol>
                  </>
                ) : (
                  <>
                    <p>Добавьте через меню браузера:</p>
                    <ol className="space-y-3">
                      <li className="flex items-center gap-3"><span className="font-bold text-white">⋮</span> 1. Нажмите меню (три точки)</li>
                      <li className="flex items-center gap-3"><Download size={16} className="text-green-400" /> 2. "Установить приложение"</li>
                      <li className="flex items-center gap-3"><span className="text-stone-400 text-xs">(Или "Добавить на гл. экран")</span></li>
                    </ol>
                  </>
                )}
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
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-[150] max-w-md mx-auto safe-area-inset-bottom"
        >
          <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1.5 hover:bg-white/5 rounded-full transition-colors z-10"
            >
              <X className="text-stone-400" size={16} />
            </button>
            <div className="p-4 flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                 {/* Fallback Icon */}
                 <span className="text-white font-bold text-xl">A</span> 
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-sm mb-0.5">Установить приложение</h4>
                <p className="text-stone-400 text-[10px] leading-tight mb-2">Работает быстрее и оффлайн</p>
                <button
                  type="button"
                  onClick={handleInstall}
                  className="bg-white text-stone-900 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-stone-200 transition-colors shadow-sm"
                >
                  Установить
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPWA;
