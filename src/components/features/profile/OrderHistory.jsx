import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { CheckCircle, Clock, Package, Truck, XCircle, MapPin, Copy, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';

// Order status progression
const ORDER_STEPS = [
  { key: 'paid', label: 'Оплачен', icon: CheckCircle },
  { key: 'processing', label: 'Собирается', icon: Package },
  { key: 'shipped', label: 'Отправлен', icon: Truck },
  { key: 'delivered', label: 'Доставлен', icon: MapPin },
];

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        }));
        
        ordersData.sort((a, b) => b.createdAt - a.createdAt);
        
        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const getStatusIndex = (status) => {
    const index = ORDER_STEPS.findIndex(s => s.key === status);
    return index >= 0 ? index : -1;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_payment':
        return <Clock size={16} className="text-yellow-500" />;
      case 'paid':
      case 'processing':
        return <Package size={16} className="text-blue-500" />;
      case 'shipped':
        return <Truck size={16} className="text-purple-500" />;
      case 'delivered':
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'cancelled':
      case 'payment_failed':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending_payment: 'Ожидает оплаты',
      paid: 'Оплачен',
      processing: 'В обработке',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      completed: 'Завершён',
      cancelled: 'Отменён',
      payment_failed: 'Ошибка оплаты',
      refunded: 'Возврат',
    };
    return statusMap[status] || status;
  };

  const copyOrderId = (orderId) => {
    navigator.clipboard.writeText(orderId);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!user) {
    return (
      <div className="bg-stone-800 p-5 rounded-3xl shadow-sm border border-stone-700 mb-8">
        <p className="text-center text-stone-400 text-sm">
          Войдите в аккаунт, чтобы увидеть историю заказов
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-stone-800 p-5 rounded-3xl shadow-sm border border-stone-700 mb-8">
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Загрузка заказов...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-stone-800 p-5 rounded-3xl shadow-sm border border-stone-700 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-stone-700 rounded-full flex items-center justify-center text-stone-300">
            <Package size={16} />
          </div>
          <h3 className="font-serif font-bold text-stone-100">
            История заказов
          </h3>
        </div>
        <p className="text-center text-stone-400 text-sm">
          У вас пока нет заказов
        </p>
      </div>
    );
  }

  return (
    <div className="bg-stone-800 p-5 rounded-3xl shadow-sm border border-stone-700 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-stone-700 rounded-full flex items-center justify-center text-stone-300">
          <Package size={16} />
        </div>
        <h3 className="font-serif font-bold text-stone-100">
          История заказов
        </h3>
        <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
          {orders.length} {orders.length === 1 ? 'заказ' : orders.length < 5 ? 'заказа' : 'заказов'}
        </span>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const statusIndex = getStatusIndex(order.status);
          const isActiveOrder = statusIndex >= 0 && statusIndex < ORDER_STEPS.length - 1;
          
          return (
            <div
              key={order.id}
              className="p-4 bg-stone-900 rounded-2xl border border-stone-700"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <button
                    type="button"
                    onClick={() => copyOrderId(order.orderId)}
                    className="flex items-center gap-1.5 text-sm font-bold text-stone-100 hover:text-amber-400 transition-colors"
                  >
                    {order.orderId}
                    <Copy size={12} className={copiedId === order.orderId ? 'text-green-400' : 'text-stone-500'} />
                  </button>
                  <p className="text-xs text-stone-500">
                    {order.createdAt?.toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-stone-800 px-2 py-1 rounded-full">
                  {getStatusIcon(order.status)}
                  <span className="text-xs font-medium text-stone-300">
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              {/* Progress Bar (for active orders) */}
              {isActiveOrder && (
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    {ORDER_STEPS.map((step, index) => {
                      const isComplete = index <= statusIndex;
                      const isCurrent = index === statusIndex;
                      const StepIcon = step.icon;
                      
                      return (
                        <div
                          key={step.key}
                          className={`flex flex-col items-center flex-1 ${index > 0 ? 'ml-2' : ''}`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              isComplete
                                ? isCurrent
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-green-500 text-white'
                                : 'bg-stone-700 text-stone-500'
                            }`}
                          >
                            <StepIcon size={12} />
                          </div>
                          <span className={`text-[9px] mt-1 ${isComplete ? 'text-stone-300' : 'text-stone-600'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="h-1 bg-stone-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-amber-500 transition-all duration-500"
                      style={{ width: `${((statusIndex + 1) / ORDER_STEPS.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Delivery Info */}
              {order.deliveryMethod && (
                <div className="mb-3 p-2 bg-stone-800/50 rounded-xl flex items-center gap-2">
                  <MapPin size={14} className="text-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-stone-300 truncate">{order.deliveryMethod}</p>
                    <p className="text-[10px] text-stone-500 truncate">{order.deliveryAddress || 'Адрес не указан'}</p>
                  </div>
                  {order.trackingNumber && (
                    <a
                      href={`https://www.cdek.ru/tracking?order_id=${order.trackingNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-amber-500 hover:text-amber-400"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              )}

              {/* Items */}
              <div className="space-y-1 mb-3">
                {order.items?.slice(0, 2).map((item, index) => (
                  <p
                    key={`${order.id}-item-${index}`}
                    className="text-xs text-stone-400"
                  >
                    {item.name} x{item.quantity} — {(item.price * item.quantity).toLocaleString()} ₽
                  </p>
                ))}
                {order.items?.length > 2 && (
                  <p className="text-xs text-stone-500">
                    и еще {order.items.length - 2} товар(ов)...
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-3 border-t border-stone-700">
                <span className="text-xs text-stone-500">
                  {order.shipping === 0 ? '🎁 Бесплатная доставка' : `Доставка: ${order.shipping?.toLocaleString()} ₽`}
                </span>
                <span className="font-bold text-amber-500">
                  {order.total?.toLocaleString()} ₽
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistory;
