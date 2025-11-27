import {
  Package,
  Truck,
  MapPin,
  FileText,
  Shield,
  Building2,
} from 'lucide-react';
import { motion } from 'framer-motion';

const LegalInfo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white pt-20 pb-24 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-stone-800 mb-3">О компании</h1>
          <p className="text-stone-500">Юридическая информация и условия</p>
        </motion.div>

        {/* Company Info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="text-emerald-600" size={24} />
            <h2 className="text-2xl font-bold text-stone-800">Реквизиты</h2>
          </div>
          <div className="space-y-3 text-stone-600">
            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-stone-100">
              <span className="font-medium text-stone-500">Наименование:</span>
              <span className="text-right">
                Индивидуальный предприниматель
                <br />
                ДМИТРИЧЕВ АЛЕКСАНДР ГЕННАДЬЕВИЧ
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-stone-100">
              <span className="font-medium text-stone-500">ИНН:</span>
              <span>520500573503</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium text-stone-500">
                Название магазина:
              </span>
              <span className="font-bold text-emerald-600">ARBAREA</span>
            </div>
          </div>
        </motion.section>

        {/* Delivery */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <Truck className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-stone-800">Доставка</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* СДЭК */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <Package size={20} className="text-green-600" />
                <h3 className="font-bold text-stone-800">СДЭК</h3>
              </div>
              <p className="text-sm text-stone-600 mb-2">
                Доставка до пункта выдачи или курьером
              </p>
              <p className="text-xs text-stone-500">Срок: 2-7 дней</p>
            </div>

            {/* Почта России */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={20} className="text-blue-600" />
                <h3 className="font-bold text-stone-800">Почта России</h3>
              </div>
              <p className="text-sm text-stone-600 mb-2">
                Доставка в любую точку России
              </p>
              <p className="text-xs text-stone-500">Срок: 5-14 дней</p>
            </div>

            {/* Boxberry */}
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Package size={20} className="text-purple-600" />
                <h3 className="font-bold text-stone-800">Boxberry</h3>
              </div>
              <p className="text-sm text-stone-600 mb-2">
                Пункты выдачи и постаматы
              </p>
              <p className="text-xs text-stone-500">Срок: 3-7 дней</p>
            </div>

            {/* Яндекс Доставка */}
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
              <div className="flex items-center gap-2 mb-2">
                <Truck size={20} className="text-orange-600" />
                <h3 className="font-bold text-stone-800">Яндекс Доставка</h3>
              </div>
              <p className="text-sm text-stone-600 mb-2">
                Быстрая курьерская доставка
              </p>
              <p className="text-xs text-stone-500">Срок: 1-3 дня</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-stone-50 rounded-xl">
            <p className="text-sm text-stone-600">
              <span className="font-semibold">Стоимость доставки</span>{' '}
              рассчитывается автоматически при оформлении заказа в зависимости
              от выбранного способа, веса товара и адреса доставки.
            </p>
          </div>
        </motion.section>

        {/* Public Offer */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-amber-600" size={24} />
            <h2 className="text-2xl font-bold text-stone-800">
              Публичная оферта
            </h2>
          </div>
          <div className="space-y-4 text-stone-600 text-sm">
            <div>
              <h3 className="font-semibold text-stone-800 mb-2">
                1. Оформление заказа
              </h3>
              <p>
                Покупатель оформляет заказ через корзину на сайте, указывая
                контактные данные и адрес доставки. Заказ считается принятым
                после получения подтверждения от продавца.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-stone-800 mb-2">2. Оплата</h3>
              <p>
                Оплата производится онлайн банковской картой, через Т-Pay или
                другими доступными способами. Все платежи защищены и проходят
                через безопасное соединение.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-stone-800 mb-2">
                3. Возврат товара
              </h3>
              <p>
                Возврат товара надлежащего качества возможен в течение 14 дней с
                момента получения. Товар должен сохранить товарный вид,
                потребительские свойства и документы.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-stone-800 mb-2">
                4. Разрешение претензий
              </h3>
              <p>
                Все претензии принимаются в письменном виде на электронную почту
                или через форму обратной связи. Срок рассмотрения — до 10
                рабочих дней.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Privacy Policy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-indigo-600" size={24} />
            <h2 className="text-2xl font-bold text-stone-800">
              Политика конфиденциальности
            </h2>
          </div>
          <div className="space-y-3 text-stone-600 text-sm">
            <p>
              Мы собираем и обрабатываем персональные данные (ФИО, адрес,
              телефон, email) исключительно для выполнения заказов и улучшения
              качества обслуживания.
            </p>
            <p>
              Ваши данные защищены и не передаются третьим лицам, за исключением
              служб доставки для выполнения заказа.
            </p>
            <p>
              Используя наш сайт, вы соглашаетесь с условиями обработки
              персональных данных в соответствии с ФЗ-152 "О персональных
              данных".
            </p>
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-xs text-indigo-800">
                <span className="font-semibold">Ваши права:</span> Вы можете
                запросить удаление или изменение ваших персональных данных в
                любое время, связавшись с нами.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100"
        >
          <p className="text-stone-600 mb-2">Остались вопросы?</p>
          <p className="text-sm text-stone-500">
            Свяжитесь с нами через AI-ассистента или форму обратной связи
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LegalInfo;
