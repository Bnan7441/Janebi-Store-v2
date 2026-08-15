## 2026-08-15T10:30:07Z
You are the Milestone 4 Worker for the Janebi-Store project.

Your working directory is: /Users/aidin/antigravity/Janebi-Store/.agents/worker_m4_gen2
Project root: /Users/aidin/antigravity/Janebi-Store

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Context:
Previous workers implemented M1 (backend concurrency, inventory race protection, discount capping, order cancellation API, payment restocking), M2 (coupon validation engine, atomic address defaults, admin cascade delete, user password update API), and M3 (frontend Persian digit normalization, React Portal modal mounting with scroll locking, LTR form inputs, admin products data parsing).

Your Task (Milestone 4: Comprehensive Test Suite Expansion & Build Verification):
1. Read the following reference files first:
   - /Users/aidin/antigravity/Janebi-Store/.agents/ORIGINAL_REQUEST.md
   - /Users/aidin/antigravity/Janebi-Store/PROJECT.md
   - /Users/aidin/antigravity/Janebi-Store/TEST_INFRA.md
   - /Users/aidin/antigravity/Janebi-Store/.agents/worker_m1/changes.md
   - /Users/aidin/antigravity/Janebi-Store/.agents/worker_m2/changes.md
   - /Users/aidin/antigravity/Janebi-Store/.agents/worker_m3/changes.md

2. Inspect and expand the test suites under `tests/` to provide exhaustive coverage across all tiers (Tier 1 Feature, Tier 2 Boundary/Negative, Tier 3 Cross-Feature, Tier 4 Workload, Tier 5 Concurrency/Rollback):
   - Auth & RBAC (`tests/api/auth.test.ts`): registration validation, login with invalid/valid creds, JWT expired/malformed, missing Authorization header, profile boundary.
   - Products & Search (`tests/api/products.test.ts`): category filtering, search queries, pagination limits/offsets, negative/invalid IDs, featured/bestseller/discounted filters.
   - Cart & Wishlist (`tests/api/cart.test.ts`, `tests/api/wishlist.test.ts`): unauthenticated access, add/update/remove items, quantity bounds, duplicate additions.
   - Coupons (`tests/api/coupons.test.ts`): percentage vs fixed discount, minimum order threshold, case insensitivity, inactive/expired coupons, discount exceeding subtotal.
   - Orders & Checkout (`tests/api/orders.test.ts`): multi-item checkout, stock deduction, discount clamping, order cancellation API (`POST /api/orders/:id/cancel`) with stock restoration, status transitions.
   - Payment Verification (`tests/api/payment.test.ts`): payment request creation, callback idempotency, verification failure stock restoration, authority security.
   - Users & Addresses (`tests/api/users.test.ts`): address CRUD, atomic default switch (`PUT /api/users/me/addresses/:id/default`), 404 on missing address, default address deletion fallback, password update API (`PUT /api/users/me/password`).
   - Admin Management (`tests/api/admin.test.ts`): strict 403 enforcement for non-admins, order status mutation, cascade product deletion (deleting product removes related features, cart, wishlist, reviews cleanly).
   - Contact & Reviews (`tests/api/contact.test.ts`, `tests/api/reviews.test.ts`): contact message submission, review creation and rating bounds.
   - Concurrency & Race Conditions (`tests/concurrency/inventory-race.test.ts`): parallel requests competing for the last item in stock, verifying single winner and no negative stock or DB lock crash.
   - Transaction Rollbacks (`tests/unit/transaction-rollback.test.ts`): multi-item order where one item fails, verifying zero changes committed to database.
   - Persian Utilities (`tests/unit/persian-utils.test.ts`): Persian digit conversion (`toEnglishDigits`), Iranian mobile normalization (`normalizeIranianMobile`), price formatting.

3. Run the automated tests:
   - Execute `npx vitest run` (or `npm run test`).
   - Verify that 100% of tests pass cleanly with zero failures and zero unhandled rejections.

4. Run the production build:
   - Execute `npm run build`.
   - Verify that TypeScript compilation (`tsc`) and Vite bundling complete with zero errors.

5. Publish `TEST_READY.md` at project root (`/Users/aidin/antigravity/Janebi-Store/TEST_READY.md`) summarizing test tiers, total test count, and pass status.

6. Maintain your working directory `/Users/aidin/antigravity/Janebi-Store/.agents/worker_m4_gen2`:
   - Keep `progress.md` updated.
   - Write `changes.md` detailing any test and code changes made.
   - Write `handoff.md` with complete test and build results.
   - Send completion message to parent when done.
