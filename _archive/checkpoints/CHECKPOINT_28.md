# Checkpoint 28: Performance & PWA (Protocol Velocity)

**Date:** 2025-11-30
**Status:** ✅ Implemented

## 🚀 Performance Boost

1.  **LCP Optimization**:
    - Added `<link rel="preload">` for hero image.
    - Added `preconnect` for Google Fonts.
    - Ensured `display=swap` for fonts.
2.  **Code Splitting**:
    - Updated `vite.config.js` to split chunks (`vendor`, `firebase`, `ui`).
    - This reduces the initial bundle size.
3.  **Script Defer**:
    - Added `async defer` to Telegram and reCAPTCHA scripts to unblock the main thread.

## 📱 PWA Activation

1.  **VitePWA Plugin**:
    - Configured `vite-plugin-pwa` in `vite.config.js`.
    - Strategy: `generateSW` (Service Worker).
    - Auto Update: Enabled.
    - Manifest: Added full PWA metadata (name, theme_color, icons).

## 🛡 Next Steps

- **Deploy**: Push changes.
- **Verify**:
  - Check Lighthouse Performance score (Goal: 90+).
  - Check "Install App" prompt on mobile (PWA).
  - Check offline functionality.
