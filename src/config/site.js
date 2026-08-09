/**
 * Single source of truth for the canonical origin and the social share card
 * copy. Deliberately free of JSX and of `import.meta` so it can be imported
 * from vite.config.js (which bakes SITE_URL into the static meta tags of
 * index.html) and from Jest, which transpiles to CJS.
 *
 * The custom domain (arbarea.ru) is not live yet, so the default origin is the
 * deployed Vercel domain — link previews must point at a host that actually
 * resolves, otherwise VK/Telegram cannot fetch og-image.jpg. Once the domain is
 * connected, set VITE_SITE_URL=https://arbarea.ru in the Vercel environment and
 * every canonical/OG URL follows automatically.
 */
export const DEFAULT_SITE_URL = 'https://arbarea-bice.vercel.app';

export const resolveSiteUrl = (candidate) =>
  (candidate || DEFAULT_SITE_URL).replace(/\/+$/, '');

export const SITE_NAME = 'ARBAREA';

/** Headline of the link preview in VK / Telegram / WhatsApp. */
export const SHARE_TITLE =
  'ARBAREA — изделия из натурального дерева ручной работы';

export const SHARE_DESCRIPTION =
  'Панно, подставки и аксессуары из массива дуба и ясеня. Каждое изделие делаем своими руками — второго такого не будет. Скидка 10% на первый заказ, доставка по всей России.';

export const SHARE_IMAGE_PATH = '/og-image.jpg';
export const SHARE_IMAGE_WIDTH = '1200';
export const SHARE_IMAGE_HEIGHT = '630';
export const SHARE_IMAGE_ALT =
  'ARBAREA — панно из массива дерева ручной работы в интерьере';
