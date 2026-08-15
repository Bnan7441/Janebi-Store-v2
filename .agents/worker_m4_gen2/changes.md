# Milestone 4 Implementation Changes

**Worker:** `worker_m4_gen2`  
**Date:** 2026-08-15  
**Working Directory:** `/Users/aidin/antigravity/Janebi-Store`

---

## 1. Test Suite Implementations & Expansions

### A. New Test Suites Created
1. **`tests/unit/persian-utils.test.ts` (22 tests)**
   - Unit tests covering `toPersianDigits`, `toEnglishDigits`, `normalizeIranianMobile`, `isValidIranianMobile`, and `formatPrice`.
   - Tests Persian digits (`۰-۹`), Arabic digits (`٠-٩`), international phone numbers (`+98`, `0098`, `98`), 10-digit formats, messy formatting with delimiters, and null/empty string handling.
2. **`tests/unit/transaction-rollback.test.ts` (3 tests)**
   - Multi-item checkout rollback when one item is out of stock (verifying preceding item stock is preserved and zero orders are created).
   - Low-level SQLite transaction abort verification inside `db.transaction(...)`.
   - Multi-table write atomicity verification.
3. **`tests/concurrency/inventory-race.test.ts` (2 tests)**
   - Concurrent execution testing 10 parallel checkout requests racing for 1 available stock unit: verified exactly 1 winner, 9 clean 400 rejections, 0 negative stock, and 0 database lock errors.
   - Concurrent execution testing 10 parallel requests for 3 stock units: verified exactly 3 winners and final stock at 0.
4. **`tests/api/reviews.test.ts` (8 tests)**
   - Product reviews retrieval and creation.
   - Rating boundary tests (rating 1, rating 5).
   - Rating out-of-bounds rejection (rating 0, 6, -1).
   - Missing required fields rejection (400) and non-existent product handling (404).

### B. Existing Test Suites Expanded
1. **`tests/api/auth.test.ts` (+4 tests -> 15 tests total)**
   - Added tests for JWT token missing `userId` payload (401).
   - Added tests for empty/whitespace authorization headers (401).
   - Added tests for completely empty registration and login bodies (400).
2. **`tests/api/products.test.ts` (+5 tests -> 19 tests total)**
   - Added query parameter validation tests for non-numeric `minPrice`, `maxPrice`, `page`, `limit` (400).
   - Added enum validation tests for `inStock` and `hasDiscount` (400).
   - Added `category=همه` full product catalog query test.
   - Added sorting by popularity (`sort=popular`).
3. **`tests/api/cart.test.ts` (+2 tests -> 11 tests total)**
   - Added boundary tests for zero/negative quantities (400).
   - Added boundary tests for zero/floating point product IDs (400).
4. **`tests/api/wishlist.test.ts` (+2 tests -> 8 tests total)**
   - Added boundary tests for zero/floating point product IDs (400).
   - Added tenant isolation test ensuring user A cannot view user B's wishlist.
5. **`tests/api/coupons.test.ts` (+4 tests -> 12 tests total)**
   - Added tests for negative `cartTotal` and empty coupon codes (400).
   - Added test for 100% discount calculation resulting in 0 total.
   - Added test for `POST /api/coupons` alias endpoint.
6. **`tests/api/payment.test.ts` (+5 tests -> 9 tests total)**
   - Added tests for missing/invalid orderId (400, 404).
   - Added tests for missing query parameters and non-existent authorities.
   - Added full payment verification success flow with dummy authority transitioning order to `processing` and saving `refId`.
   - Added verification idempotency for already processed orders.
7. **`tests/api/users.test.ts` (+3 tests -> 13 tests total)**
   - Added email validation test on profile update (400).
   - Added phone format and short address validation tests on address creation (400).
   - Added 401 unauthenticated access tests across user endpoints.
8. **`tests/api/admin.test.ts` (+3 tests -> 23 tests total)**
   - Added test for creating fixed-amount coupons (201).
   - Added test for non-numeric product ID deletion (400).
   - Added test for full status transitions (`pending_payment`, `processing`, `shipped`, `delivered`, `cancelled`).

---

## 2. Server & Utility Bug Fixes

1. **`server/routes/payment.ts`**:
   - Fixed sandbox / test merchant detection to bypass external network request to ZarinPal (`api.zarinpal.com`) when running tests or with dummy merchant ID, resolving test timeout.
2. **`server/routes/products.ts`**:
   - Reordered routes to mount `/:id/reviews` before `/:id` to adhere to Express routing best practices.
3. **`server/app.ts`**:
   - Imported `env` from `./env.js` for rate-limiting skip check, fixing `tsc --noEmit` error.
4. **`src/lib/utils.ts`**:
   - Added null / undefined guard to `toPersianDigits` function so calling with null or undefined returns empty string instead of throwing a TypeError.

---

## 3. Verification Summary

- **Total Test Files:** 17
- **Total Tests:** 198
- **Vitest Result:** 100% Passing (198 passed, 0 failed)
- **TypeScript Typecheck (`tsc --noEmit`):** 0 Errors
- **Production Build (`npm run build`):** Vite + esbuild bundled cleanly with 0 Errors
- **Artifact Published:** `TEST_READY.md` at project root
