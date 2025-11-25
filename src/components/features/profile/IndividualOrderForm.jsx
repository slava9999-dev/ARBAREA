import React, { useState, useRef } from 'react';
import { FileText, Upload, Check, ArrowRight, X } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { db, storage } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';

const IndividualOrderForm = () => {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        length: '',
        width: '',
        details: ''
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

    const sendTelegramNotification = async (orderData) => {
        try {
            const message = `
🔔 <b>Новая заявка на индивидуальный заказ!</b>

👤 <b>Клиент:</b> ${user.displayName || user.phoneNumber || user.email || 'Неизвестно'}
📧 <b>Email:</b> ${orderData.userEmail || 'Не указан'}
📱 <b>Телефон:</b> ${orderData.userPhone || 'Не указан'}

📝 <b>Описание:</b> ${orderData.description}
📏 <b>Размеры:</b> ${orderData.dimensions.length || '?'} x ${orderData.dimensions.width || '?'} см
💬 <b>Детали:</b> ${orderData.details || 'Не указаны'}

${orderData.fileUrl ? `📎 <b>Файл:</b> ${orderData.fileName}` : '📎 Файл не прикреплён'}

🔗 <b>ID заявки:</b> ${orderData.orderId}
            `.trim();

            const response = await fetch('/api/telegram-notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: message })
            });

            if (!response.ok) {
                console.error('Failed to send Telegram notification');
            }
        } catch (error) {
            console.error('Telegram notification error:', error);
            // Не прерываем процесс, если Telegram не работает
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
                const storageRef = ref(storage, `individual-orders/${user.uid}/${Date.now()}-${file.name}`);
                await uploadBytes(storageRef, file);
                fileUrl = await getDownloadURL(storageRef);
            }

            const orderId = `ORDER-${Date.now()}`;

            const orderData = {
                orderId,
                userId: user.uid,
                userEmail: user.email || '',
                userPhone: user.phoneNumber || '',
                description: formData.description,
                dimensions: {
                    length: formData.length,
                    width: formData.width
                },
                details: formData.details,
                fileUrl,
                fileName: file?.name || null,
                status: 'pending',
                createdAt: new Date()
            };

            // Сохранение заявки в Firestore
            await addDoc(collection(db, 'individual-orders'), orderData);

            // Отправка уведомления в Telegram
            await sendTelegramNotification(orderData);

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
        <div className="bg-white dark:bg-stone-800 p-5 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-700 mb-8">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center text-stone-600 dark:text-stone-300">
                    <FileText size={16} />
                </div>
                <h3 className="font-serif font-bold text-stone-800 dark:text-stone-100">Индивидуальный заказ</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    required
                    placeholder="Что будем создавать?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-4 bg-stone-50 dark:bg-stone-900 dark:text-stone-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary-300 transition-all"
                />

                <div className="flex gap-3">
                    <input
                        type="number"
                        placeholder="Длина (см)"
                        value={formData.length}
                        onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                        className="w-1/2 p-4 bg-stone-50 dark:bg-stone-900 dark:text-stone-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary-300 transition-all"
                    />
                    <input
                        type="number"
                        placeholder="Ширина (см)"
                        value={formData.width}
                        onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                        className="w-1/2 p-4 bg-stone-50 dark:bg-stone-900 dark:text-stone-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary-300 transition-all"
                    />
                </div>

                <textarea
                    placeholder="Опишите детали (материал, цвет, стиль)..."
                    rows={3}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    className="w-full p-4 bg-stone-50 dark:bg-stone-900 dark:text-stone-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary-300 transition-all resize-none"
                />

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div
                    onClick={!file ? handleFileClick : undefined}
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-colors ${file
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 cursor-pointer'
                        }`}
                >
                    {file ? (
                        <div className="w-full flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                                    <Check size={16} />
                                </div>
                                <div>
                                    <span className="text-xs text-green-700 dark:text-green-400 font-medium block">{file.name}</span>
                                    <span className="text-[10px] text-green-600 dark:text-green-500">{(file.size / 1024).toFixed(1)} KB</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={removeFile}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                            >
                                <X size={16} className="text-red-500" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Upload size={20} className="text-stone-400 mb-2" />
                            <span className="text-xs text-stone-400 dark:text-stone-500">Прикрепить эскиз или фото</span>
                            <span className="text-[10px] text-stone-300 dark:text-stone-600 mt-1">JPG, PNG, PDF (макс 10MB)</span>
                        </>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-stone-800 dark:bg-primary-600 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-700 dark:hover:bg-primary-500"
                >
                    {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                    {!isSubmitting && <ArrowRight size={16} />}
                </button>
            </form>
        </div>
    );
};

export default IndividualOrderForm;
