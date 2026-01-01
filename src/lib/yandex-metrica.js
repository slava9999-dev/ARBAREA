/**
 * Yandex Metrica Analytics Core
 * Production-grade SPA integration with advanced tracking
 *
 * Counter ID: 106096262
 * Features: Webvisor, Clickmap, E-commerce, AccurateTrackBounce
 */

const METRICA_ID = 106096262;

// Goal IDs (as per MASTER PROTOCOL)
export const GOALS = {
  INTERACTION_3D: 'INTERACTION_3D',
  CONFIG_MATERIAL_CHANGE: 'CONFIG_MATERIAL_CHANGE',
  DEEP_SCROLL_SHOWCASE: 'DEEP_SCROLL_SHOWCASE',
  CONTACT_INIT: 'CONTACT_INIT',
  CHECKOUT_START: 'CHECKOUT_START',
  PURCHASE_SUCCESS: 'PURCHASE_SUCCESS',
};

/**
 * Initialize Yandex Metrica counter
 * Called once on app mount
 */
export const initMetrica = () => {
  if (typeof window === 'undefined') return;

  // Prevent double initialization
  if (window.ym) {
    console.warn('[Metrica] Already initialized');
    return;
  }

  // Create ym function placeholder
  window.ym =
    window.ym ||
    ((...args) => {
      window.ym.a = window.ym.a || [];
      window.ym.a.push(args);
    });
  window.ym.l = Date.now();

  // Check if script already loaded
  const scripts = document.scripts;
  const metrikaUrl = 'https://mc.yandex.ru/metrika/tag.js';
  let scriptExists = false;

  for (let j = 0; j < scripts.length; j++) {
    if (scripts[j].src === metrikaUrl) {
      scriptExists = true;
      break;
    }
  }

  // Inject script if not exists
  if (!scriptExists) {
    const script = document.createElement('script');
    const firstScript = document.getElementsByTagName('script')[0];
    script.async = true;
    script.src = metrikaUrl;
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    }
  }

  // Initialize counter with advanced options
  window.ym(METRICA_ID, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
    ecommerce: 'dataLayer',
    trackHash: true,
    defer: true,
  });

  console.log('[Metrica] Initialized:', METRICA_ID);
};

/**
 * Track virtual pageview (for SPA navigation)
 */
export const trackPageView = (url, options = {}) => {
  if (typeof window === 'undefined' || !window.ym) return;

  const fullUrl = window.location.origin + url;

  window.ym(METRICA_ID, 'hit', fullUrl, {
    title: document.title,
    referer: document.referrer,
    ...options,
  });

  console.log('[Metrica] Page view:', fullUrl);
};

/**
 * Track goal achievement
 */
export const reachGoal = (goalId, params = {}) => {
  if (typeof window === 'undefined' || !window.ym) return;

  window.ym(METRICA_ID, 'reachGoal', goalId, params);

  console.log('[Metrica] Goal reached:', goalId, params);
};

/**
 * E-commerce: Add to cart
 */
export const ecommerceAdd = (product) => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    ecommerce: {
      currencyCode: 'RUB',
      add: {
        products: [
          {
            id: product.id,
            name: product.name,
            price: product.price,
            brand: 'Arbarea',
            category: product.category || 'Декор',
            quantity: product.quantity || 1,
          },
        ],
      },
    },
  });

  console.log('[Metrica] E-commerce add:', product.name);
};

/**
 * E-commerce: Remove from cart
 */
export const ecommerceRemove = (product) => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    ecommerce: {
      currencyCode: 'RUB',
      remove: {
        products: [
          {
            id: product.id,
            name: product.name,
            price: product.price,
            brand: 'Arbarea',
            category: product.category || 'Декор',
            quantity: product.quantity || 1,
          },
        ],
      },
    },
  });

  console.log('[Metrica] E-commerce remove:', product.name);
};

/**
 * E-commerce: Purchase
 */
export const ecommercePurchase = (orderData) => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    ecommerce: {
      currencyCode: 'RUB',
      purchase: {
        actionField: {
          id: orderData.orderId,
          revenue: orderData.total,
          shipping: orderData.shipping || 0,
        },
        products: orderData.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          brand: 'Arbarea',
          category: item.category || 'Декор',
          quantity: item.quantity,
        })),
      },
    },
  });

  // Also track as goal
  reachGoal(GOALS.PURCHASE_SUCCESS, {
    order_id: orderData.orderId,
    revenue: orderData.total,
  });

  console.log('[Metrica] E-commerce purchase:', orderData.orderId);
};

/**
 * E-commerce: Product detail view
 */
export const ecommerceDetail = (product) => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    ecommerce: {
      currencyCode: 'RUB',
      detail: {
        products: [
          {
            id: product.id,
            name: product.name,
            price: product.price,
            brand: 'Arbarea',
            category: product.category || 'Декор',
          },
        ],
      },
    },
  });

  console.log('[Metrica] E-commerce detail:', product.name);
};

export default {
  init: initMetrica,
  trackPageView,
  reachGoal,
  ecommerceAdd,
  ecommerceRemove,
  ecommercePurchase,
  ecommerceDetail,
  GOALS,
};
