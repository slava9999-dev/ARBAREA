import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  X,
  Check,
  ChevronRight,
  Clock,
  Truck,
  Search,
  Navigation,
  Loader2,
} from 'lucide-react';

// Lazy load map components for performance
const MapContainer = lazy(() =>
  import('react-leaflet').then((m) => ({ default: m.MapContainer })),
);
const TileLayer = lazy(() =>
  import('react-leaflet').then((m) => ({ default: m.TileLayer })),
);
const Marker = lazy(() =>
  import('react-leaflet').then((m) => ({ default: m.Marker })),
);
const Popup = lazy(() =>
  import('react-leaflet').then((m) => ({ default: m.Popup })),
);

// Доступные службы доставки — ВСЕ БЕСПЛАТНО
const DELIVERY_SERVICES = [
  // === МАРКЕТПЛЕЙСЫ ===
  {
    id: 'wildberries',
    name: 'Wildberries',
    logo: '🟣',
    color: '#7B2D8E',
    description: 'В любой ПВЗ Wildberries',
    basePrice: 0, // БЕСПЛАТНО
    days: '3-7',
    category: 'marketplace',
    popular: true,
    hasPickupPoints: true,
  },
  {
    id: 'ozon',
    name: 'Ozon',
    logo: '🔵',
    color: '#005BFF',
    description: 'В любой ПВЗ Ozon',
    basePrice: 0, // БЕСПЛАТНО
    days: '2-5',
    category: 'marketplace',
    popular: true,
    hasPickupPoints: true,
  },
  // === ТРАНСПОРТНЫЕ КОМПАНИИ ===
  {
    id: 'cdek',
    name: 'СДЭК',
    logo: '📦',
    color: '#00A651',
    description: 'Пункты выдачи и постаматы',
    basePrice: 0, // БЕСПЛАТНО
    days: '2-5',
    category: 'transport',
    popular: true,
    hasPickupPoints: true,
  },
  {
    id: 'boxberry',
    name: 'Boxberry',
    logo: '🟢',
    color: '#FF6600',
    description: 'Пункты выдачи по России',
    basePrice: 0, // БЕСПЛАТНО
    days: '3-7',
    category: 'transport',
    hasPickupPoints: true,
  },
  {
    id: 'dpd',
    name: 'DPD',
    logo: '🔴',
    color: '#DC0032',
    description: 'Экспресс-доставка',
    basePrice: 0, // БЕСПЛАТНО
    days: '2-4',
    category: 'transport',
  },
  {
    id: '5post',
    name: '5Post',
    logo: '🟡',
    color: '#FFD600',
    description: 'Постаматы в Пятёрочке',
    basePrice: 0, // БЕСПЛАТНО
    days: '3-6',
    category: 'transport',
    hasPickupPoints: true,
  },
  // === КУРЬЕРСКИЕ СЛУЖБЫ ===
  {
    id: 'yandex',
    name: 'Яндекс.Доставка',
    logo: '🚕',
    color: '#FFCC00',
    description: 'Быстрая доставка от 1 часа',
    basePrice: 0, // БЕСПЛАТНО
    days: '1',
    category: 'courier',
    fast: true,
  },
  {
    id: 'courier',
    name: 'Курьер до двери',
    logo: '🏠',
    color: '#D97706',
    description: 'Доставка на дом',
    basePrice: 0, // БЕСПЛАТНО
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
    basePrice: 0, // БЕСПЛАТНО
    days: '5-14',
    category: 'post',
    hasPickupPoints: true,
  },
];

// Категории для группировки (ВСЕ БЕСПЛАТНО)
const CATEGORIES = {
  marketplace: { name: '🎁 Маркетплейсы', order: 1 },
  transport: { name: '🚚 Транспортные компании', order: 2 },
  courier: { name: '🏃 Курьерская доставка', order: 3 },
  post: { name: '📮 Почта России', order: 4 },
};

// Geocoding через OpenStreetMap (бесплатно)
const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=ru&limit=5`,
    );
    const data = await response.json();
    return data.map((item) => ({
      display_name: item.display_name,
      lat: Number.parseFloat(item.lat),
      lng: Number.parseFloat(item.lon),
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
};

const DeliverySelectorWithMap = ({
  isOpen,
  onClose,
  onSelect,
  isFreeShipping = false,
}) => {
  const [selectedService, setSelectedService] = useState(null);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [step, setStep] = useState('service'); // service, map, confirm
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([55.7558, 37.6173]); // Москва
  const [showMap, setShowMap] = useState(false);

  // Группируем сервисы по категориям
  const groupedServices = DELIVERY_SERVICES.reduce((acc, service) => {
    const category = service.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {});

  // Сортируем категории
  const sortedCategories = Object.entries(groupedServices).sort(
    (a, b) => (CATEGORIES[a[0]]?.order || 99) - (CATEGORIES[b[0]]?.order || 99),
  );

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    if (service.hasPickupPoints) {
      setStep('map');
      setShowMap(true);
    } else {
      setStep('address');
    }
  };

  // Debounced search
  const handleSearch = useCallback(async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results = await geocodeAddress(query);
    setSearchResults(results);
    setIsSearching(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setMapCenter([location.lat, location.lng]);
    setAddress(location.display_name);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleAddressSubmit = () => {
    if (address.trim()) {
      setStep('confirm');
    }
  };

  const handleConfirm = () => {
    const deliveryData = {
      service: selectedService,
      address: selectedLocation?.display_name || `${city}, ${address}`,
      city: city || selectedLocation?.display_name?.split(',')[0] || '',
      fullAddress: address,
      price: isFreeShipping ? 0 : selectedService.basePrice,
      coordinates: selectedLocation
        ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
        : null,
    };
    onSelect(deliveryData);
    onClose();
  };

  const handleBack = () => {
    if (step === 'confirm') {
      if (selectedService?.hasPickupPoints) {
        setStep('map');
      } else {
        setStep('address');
      }
    } else if (step === 'map' || step === 'address') {
      setStep('service');
      setSelectedService(null);
      setShowMap(false);
    }
  };

  const resetAndClose = () => {
    setStep('service');
    setSelectedService(null);
    setAddress('');
    setCity('');
    setShowMap(false);
    setSelectedLocation(null);
    onClose();
  };

  // Geolocation
  const handleGetMyLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);

          // Reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            );
            const data = await response.json();
            if (data.display_name) {
              setSelectedLocation({
                display_name: data.display_name,
                lat: latitude,
                lng: longitude,
              });
              setAddress(data.display_name);
            }
          } catch (error) {
            console.error('Reverse geocoding error:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
      );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={resetAndClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-[#1c1917] w-full sm:w-[500px] max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col border border-white/10"
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
                  {step === 'map' && 'Укажите адрес на карте'}
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
          <div className="flex-1 overflow-y-auto">
            {/* Step 1: Service Selection with Categories */}
            {step === 'service' && (
              <div className="p-4 space-y-6">
                {sortedCategories.map(([category, services]) => (
                  <div key={category}>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-3">
                      {CATEGORIES[category]?.name || category}
                    </p>
                    <div className="space-y-2">
                      {services.map((service) => (
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
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-white">
                                  {service.name}
                                </p>
                                {service.popular && (
                                  <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">
                                    ⭐ Популярное
                                  </span>
                                )}
                                {service.fast && (
                                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                                    ⚡ Быстро
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-500">
                                {service.description}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] text-stone-400 flex items-center gap-1">
                                  <Clock size={10} /> {service.days} дн.
                                </span>
                                {service.hasPickupPoints && (
                                  <span className="text-[10px] text-blue-400 flex items-center gap-1">
                                    <MapPin size={10} /> Пункты выдачи
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-bold ${service.basePrice === 0 ? 'text-emerald-400' : isFreeShipping ? 'text-emerald-400' : 'text-amber-500'}`}
                            >
                              {service.basePrice === 0
                                ? 'Бесплатно'
                                : isFreeShipping
                                  ? '0 ₽'
                                  : `${service.basePrice} ₽`}
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
                  </div>
                ))}
              </div>
            )}

            {/* Step 2: Map with Address Search */}
            {step === 'map' && selectedService && (
              <div className="flex flex-col h-full">
                {/* Selected Service Badge */}
                <div className="p-3 bg-stone-800/50 border-b border-white/5 flex items-center gap-3">
                  <span
                    className="text-xl w-10 h-10 flex items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${selectedService.color}20` }}
                  >
                    {selectedService.logo}
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">
                      {selectedService.name}
                    </p>
                    <p className="text-xs text-stone-500">
                      {selectedService.days} дней
                    </p>
                  </div>
                  <p
                    className={`font-bold ${selectedService.basePrice === 0 ? 'text-emerald-400' : 'text-amber-500'}`}
                  >
                    {selectedService.basePrice === 0
                      ? 'Бесплатно'
                      : `${selectedService.basePrice} ₽`}
                  </p>
                </div>

                {/* Search Box */}
                <div className="p-4 space-y-3">
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500"
                      size={18}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Введите ваш адрес..."
                      className="w-full pl-12 pr-12 py-3 bg-stone-800/50 border border-white/10 rounded-xl text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                    {isSearching && (
                      <Loader2
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 animate-spin"
                        size={18}
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleGetMyLocation}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Navigation size={16} />
                    Определить моё местоположение
                  </button>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="bg-stone-800/80 rounded-xl border border-white/10 overflow-hidden">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.lat}-${result.lng}`}
                          type="button"
                          onClick={() => handleLocationSelect(result)}
                          className="w-full flex items-start gap-3 p-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-b-0"
                        >
                          <MapPin
                            className="text-amber-500 shrink-0 mt-0.5"
                            size={16}
                          />
                          <p className="text-sm text-white line-clamp-2">
                            {result.display_name}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Map */}
                <div className="flex-1 min-h-[250px] relative">
                  <Suspense
                    fallback={
                      <div className="absolute inset-0 flex items-center justify-center bg-stone-900">
                        <Loader2
                          className="text-amber-500 animate-spin"
                          size={32}
                        />
                      </div>
                    }
                  >
                    {showMap && (
                      <MapContainer
                        center={mapCenter}
                        zoom={14}
                        style={{ height: '100%', width: '100%' }}
                        className="z-0"
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {selectedLocation && (
                          <Marker
                            position={[
                              selectedLocation.lat,
                              selectedLocation.lng,
                            ]}
                          >
                            <Popup>
                              <div className="text-sm">
                                <p className="font-bold">Ваш адрес</p>
                                <p className="text-xs text-gray-600">
                                  {selectedLocation.display_name}
                                </p>
                              </div>
                            </Popup>
                          </Marker>
                        )}
                      </MapContainer>
                    )}
                  </Suspense>

                  {/* Info overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-stone-900/90 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <p className="text-xs text-stone-400">
                      💡 Укажите ваш адрес — мы отправим заказ в ближайший пункт{' '}
                      {selectedService.name} и пришлём трек-номер
                    </p>
                  </div>
                </div>

                {/* Selected Address */}
                {selectedLocation && (
                  <div className="p-4 border-t border-white/5">
                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-start gap-3">
                      <Check className="text-emerald-400 shrink-0" size={18} />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">
                          Адрес выбран
                        </p>
                        <p className="text-xs text-stone-400 line-clamp-2">
                          {selectedLocation.display_name}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('confirm')}
                      className="w-full mt-3 bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      Продолжить
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2 Alt: Simple Address Input (for courier/services without pickup points) */}
            {step === 'address' && selectedService && (
              <div className="p-4 space-y-4">
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
                    Полный адрес доставки
                  </label>
                  <textarea
                    id="delivery-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="ул. Ленина 15, кв. 42, домофон 42#"
                    rows={3}
                    className="w-full p-4 bg-stone-800/50 border border-white/10 rounded-xl text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none resize-none"
                  />
                </div>

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
              <div className="p-4 space-y-4">
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
                    <p className="text-sm text-white">
                      {selectedLocation?.display_name || `${city}, ${address}`}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-stone-400">
                        Стоимость доставки
                      </p>
                      {(isFreeShipping || selectedService.basePrice === 0) &&
                        selectedService.basePrice > 0 && (
                          <p className="text-xs text-stone-500 line-through">
                            {selectedService.basePrice} ₽
                          </p>
                        )}
                    </div>
                    <p
                      className={`text-2xl font-bold ${selectedService.basePrice === 0 || isFreeShipping ? 'text-emerald-400' : 'text-amber-500'}`}
                    >
                      {selectedService.basePrice === 0 || isFreeShipping
                        ? 'Бесплатно'
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

export default DeliverySelectorWithMap;
