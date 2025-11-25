# PERFORMANCE GUIDE: Arbarea Mobile App

## 1. Image Optimization
- **Format:** Use `.webp` for all raster images.
- **Loading:** Use `<img loading="lazy" />` for all off-screen images.
- **LCP:** The main banner (LCP element) MUST use `loading="eager"` or standard loading.
- **Dimensions:** Always specify `width` and `height` attributes to prevent Layout Shift (CLS).

## 2. Glassmorphism Safety
- **Performance:** Use `backdrop-blur` sparingly.
- **Optimization:** Add `will-change: transform, opacity` for animated blurred elements.
- **Fallback:** Disable blur on low-end devices or if `prefers-reduced-motion` is set.

## 3. Code Splitting
- **Routes:** All page components in `App.jsx` MUST be loaded via `React.lazy()` and wrapped in `Suspense`.
- **Libraries:** Load heavy libraries (charts, maps) dynamically only when needed.

## 4. Firebase Imports (Tree Shaking)
- **FORBIDDEN:** `import firebase from 'firebase/compat/app'` (loads entire SDK).
- **REQUIRED:** Modular imports, e.g., `import { initializeApp } from 'firebase/app'`, `import { doc, getDoc } from 'firebase/firestore'`.
