# Checkpoint 10: Auth & UI Fixes

**Date:** 2025-11-29
**Status:** ✅ Fixed

## 🛠 Fixes Implemented

1.  **Auth Screen UI**:
    - Fixed "invisible text" issue in inputs. Added `text-stone-900` to ensure text is visible on the light background (`bg-stone-50`).
2.  **Phone Authentication**:
    - Added sanitization for phone numbers. Spaces, dashes, and parentheses are now automatically removed before sending to Firebase (e.g., `+7 (999) 000-00-00` -> `+79990000000`).
3.  **Email Authentication**:
    - Should now work correctly as users can see what they are typing.

## 🚀 Next Steps

- **Deploy**: Push changes to production.
- **Verify**: User should test registration again.
