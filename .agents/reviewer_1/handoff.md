# Reviewer 1 Handoff Report: Backend Architecture, Concurrency Safety & Automated Test Suite Review

**Reviewer Archetype:** Reviewer & Adversarial Critic  
**Date:** 2026-08-15  
**Verdict:** `APPROVE`  
**Target Repository:** Janebi-Store E-Commerce Platform  

---

## 1. Observation

Direct observations from codebase inspection, database schema analysis, and automated test execution:

### A. Test Execution & Build Outputs
- **Automated Test Execution (`npm run test` / `npx vitest run`):**
  ```text
  Test Files  17 passed (17)
       Tests  198 passed (198)
    Duration  11.23s
  ```
  All 17 test files and 198 tests execute cleanly with 100% pass rate. Zero failures, zero test skips, zero timeouts, and zero unhandled rejections.

- **TypeScript Typecheck (`npm run lint` / `tsc --noEmit`):**
  ```text
  > react-example@0.0.0 lint
  > tsc --noEmit
  Exit Code: 0 (No Errors)
  ```

- **Production Build (`npm run build`):**
  ```text
  > react-example@0.0.0 build
  > vite build && esbuild server/index.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs
  dist/index.html                     1.27 kB
  dist/assets/index-CBkftzs8.css    163.35 kB
  dist/assets/index-DV6TZ1Pv.js   1,083.58 kB
  dist/server.cjs                   83.10 kB
  Exit Code: 0 (No Errors)
  ```

### B. Codebase & Architectural Observations

1. **Concurrency & Inventory Aggregation (`server/routes/orders.ts:64-184`):**
   - In `POST /api/orders`, input items in `req.body.items` are aggregated into a `Map<number, number>` mapping `productId -> summedQuantity` before any inventory check or DB insertion (`server/routes/orders.ts:66-78`).
   - The entire order creation process (aggregation, inventory check, order insertion, item records insertion, stock decrement via `sql`stockQuantity - ${item.quantity}``, and cart clearing) executes inside an atomic synchronous SQLite transaction `db.transaction((tx) => { ... })`.
   - Concurrency tests in `tests/concurrency/inventory-race.test.ts` (10 parallel requests) and `tests/concurrency/adversarial-stress.test.ts` (50 and 100 parallel requests) empirically confirm that when multiple clients compete for limited units, exactly $N$ winners succeed with HTTP 201, remaining requests receive HTTP 400, and final stock is guaranteed to never drop below 0.

2. **Order Cancellation & Stock Restoration (`server/routes/orders.ts:195-244`):**
   - Dedicated endpoint `POST /api/orders/:id/cancel` verifies JWT authentication and order ownership (`order.userId === req.user.id`, returning 403 on mismatch).
   - Validates that order status is `pending_payment` or `processing` (returning 400 for other statuses).
   - Inside `db.transaction(...)`, restores stock for all order items (`tx.update(products).set({ stockQuantity: sql`stockQuantity + ${item.qty}` })`) and transitions order status to `cancelled`.
   - Duplicate cancellation attempts return 400 without double-restocking.

3. **Payment Failure Restocking & Callback Idempotency (`server/routes/payment.ts:102-220`):**
   - `POST /api/payment/request` is protected by `authenticate` middleware and checks order ownership (`order.userId === req.user.id`).
   - `GET /api/payment/verify` checks if `order.status !== 'pending_payment'`. If already cancelled or processing, it redirects immediately without re-executing state transitions.
   - When `Status !== 'OK'` or ZarinPal returns an error code, `restockOrder(tx, order.id)` restocks all order item quantities and marks the order `cancelled`.
   - Parallel callback stress tests in `tests/api/adversarial_challenge.test.ts` (5 concurrent failure callbacks) and `tests/concurrency/adversarial-stress.test.ts` (20 parallel failure callbacks) confirm that inventory is restocked exactly once.

4. **Coupon Engine Calculation & Clamping (`server/routes/coupons.ts:10-56`, `server/routes/orders.ts:116-138`):**
   - Validates coupon code case-insensitively using `code.trim().toUpperCase()`.
   - Returns 400 if coupon does not exist or `!coupon.active`.
   - Returns 400 if `cartTotal < coupon.minTotal`.
   - Clamps discount to cart subtotal: `realDiscount = Math.min(realDiscount, realSubtotal)`.
   - Clamps order total: `realTotal = Math.max(0, realSubtotal + realShippingFee - realDiscount)`, ensuring totals never become negative.

5. **Address Book Default Atomicity & Fallback (`server/routes/users.ts:155-223`):**
   - First created address automatically has `isDefault: true`; subsequent addresses are `isDefault: false`.
   - `PUT /api/users/me/addresses/:id/default` atomically resets `isDefault: false` across all user addresses and sets the target address to `isDefault: true` inside a transaction. Returns 404 for non-existent address or wrong user.
   - `DELETE /api/users/me/addresses/:id` deletes the address inside a transaction. If the deleted address had `isDefault: true`, the most recent remaining address is promoted to `isDefault: true`.

6. **User Password Update Endpoint (`server/routes/users.ts:54-78`):**
   - Endpoint `PUT /api/users/me/password` verifies `currentPassword` against `user.password` using `bcrypt.compare`.
   - Returns 400 `{ error: 'کلمه عبور فعلی نادرست است' }` upon password mismatch.
   - Hashes `newPassword` with `bcrypt.hash(newPassword, 10)` and updates database record.

7. **Admin Cascading Product Deletion & RBAC Protection (`server/routes/admin.ts:1-285`):**
   - All admin routes enforce `authenticate` and `requireAdmin` middleware. Non-admin users are strictly blocked with HTTP 403.
   - `DELETE /api/admin/products/:id` executes inside `db.transaction(...)`, deleting associated records in `productFeatures`, `cartItems`, `wishlistItems`, and `reviews` before deleting the product record, preserving referential integrity.

8. **Integrity Audit:**
   - Zero hardcoded mock bypasses or dummy implementations in the server routes.
   - All test files instantiate Supertest against real Express route trees and execute actual queries/transactions against the SQLite database with WAL mode and 5000ms busy timeout.

---

## 2. Logic Chain

1. **Premise 1 (Concurrency & Inventory):** Because `server/routes/orders.ts` aggregates item quantities before reading DB inventory and wraps the entire stock validation and deduction in a synchronous SQLite transaction under WAL mode, multi-client parallel checkouts cannot cause race conditions or negative inventory. Verified by Scenario 1 & 2 in `tests/concurrency/adversarial-stress.test.ts` (up to 100 concurrent requests, exactly matching available stock units).
2. **Premise 2 (Order Cancellation & Restocking):** Because `POST /api/orders/:id/cancel` and `GET /api/payment/verify` only allow cancellations and restocking for orders in `pending_payment` (or `processing` for user cancels) inside a single transaction, stock is guaranteed to be restored exactly once. Repeat or concurrent calls are idempotent.
3. **Premise 3 (Coupon & Financial Bounds):** Because discounts are clamped using `Math.min(discount, subtotal)` and order totals are clamped using `Math.max(0, subtotal + shippingFee - discount)`, orders with massive or 100% coupons never produce negative prices.
4. **Premise 4 (User & Admin Security):** Because RBAC middleware (`requireAdmin`) verifies user role against database state, JWT token spoofing or non-admin attempts to mutate roles, delete products, or inspect dashboard metrics are strictly blocked with 403 Forbidden.
5. **Premise 5 (Automated Test Suite Quality):** Because all 17 test suites pass 100% (198/198 tests), TypeScript compiles with zero errors, and Vite/esbuild bundle production assets cleanly, the platform satisfies all testing and stability criteria.

---

## 3. Caveats

- **ZarinPal Gateway Network Boundary:** In test environments (`NODE_ENV === 'test'`), payment requests bypass live external HTTP calls to `api.zarinpal.com` and use dummy authorities (`DUMMY_AUTH_...`) to ensure deterministic test execution without network latency or external service outages. In production, live credentials and endpoints are activated via `env.ZARINPAL_MERCHANT_ID`.
- **Single Node Concurrency Model:** SQLite transactions are serialized per process. This architecture is optimal for single-instance Node.js backends with WAL mode and busy timeout configured. If horizontally scaled across multiple instances in the future, a distributed database (PostgreSQL/MySQL) would be recommended.

---

## 4. Conclusion & Explicit Verdict

**Verdict:** `APPROVE`

The backend implementation, database transaction boundaries, concurrency handling, discount calculations, payment lifecycle, and automated test suites fully satisfy all architectural requirements from `ORIGINAL_REQUEST.md`, `PROJECT.md`, and `TEST_INFRA.md`.

- Concurrency & Inventory: Verified atomic, duplicate aggregated, zero negative stock.
- Order & Payment Security: Verified cancel endpoint, restock on payment failure, idempotent callbacks, discount clamping.
- User & Admin APIs: Verified password change with bcrypt, atomic default address switching with fallback promotion, admin cascading deletion, and RBAC 403 enforcement.
- Automated Test Suite: 100% passing (17 files, 198 tests), 0 TypeScript errors, clean production build.

---

## 5. Verification Method

To independently reproduce and verify the findings:

1. **Run full automated test suite:**
   ```bash
   npx vitest run
   ```
   *Expected Output:* 17 test files passed, 198 tests passed.

2. **Run TypeScript static analysis:**
   ```bash
   npm run lint
   ```
   *Expected Output:* Exit code 0, 0 errors.

3. **Run production build:**
   ```bash
   npm run build
   ```
   *Expected Output:* Vite client build + esbuild server bundle compile cleanly with exit code 0.

4. **Inspect critical transaction files:**
   - `server/routes/orders.ts` (lines 64-184: atomic checkout & aggregation, lines 195-244: atomic cancellation & restocking)
   - `server/routes/payment.ts` (lines 102-220: idempotent verify & failure restock)
   - `server/routes/users.ts` (lines 54-78: password update, lines 155-223: address atomicity)
   - `server/routes/admin.ts` (lines 152-181: cascade deletion)
