/**
 * ntfy.sh notifications — client-side push to a public topic.
 *
 * Used to deliver a "client card" when a customer registers and an order
 * card when a customer places an order. Fire-and-forget: a failed
 * notification must never break registration or checkout.
 *
 * Topic and server are configurable via env (defaults to ntfy.sh/ARBAREA).
 */

const NTFY_URL = (import.meta.env.VITE_NTFY_URL || 'https://ntfy.sh').replace(
  /\/+$/,
  '',
);
const NTFY_TOPIC = import.meta.env.VITE_NTFY_TOPIC || 'ARBAREA';

/**
 * Publish a message to the ntfy topic.
 * Title/Tags/Priority are ASCII-only headers (ntfy requirement); the human
 * readable Russian content goes in the UTF-8 body.
 */
export const sendNtfy = async ({ message, tags = [], priority, click }) => {
  try {
    const headers = { 'Content-Type': 'text/plain; charset=utf-8' };
    if (tags.length) headers.Tags = tags.join(',');
    if (priority) headers.Priority = String(priority);
    if (click) headers.Click = click;

    await fetch(`${NTFY_URL}/${NTFY_TOPIC}`, {
      method: 'POST',
      headers,
      body: message,
    });
    return true;
  } catch (error) {
    console.warn('ntfy notification failed:', error);
    return false;
  }
};

const formatDate = () =>
  new Date().toLocaleString('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

const attributionSource = (attribution) => {
  if (!attribution) return '';
  return (
    attribution.utm_source ||
    (attribution.yclid ? 'Яндекс.Директ (yclid)' : '') ||
    attribution.utm_medium ||
    ''
  );
};

/** Notify about a new registered client (customer card). */
export const notifyNewClient = ({
  name,
  phone,
  discount,
  attribution,
} = {}) => {
  const source = attributionSource(attribution);
  const lines = [
    '🆕 Новый клиент ARBAREA',
    `Имя: ${name || '—'}`,
    `Телефон: ${phone || '—'}`,
    `Скидка: ${discount ?? 10}%`,
    `Дата: ${formatDate()}`,
  ];
  if (source) lines.push(`Источник: ${source}`);

  return sendNtfy({
    tags: ['bust_in_silhouette', 'sparkles'],
    message: lines.join('\n'),
  });
};

/** Notify about a placed order. */
export const notifyNewOrder = ({
  orderId,
  name,
  phone,
  email,
  total,
  deliveryMethod,
  address,
  items = [],
  attribution,
} = {}) => {
  const itemsList =
    items.map((i) => `• ${i.name} ×${i.quantity || 1}`).join('\n') || '—';
  const source = attributionSource(attribution);

  const lines = ['🛒 Новый заказ ARBAREA'];
  if (orderId) lines.push(`Заказ: ${orderId}`);
  lines.push(`Клиент: ${name || '—'}`);
  lines.push(`Телефон: ${phone || '—'}`);
  if (email) lines.push(`Email: ${email}`);
  if (typeof total === 'number') {
    lines.push(`Сумма: ${total.toLocaleString('ru-RU')} ₽`);
  }
  lines.push(`Доставка: ${deliveryMethod || '—'}`);
  lines.push(`Адрес: ${address || '—'}`);
  lines.push(`Товары:\n${itemsList}`);
  if (source) lines.push(`Источник: ${source}`);

  return sendNtfy({
    tags: ['package', 'moneybag'],
    priority: 4,
    message: lines.join('\n'),
  });
};
