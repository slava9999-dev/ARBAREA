export const COLORS = {
  bronze: { name: 'Бронза', hex: '#CD7F32', class: 'bg-[#CD7F32]' },
  chrome: { name: 'Хром', hex: '#E5E7EB', class: 'bg-gray-300' },
  black: { name: 'Черный', hex: '#1F2937', class: 'bg-stone-800' },
};

export const SIZES = ['60 см', '80 см', '100 см'];

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELED: 'canceled',
};

export const CURRENCY = 'RUB';

export const NOTIFICATION_TYPES = {
  ORDER_NEW: 'order_new',
  ORDER_STATUS: 'order_status',
  PAYMENT_SUCCESS: 'payment_success',
};
