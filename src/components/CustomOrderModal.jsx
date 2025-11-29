import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Send, X } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { sendTelegramNotification } from '../lib/telegram';

const CustomOrderModal = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    description: '',
    contactMethod: 'telegram', // 'telegram' or 'whatsapp'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const message = `
<b>🔔 Новый Индивидуальный Заказ!</b>

👤 <b>Имя:</b> ${formData.name}
📞 <b>Телефон:</b> ${formData.phone}
💬 <b>Связь:</b> ${formData.contactMethod === 'telegram' ? 'Telegram' : 'WhatsApp'}

📝 <b>Описание идеи:</b>
<i>${formData.description}</i>

#custom_order #new
`;

      const result = await sendTelegramNotification(message);

      if (result.success !== false) {
        showToast('Заявка успешно отправлена!', 'success');
        onClose();
        setFormData({
          name: '',
          phone: '',
          description: '',
          contactMethod: 'telegram',
        });
      } else {
        throw new Error(result.error || 'Ошибка отправки');
      }
    } catch (error) {
      console.error('Error sending custom order:', error);
      showToast('Не удалось отправить заявку. Попробуйте позже.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-stone-100 dark:bg-stone-800 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-serif font-bold text-stone-800 dark:text-stone-100">
                Индивидуальный заказ
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-2 bg-white dark:bg-stone-700 rounded-full text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                Опишите вашу идею, и мы свяжемся с вами для обсуждения деталей и
                расчета стоимости.
              </p>

              <div>
                <label
                  htmlFor="order-name"
                  className="block text-xs font-bold uppercase text-stone-400 mb-1"
                >
                  Ваше имя
                </label>
                <input
                  id="order-name"
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-3 bg-stone-50 dark:bg-stone-800 rounded-xl outline-none border border-stone-200 dark:border-stone-700 focus:border-amber-500 dark:focus:border-amber-500 transition-colors text-stone-800 dark:text-stone-100"
                  placeholder="Иван Иванов"
                />
              </div>

              <div>
                <label
                  htmlFor="order-phone"
                  className="block text-xs font-bold uppercase text-stone-400 mb-1"
                >
                  Телефон
                </label>
                <input
                  id="order-phone"
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-3 bg-stone-50 dark:bg-stone-800 rounded-xl outline-none border border-stone-200 dark:border-stone-700 focus:border-amber-500 dark:focus:border-amber-500 transition-colors text-stone-800 dark:text-stone-100"
                  placeholder="+7 (999) 000-00-00"
                />
              </div>

              <div>
                <span className="block text-xs font-bold uppercase text-stone-400 mb-1">
                  Предпочтительный способ связи
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, contactMethod: 'telegram' })
                    }
                    className={`py-2 rounded-xl text-sm font-medium transition-all border ${
                      formData.contactMethod === 'telegram'
                        ? 'bg-[#229ED9]/10 border-[#229ED9] text-[#229ED9]'
                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500'
                    }`}
                  >
                    Telegram
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, contactMethod: 'whatsapp' })
                    }
                    className={`py-2 rounded-xl text-sm font-medium transition-all border ${
                      formData.contactMethod === 'whatsapp'
                        ? 'bg-[#25D366]/10 border-[#25D366] text-[#25D366]'
                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500'
                    }`}
                  >
                    WhatsApp
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="order-desc"
                  className="block text-xs font-bold uppercase text-stone-400 mb-1"
                >
                  Описание идеи
                </label>
                <textarea
                  id="order-desc"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-3 bg-stone-50 dark:bg-stone-800 rounded-xl outline-none border border-stone-200 dark:border-stone-700 focus:border-amber-500 dark:focus:border-amber-500 transition-colors text-stone-800 dark:text-stone-100 resize-none"
                  placeholder="Размеры, материалы, стиль..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 dark:hover:bg-white/90 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Отправить заявку <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CustomOrderModal;
