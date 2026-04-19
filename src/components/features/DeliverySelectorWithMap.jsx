import { useState, useEffect, useCallback, Suspense } from 'react';
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
  Package,
} from 'lucide-react';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon (required for Vite/Webpack bundling)
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// biome-ignore lint/performance/noDelete: Leaflet internals require this
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// ═══════════════════════════════════════════════════════════════
// PRODUCTION-READY DELIVERY SERVICES
// ═══════════════════════════════════════════════════════════════

const DELIVERY_SERVICES = [
  // === ТРАНСПОРТНЫЕ КОМПАНИИ ===
  {
    id: 'cdek',
    name: 'СДЭК',
    logo: '📦',
    color: '#00A651',
    description: '15,000+ ПВЗ по всей России',
    basePrice: 0,
    days: '2-5',
    category: 'transport',
    popular: true,
    hasPickupPoints: true,
    hasAPI: true,
  },
  {
    id: 'boxberry',
    name: 'Boxberry',
    logo: '🟠',
    color: '#FF6600',
    description: '10,000+ пунктов выдачи',
    basePrice: 0,
    days: '3-7',
    category: 'transport',
    popular: true,
    hasPickupPoints: true,
    hasAPI: true,
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
    hasPickupPoints: true,
    hasAPI: true,
  },
  // === ПОЧТА РОССИИ ===
  {
    id: 'pochta',
    name: 'Почта России',
    logo: '📮',
    color: '#0033A0',
    description: '42,000+ отделений по всей России',
    basePrice: 0,
    days: '5-14',
    category: 'post',
    hasPickupPoints: true,
    hasAPI: true,
  },
  // === АВИТО ДОСТАВКА ===
  {
    id: 'avito',
    name: 'Авито Доставка',
    logo: '🔵',
    color: '#00AAFF',
    description: 'Удобно для покупателей Авито',
    basePrice: 0,
    days: '3-7',
    category: 'avito',
    hasPickupPoints: true,
    note: 'Использует СДЭК внутри',
  },
  // === КУРЬЕРСКАЯ ДОСТАВКА ===
  {
    id: 'courier',
    name: 'Курьер до двери',
    logo: '🏠',
    color: '#D97706',
    description: 'Доставка на ваш адрес',
    basePrice: 0,
    days: '1-3',
    category: 'courier',
    hasPickupPoints: false, // No pickup points, direct delivery
    hasAPI: false,
  },
];

// Категории для группировки
const CATEGORIES = {
  transport: { name: '🚚 Транспортные компании', order: 1 },
  post: { name: '📮 Почта России', order: 2 },
  avito: { name: '📱 Авито Доставка', order: 3 },
  courier: { name: '🏠 Курьерская доставка', order: 4 },
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
  initialAddress = '',
  cartTotal = 0,
}) => {
  const [selectedService, setSelectedService] = useState(null);
  const [address, setAddress] = useState(initialAddress);
  const [city, setCity] = useState('');
  const [step, setStep] = useState('service'); // service, map, confirm
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([55.7558, 37.6173]); // Москва по умолчанию
  const [showMap, setShowMap] = useState(false);
  const [mapKey, setMapKey] = useState(() => Date.now()); // Unique key for map remount
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Fetch Points from API
  const fetchPoints = useCallback(
    async (lat, lng, code) => {
      if (selectedService?.id !== 'cdek') return;

      setIsLoadingPoints(true);
      try {
        let url = `/api/cdek?action=points`;
        if (code) url += `&city=${code}`;
        else url += `&lat=${lat}&lng=${lng}`;

        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
          setPoints(data.points || []);
        }
      } catch (e) {
        console.error('Failed to fetch delivery points:', e);
      } finally {
        setIsLoadingPoints(false);
      }
    },
    [selectedService],
  );

  // Reset map when service changes
  useEffect(() => {
    if (step === 'map' && selectedService) {
      setIsMapReady(false);
      const timer = setTimeout(() => {
        setMapKey(Date.now());
        setIsMapReady(true);
        setShowMap(true);
        // If we have coordinates, fetch points
        if (mapCenter) fetchPoints(mapCenter[0], mapCenter[1]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [step, selectedService, mapCenter, fetchPoints]);

  // Debounced search
  const handleSearch = useCallback(
    async (query) => {
      if (query.length < 3) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        if (selectedService?.id === 'cdek') {
          const response = await fetch(
            `/api/cdek?action=cities&query=${encodeURIComponent(query)}`,
          );
          const data = await response.json();
          if (data.success) {
            setSearchResults(
              data.cities.map((c) => ({
                display_name: c.fullName,
                lat: null,
                lng: null,
                cityCode: c.code,
                source: 'cdek',
              })),
            );
          }
        } else {
          const results = await geocodeAddress(query);
          setSearchResults(results.map((r) => ({ ...r, source: 'osm' })));
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsSearching(false);
      }
    },
    [selectedService],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsMapReady(false);
      setShowMap(false);
    };
  }, []);

  // Sync initialAddress when it changes (only if address is empty)
  useEffect(() => {
    if (initialAddress) {
      setAddress((prev) => prev || initialAddress);
    }
  }, [initialAddress]);

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
      setStep('confirm');
    }
  };

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
    // Используем адрес из формы корзины (initialAddress) или введённый адрес
    const finalAddress = address || initialAddress || 'Адрес будет уточнён';
    const deliveryData = {
      service: selectedService,
      address: finalAddress,
      city: city || finalAddress.split(',')[0] || '',
      fullAddress: finalAddress,
      price: 0, // Всегда бесплатно
      coordinates: selectedLocation
        ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
        : null,
    };
    onSelect(deliveryData);
    onClose();
  };

  const handleBack = () => {
    // Из подтверждения возвращаемся к выбору сервиса
    setStep('service');
    setSelectedService(null);
    setShowMap(false);
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
        className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={resetAndClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-wood-bg-card w-full sm:w-[500px] max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col border border-wood-amber/20 shadow-wood-glow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-wood-amber/10 shrink-0 flex items-center justify-between bg-gradient-to-r from-wood-amber/10 to-transparent">
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
                <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                  <Package size={20} className="text-amber-500" />
                  {step === 'service' && 'Выберите доставку'}
                  {step === 'map' && 'Укажите адрес'}
                  {step === 'address' && 'Укажите адрес'}
                  {step === 'confirm' && 'Подтвердите'}
                </h3>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  ✨ Доставка бесплатно
                </p>
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
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
            {/* Step 1: Service Selection with Categories */}
            {step === 'service' && (
              <div className="p-4 space-y-6">
                {sortedCategories.map(([category, services]) => (
                  <div key={category}>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                      {CATEGORIES[category]?.name || category}
                    </p>
                    <div className="space-y-2">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleServiceSelect(service)}
                          className="w-full flex items-center justify-between p-4 bg-wood-bg-elevated/50 hover:bg-wood-bg-elevated rounded-2xl border border-wood-amber/10 hover:border-wood-amber/40 transition-all group shadow-sm hover:shadow-wood-sm"
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
                                {service.hasAPI && (
                                  <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">
                                    🤖 Авто
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-500">
                                {service.description}
                              </p>
                              {service.note && (
                                <p className="text-[10px] text-stone-600 mt-0.5">
                                  {service.note}
                                </p>
                              )}
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
                            <p className="font-bold text-emerald-400 text-lg">
                              Бесплатно
                            </p>
                            <ChevronRight
                              className="text-stone-600 group-hover:text-amber-500 ml-auto mt-1 transition-colors"
                              size={16}
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Info Banner */}
                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <p className="text-xs text-blue-300 flex items-start gap-2">
                    <Truck size={14} className="shrink-0 mt-0.5" />
                    После оплаты мы отправим ваш заказ в выбранный пункт и
                    пришлём трек-номер для отслеживания
                  </p>
                </div>
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
                      {selectedService.days} дней • Бесплатно
                    </p>
                  </div>
                </div>

                {/* Search Box */}
                <div className="p-4 space-y-3">
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-wood-text-secondary"
                      size={18}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Введите ваш адрес..."
                      className="w-full pl-12 pr-12 py-3 bg-wood-bg-elevated border border-wood-amber/20 rounded-xl text-wood-text-primary placeholder-wood-text-secondary focus:border-wood-amber focus:outline-none focus:shadow-wood-glow-sm"
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
                    <div className="bg-stone-800/80 rounded-xl border border-white/10 overflow-hidden max-h-[200px] overflow-y-auto custom-scrollbar">
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
                    {showMap && isMapReady && (
                      <MapContainer
                        key={`map-${mapKey}`}
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
                      className="w-full mt-3 btn-primary text-base font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                    >
                      Продолжить
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2 Alt: Simple Address Input (for services without pickup points) */}
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
                      {selectedService.days} дней • Бесплатно
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
                    Полный адрес
                  </label>
                  <textarea
                    id="delivery-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="ул. Ленина 15, кв. 42"
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
                      {address ||
                        initialAddress ||
                        'Адрес будет указан в форме заказа'}
                    </p>
                  </div>
                </div>

                {/* Итоговая сумма */}
                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-stone-400">Сумма товаров</p>
                      <p className="text-lg font-bold text-white">
                        {cartTotal.toLocaleString()} ₽
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-stone-400">Доставка</p>
                      <p className="text-lg font-bold text-emerald-400">
                        Бесплатно
                      </p>
                    </div>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-white">
                        Итого к оплате
                      </p>
                      <p className="text-2xl font-bold text-gradient-amber">
                        {cartTotal.toLocaleString()} ₽
                      </p>
                    </div>
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
            <div className="p-4 pb-10 sm:pb-4 border-t border-white/5 shrink-0">
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full btn-primary text-base font-bold py-4 rounded-xl flex items-center justify-center gap-2"
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
