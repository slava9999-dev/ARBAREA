# Critical Security & Performance Audit

**Date:** 2026-01-02
**Version:** 1.0.0

## 🛡️ Security Audit

### 1. Database Security (Supabase RLS)

**Status:** ✅ SECURED (with fixes)

- **Profiles Table:**
  - ✅ Users can only edit their own profile.
  - ⚠️ **Observation:** Users can technically update their own `role` field in `public.profiles` via the client API because the RLS matches `auth.uid() = id`.
  - ✅ **Mitigation:** The application's core security (RLS for Products/Orders) relies on the **JWT Role** (`auth.jwt() ->> 'role'`), not the `public.profiles` column. Thus, even if a user changes their profile role to 'admin', they **cannot** bypass database security or API checks.
- **Products Table:**
  - ✅ Publicly readable.
  - ✅ Modifiable ONLY by admins (checked against secure JWT role).
- **Orders Table (Authentication Loophole Fixed):**
  - ❌ **Previous Vulnerability:** Users could UPDATE their own orders (`orders_update` policy). This theoretically allowed malicious users to change order status or amounts via the client SDK.
  - ✅ **Fix Applied:** Policy changed to **Admin Only** for updates. Users can create (INSERT) and view (SELECT) but CANNOT modify existing orders. This is a critical security hardening.
- **Individual Orders:**
  - ✅ Secure by design (User INSERT/SELECT, Admin UPDATE).

### 2. Backend API (`api/create-payment.js`)

**Status:** ✅ VERY GOOD

- **Authentication:** Manually verifies Supabase JWT tokens. Correctly identifies users vs guests.
- **Price Validation:** ⭐️ **Excellent.** The API fetches product prices from the database (`dbProducts`) rather than trusting the client-side `req.body`. This prevents price tampering.
- **Input Sanitization:** Explicitly destructs `req.body` and validates types (especially for Donations).
- **Payment Integration:** Uses secure SHA-256 token generation for Tinkoff.
- **Logic Fix:** Standardized "Free Delivery" logic to explicitly set cost to 0, matching the frontend promise.

### 3. Frontend Application & Dependencies

**Status:** ✅ GOOD

- **Dependency Vulnerabilities:**
  - ❌ **High Severity Issue:** `qs` (via Express) had a high-severity DoS vulnerability.
  - ✅ **Fix Applied:** Enforced upgrade to `qs@^6.14.0` via `package.json` overrides.
  - ⚠️ **Moderate Issue:** `esbuild` / `vite` (Development Server). This allows requests to the dev server to access files. **Impact:** Low for production (since we export static assets), but developers should be aware. Fix requires Vite v6 upgrade (breaking change).
- **XSS Prevention:** No usage of `dangerouslySetInnerHTML` found in critical paths.
- **Secrets Management:** No leak of `SERVICE_ROLE_KEY` or private API keys in client-side code.

---

## ⚡ Performance Audit

### 1. Database Performance

**Status:** ✅ OPTIMIZED

- **Indexes:**
  - `profiles`: `email`, `phone`, `vk_id` (Crucial for auth lookups).
  - `products`: `slug` (URL routing), `category` (Filtering).
  - `orders`: `user_id` (Profile history), `order_id` (Lookups).
- **Query Efficiency:** API fetches products by ID `in()` array, which is efficient (O(1) lookup with PK).

### 2. Application Bundle

**Status:** ⚠️ ACCEPTABLE (Room for Improvement)

- **Vendor Bundle:** ~250kB (compressed). Contains React, Leaflet, Framer Motion.
- **Lazy Loading:** ⭐️ **Excellent.** Features like `DeliverySelectorWithMap`, `VKIDWidget`, and `CheckoutModal` are split into separate chunks. They only load when needed.

## 🚨 Final Verification

1.  **Strict Admin Role Management:** The backend correctly relies on JWT claims.
2.  **Monitoring:** Enable Supabase Database Performance Monitor.
3.  **Vite Upgrade:** Plan for Vite v6 upgrade in the next quarterly maintenance window.

**Overall Score:** A- (Production Ready with applied fixes)
