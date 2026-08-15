# Project: Janebi-Store E-Commerce Platform Verification & Hardening

## Architecture
- **Backend:** Node.js + Express 5, better-sqlite3 with WAL mode, Drizzle ORM, Zod validation, JWT authentication, bcrypt password hashing.
- **Frontend:** React 19, Vite 8, React Router DOM v7, Tailwind CSS v4, Motion (Framer Motion 12), Lucide React, Persian RTL styling.
- **Database:** SQLite at `./data/janebi.db` with WAL mode and 5000ms busy timeout.
- **Testing:** Vitest 4 with Supertest 7, sequential file execution (`fileParallelism: false`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | TypeScript & Schema Fixes | Fix `products.inStock` -> `gt(products.stockQuantity, 0)` and seed types | M1 | Survey (TS2339/TS2769) |
| 2 | Inventory Concurrency & Race Protection | Aggregate duplicate item quantities before stock check; prevent negative inventory | M1 | Survey GAP-01 |
| 3 | Order Total & Discount Capping | Prevent negative total with discount clamping `Math.min(realDiscount, realSubtotal)` | M1 | Survey GAP-03 |
| 4 | Payment Stock Restoration & Security | Restock cancelled/failed payments; auth protect payment requests | M1 | Survey GAP-02, GAP-07 |
| 5 | Order Cancellation API | Dedicated `POST /api/orders/:id/cancel` endpoint with stock restoration | M1 | Survey Frontend Gap |
| 6 | Address Book Default Atomicity | Return 404 on non-existent address ID; atomic default switch; delete fallback | M2 | Survey GAP-05 |
| 7 | User Password Update Endpoint | Backend `PUT /api/users/me/password` with bcrypt verification | M2 | Survey Frontend Gap |
| 8 | Admin Product Cascade Deletion | Cleanly delete related features, cart, wishlist, and reviews in transaction | M2 | Survey GAP-06 |
| 9 | Coupon Calculation & Threshold Validation | Validate bounds, case-insensitivity, minTotal threshold, inactive coupons | M2 | Survey R1 |
| 10 | Shipping Rate Harmony | Harmonize shipping rates and free shipping thresholds across frontend & backend | M2 | Survey UI Inconsistency |
| 11 | Persian Digit Normalization | Standardize Iranian phone inputs (`toEnglishDigits` / `normalizeIranianMobile`) | M3 | Survey Frontend R2 |
| 12 | React Portal Modal Architecture | Wrap all modals in `createPortal(..., document.body)` with body scroll lock | M3 | Survey Frontend R2 |
| 13 | LTR Input Directions & RTL Fixes | Apply `dir="ltr"` and `text-left font-mono` to phone, password, postal code | M3 | Survey Frontend R2 |
| 14 | Admin Products Data Parsing Bug | Handle array response in `AdminProducts.tsx` (`data` vs `data.products`) | M3 | Survey Frontend Bug |
| 15 | Profile Real Mutations Integration | Connect profile password change and order cancel to real API endpoints | M3 | Survey Frontend Bug |
| 16 | Standardized Test App Harness | Mount `errorHandler` on test app instances to return clean JSON 400s | M4 | Survey Test Gap |
| 17 | Negative & RBAC Test Suite Expansion | Full 400/401/403/404 coverage across auth, admin, users, cart, wishlist, etc. | M4 | Survey Test Gap / R3 |
| 18 | Concurrency & Race Condition Tests | Concurrent checkout on last stock item verifying single winner | M4 | Survey Test Gap / R1 |
| 19 | Transaction Rollback Integrity Tests | Multi-item checkout failure rollback verification | M4 | Survey Test Gap / R1 |
| 20 | Payment Callback Idempotency Tests | Verify duplicate callbacks, failure restocking, and authority handling | M4 | Survey Test Gap / R1 |
| 21 | Full Acceptance & Clean Build Verification | 100% test pass rate, zero flake, zero TypeScript errors, clean `npm run build` | M4 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Backend Concurrency, Inventory Lock, Rollbacks, and Order/Payment Security | Features 1, 2, 3, 4, 5 | None | DONE |
| M2 | Coupon Engine, Address Book Atomicity, Cascading Deletions & User APIs | Features 6, 7, 8, 9, 10 | M1 | DONE |
| M3 | Frontend UI, Persian Digit Sanitization, LTR Inputs & React Portal Modals | Features 11, 12, 13, 14, 15 | M1, M2 | DONE |
| M4 | Comprehensive Vitest + Supertest Expansion & Regression Verification | Features 16, 17, 18, 19, 20, 21 | M1, M2, M3 | DONE |

## Interface Contracts
### `POST /api/orders`
- **Request Body:** `{ items: Array<{ id: number, quantity: number }>, shippingMethod: 'standard' | 'express', recipientName: string, recipientPhone: string, recipientAddress: string, recipientPostalCode?: string, couponCode?: string }`
- **Response 201:** `{ order: Order }`
- **Response 400:** `{ error: string }` (e.g. "محصول با شناسه X ناموجود است", "تعداد درخواستی بیشتر از موجودی است")

### `POST /api/orders/:id/cancel`
- **Request:** Authenticated User
- **Response 200:** `{ message: string, order: Order }`
- **Response 400/403/404:** Invalid status transition, wrong user, or not found.

### `PUT /api/users/me/addresses/:id/default`
- **Request:** Authenticated User, address ID in params
- **Response 200:** `{ message: 'آدرس پیش‌فرض با موفقیت تغییر کرد' }`
- **Response 404:** `{ error: 'آدرس مورد نظر یافت نشد' }`

### `PUT /api/users/me/password`
- **Request Body:** `{ currentPassword: string, newPassword: string }`
- **Response 200:** `{ message: 'کلمه عبور با موفقیت به‌روزرسانی شد' }`
- **Response 400:** `{ error: string }` (e.g. wrong current password or validation error)

## Code Layout
- `server/` - Backend API, routes, middleware, db schema, validators.
- `src/` - Frontend React application, components, pages, context, hooks.
- `tests/` - Vitest test suites (`tests/api/`, `tests/unit/`, `tests/concurrency/`).
