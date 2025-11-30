import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
        
        // Sort client-side to avoid needing a composite index immediately
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
    };
    return statusMap[status] || status;
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-stone-800 p-5 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-700 mb-8">
        <p className="text-center text-stone-500 dark:text-stone-400 text-sm">
          Войдите в аккаунт, чтобы увидеть историю заказов
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-stone-800 p-5 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-700 mb-8">
        <p className="text-center text-stone-500 dark:text-stone-400 text-sm">
          Загрузка...
        </p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white dark:bg-stone-800 p-5 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-700 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center text-stone-600 dark:text-stone-300">
            <Package size={16} />
          </div>
          <h3 className="font-serif font-bold text-stone-800 dark:text-stone-100">
            История заказов
          </h3>
        </div>
        <p className="text-center text-stone-500 dark:text-stone-400 text-sm">
          У вас пока нет заказов
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stone-800 p-5 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-700 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center text-stone-600 dark:text-stone-300">
          <Package size={16} />
        </div>
        <h3 className="font-serif font-bold text-stone-800 dark:text-stone-100">
          История заказов
        </h3>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-4 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-700"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-sm text-stone-800 dark:text-stone-100">
                  {order.orderId}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {order.createdAt?.toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon(order.status)}
                <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>

            <div className="space-y-1 mb-2">
              {order.items?.map((item, index) => (
                <p
                  key={`${order.id}-item-${index}`}
                  className="text-xs text-stone-600 dark:text-stone-400"
                >
                  {item.name} x{item.quantity} -{' '}
                  {(item.price * item.quantity).toLocaleString()} ₽
                </p>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-stone-200 dark:border-stone-700">
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Итого:
              </span>
              <span className="font-bold text-sm text-stone-800 dark:text-stone-100">
                {order.total?.toLocaleString()} ₽
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
