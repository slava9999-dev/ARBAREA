import { Download, X, Share } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Компонент установки PWA.
 * - Если событие `beforeinstallprompt` сработало – показываем системный диалог.
 * - Если событие не пришло (iOS, некоторые браузеры) – сразу показываем инструкцию.
 * - Баннер отображается в безопасной зоне нижней части экрана.
 */
const InstallPWA = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const deferredPromptRef = useRef(null);

  // Определяем платформу и проверяем, установлено ли приложение
  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      navigator.standalone === true;
    if (isStandalone) return; // уже установлен – ничего не делаем

    // Если пользователь отклонил баннер недавно, не показываем его
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const days = (Date.now() - Number(dismissed)) / (1000 * 60 * 60 * 24);
      if (days < 7) return;
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Фолбэк: если событие не пришло в течение 5 сек – показываем инструкцию сразу
    const fallbackTimer = setTimeout(() => {
      if (!deferredPromptRef.current) {
        setShowInstructions(true);
        setShowBanner(true);
      }
    }, 5000);

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    // iOS – нет системного диалога
    if (isIOS) {
      setShowInstructions(true);
      return;
    }

    const prompt = deferredPromptRef.current;
    if (!prompt) {
      setShowInstructions(true);
      return;
    }

    try {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
    } catch (err) {
      console.error('PWA install error:', err);
      setShowInstructions(true);
    } finally {
      deferredPromptRef.current = null;
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowInstructions(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      {showInstructions ? (
        // Модальное окно с инструкциями (универсальное)
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
                  // iOS инструкции
                  <>
                    <p>Чтобы добавить Arbarea на главный экран:</p>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <span>Нажмите кнопку <Share className="inline w-4 h-4 text-blue-400 mx-1" /> <span className="text-blue-400 font-medium">Поделиться</span> внизу экрана Safari</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <span>Прокрутите меню и выберите <span className="font-bold text-white">"На экран Домой"</span></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <span>Нажмите <span className="font-bold text-white">"Добавить"</span></span>
                      </li>
                    </ol>
                  </>
                ) : (
                  // Android инструкции
                  <>
                    <p>Чтобы установить Arbarea:</p>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <span>Нажмите <span className="font-bold text-white">⋮</span> (три точки) в правом верхнем углу браузера</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <span>Выберите <span className="font-bold text-white">"Установить приложение"</span> или <span className="font-bold text-white">"Добавить на главный экран"</span></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <span>Нажмите <span className="font-bold text-white">"Установить"</span></span>
                      </li>
                    </ol>
                  </>
                )}
                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-amber-400 text-xs leading-relaxed">✨ После установки приложение будет работать быстрее и даже без интернета!</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full mt-6 bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-5 transition-all"
              >
                Понятно
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        // Баннер внизу экрана
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-[150] max-w-md mx-auto safe-area-inset-bottom"
        >
          <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none" />
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1.5 hover:bg-white/5 rounded-full transition-colors"
            >
              <X className="text-stone-400" size={16} />
            </button>
            <div className="p-4 flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                <img src="/icons/icon-96x96.png" alt="Arbarea" className="w-10 h-10 rounded-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-serif font-bold text-white text-base mb-1">Установить Arbarea</h4>
                <p className="text-stone-400 text-xs mb-3">Добавьте приложение на главный экран для быстрого доступа</p>
                <button
                  type="button"
                  onClick={handleInstall}
                  className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-amber-500 active:scale-95 transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)]"
                >
                  <Download size={16} />
                  {isIOS ? 'Как установить' : 'Установить'}
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
