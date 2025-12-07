/**
 * CORS utility for Vercel API endpoints
 * Restricts access to allowed origins only
 */

const ALLOWED_ORIGINS = [
  'https://arbarea.ru',
  'https://www.arbarea.ru',
  'https://arbarea-bice.vercel.app',
  // Allow Vercel preview deployments
  /^https:\/\/arbarea-.*\.vercel\.app$/,
];

// Development origins (only in non-production)
const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

/**
 * Check if origin is allowed
 * @param {string} origin - The request origin
 * @returns {boolean}
 */
function isAllowedOrigin(origin) {
  if (!origin) return false;
  
  // Check exact matches
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  
  // Check regex patterns (for Vercel preview deployments)
  for (const pattern of ALLOWED_ORIGINS) {
    if (pattern instanceof RegExp && pattern.test(origin)) {
      return true;
    }
  }
  
  // Allow dev origins in non-production
  if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV === 'development') {
    if (DEV_ORIGINS.includes(origin)) return true;
  }
  
  return false;
}

/**
 * Apply CORS headers to response
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {boolean} - True if preflight request was handled
 */
export function applyCors(req, res) {
  const origin = req.headers.origin;
  
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  
  return false;
}

export default applyCors;
