import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Check, ChevronRight, Clock, Truck } from 'lucide-react';

// Доступные службы доставки — ВСЕ БЕСПЛАТНО
const DELIVERY_SERVICES = [
  // === ТРАНСПОРТНЫЕ КОМПАНИИ ===
  {
    id: 'cdek',
    name: 'СДЭК',
    logo: '📦',
    color: '#00A651',
    description: 'Пункты выдачи и постаматы',
    basePrice: 0,
    days: '2-5',
    category: 'transport',
    popular: true,
  },
  {
    id: 'boxberry',
    name: 'Boxberry',
    logo: '�',
    color: '#FF6600',
    description: 'Пункты выдачи по России',
    basePrice: 0,
    days: '3-7',
    category: 'transport',
    popular: true,
  },
  {
    id: '5post',
    name: '5Post',
    logo: '🟡',
    color: '#FFD600',
    description: 'Постаматы в Пятёрочке',
    basePrice: 0,
    days: '3-6',
    category: 'transport',
  },
  // === КУРЬЕРСКАЯ ДОСТАВКА ===
  {
    id: 'courier',
    name: 'Курьер до двери',
    logo: '🏠',
    color: '#D97706',
    description: 'Доставка на дом',
    basePrice: 0,
    days: '1-3',
    category: 'courier',
  },
  // === ПОЧТА ===
  {
    id: 'pochta',
    name: 'Почта России',
    logo: '📮',
    color: '#0033A0',
    description: 'Отделения почты',
    basePrice: 0,
    days: '5-14',
    category: 'post',
  },
];

const DeliverySelector = ({
  isOpen,
  onClose,
  onSelect,
  isFreeShipping = false,
}) => {
  const [selectedService, setSelectedService] = useState(null);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [step, setStep] = useState('service'); // service, address, confirm

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setStep('address');
  };

  const handleAddressSubmit = () => {
    if (address.trim() && city.trim()) {
      setStep('confirm');
    }
  };

  const handleConfirm = () => {
    const deliveryData = {
      service: selectedService,
      address: `${city}, ${address}`,
      city,
      fullAddress: address,
      price: isFreeShipping ? 0 : selectedService.basePrice,
    };
    onSelect(deliveryData);
    onClose();
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('address');
    } else if (step === 'address') {
      setStep('service');
      setSelectedService(null);
    }
  };

  const resetAndClose = () => {
    setStep('service');
    setSelectedService(null);
    setAddress('');
    setCity('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={resetAndClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-[#1c1917] w-full sm:w-[450px] max-h-[85vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/5 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step !== 'service' && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <ChevronRight
                    className="text-stone-400 rotate-180"
                    size={20}
                  />
                </button>
              )}
              <div>
                <h3 className="font-serif font-bold text-lg text-white">
                  {step === 'service' && 'Выберите доставку'}
                  {step === 'address' && 'Укажите адрес'}
                  {step === 'confirm' && 'Подтвердите'}
                </h3>
                {isFreeShipping && (
                  <p className="text-xs text-emerald-400">
                    ✨ Бесплатная доставка для вас
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={resetAndClose}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <X className="text-stone-400" size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Step 1: Service Selection */}
            {step === 'service' && (
              <div className="space-y-3">
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-4">
                  Доступные службы доставки
                </p>
                {DELIVERY_SERVICES.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceSelect(service)}
                    className="w-full flex items-center justify-between p-4 bg-stone-800/30 hover:bg-stone-800/50 rounded-2xl border border-white/5 hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="text-2xl w-12 h-12 flex items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${service.color}20` }}
                      >
                        {service.logo}
                      </span>
                      <div className="text-left">
                        <p className="font-bold text-white">{service.name}</p>
                        <p className="text-xs text-stone-500">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-stone-400 flex items-center gap-1">
                            <Clock size={10} /> {service.days} дн.
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${isFreeShipping ? 'text-emerald-400' : 'text-amber-500'}`}
                      >
                        {isFreeShipping ? '0 ₽' : `${service.basePrice} ₽`}
                      </p>
                      {isFreeShipping && service.basePrice > 0 && (
                        <p className="text-[10px] text-stone-500 line-through">
                          {service.basePrice} ₽
                        </p>
                      )}
                      <ChevronRight
                        className="text-stone-600 group-hover:text-stone-400 ml-auto mt-1"
                        size={16}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Address Input */}
            {step === 'address' && selectedService && (
              <div className="space-y-4">
                <div className="p-3 bg-stone-800/30 rounded-xl flex items-center gap-3 mb-4">
                  <span
                    className="text-xl w-10 h-10 flex items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${selectedService.color}20` }}
                  >
                    {selectedService.logo}
                  </span>
                  <div>
                    <p className="font-bold text-white text-sm">
                      {selectedService.name}
                    </p>
                    <p className="text-xs text-stone-500">
                      {selectedService.days} дней
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="delivery-city"
                    className="text-xs text-stone-400 ml-1"
                  >
                    Город
                  </label>
                  <input
                    id="delivery-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Москва"
                    className="w-full p-4 bg-stone-800/50 border border-white/10 rounded-xl text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="delivery-address"
                    className="text-xs text-stone-400 ml-1"
                  >
                    {selectedService.id === 'courier'
                      ? 'Полный адрес доставки'
                      : 'Адрес (улица, дом, квартира)'}
                  </label>
                  <textarea
                    id="delivery-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={
                      selectedService.id === 'courier'
                        ? 'ул. Ленина 15, кв. 42, домофон 42#'
                        : 'ул. Ленина 15 (ближайший ПВЗ найду сам)'
                    }
                    rows={3}
                    className="w-full p-4 bg-stone-800/50 border border-white/10 rounded-xl text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none resize-none"
                  />
                </div>

                {selectedService.id !== 'courier' && (
                  <p className="text-xs text-stone-500 bg-stone-800/30 p-3 rounded-lg">
                    💡 Мы найдём ближайший пункт выдачи {selectedService.name} к
                    вашему адресу и отправим трек-номер в SMS/Telegram
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleAddressSubmit}
                  disabled={!address.trim() || !city.trim()}
                  className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors mt-4"
                >
                  Продолжить
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 'confirm' && selectedService && (
              <div className="space-y-4">
                <div className="p-4 bg-stone-800/30 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-3">
                    Способ доставки
                  </p>
                  <div className="flex items-center gap-4">
                    <span
                      className="text-3xl w-14 h-14 flex items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${selectedService.color}20` }}
                    >
                      {selectedService.logo}
                    </span>
                    <div>
                      <p className="font-bold text-white text-lg">
                        {selectedService.name}
                      </p>
                      <p className="text-xs text-stone-400">
                        {selectedService.days} дней
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-stone-800/30 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-3">
                    Адрес доставки
                  </p>
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="text-amber-500 shrink-0 mt-0.5"
                      size={20}
                    />
                    <div>
                      <p className="font-bold text-white">{city}</p>
                      <p className="text-sm text-stone-400">{address}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-stone-400">
                        Стоимость доставки
                      </p>
                      {isFreeShipping && selectedService.basePrice > 0 && (
                        <p className="text-xs text-stone-500 line-through">
                          {selectedService.basePrice} ₽
                        </p>
                      )}
                    </div>
                    <p
                      className={`text-2xl font-bold ${isFreeShipping ? 'text-emerald-400' : 'text-amber-500'}`}
                    >
                      {isFreeShipping
                        ? '0 ₽'
                        : `${selectedService.basePrice} ₽`}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <p className="text-xs text-blue-300 flex items-start gap-2">
                    <Truck size={14} className="shrink-0 mt-0.5" />
                    После оплаты мы отправим ваш заказ и пришлём трек-номер для
                    отслеживания
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Confirm Button */}
          {step === 'confirm' && (
            <div className="p-4 border-t border-white/5 shrink-0">
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(217,119,6,0.3)]"
              >
                <Check size={20} />
                Подтвердить доставку
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeliverySelector;
