# Milestone 1 Implementation Changes

**Date:** 2026-08-15  
**Worker:** `worker_m1`  
**Working Directory:** `/Users/aidin/antigravity/Janebi-Store`

---

## Summary of Changes

### 1. TypeScript Compilation & Schema Fixes
- **`server/routes/products.ts`**:
  - Replaced invalid column query `eq(products.inStock, true)` with `gt(products.stockQuantity, 0)` on line 44.
- **`server/data/seed.ts`**:
  - Fixed the product insertion type to supply `stockQuantity: (p as any).stockQuantity ?? (p.inStock ? 10 : 0)` matching `schema.products` definition.
  - Result: `npm run lint` (`tsc --noEmit`) passes with 0 errors.

### 2. Order Submission Hardening & Cancellation Endpoint (`server/routes/orders.ts`)
- **Duplicate Item Aggregation:**
  - Before querying the database or checking inventory, items in `req.body.items` are aggregated into a `Map<number, number>` by `productId` with summed quantities.
  - Ensures users cannot bypass inventory limits by submitting duplicate item entries in the same payload.
- **Discount & Total Bounds Clamping:**
  - Clamped calculated discount amount to `Math.min(realDiscount, realSubtotal)` so discounts never exceed the cart subtotal.
  - Clamped order total to `Math.max(0, realSubtotal + realShippingFee - realDiscount)` so order total never becomes negative.
- **Order Cancellation API (`POST /api/orders/:id/cancel`):**
  - Authenticated endpoint verifying that the authenticated user owns the order (`order.userId === req.user.id`, returning 403 on mismatch).
  - Validates that order status is either `pending_payment` or `processing` (returns 400 on other statuses).
  - Atomically inside a database transaction:
    - Restores inventory quantity for all order items: `tx.update(products).set({ stockQuantity: sql`stockQuantity + ${item.qty}` })`.
    - Updates order status to `cancelled` with status text `لغو شده توسط کاربر`.
  - Returns `{ message: 'سفارش با موفقیت لغو شد', order: updatedOrder }`.

### 3. Payment Gateway Security & Inventory Restoration (`server/routes/payment.ts`)
- **Authentication & Ownership:**
  - Added `authenticate` middleware to `POST /api/payment/request`.
  - Added authorization check verifying `order.userId === req.user.id` (returns 403 Forbidden on unauthorized attempt).
- **Environment Variable Integration:**
  - Replaced hardcoded merchant ID with `env.ZARINPAL_MERCHANT_ID` with proper fallback for sandbox/test environments.
- **Failed / Cancelled Payment Inventory Restoration:**
  - In `GET /api/payment/verify`: When `Status !== 'OK'` or ZarinPal verification returns a failure code, atomically marks the order as `cancelled` and restores all product item quantities in `products.stockQuantity` inside a database transaction.
- **Idempotency Safeguard:**
  - If `GET /api/payment/verify` is invoked multiple times for an order that is no longer `pending_payment`, it safely redirects to the result page without modifying database state or double-restocking inventory.

### 4. Frontend Integration (`src/hooks/useCheckoutForm.ts`)
- Added `Authorization: Bearer ${token}` header to `fetch('/api/payment/request')` in `useCheckoutForm.ts` to seamlessly authenticate payment requests initiated from the UI.

### 5. Test Suite Additions & Expansion
- **`tests/api/orders.test.ts`**:
  - Added test for duplicate item payload aggregation decrementing inventory by total summed quantity.
  - Added test for duplicate item payload exceeding available inventory (expect 400).
  - Added test for large discount coupon clamping discount to subtotal and keeping total positive.
  - Added test for `POST /api/orders/:id/cancel` verifying stock restoration, duplicate cancellation rejection (400), 404 on missing order, and 403 on unauthorized user.
- **`tests/api/payment.test.ts`**:
  - Created test suite verifying unauthenticated 401, unauthorized 403, successful payment request with authority generation, failed payment verification cancelling order and restocking inventory, and idempotency verification preventing double restocking.

---

## Verification Results
- `npm run lint` (`tsc --noEmit`): **Passed with 0 errors**.
- `npx vitest run`: **9 test files, 45 tests passed (100% pass rate)**.
- `npm run build`: **Build completed successfully with 0 errors**.
