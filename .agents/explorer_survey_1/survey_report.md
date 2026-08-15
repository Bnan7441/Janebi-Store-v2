# Comprehensive Architecture & Codebase Survey Report: Janebi-Store

**Date:** 2026-08-15  
**Survey Agent:** `explorer_survey_1`  
**Integrity Mode:** Development  
**Working Directory:** `/Users/aidin/antigravity/Janebi-Store`

---

## Executive Summary

Janebi-Store is an e-commerce platform for digital and mobile accessories built with a modern TypeScript stack:
- **Backend:** Node.js, Express 5.2.1, better-sqlite3 13.0.3, Drizzle ORM 0.45.2, Zod 4.4.3, jsonwebtoken 9.0.3, bcrypt 6.0.0, Pino, Helmet, and express-rate-limit.
- **Frontend:** React 19, Vite 8, Tailwind CSS v4, Motion (Framer Motion v12), Lucide React.
- **Database:** SQLite database in WAL mode located at `./data/janebi.db` with schema and relations managed via Drizzle ORM.
- **Testing:** Vitest 4.1.10 with Supertest 7.2.2. Current test suite executes 8 test files (37 tests) in ~3.1 seconds.

While core flows (auth, product queries, cart, checkout, admin management) are implemented and functional, the survey identified critical architectural defects, concurrency vulnerabilities, missing negative response handlers, and TypeScript compiler errors that need resolution to satisfy production robustness standards.

---

## 1. Backend Architecture & Server Structure

### 1.1 Server Entry & Lifecycles
- **Entry point (`server/index.ts`):** 
  - In development mode (`env.NODE_ENV !== 'production'`), starts Vite in middleware mode with SPA HTML transformations.
  - In production mode, serves static assets from `dist/` and falls back to `dist/index.html`.
  - Port is loaded from `env.PORT` (default: 3000).
- **Express App Setup (`server/app.ts`):**
  - Security headers via `helmet({ contentSecurityPolicy: false })`.
  - CORS enabled via `cors()`.
  - Body parser `express.json()`.
  - Logging with `pino-http` and `pino-pretty`.
  - Global rate limiter on `/api/`: 100 requests per 15-minute window.
  - Global error handler `errorHandler` (`server/middleware/errorHandler.ts`).

### 1.2 API Route Endpoints Catalog

| Endpoint Prefix | Router File | Primary Responsibility | Auth Required |
|---|---|---|---|
| `/api/auth` | `server/routes/auth.ts` | Registration, Login, Token generation, `/me` profile check | Partial (`/me` only) |
| `/api/users` | `server/routes/users.ts` | Profile updates, Address book CRUD, Set default address | Yes (All) |
| `/api/products` | `server/routes/products.ts` | Catalog filtering, search, pagination, single product, reviews | No (Public) |
| `/api/categories` | `server/routes/categories.ts` | Distinct category list dynamically generated from products | No (Public) |
| `/api/brands` | `server/routes/brands.ts` | Brand list from seed-data | No (Public) |
| `/api/cart` | `server/routes/cart.ts` | Cart CRUD, quantity adjustment, clear cart | Yes (All) |
| `/api/wishlist` | `server/routes/wishlist.ts` | Wishlist toggle and fetch | Yes (All) |
| `/api/coupons` | `server/routes/coupons.ts` | Coupon code validation and calculation | No (Public) |
| `/api/orders` | `server/routes/orders.ts` | Order submission with atomic stock decrement, order history | Yes (All) |
| `/api/payment` | `server/routes/payment.ts` | ZarinPal payment gateway request and verification callback | No (Unauthenticated) |
| `/api/admin` | `server/routes/admin.ts` | Metrics/stats, user roles, product CRUD, order status, coupon CRUD | Yes (`authenticate` + `requireAdmin`) |
| `/api/contact` | `server/routes/contact.ts` | Contact form submission handler | No (Public) |

---

## 2. Database Schema, ORM & Concurrency / Locking

### 2.1 SQLite Driver & Concurrency Configuration (`server/db/index.ts`)
```ts
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('busy_timeout = 5000');
export const db = drizzle(sqlite, { schema });
```
- **Journal Mode WAL (Write-Ahead Logging):** Enables concurrent readers without blocking writes and a single concurrent writer without blocking reads.
- **Busy Timeout 5000ms:** SQLite waits up to 5000ms for busy lock release before returning `SQLITE_BUSY`.
- **Concurrency Limitation:** SQLite is inherently a single-writer system. Long synchronous transactions or unhandled async exceptions inside transactions will block all other write operations.

### 2.2 Schema Definitions (`server/db/schema.ts`)
1. **`users`:** `id` (text, PK), `name`, `phone` (unique), `email`, `password` (hashed), `avatar`, `joinedDate`, `vipPoints`, `role` (default: 'user').
2. **`addresses`:** `id` (text, PK), `userId` (FK -> `users.id`), `title`, `name`, `phone`, `province`, `city`, `address`, `postalCode`, `isDefault` (boolean integer).
3. **`products`:** `id` (integer, auto-increment PK), `title`, `category`, `price`, `originalPrice`, `discount`, `image`, `brand`, `warranty`, `description`, `rating`, `reviewsCount`, `stockQuantity` (default: 10, not null), `sku` (unique).
4. **`productFeatures`:** `id` (integer PK), `productId` (FK -> `products.id`), `feature`.
5. **`orders`:** `id` (text PK), `userId` (FK -> `users.id`), `date`, `status`, `statusText`, `total`, `subtotal`, `shippingFee`, `discountAmount`, `paymentMethod`, `shippingMethod`, `recipientName`, `recipientPhone`, `recipientAddress`, `recipientPostalCode`, `authority`, `refId`.
6. **`orderItems`:** `id` (integer PK), `orderId` (FK -> `orders.id`), `productId` (FK -> `products.id`), `price`, `qty`, `title`, `image`, `brand`.
7. **`reviews`:** `id` (text PK), `productId` (FK -> `products.id`), `userId` (FK -> `users.id`), `userName`, `rating`, `title`, `comment`, `date`, `isVerifiedBuyer`, `recommend`, `helpfulCount`, `unhelpfulCount`.
8. **`coupons`:** `code` (text PK), `percent`, `amount`, `minTotal`, `label`, `active` (boolean).
9. **`cartItems`:** `id` (text PK), `userId` (FK -> `users.id`), `productId` (FK -> `products.id`), `quantity`, `addedAt`.
10. **`wishlistItems`:** `id` (text PK), `userId` (FK -> `users.id`), `productId` (FK -> `products.id`), `addedAt`.

---

## 3. Deep-Dive Inspection of Critical Subsystems

### 3.1 Order Placement & Inventory Transactions (`server/routes/orders.ts`)

#### Current Logic
```ts
const newOrder = db.transaction((tx) => {
  const productIds = items.map((i: any) => i.id || i.productId);
  const dbProducts = tx.select().from(products).where(inArray(products.id, productIds)).all();
  // Validates stock, calculates realSubtotal, verifies coupon, inserts order, inserts items,
  // updates stock: tx.update(products).set({ stockQuantity: sql`stockQuantity - ${item.quantity}` }),
  // deletes user cart.
});
```

#### Defects & Vulnerabilities
1. **Duplicate Item Multi-Check Bypass:**
   - If an order payload contains duplicate item IDs: `items: [{ id: 1, quantity: 4 }, { id: 1, quantity: 4 }]` when product stock is 5:
   - `dbProducts.find(p => p.id === 1)` returns product with `stockQuantity = 5`.
   - The loop checks `5 < 4` (false) on iteration 1, and `5 < 4` (false) on iteration 2 because `dbProducts` is an in-memory array that is never refreshed during the loop.
   - Result: Stock becomes `-3` (negative stock), bypassing inventory protection!
2. **Missing Discount Subtotal Capping (Negative Total):**
   - In `server/routes/orders.ts` lines 117-118:
     ```ts
     const realShippingFee = shippingMethod === 'express' ? 50000 : 35000;
     const realTotal = realSubtotal + realShippingFee - realDiscount;
     ```
   - If a fixed-amount coupon (e.g., 100,000 تومان) is applied to an order where `realSubtotal + realShippingFee < 100000` (or `realSubtotal < realDiscount`), `realTotal` becomes negative.
   - Discount should be capped: `Math.min(realDiscount, realSubtotal)` and total clamped: `Math.max(0, realTotal)`.
3. **Inventory Leak on Failed / Unpaid Payments:**
   - In `POST /api/orders`, stock is decremented immediately when order is created with `status: 'pending_payment'`.
   - In `server/routes/payment.ts` lines 112-117 and 166-170, when payment fails or status is not 'OK', status is updated to `cancelled`, but **stock is NEVER restored / incremented back**.
   - Result: Abandoned or cancelled checkout attempts permanently reduce available stock without any sale.

---

### 3.2 Payment Gateway Verification & Idempotency (`server/routes/payment.ts`)

#### Current Logic
- `POST /api/payment/request`: Generates ZarinPal transaction authority or fallback dummy authority (`DUMMY_AUTH_${Date.now()}`).
- `GET /api/payment/verify`: Checks `Authority` and `Status`.

#### Defects & Vulnerabilities
1. **Hardcoded Merchant ID:**
   - Line 9: `const MERCHANT_ID = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';` ignores `env.ZARINPAL_MERCHANT_ID`.
2. **Missing Authentication on Payment Endpoints:**
   - `/api/payment/request` has no `authenticate` middleware. Anyone can trigger payment requests for arbitrary order IDs.
3. **Missing Stock Restoration on Cancellation:**
   - As noted in 3.1, cancelled payments mark order as cancelled without restocking `products.stockQuantity`.
4. **Lack of Transaction Wrapping in Verify Callback:**
   - `/api/payment/verify` performs multiple separate read/update queries without a database transaction. Concurrent requests with same authority could cause racing status transitions.

---

### 3.3 Coupon Calculation & Validation (`server/routes/coupons.ts` & `orders.ts`)

#### Current Logic
- Case-insensitivity: Uses `code.toUpperCase()` (both routes).
- Percentage discount: `Math.round(realSubtotal * (coupon.percent / 100))`.
- Fixed amount discount: `coupon.amount`.
- Threshold check: `realSubtotal >= coupon.minTotal`.

#### Defects & Gaps
1. **Missing Expiry Date Field & Validation:**
   - Neither `schema.ts` nor validator checks expiration dates (`expiresAt`).
2. **Missing Discount Ceiling / Cap:**
   - No `maxDiscount` cap for percentage coupons (e.g. 50% discount on a 100M purchase gives 50M discount without limit).
3. **Missing Coupon Usage Limits:**
   - No tracking of how many times a user or platform has redeemed a coupon code.

---

### 3.4 Authentication & RBAC Security (`server/middleware/auth.ts`, `routes/auth.ts`, `routes/admin.ts`)

#### Current Logic
- Password hashing with bcrypt (10 rounds).
- Access Token (1 day) & Refresh Token (7 days) signed with separate JWT secrets.
- `authenticate` middleware extracts `Bearer <token>`, verifies JWT access secret, and queries DB for user existence.
- `requireAdmin` checks `req.user.role === 'admin'`, returns 403 Forbidden.

#### Defects & Gaps
1. **Missing Token Refresh Endpoint:**
   - Refresh tokens are generated and returned upon login/registration, but no `/api/auth/refresh` endpoint exists to exchange refresh tokens for new access tokens.
2. **Missing Strict Input Sanitization / Persian Digit Normalization in Auth Validator:**
   - If a user sends Persian digits for phone (`۰۹۱۲۳۴۵۶۷۸۹`), the Zod regex `/^09\d{9}$/` fails with 400 unless converted first.
3. **Admin Endpoints Parameter Validation:**
   - In `server/routes/admin.ts`, routes like `PUT /products/:id`, `DELETE /products/:id`, `PUT /orders/:id/status`, `PUT /users/:id/role` lack Zod middleware validation and rely on ad-hoc manual checks.
4. **Admin Product Deletion Foreign Key Violations:**
   - In `DELETE /admin/products/:id`, transaction deletes `reviews` and `products`, but does not clean up `cart_items`, `wishlist_items`, or `product_features`, causing foreign key constraint errors or orphaned records.

---

### 3.5 User Address Book Operations (`server/routes/users.ts`)

#### Current Logic
- `POST /me/addresses`: Inserts address. If first address, sets `isDefault: true`.
- `PUT /me/addresses/:id`: Updates fields scoped to `userId`.
- `PUT /me/addresses/:id/default`: Runs transaction setting all user addresses `isDefault: false`, then sets targeted address `isDefault: true`.
- `DELETE /me/addresses/:id`: Deletes address scoped to `userId`.

#### Defects & Gaps
1. **Silent 200 OK on Setting Default for Non-Existent Address:**
   - In `PUT /me/addresses/:id/default`, if `addressId` does not exist or belongs to another user, SQLite updates 0 rows and returns 200 OK!
   - Result: All user addresses become `isDefault: false` and no address is default, while returning success instead of 404 Not Found.
2. **No Default Reassignment on Deleting Default Address:**
   - If a user deletes their default address, remaining addresses are left without a default address.
3. **React Portal Missing in Frontend Address Modal:**
   - In `src/components/profile/AddressBookTab.tsx`, the Add/Edit Address modal is rendered inline without `createPortal(..., document.body)`, risking clipping by sticky headers and backdrop filters.

---

### 3.6 TypeScript Compilation & Build Issues

Running `npm run lint` (`tsc --noEmit`) revealed 2 active compilation errors:
1. `server/routes/products.ts:44:33`: `Property 'inStock' does not exist on type ... (products table)`.
   - The schema defines `stockQuantity: integer('stockQuantity')`, but the filter queries `eq(products.inStock, true)`.
   - Must be fixed to `gt(products.stockQuantity, 0)`.
2. `server/data/seed.ts:18:9`: Insertion type mismatch with `id` and `inStock`.

---

## 4. Vulnerability & Implementation Gaps Matrix

| ID | Component | Severity | Description | Recommended Fix |
|---|---|---|---|---|
| **GAP-01** | `server/routes/orders.ts` | **Critical** | Duplicate items in order payload bypass stock verification, driving inventory negative. | Aggregate item quantities by `productId` before stock checking and updating. |
| **GAP-02** | `server/routes/payment.ts` | **Critical** | Cancelled/failed payment verification does not restore decremented product inventory. | Add atomic inventory rollback/restoration inside transaction on payment failure/cancellation. |
| **GAP-03** | `server/routes/orders.ts` | **High** | Fixed discount exceeding cart subtotal causes negative `realTotal`. | Clamp discount to `Math.min(realDiscount, realSubtotal)` and total to `Math.max(0, realTotal)`. |
| **GAP-04** | `server/routes/products.ts` | **High** | `inStock` property does not exist on `products` table schema, breaking TypeScript build and crashing `?inStock=true` queries. | Change query to `gt(products.stockQuantity, 0)` and update seed file. |
| **GAP-05** | `server/routes/users.ts` | **Medium** | `PUT /me/addresses/:id/default` returns 200 OK on non-existent `addressId`, wiping all default flags. | Check affected rows or find address first; return 404 if not found. |
| **GAP-06** | `server/routes/admin.ts` | **Medium** | `DELETE /admin/products/:id` leaves orphaned cart/wishlist/features or triggers FK constraint error. | Delete related `product_features`, `cart_items`, `wishlist_items` within deletion transaction. |
| **GAP-07** | `server/routes/payment.ts` | **Medium** | `/api/payment/request` is unauthenticated and uses hardcoded dummy merchant ID. | Add `authenticate` middleware, verify order ownership, use `env.ZARINPAL_MERCHANT_ID`. |
| **GAP-08** | `server/routes/auth.ts` | **Low** | Missing `/api/auth/refresh` endpoint despite generating refresh tokens. | Implement JWT refresh token verification and access token issuance endpoint. |
| **GAP-09** | `src/components/profile/` | **Low** | AddressModal in `AddressBookTab.tsx` is rendered inline without React Portal. | Wrap modal in `createPortal(..., document.body)` similar to `AuthModal.tsx`. |
| **GAP-10** | `server/routes/cart.ts` | **Low** | `PUT /api/cart/:id` and `DELETE /api/cart/:id` return 200 even when product is not in cart. | Validate numeric ID and handle missing cart items with proper status codes. |

---

## 5. Test Suite State & Expansion Strategy

### Current Test Coverage
- `tests/api/auth.test.ts`: 3 tests (unauthenticated `/me`, unauthenticated `/admin/stats`, invalid login).
- `tests/api/admin.test.ts`: 5 tests (non-admin 403, stats, product CRUD).
- `tests/api/orders.test.ts`: 3 tests (order placement + stock decrement, insufficient stock, invalid coupon).
- `tests/api/products.test.ts`: 3 tests (products list, categories, brands).
- `tests/api/users.test.ts`: 7 tests (profile get/put, address CRUD, default address switch).
- `tests/api/e2e_journey.test.ts`: 7 tests (complete register -> address -> order -> admin ship flow).
- `tests/unit/utils.test.ts`: 4 tests (Persian digits, English digits, mobile validation).
- `tests/unit/validators.test.ts`: 5 tests (Zod schema validations).

### Required Negative & Edge Case Test Additions
1. **Inventory & Concurrency:**
   - Multi-request concurrent checkout racing on the last 1 item in stock.
   - Ordering zero quantity, negative quantity, or decimal quantity.
   - Ordering duplicate item entries in the same payload.
   - Rollback verification during database transaction errors.
2. **Coupons & Discount Bounds:**
   - Discount amount exceeding subtotal.
   - Cart subtotal falling 1 Toman below `minTotal`.
   - Inactive coupon redemption attempt.
   - Mixed-case coupon codes (`welcome10` vs `WELCOME10`).
3. **Payment Callbacks & Idempotency:**
   - Repeated verification callbacks with same authority.
   - Payment cancellation restoring stock.
   - Verification with invalid/unknown authority.
4. **Auth & RBAC Security:**
   - Expired JWT token (401).
   - Malformed / garbage JWT token (401).
   - Non-admin attempting all admin endpoints (`/api/admin/users`, `/api/admin/orders`, `/api/admin/products`, `/api/admin/coupons`) (strict 403).
   - User attempting to view another user's order by ID (`/api/orders/:id`) (404/403).
5. **Address Book Edge Cases:**
   - Setting non-existent address as default (expect 404).
   - Deleting non-existent address (expect 404).
   - Updating another user's address (expect 404).

---

## 6. Actionable Implementation Roadmap

1. **Step 1: Fix Core Schema & TypeScript Errors**
   - Fix `products.inStock` -> `gt(products.stockQuantity, 0)` in `server/routes/products.ts`.
   - Fix `server/data/seed.ts` insertion types.
   - Ensure `npm run lint` passes with 0 errors.

2. **Step 2: Harden Order & Inventory Transactions**
   - Aggregate duplicate item IDs in `POST /api/orders`.
   - Enforce discount capping: `discountAmount <= subtotal`.
   - Prevent negative order total.

3. **Step 3: Implement Payment Stock Rollback & Security**
   - Restock items when payment verification fails or is cancelled in `/api/payment/verify`.
   - Protect `/api/payment/request` with user authentication.
   - Integrate `env.ZARINPAL_MERCHANT_ID`.

4. **Step 4: Harden Address Book & Admin Routes**
   - Fix `PUT /me/addresses/:id/default` to return 404 if address is not found.
   - Handle default address fallback when default address is deleted.
   - Fix `DELETE /admin/products/:id` cascading deletion for features, cart, wishlist, reviews.

5. **Step 5: Frontend React Portal & Form Enhancements**
   - Mount `AddressBookTab` modal using `createPortal(..., document.body)`.

6. **Step 6: Expand Vitest + Supertest Regression Suite**
   - Implement dedicated negative test suites for 400, 401, 403, 404 across all endpoints.
   - Verify 100% test pass rate with zero flake and zero SQLite lock contention.
