# Janebi-Store Testing Infrastructure & Build Setup Survey Report

**Date:** 2026-08-15  
**Surveyor:** Explorer (explorer_survey_3)  
**Project Root:** `/Users/aidin/antigravity/Janebi-Store`  
**Working Directory:** `/Users/aidin/antigravity/Janebi-Store/.agents/explorer_survey_3`  

---

## Executive Summary

A comprehensive investigation into the testing infrastructure, build pipeline, database configuration, TypeScript health, and API/UI coverage of the **Janebi-Store** e-commerce platform was conducted.

While the existing test suite executes quickly (~3.2s) with 37 passing tests across 8 test files, the investigation identified **critical TypeScript compilation errors**, **database test isolation hazards**, **inconsistent Express test harness setups**, **six completely untested route modules**, and **zero frontend component testing infrastructure**.

| Area | Current Status | Key Findings |
|---|---|---|
| **TypeScript / Linting** | ❌ **FAILING** | 2 compile errors in `server/data/seed.ts` (TS2769) & `server/routes/products.ts` (TS2339) |
| **Production Build** | ⚠️ **CONDITIONAL** | `npm run build` succeeds only because Vite/esbuild strip types without running `tsc --noEmit` |
| **Test Execution** | ✅ **37 / 37 Passing** | 8 test files passing in 3.2s with `fileParallelism: false` |
| **Test Database** | ⚠️ **HAZARDOUS** | Tests execute against the live development database (`./data/janebi.db`) rather than isolated in-memory or temp DB |
| **API Route Coverage** | ⚠️ **PARTIAL (~40%)** | 6 route modules (`cart`, `wishlist`, `coupons`, `payment`, `contact`, `reviews`) have 0 dedicated tests |
| **Negative / Edge Tests** | ❌ **DEFICIENT** | Massive gaps in 400 (validation), 401 (token variations), 403 (admin RBAC), 404 (not found / tenant isolation) |
| **Concurrency & Rollback** | ❌ **UNTESTED** | Zero multi-request race condition tests, zero transaction rollback verification tests |
| **Frontend UI Testing** | ❌ **ABSENT** | No React Testing Library setup; modal portal mounting issues identified in 5 components |

---

## 1. Testing Infrastructure & Framework Inventory

### 1.1 Test Runner & Tools
- **Test Runner:** `vitest` v4.1.10 (configured in `vitest.config.ts`)
- **HTTP Assertions:** `supertest` v7.2.2 (`@types/supertest` v7.2.1)
- **Environment:** `node`
- **Execution Mode:** `fileParallelism: false` (sequential file execution)
- **Coverage Provider:** Missing `@vitest/coverage-v8` / `@vitest/coverage-istanbul` (running `--coverage` fails with missing dependency error)

### 1.2 Frontend Testing Infrastructure
- **Status:** **Completely absent.**
- There is no `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, or `happy-dom` in `package.json`.
- No `.test.tsx` files exist for React components, hooks, or contexts.

### 1.3 Test Harness Architecture Discrepancy
An architectural flaw was discovered across existing test suites:
- `tests/api/auth.test.ts` and `tests/api/products.test.ts` test against the central `app` exported from `server/app.ts`.
- In contrast, `tests/api/orders.test.ts`, `tests/api/admin.test.ts`, `tests/api/users.test.ts`, and `tests/api/e2e_journey.test.ts` construct isolated ad-hoc Express instances (`const app = express(); app.use(json()); app.use('/api/...', route);`).
- **Consequence:** These ad-hoc instances do **not** mount `errorHandler` from `server/middleware/errorHandler.ts`. When a Zod validation error occurs and calls `next(error)`, Express default error handler handles it as an unhandled error (500) rather than a clean JSON 400 response with error details.
- Furthermore, `server/app.ts` includes `rateLimit` (100 reqs/15m). If full regression test suites run against `server/app.ts` without bypassing or raising rate limits in `NODE_ENV=test`, tests will encounter 429 Too Many Requests.

---

## 2. Database Configuration, Concurrency & Locking

### 2.1 Engine & Configuration
- **Engine:** `better-sqlite3` v13.0.3 with `drizzle-orm` v0.45.2
- **Config Location:** `server/db/index.ts`
  ```typescript
  const dbPath = path.resolve(process.cwd(), env.DATABASE_URL);
  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('busy_timeout = 5000');
  export const db = drizzle(sqlite, { schema });
  ```
- **Database URL:** Defaults to `./data/janebi.db` via `server/env.ts`.

### 2.2 Test Isolation Deficiencies
1. **Live Database Mutation:** Tests currently insert and delete records in the live `./data/janebi.db` database.
2. **State Pollution Risk:** Tests rely on manual cleanup in `afterAll()`. If a test suite crashes or aborts during execution, test artifacts remain permanently in `./data/janebi.db`.
3. **No In-Memory / Ephemeral Test Database:** There is no mechanism (like `DATABASE_URL=":memory:"` or a dynamic `/tmp/test-*.db`) to instantiate fresh, isolated database instances per test run.

### 2.3 Concurrency & Lock Contention Analysis
- **SQLite Concurrency Model:** SQLite operates with a single writer lock. Even in WAL mode, write transactions (`BEGIN IMMEDIATE / EXCLUSIVE`) serialize.
- **Busy Timeout:** `sqlite.pragma('busy_timeout = 5000')` allows threads to retry for up to 5 seconds before failing with `SQLITE_BUSY: database is locked`.
- **Parallelism Setting:** Vitest is configured with `fileParallelism: false` to avoid simultaneous multi-file lock conflicts.
- **Race Condition Vulnerabilities:**
  - In `server/routes/orders.ts`, the order placement logic runs inside a synchronous `db.transaction((tx) => ...)`.
  - Inside the transaction, it checks `dbProduct.stockQuantity < quantity` and decrements stock via `tx.update(products).set({ stockQuantity: sql`stockQuantity - ${item.quantity}` })`.
  - While Drizzle's synchronous transaction locks the SQLite database for the duration of the function, there are currently **zero tests** verifying that high-frequency concurrent checkout requests on the last remaining stock item correctly allow exactly one order and cleanly reject subsequent requests without unhandled lock crashes.

### 2.4 Transaction Rollback Integrity
- In `server/routes/orders.ts`: If any item in a multi-item order is out of stock, or if the coupon is invalid, the transaction throws an `Error`, causing `better-sqlite3` to rollback all writes.
- **Testing Gap:** There are **zero tests** validating that when an error occurs halfway through a multi-item checkout transaction, no order record is persisted, no order items are created, and no previously processed item stock counts are decremented.

---

## 3. TypeScript, Linting, & Build Analysis

### 3.1 TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": { "@/*": ["./*"] },
    "allowImportingTsExtensions": true,
    "noEmit": true
  },
  "exclude": ["tests", "vitest.config.ts"]
}
```
- **Observation:** `tests/` and `vitest.config.ts` are excluded from `tsconfig.json`. This means `tsc --noEmit` ignores test file type errors.

### 3.2 Active TypeScript Errors (`npm run lint`)
Running `npm run lint` (`tsc --noEmit`) produces **2 blocking compilation errors**:

1. **`server/data/seed.ts:18:9` (TS2769):**
   - Error: `No overload matches this call. Object literal may only specify known properties, and 'id' does not exist in type...`
   - Cause: `schema.products` defines `id` as auto-increment primary key (`id: integer('id').primaryKey({ autoIncrement: true })`), while `seed.ts` attempts to pass `id: p.id` and `inStock: p.inStock` (which is not a column in `schema.products`).

2. **`server/routes/products.ts:44:33` (TS2339):**
   - Error: `Property 'inStock' does not exist on type 'SQLiteTableWithColumns<...>'`
   - Cause: `server/routes/products.ts` line 44 queries `eq(products.inStock, true)`. In `server/db/schema.ts`, the column is `stockQuantity: integer('stockQuantity')`, not `inStock`. The correct filter condition is `gt(products.stockQuantity, 0)`.

### 3.3 Build Pipeline (`npm run build`)
- **Command:** `vite build && esbuild server/index.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`
- **Client Build:** Vite 8.2.0 compiles 2,275 modules in ~250ms.
  - Output: `dist/index.html` (1.27 kB), `dist/assets/index-*.css` (163.28 kB), `dist/assets/index-*.js` (1,080.18 kB).
  - Warning: Main JS bundle is 1.08 MB (>500 kB recommended threshold). Dynamic code splitting with `React.lazy()` / `import()` is recommended.
- **Server Build:** esbuild compiles `server/index.ts` to `dist/server.cjs` (69.8 kB).
- **Vulnerability:** Neither Vite nor esbuild perform typechecking during build. As a result, `npm run build` succeeds despite active TypeScript compilation errors.

---

## 4. Test Coverage Audit & Endpoint Gap Analysis

### 4.1 Current Test Inventory (8 files, 37 tests)

| Test File | Tests | Covered Scenarios |
|---|---|---|
| `tests/api/admin.test.ts` | 5 | Non-admin 403 on stats, admin stats 200, create product 201, update product 200, delete product 200 |
| `tests/api/auth.test.ts` | 3 | `/api/auth/me` 401 unauthenticated, `/api/admin/stats` 401 unauthenticated, `/api/auth/login` 401 invalid credentials |
| `tests/api/e2e_journey.test.ts` | 7 | Register, add address, view product, place order with coupon, my-orders check, admin view order, admin update order status |
| `tests/api/orders.test.ts` | 3 | Place order & decrement stock 201, insufficient stock 400, invalid coupon 400 |
| `tests/api/products.test.ts` | 3 | List products 200 with `x-total-count`, list categories 200, list brands 200 |
| `tests/api/users.test.ts` | 7 | Get `/me` 200, update `/me` 200, add address 201, list addresses 200, update address 200, set default address 200, delete address 200 |
| `tests/unit/utils.test.ts` | 4 | `toPersianDigits`, `toEnglishDigits`, `isValidIranianMobile` valid, `isValidIranianMobile` invalid |
| `tests/unit/validators.test.ts` | 5 | `registerSchema` valid/invalid, `loginSchema` valid, `cartItemSchema` bounds, `addressSchema` valid |

---

### 4.2 Comprehensive Route-by-Route Gap Matrix

Below is the complete status of all API endpoints and missing test cases:

```
Endpoint                              Method    Existing Tests   Missing Coverage / Gaps
---------------------------------------------------------------------------------------------------------
/api/auth/register                    POST      Partial (E2E)    400 duplicate phone, 400 invalid phone regex, 
                                                                 400 short password (<6 chars), 400 empty name
/api/auth/login                       POST      Partial (401)    401 non-existent user, 400 invalid phone regex, 
                                                                 400 empty password, 200 valid login with addresses
/api/auth/me                          GET       Partial (401)    401 malformed token, 401 expired token, 
                                                                 401 invalid signature, 200 valid profile with addresses

/api/products                         GET       Partial (200)    Filter by category, search query, brands filter, 
                                                                 minPrice/maxPrice, inStock filter, hasDiscount, 
                                                                 sorting (price-asc, price-desc), pagination (page, limit)
/api/products/:id                     GET       Partial (E2E)    404 product not found, 400 non-numeric ID
/api/products/:id/reviews             GET       NONE (0)         200 fetch product reviews, empty reviews list
/api/products/:id/reviews             POST      NONE (0)         400 rating < 1 or > 5, 400 missing required fields, 
                                                                 404 non-existent product, 201 success

/api/categories                       GET       Basic (200)      Response schema verification
/api/brands                           GET       Basic (200)      Response schema verification

/api/cart                             GET       NONE (0)         401 unauthenticated, 200 returns formatted cart items
/api/cart                             POST      NONE (0)         401 unauthenticated, 400 invalid productId/quantity, 
                                                                 200 new item added, 200 existing item incremented (max 10)
/api/cart/:id                         PUT       NONE (0)         401 unauthenticated, 400 quantity > 10, 200 update
/api/cart/:id                         DELETE    NONE (0)         401 unauthenticated, 200 remove item
/api/cart                             DELETE    NONE (0)         401 unauthenticated, 200 clear cart

/api/wishlist                         GET       NONE (0)         401 unauthenticated, 200 return user wishlist products
/api/wishlist                         POST      NONE (0)         401 unauthenticated, 400 invalid productId, 
                                                                 200 add new, 200 idempotent add existing
/api/wishlist/:id                     DELETE    NONE (0)         401 unauthenticated, 200 remove item

/api/coupons/validate                 POST      NONE (0)         400 missing code/cartTotal, 400 inactive/expired, 
                                                                 400 cartTotal < minTotal, 200 percentage discount, 
                                                                 200 fixed amount discount, case insensitivity (lower/upper)

/api/orders                           POST      Partial (201,400)401 unauthenticated, 400 empty items, 
                                                                 400 missing recipient fields (name, phone, address), 
                                                                 zero stock handling, exact stock boundary, 
                                                                 coupon calculation (percentage vs fixed), 
                                                                 shipping fee (express vs regular), 
                                                                 multi-item transaction rollback, 
                                                                 concurrent order race conditions on last stock
/api/orders, /api/orders/my-orders    GET       Partial (E2E)    401 unauthenticated, 200 returns formatted orders
/api/orders/:id                       GET       NONE (0)         401 unauthenticated, 404 non-existent order, 
                                                                 404 order belongs to another user (tenant isolation)

/api/payment/request                  POST      NONE (0)         400 missing orderId, 404 order not found, 
                                                                 200 dummy authority fallback & database update
/api/payment/verify                   GET       NONE (0)         Redirect failed on missing query params, 
                                                                 Redirect failed on invalid authority, 
                                                                 Idempotency: already-processed order handling, 
                                                                 Status != 'OK' sets order to 'cancelled', 
                                                                 Status == 'OK' sets order to 'processing' with refId

/api/users/me                         GET       Basic (200)      401 unauthenticated, 404 deleted user
/api/users/me                         PUT       Basic (200)      401 unauthenticated, 400 invalid email format, 200 update
/api/users/me/addresses               GET       Basic (200)      401 unauthenticated, 200 list addresses
/api/users/me/addresses               POST      Basic (201)      401 unauthenticated, 400 missing title/name/phone/address, 
                                                                 400 invalid phone regex, 201 sets isDefault for 1st address
/api/users/me/addresses/:id           PUT       Basic (200)      401 unauthenticated, 404 address not found / another user's
/api/users/me/addresses/:id/default   PUT       Basic (200)      401 unauthenticated, 404 not found, atomic default switch
/api/users/me/addresses/:id           DELETE    Basic (200)      401 unauthenticated, 404 not found / another user's

/api/contact                          POST      NONE (0)         400 missing name/email/message, 200 success

/api/admin/stats                      GET       Basic (200,403)  401 unauthenticated, 403 non-admin, 200 metric calculation
/api/admin/users                      GET       NONE (0)         401 unauthenticated, 403 non-admin, 200 safe user list
/api/admin/users/:id/role             PUT       NONE (0)         401 unauthenticated, 403 non-admin, 400 invalid role, 
                                                                 200 valid role update
/api/admin/products                   POST      Basic (201)      401 unauthenticated, 403 non-admin, 400 missing title/category
/api/admin/products/:id               PUT       Basic (200)      401 unauthenticated, 403 non-admin, 404 non-existent product
/api/admin/products/:id               DELETE    Basic (200)      401 unauthenticated, 403 non-admin, cascade delete reviews
/api/admin/orders                     GET       Basic (200)      401 unauthenticated, 403 non-admin, 200 all orders list
/api/admin/orders/:id/status          PUT       Basic (200)      401 unauthenticated, 403 non-admin, 400 missing status, 
                                                                 404 non-existent order
/api/admin/coupons                    GET       NONE (0)         401 unauthenticated, 403 non-admin, 200 coupon list
/api/admin/coupons                    POST      NONE (0)         401 unauthenticated, 403 non-admin, 400 missing code/label, 
                                                                 201 create coupon
/api/admin/coupons/:code              DELETE    NONE (0)         401 unauthenticated, 403 non-admin, 200 delete coupon
```

---

## 5. Frontend UI & Form Validation Inspection

### 5.1 Modal Mounting & Portal Audit
Investigation of modal implementations across the codebase revealed an inconsistency:

| Component | Modal Purpose | Mounting Method | Status / Risk |
|---|---|---|---|
| `src/components/auth/AuthModal.tsx` | Login / Register | `createPortal(modalContent, document.body)` | ✅ Correctly isolated from parent DOM |
| `src/components/profile/AddressBookTab.tsx` | Add / Edit Address | Inline DOM render (`{showModal && <div className="fixed inset-0 ...">}`) | ⚠️ **Risk:** Trapped in parent stacking context; clipped by backdrop filters / overflow |
| `src/pages/admin/Orders.tsx` | Order Details View | Inline DOM render (`{isModalOpen && <div className="fixed inset-0 ...">}`) | ⚠️ **Risk:** Stacking context trapping |
| `src/pages/admin/Products.tsx` | Product Add/Edit Form | Inline DOM render (`{isModalOpen && <div className="fixed inset-0 ...">}`) | ⚠️ **Risk:** Stacking context trapping |
| `src/pages/admin/Coupons.tsx` | Coupon Add Form | Inline DOM render (`{isModalOpen && <div className="fixed inset-0 ...">}`) | ⚠️ **Risk:** Stacking context trapping |
| `src/pages/Profile.tsx` | Logout Confirmation | Inline DOM render (`{showLogoutModal && <div className="fixed inset-0 ...">}`) | ⚠️ **Risk:** Stacking context trapping |

**Recommendation:** Wrap all modal overlays in `createPortal(modalElement, document.body)` to ensure they always mount at document root, above sticky navigation headers and backdrop blur containers.

### 5.2 Form Inputs & Validation Formats
- **Phone Formatting:** `src/lib/utils.ts` contains `isValidIranianMobile` and `toEnglishDigits` which properly handles Persian/Arabic numerals, spaces, and country code prefixes (`+98`, `0098`, `0`).
- **LTR Attributes:** Form inputs for phone numbers and passwords across `AuthModal.tsx`, `AddressBookTab.tsx`, and `CheckoutRecipientForm.tsx` correctly specify `dir="ltr"` and `text-left font-mono`.

---

## 6. Bottlenecks, Risks, & Implementation Recommendations

### 6.1 Critical Fixes Required Before Expansion
1. **Fix TypeScript Errors:**
   - In `server/routes/products.ts:44`: Replace `eq(products.inStock, true)` with `gt(products.stockQuantity, 0)`.
   - In `server/data/seed.ts:18`: Clean up insert types for `products` table so `tsc --noEmit` passes with 0 errors.
2. **Include Tests in Typechecking:**
   - Update `tsconfig.json` or create `tsconfig.test.json` so test files are type-checked during linting.
3. **Standardize Test App Harness with Global Error Handling:**
   - Create a test helper `createTestApp()` or export configured `app` with `errorHandler` attached, ensuring Zod errors consistently return structured JSON 400 responses across all test suites.

### 6.2 Test Database Architecture Recommendation
- For hermetic, fast, and flake-free testing:
  - Configure `DATABASE_URL` during tests to point to a temporary SQLite database per run (or run migrations/push against `:memory:` / temp file).
  - Ensure all database tables are cleanly seeded or wiped per test suite without touching development data.

### 6.3 Test Expansion Roadmap
- **Sprint 1 (Negative & Security Tests):** Implement comprehensive 400, 401, 403, 404 tests for all routes (`auth`, `admin`, `users`, `cart`, `wishlist`, `coupons`, `orders`, `payment`, `contact`).
- **Sprint 2 (Transactions & Concurrency):** Implement SQLite race condition tests (concurrent checkouts on single stock) and multi-item order failure rollback tests.
- **Sprint 3 (Coupons & Payment Idempotency):** Implement coupon threshold, percentage/fixed calculations, and payment verify idempotency callbacks.
- **Sprint 4 (Frontend UI Verification):** Verify React Portals for modals and form validation behaviors.
