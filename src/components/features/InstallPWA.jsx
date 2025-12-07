import { Download, X, Share } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InstallPWA = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Определяем платформу
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Проверяем — уже установлено?
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      return; // Уже установлено, не показываем баннер
    }

    // Проверяем — пользователь отклонил ранее?
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // Не показываем 7 дней
      }
    }

    // Слушаем beforeinstallprompt (Android Chrome)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Показываем баннер через 5 секунд
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 5000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Обработка клика на кнопку "Установить"
  const handleInstall = async () => {
    if (isIOS) {
      // iOS — показываем инструкции
      setShowIOSInstructions(true);
      return;
    }

    if (deferredPrompt) {
      // Android — пытаемся вызвать системный диалог
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Ошибка установки:', error);
        // Если ошибка — показываем инструкцию
        setShowIOSInstructions(true);
      }
    } else {
      // Событие не сработало — показываем инструкцию вручную
      setShowIOSInstructions(true);
    }
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
        // Модал с инструкциями (работает для всех платформ)
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
                    <p className="leading-relaxed">
                      Чтобы добавить Arbarea на главный экран:
                    </p>
                    
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <span className="leading-relaxed">
                          Нажмите кнопку <Share className="inline w-4 h-4 text-blue-400 mx-1" /> <span className="text-blue-400 font-medium">Поделиться</span> внизу экрана Safari
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <span className="leading-relaxed">
                          Прокрутите меню и выберите <span className="font-bold text-white">"На экран Домой"</span>
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <span className="leading-relaxed">
                          Нажмите <span className="font-bold text-white">"Добавить"</span> в правом верхнем углу
                        </span>
                      </li>
                    </ol>
                  </>
                ) : (
                  // Android инструкции
                  <>
                    <p className="leading-relaxed">
                      Чтобы установить Arbarea:
                    </p>
                    
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <span className="leading-relaxed">
                          Нажмите <span className="font-bold text-white">⋮</span> (три точки) в правом верхнем углу браузера
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <span className="leading-relaxed">
                          Выберите <span className="font-bold text-white">"Установить приложение"</span> или <span className="font-bold text-white">"Добавить на главный экран"</span>
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <span className="leading-relaxed">
                          Нажмите <span className="font-bold text-white">"Установить"</span>
                        </span>
                      </li>
                    </ol>
                  </>
                )}

                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-amber-400 text-xs leading-relaxed">
                    ✨ После установки приложение будет работать быстрее и даже без интернета!
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
        // Баннер установки (внизу экрана)
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-[150] max-w-md mx-auto"
        >
          <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Декоративный градиент */}
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
                  <img 
                    src="/icons/icon-96x96.png" 
                    alt="Arbarea" 
                    className="w-10 h-10 rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <span className="text-white font-serif font-bold text-2xl hidden items-center justify-center">A</span>
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
                    className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-amber-500 active:scale-95 transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)]"
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
