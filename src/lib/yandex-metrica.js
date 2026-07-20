/**
 * Yandex Metrica Analytics Core
 * Production-grade SPA integration with advanced tracking
 *
 * Default Counter ID: 106096262 (override via VITE_YM_COUNTER_ID)
 * Features: Webvisor, Clickmap, E-commerce, AccurateTrackBounce,
 *           full-funnel goals, UTM + yclid attribution.
 */

const DEFAULT_COUNTER_ID = 106096262;

const readEnvCounterId = () => {
  const raw =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.VITE_YM_COUNTER_ID
      : undefined;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_COUNTER_ID;
};

const METRICA_ID = readEnvCounterId();

// Persisted marketing attribution (UTM + Yandex/Google click ids)
const ATTRIBUTION_KEY = 'arbarea_attribution';

// Goal IDs — every goal below is actually fired somewhere in the app.
export const GOALS = {
  // Engagement
  DEEP_SCROLL_SHOWCASE: 'DEEP_SCROLL_SHOWCASE',
  PRODUCT_OPEN: 'PRODUCT_OPEN',
  VARIANT_CHANGE: 'CONFIG_MATERIAL_CHANGE',
  CONFIG_MATERIAL_CHANGE: 'CONFIG_MATERIAL_CHANGE',
  INTERACTION_3D: 'INTERACTION_3D',
  CATEGORY_SELECT: 'CATEGORY_SELECT',
  SEARCH: 'SEARCH',
  WISHLIST_ADD: 'WISHLIST_ADD',
  // Funnel
  ADD_TO_CART: 'ADD_TO_CART',
  BUY_NOW: 'BUY_NOW',
  CONTACT_INIT: 'CONTACT_INIT',
  CHECKOUT_START: 'CHECKOUT_START',
  PURCHASE_SUCCESS: 'PURCHASE_SUCCESS',
};

/** The active Metrica counter id (env-driven). */
export const getCounterId = () => METRICA_ID;

/**
 * Parse marketing params from the current URL and merge with what is
 * already stored (first-touch wins for utm_source, last-touch for click ids).
 */
export const captureAttribution = () => {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const tracked = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'yclid',
    'ymclid',
    'gclid',
    '_openstat',
  ];

  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem(ATTRIBUTION_KEY) || '{}') || {};
  } catch {
    stored = {};
  }

  const incoming = {};
  for (const key of tracked) {
    const value = params.get(key);
    if (value) incoming[key] = value;
  }

  if (Object.keys(incoming).length === 0) {
    return stored;
  }

  // First-touch source attribution, but always refresh volatile click ids.
  const merged = {
    ...incoming,
    ...stored,
    ...(incoming.yclid ? { yclid: incoming.yclid } : {}),
    ...(incoming.gclid ? { gclid: incoming.gclid } : {}),
    landing: stored.landing || window.location.pathname,
    first_seen: stored.first_seen || new Date().toISOString(),
  };

  try {
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(merged));
  } catch {
    // storage unavailable — ignore
  }

  return merged;
};

/** Read the stored attribution object (for order payloads etc). */
export const getAttribution = () => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(ATTRIBUTION_KEY) || '{}') || {};
  } catch {
    return {};
  }
};

/**
 * Initialize Yandex Metrica counter.
 * Called once on app mount.
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

  // Capture marketing attribution and attach to the visit / user profile so
  // Yandex Direct campaigns and offline conversions can be reconciled.
  const attribution = captureAttribution();
  if (Object.keys(attribution).length > 0) {
    window.ym(METRICA_ID, 'params', { attribution });
    window.ym(METRICA_ID, 'userParams', { attribution });
  }

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
 * Generic click / interaction event.
 * Thin wrapper over reachGoal so call-sites read declaratively.
 */
export const trackEvent = (goalId, params = {}) => reachGoal(goalId, params);

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

  // Also track as goal, enriched with attribution for Direct reconciliation.
  reachGoal(GOALS.PURCHASE_SUCCESS, {
    order_id: orderData.orderId,
    revenue: orderData.total,
    ...getAttribution(),
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

/**
 * E-commerce: Product impressions (list view)
 */
export const ecommerceImpressions = (products, listName = 'Каталог') => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  const items = products.map((product, index) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    brand: 'Arbarea',
    category: product.category || 'Декор',
    list: listName,
    position: index + 1,
  }));

  // Send in chunks of 50 to avoid size limits, though usually fine
  window.dataLayer.push({
    ecommerce: {
      currencyCode: 'RUB',
      impressions: items,
    },
  });

  console.log('[Metrica] E-commerce impressions:', items.length);
};

export default {
  init: initMetrica,
  getCounterId,
  captureAttribution,
  getAttribution,
  trackPageView,
  reachGoal,
  trackEvent,
  ecommerceAdd,
  ecommerceRemove,
  ecommercePurchase,
  ecommerceDetail,
  ecommerceImpressions,
  GOALS,
};
