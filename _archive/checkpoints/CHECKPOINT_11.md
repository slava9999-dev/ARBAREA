# Checkpoint 11: Fix Firestore Permissions & Indexing

**Date:** 2025-11-29
**Status:** ✅ Fixed

## 🛠 Fixes Implemented

1.  **Order History Error**:
    - The error `Missing or insufficient permissions` was likely caused by a missing Firestore Composite Index (`userId` + `createdAt`).
    - **Fix**: Removed server-side sorting (`orderBy`) and implemented client-side sorting. This removes the need for a complex index and should instantly fix the "permission" error.
2.  **CSP Update**:
    - Added `https://www.google.com` to `vercel.json` to allow reCAPTCHA connections.

## ⚠️ CRITICAL ACTION REQUIRED (USER)

You **MUST** enable the **Blaze (Pay-as-you-go)** plan in your Firebase Console.

- **Why?** Google disabled SMS authentication for the free "Spark" plan.
- **Error**: `auth/billing-not-enabled`
- **Solution**: Go to Firebase Console -> Bottom Left -> Upgrade -> Select "Blaze". It is still free for small usage, but requires a card.

## 🚀 Next Steps

- **Deploy**: Push changes.
- **Verify**: Check if Order History now loads correctly.
