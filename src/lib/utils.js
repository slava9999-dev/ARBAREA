import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx
 * @param {...(string|object|array)} inputs - Class names to merge
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in Russian Rubles
 * @param {number} price - Price in rubles
 * @param {boolean} showCurrency - Whether to show currency symbol
 * @returns {string} Formatted price string
 */
export function formatPrice(price, showCurrency = true) {
  if (typeof price !== 'number' || Number.isNaN(price)) {
    return showCurrency ? '0 ₽' : '0';
  }

  const formatted = new Intl.NumberFormat('ru-RU', {
    style: showCurrency ? 'currency' : 'decimal',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return formatted;
}

/**
 * Generate a unique order ID
 * @param {string} prefix - Prefix for the order ID (default: 'ARB')
 * @returns {string} Unique order ID
 */
export function generateOrderId(prefix = 'ARB') {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate Russian phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Whether phone is valid
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // Russian phone: 10 digits (without country code) or 11 (with 7/8)
  return (
    digits.length === 10 ||
    (digits.length === 11 && (digits[0] === '7' || digits[0] === '8'))
  );
}

/**
 * Format phone number to E.164 format
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export function formatPhoneE164(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+7${digits}`;
  if (digits.length === 11 && digits[0] === '8') return `+7${digits.slice(1)}`;
  if (digits.length === 11 && digits[0] === '7') return `+${digits}`;
  return `+${digits}`;
}

/**
 * Calculate cart totals
 * @param {Array} items - Cart items
 * @returns {Object} Totals object with subtotal, itemCount, etc.
 */
export function calculateCartTotals(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { subtotal: 0, itemCount: 0, uniqueItems: 0 };
  }

  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    return sum + price * quantity;
  }, 0);

  const itemCount = items.reduce((count, item) => {
    return count + (Number(item.quantity) || 1);
  }, 0);

  return {
    subtotal,
    itemCount,
    uniqueItems: items.length,
  };
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Sleep/delay promise
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
