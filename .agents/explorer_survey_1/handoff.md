# Handoff Report: Janebi-Store Exploration & Codebase Survey

**Agent Folder:** `/Users/aidin/antigravity/Janebi-Store/.agents/explorer_survey_1`  
**Handoff Type:** Hard (Task Complete)  
**Date:** 2026-08-15  

---

## 1. Observation

1. **Server & Database Infrastructure:**
   - Database is SQLite at `./data/janebi.db` configured in `server/db/index.ts` with `better-sqlite3` and `drizzle-orm`. WAL mode is enabled via `sqlite.pragma('journal_mode = WAL')` and `sqlite.pragma('busy_timeout = 5000')`.
   - Express server configured in `server/app.ts` with helmet, cors, json body parsing, rate-limiting (`/api/`, 100 req/15min), and pino logging.

2. **TypeScript & Build Errors:**
   - Running `npm run lint` (`tsc --noEmit`) produced 2 compilation errors:
     - `server/routes/products.ts:44:33`: `Property 'inStock' does not exist on type 'SQLiteTableWithColumns<...>'`. (In `server/db/schema.ts:42`, the column is named `stockQuantity: integer('stockQuantity')`).
     - `server/data/seed.ts:18:9`: Type mismatch with `id` and `inStock` during product insertion.

3. **Inventory & Order Transactions (`server/routes/orders.ts`):**
   - Order placement in `POST /api/orders` (lines 64-164) runs inside `db.transaction((tx) => { ... })`.
   - Line 67: `const dbProducts = tx.select().from(products).where(inArray(products.id, productIds)).all();`
   - Line 73-83: Products checked in a loop against static `dbProduct.stockQuantity`. If duplicate item entries with same `id` are passed in `items`, stock check is evaluated against static stock for each entry independently, bypassing inventory bounds and permitting negative stock.
   - Lines 117-118: `const realTotal = realSubtotal + realShippingFee - realDiscount;` lacks subtotal capping, allowing fixed discounts larger than subtotal + shipping to result in negative total.
   - Line 153: Stock is decremented immediately during order placement with status `pending_payment`.

4. **Payment Verification & Rollback Defect (`server/routes/payment.ts`):**
   - Line 9: Hardcoded `const MERCHANT_ID = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';` rather than reading `env.ZARINPAL_MERCHANT_ID`.
   - `/api/payment/request` lacks authentication middleware.
   - Lines 112-117 and 166-170: When payment fails (`status !== 'OK'` or verify code error), `orders` status is updated to `cancelled`, but stock is never restored.

5. **Address Book Edge Case (`server/routes/users.ts`):**
   - Lines 145-168: `PUT /me/addresses/:id/default` sets all addresses to `isDefault: false`, then updates target address where `id = addressId AND userId = userId`.
   - If `addressId` is invalid or belongs to another user, SQLite updates 0 rows without error and returns `200 OK`, leaving the user with zero default addresses.

6. **Admin Route Cascading & Validation Gaps (`server/routes/admin.ts`):**
   - Lines 149-164: `DELETE /products/:id` only deletes from `reviews` and `products`, leaving related rows in `product_features`, `cart_items`, and `wishlist_items`.

7. **Frontend Modal Architecture (`src/components/`):**
   - `src/components/auth/AuthModal.tsx` correctly uses `createPortal(modalContent, document.body)`.
   - `src/components/profile/AddressBookTab.tsx` (lines 233-382) renders modal inline inside tab layout without `createPortal`.

8. **Test Suite Status:**
   - Running `npx vitest run` executed 8 test files (37 tests) with 100% pass rate in 3.11s.

---

## 2. Logic Chain

1. **From Observation 2 to TypeScript Remediation Need:**
   - Because `products` table schema contains `stockQuantity` and not `inStock`, line 44 in `server/routes/products.ts` causes `tsc --noEmit` to fail with exit code 1.
   - In addition, calling `/api/products?inStock=true` evaluates an invalid column filter. Replacing this with `gt(products.stockQuantity, 0)` fixes both the runtime query and TypeScript compilation.

2. **From Observation 3 & 4 to Concurrency & Inventory Inconsistency:**
   - Deducting inventory on order creation before payment verification creates inventory leakage if payment is cancelled or abandoned, unless `server/routes/payment.ts` executes an atomic stock restoration query.
   - Checking item quantities without pre-aggregating product IDs allows duplicate payloads to bypass stock availability bounds.

3. **From Observation 5 to Address API Reliability:**
   - A non-existent address ID in `PUT /me/addresses/:id/default` silently clearing all defaults violates expected REST semantics (should return 404 Not Found without modifying user state).

4. **From Observation 6 to Database Referential Integrity:**
   - Deleting a product in `DELETE /admin/products/:id` without deleting referenced rows in `cart_items`, `wishlist_items`, and `product_features` violates referential integrity and could crash cart/wishlist queries.

5. **From Observation 7 to UI Display Robustness:**
   - Modals rendered inline without `createPortal` can be clipped or distorted by parent CSS stacking contexts, overflow rules, sticky headers, or backdrop blur filters.

---

## 3. Caveats

1. **Payment Gateway Sandbox vs Live:**
   - ZarinPal live gateway testing was not performed with a live merchant bank account; dummy fallback authority testing (`DUMMY_AUTH_...`) was used.
2. **Rate Limiting in E2E Tests:**
   - Global rate limiter (100 req / 15 min) in `server/app.ts` could be triggered if massive test suites run against the shared `app` instance without disabling rate limiting in test mode.
3. **Persian Font & Visual Assets:**
   - Visual styling was inspected via source code; browser rendering of Persian typography (Vazirmatn) depends on client font availability or web font loading.

---

## 4. Conclusion

The Janebi-Store backend architecture is well-structured with clear layer separation, but requires targeted hardening across 5 primary areas:
1. **Fix Compiler & Query Errors:** Resolve `inStock` column mismatch in `server/routes/products.ts` and `server/data/seed.ts` to achieve clean `npm run lint`.
2. **Harden Inventory & Order Transactions:** Aggregate items before checking stock in `POST /api/orders`, clamp discount to subtotal, and implement stock restoration upon payment failure/cancellation in `server/routes/payment.ts`.
3. **Secure Payment & Admin Endpoints:** Authenticate `/api/payment/request`, link `env.ZARINPAL_MERCHANT_ID`, and enforce cascading cleanup on product deletion in `server/routes/admin.ts`.
4. **Fix Address Default Logic:** Return 404 on invalid address in `PUT /me/addresses/:id/default` and reassign default when default address is deleted.
5. **Expand Test Suite:** Add comprehensive negative test suites for 400, 401, 403, and 404 responses across all routes.

---

## 5. Verification Method

To independently verify all findings:
1. **Verify TypeScript Compilation Failure:**
   ```bash
   npm run lint
   ```
   *Expected:* Fails with TS2339 in `server/routes/products.ts` and TS2769 in `server/data/seed.ts`.

2. **Verify Current Vitest Suite Pass Rate:**
   ```bash
   npx vitest run
   ```
   *Expected:* 8 test files, 37 tests pass.

3. **Verify Survey Report & Artifacts:**
   Inspect `/Users/aidin/antigravity/Janebi-Store/.agents/explorer_survey_1/survey_report.md`.
