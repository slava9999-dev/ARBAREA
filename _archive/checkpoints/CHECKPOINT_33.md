# Checkpoint 33: Auth Screen Visibility Fix

**Date:** 2025-11-30
**Status:** ✅ Fixed

## 🎨 UI Polish

1.  **Auth Screen Text**:
    - Changed "Добро пожаловать в Arbarea" to `text-white`.
    - Changed description to `text-stone-300` for better contrast on dark backgrounds.
2.  **Dark Mode Default**:
    - Added `class="dark"` to `<html>` in `index.html` to ensure dark mode styles are applied immediately (preventing potential FOUC or light mode glitches).
3.  **Cleanup**:
    - Removed unused `GoogleIcon` and `YandexIcon` imports from `AuthScreen.jsx`.

## 🚀 Ready for Release

The text visibility issue on the Auth Screen is resolved.
