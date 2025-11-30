import { addDoc, collection } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { ArrowRight, Check, FileText, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db, storage } from '../../../lib/firebase';
import { sendTelegramNotification } from '../../../lib/telegram';

const IndividualOrderForm = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    length: '',
    width: '',
    details: '',
  });
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Проверка размера файла (макс 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('Файл слишком большой. Максимальный размер: 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendNotification = async (orderData) => {
    const escapeHtml = (text) => {
      if (!text) return '';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const message = `
🔔 <b>Новая заявка на индивидуальный заказ!</b>

👤 <b>Клиент:</b> ${escapeHtml(user.displayName || user.phoneNumber || user.email || 'Неизвестно')}
📧 <b>Email:</b> ${escapeHtml(orderData.userEmail || 'Не указан')}
📱 <b>Телефон:</b> ${escapeHtml(orderData.userPhone || 'Не указан')}

📝 <b>Описание:</b> ${escapeHtml(orderData.description)}
📏 <b>Размеры:</b> ${escapeHtml(orderData.dimensions.length || '?')} x ${escapeHtml(orderData.dimensions.width || '?')} см
💬 <b>Детали:</b> ${escapeHtml(orderData.details || 'Не указаны')}

${orderData.fileUrl ? `📎 <b>Файл:</b> ${escapeHtml(orderData.fileName)}` : '📎 Файл не прикреплён'}

🔗 <b>ID заявки:</b> ${orderData.orderId}
        `.trim();

    try {
      const result = await sendTelegramNotification(message);
      console.log('Telegram notification result:', result);
      
      if (result && result.ok === false) {
        throw new Error(result.description || 'Telegram API error');
      }
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
      // Не прерываем процесс, но логируем ошибку
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Войдите в аккаунт для отправки заявки');
      return;
    }

    setIsSubmitting(true);

    try {
      let fileUrl = null;

      // Загрузка файла в Firebase Storage
      if (file) {
        const storageRef = ref(
          storage,
          `individual-orders/${user.uid}/${Date.now()}-${file.name}`,
        );
        await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(storageRef);
      }

      const orderId = `ORDER-${Date.now()}`;

      const formDataObj = new FormData(e.target);
      const userName = formDataObj.get('userName');
      const userPhone = formDataObj.get('userPhone');

      const orderData = {
        orderId,
        userId: user.uid,
        userEmail: user.email || '',
        userName: userName || user.displayName || 'Не указано',
        userPhone: userPhone || user.phoneNumber || 'Не указано',
        description: formData.description,
        dimensions: {
          length: formData.length,
          width: formData.width,
        },
        details: formData.details,
        fileUrl,
        fileName: file?.name || null,
        status: 'pending',
        createdAt: new Date(),
      };

      // Сохранение заявки в Firestore
      await addDoc(collection(db, 'individual-orders'), orderData);

      // Отправка уведомления в Telegram
      await handleSendNotification(orderData);

      alert('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');

      // Очистка формы
      setFormData({ description: '', length: '', width: '', details: '' });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Ошибка при отправке заявки. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-stone-800 p-5 rounded-3xl shadow-sm border border-stone-700 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center text-stone-600 dark:text-stone-300">
          <FileText size={16} />
        </div>
        <h3 className="font-serif font-bold text-stone-800 dark:text-stone-100">
          Индивидуальный заказ
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact Info */}
        <div className="grid grid-cols-1 gap-4">
           <div className="space-y-1">
            <label htmlFor="userName" className="text-xs text-stone-500 dark:text-stone-400 ml-1 font-medium">Ваше имя</label>
            <input
              id="userName"
              required
              placeholder="Как к вам обращаться?"
              defaultValue={user?.displayName || ''}
              name="userName"
              className="w-full p-4 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl text-sm outline-none border border-transparent focus:border-amber-500 transition-all"
            />
          </div>
           <div className="space-y-1">
            <label htmlFor="userPhone" className="text-xs text-stone-500 dark:text-stone-400 ml-1 font-medium">Телефон для связи</label>
            <input
              id="userPhone"
              required
              type="tel"
              placeholder="+7 (999) 000-00-00"
              defaultValue={user?.phoneNumber || ''}
              name="userPhone"
              className="w-full p-4 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl text-sm outline-none border border-transparent focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
            <label htmlFor="description" className="text-xs text-stone-500 dark:text-stone-400 ml-1 font-medium">Что будем создавать?</label>
            <input
              id="description"
              required
              placeholder="Например: Обеденный стол из дуба"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-4 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl text-sm outline-none border border-transparent focus:border-amber-500 transition-all"
            />
        </div>

        <div className="flex gap-3">
          <div className="w-1/2 space-y-1">
            <label htmlFor="length" className="text-xs text-stone-500 dark:text-stone-400 ml-1 font-medium">Длина (см)</label>
            <input
                id="length"
                type="number"
                placeholder="0"
                value={formData.length}
                onChange={(e) =>
                setFormData({ ...formData, length: e.target.value })
                }
                className="w-full p-4 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl text-sm outline-none border border-transparent focus:border-amber-500 transition-all"
            />
          </div>
          <div className="w-1/2 space-y-1">
            <label htmlFor="width" className="text-xs text-stone-500 dark:text-stone-400 ml-1 font-medium">Ширина (см)</label>
            <input
                id="width"
                type="number"
                placeholder="0"
                value={formData.width}
                onChange={(e) =>
                setFormData({ ...formData, width: e.target.value })
                }
                className="w-full p-4 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl text-sm outline-none border border-transparent focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
            <label htmlFor="details" className="text-xs text-stone-500 dark:text-stone-400 ml-1 font-medium">Детали и пожелания</label>
            <textarea
              id="details"
              placeholder="Опишите желаемый цвет, материал, стиль и другие важные детали..."
              rows={4}
              value={formData.details}
              onChange={(e) =>
                setFormData({ ...formData, details: e.target.value })
              }
              className="w-full p-4 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl text-sm outline-none border border-transparent focus:border-amber-500 transition-all resize-none"
            />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={!file ? handleFileClick : undefined}
          className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all group ${
            file
              ? 'border-green-500/50 bg-green-50/50 dark:bg-green-900/10'
              : 'border-stone-200 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer'
          }`}
        >
          {file ? (
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center shadow-sm">
                  <Check size={20} />
                </div>
                <div className="text-left">
                  <span className="text-sm text-stone-800 dark:text-stone-200 font-medium block truncate max-w-[150px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors text-stone-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload size={24} className="text-stone-400 group-hover:text-amber-500 transition-colors" />
              </div>
              <span className="text-sm font-medium text-stone-600 dark:text-stone-300">
                Прикрепить эскиз или фото
              </span>
              <span className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                JPG, PNG, PDF (макс 10MB)
              </span>
            </>
          )}
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-500 shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)]"
        >
          {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
          {!isSubmitting && <ArrowRight size={20} />}
        </button>
      </form>
    </div>
  );
};

export default IndividualOrderForm;
