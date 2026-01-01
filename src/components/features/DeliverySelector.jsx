import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, X, Check, ChevronRight, Clock, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Delivery services configuration
const DELIVERY_SERVICES = [
  {
    id: 'cdek',
    name: 'СДЭК',
    logo: '📦',
    color: '#00A651',
    description: 'ПВЗ и постаматы',
    basePrice: 350,
    days: '2-5',
  },
  {
    id: 'wildberries',
    name: 'Wildberries',
    logo: '🟣',
    color: '#CB11AB',
    description: 'Пункты выдачи WB',
    basePrice: 0,
    days: '1-3',
  },
  {
    id: 'ozon',
    name: 'Ozon',
    logo: '🔵',
    color: '#005BFF',
    description: 'ПВЗ и постаматы',
    basePrice: 0,
    days: '1-4',
  },
  {
    id: 'boxberry',
    name: 'Boxberry',
    logo: '🟢',
    color: '#FF6600',
    description: 'Пункты выдачи',
    basePrice: 300,
    days: '3-7',
  },
  {
    id: 'pochta',
    name: 'Почта России',
    logo: '📮',
    color: '#0033A0',
    description: 'Отделения почты',
    basePrice: 400,
    days: '5-14',
  },
  {
    id: 'courier',
    name: 'Курьер до двери',
    logo: '🏠',
    color: '#D97706',
    description: 'Доставка на дом',
    basePrice: 600,
    days: '1-3',
  },
];

// Custom marker icons for each service
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Map center controller component
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13, { animate: true });
    }
  }, [center, map]);
  return null;
};

// Mock pickup points generator (in production, fetch from real APIs)
const generateMockPickupPoints = (center, serviceId, count = 15) => {
  const points = [];
  const service = DELIVERY_SERVICES.find(s => s.id === serviceId);
  
  for (let i = 0; i < count; i++) {
    const latOffset = (Math.random() - 0.5) * 0.08;
    const lngOffset = (Math.random() - 0.5) * 0.08;
    
    points.push({
      id: `${serviceId}-${i}`,
      serviceId,
      name: `${service.name} ПВЗ #${1000 + i}`,
      address: `ул. ${['Ленина', 'Пушкина', 'Гагарина', 'Мира', 'Советская'][i % 5]}, ${10 + i}`,
      lat: center[0] + latOffset,
      lng: center[1] + lngOffset,
      workHours: '09:00 - 21:00',
      phone: '+7 (800) 555-35-35',
      hasCard: Math.random() > 0.3,
      hasFitting: serviceId === 'wildberries' || serviceId === 'ozon',
    });
  }
  
  return points;
};

const DeliverySelector = ({ isOpen, onClose, onSelect, isFreeShipping = false }) => {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [mapCenter, setMapCenter] = useState([55.7558, 37.6173]); // Moscow default
  const [pickupPoints, setPickupPoints] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [step, setStep] = useState('service'); // service, map, confirm

  // Geocode address
  const geocodeAddress = useCallback(async (address) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&accept-language=ru`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Get user's geolocation
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          
          // Reverse geocode to get address
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ru`
            );
            const data = await response.json();
            if (data.display_name) {
              setUserAddress(data.display_name.split(',').slice(0, 3).join(','));
            }
          } catch (error) {
            console.error('Reverse geocoding error:', error);
          }
        },
        (error) => console.error('Geolocation error:', error)
      );
    }
  }, []);

  // Load pickup points when service or center changes
  useEffect(() => {
    if (selectedService && step === 'map') {
      const points = generateMockPickupPoints(mapCenter, selectedService.id);
      setPickupPoints(points);
    }
  }, [selectedService, mapCenter, step]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    if (service.id === 'courier') {
      // For courier delivery, skip map selection
      setStep('confirm');
    } else {
      setStep('map');
      getUserLocation();
    }
  };

  const handlePointSelect = (point) => {
    setSelectedPoint(point);
    setStep('confirm');
  };

  const handleConfirm = () => {
    const deliveryData = {
      service: selectedService,
      point: selectedPoint,
      address: selectedPoint?.address || userAddress,
      price: isFreeShipping ? 0 : selectedService.basePrice,
    };
    onSelect(deliveryData);
    onClose();
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep(selectedService?.id === 'courier' ? 'service' : 'map');
      setSelectedPoint(null);
    } else if (step === 'map') {
      setStep('service');
      setSelectedService(null);
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
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-[#1c1917] w-full sm:w-[500px] h-[90vh] sm:h-[85vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col border border-white/10"
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
                  <ChevronRight className="text-stone-400 rotate-180" size={20} />
                </button>
              )}
              <div>
                <h3 className="font-serif font-bold text-lg text-white">
                  {step === 'service' && 'Выберите способ доставки'}
                  {step === 'map' && `Пункты ${selectedService?.name}`}
                  {step === 'confirm' && 'Подтвердите выбор'}
                </h3>
                {isFreeShipping && (
                  <p className="text-xs text-emerald-400">✨ Бесплатная доставка для вас</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <X className="text-stone-400" size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Step 1: Service Selection */}
            {step === 'service' && (
              <div className="p-4 space-y-3">
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
                        <p className="text-xs text-stone-500">{service.description}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-stone-400 flex items-center gap-1">
                            <Clock size={10} /> {service.days} дн.
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${isFreeShipping ? 'text-emerald-400' : 'text-amber-500'}`}>
                        {isFreeShipping ? '0 ₽' : `${service.basePrice} ₽`}
                      </p>
                      {isFreeShipping && service.basePrice > 0 && (
                        <p className="text-[10px] text-stone-500 line-through">{service.basePrice} ₽</p>
                      )}
                      <ChevronRight className="text-stone-600 group-hover:text-stone-400 ml-auto mt-1" size={16} />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Map Selection */}
            {step === 'map' && selectedService && (
              <div className="h-full flex flex-col">
                {/* Search Bar */}
                <div className="p-4 border-b border-white/5">
                  <div className="relative">
                    <input
                      type="text"
                      value={userAddress}
                      onChange={(e) => setUserAddress(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && geocodeAddress(userAddress)}
                      placeholder="Введите ваш адрес или город..."
                      className="w-full p-3 pl-10 pr-12 bg-stone-800/50 border border-white/10 rounded-xl text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                    <button
                      type="button"
                      onClick={getUserLocation}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-amber-500 hover:text-amber-400"
                      title="Определить местоположение"
                    >
                      <Navigation size={18} />
                    </button>
                  </div>
                  {isSearching && (
                    <p className="text-xs text-stone-500 mt-2">Поиск адреса...</p>
                  )}
                </div>

                {/* Map */}
                <div className="flex-1 relative">
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapController center={mapCenter} />
                    
                    {pickupPoints.map((point) => (
                      <Marker
                        key={point.id}
                        position={[point.lat, point.lng]}
                        icon={createCustomIcon(selectedService.color)}
                        eventHandlers={{
                          click: () => handlePointSelect(point),
                        }}
                      >
                        <Popup>
                          <div className="p-2 min-w-[200px]">
                            <p className="font-bold text-sm">{point.name}</p>
                            <p className="text-xs text-gray-600">{point.address}</p>
                            <p className="text-xs text-gray-500 mt-1">🕐 {point.workHours}</p>
                            <div className="flex gap-2 mt-2">
                              {point.hasCard && (
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded">💳 Оплата картой</span>
                              )}
                              {point.hasFitting && (
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">👔 Примерка</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handlePointSelect(point)}
                              className="w-full mt-3 bg-amber-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-amber-600"
                            >
                              Выбрать этот пункт
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>

                  {/* Points count badge */}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full z-[1000]">
                    <MapPin size={12} className="inline mr-1" />
                    {pickupPoints.length} пунктов рядом
                  </div>
                </div>

                {/* Points List (collapsed) */}
                <div className="p-3 border-t border-white/5 bg-stone-900/50">
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-2">Ближайшие пункты</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {pickupPoints.slice(0, 5).map((point) => (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => handlePointSelect(point)}
                        className="flex-shrink-0 p-3 bg-stone-800/50 rounded-xl border border-white/5 text-left min-w-[180px] hover:border-amber-500/50 transition-colors"
                      >
                        <p className="text-xs font-bold text-white truncate">{point.name}</p>
                        <p className="text-[10px] text-stone-500 truncate">{point.address}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 'confirm' && selectedService && (
              <div className="p-6 space-y-6">
                {/* Selected Service */}
                <div className="p-4 bg-stone-800/30 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-3">Способ доставки</p>
                  <div className="flex items-center gap-4">
                    <span
                      className="text-3xl w-14 h-14 flex items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${selectedService.color}20` }}
                    >
                      {selectedService.logo}
                    </span>
                    <div>
                      <p className="font-bold text-white text-lg">{selectedService.name}</p>
                      <p className="text-xs text-stone-400">{selectedService.days} дней</p>
                    </div>
                  </div>
                </div>

                {/* Selected Point (if applicable) */}
                {selectedPoint && (
                  <div className="p-4 bg-stone-800/30 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-3">Пункт выдачи</p>
                    <div className="flex items-start gap-3">
                      <MapPin className="text-amber-500 shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="font-bold text-white">{selectedPoint.name}</p>
                        <p className="text-sm text-stone-400">{selectedPoint.address}</p>
                        <p className="text-xs text-stone-500 mt-1">🕐 {selectedPoint.workHours}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Courier Address Input */}
                {selectedService.id === 'courier' && (
                  <div className="p-4 bg-stone-800/30 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-3">Адрес доставки</p>
                    <div className="relative">
                      <textarea
                        value={userAddress}
                        onChange={(e) => setUserAddress(e.target.value)}
                        placeholder="Введите полный адрес доставки..."
                        rows={3}
                        className="w-full p-3 bg-stone-900/50 border border-white/10 rounded-xl text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none resize-none"
                      />
                      <button
                        type="button"
                        onClick={getUserLocation}
                        className="absolute right-3 bottom-3 text-amber-500 hover:text-amber-400"
                      >
                        <Navigation size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-stone-400">Стоимость доставки</p>
                      {isFreeShipping && selectedService.basePrice > 0 && (
                        <p className="text-xs text-stone-500 line-through">{selectedService.basePrice} ₽</p>
                      )}
                    </div>
                    <p className={`text-2xl font-bold ${isFreeShipping ? 'text-emerald-400' : 'text-amber-500'}`}>
                      {isFreeShipping ? '0 ₽' : `${selectedService.basePrice} ₽`}
                    </p>
                  </div>
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
                disabled={selectedService?.id === 'courier' && !userAddress}
                className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(217,119,6,0.3)]"
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
