## 2026-08-15T09:17:29Z
You are a Worker implementing Milestone 4 for Janebi-Store.

Working directory: /Users/aidin/antigravity/Janebi-Store/.agents/worker_m4
Project root: /Users/aidin/antigravity/Janebi-Store

Read the following files before starting:
- /Users/aidin/antigravity/Janebi-Store/.agents/ORIGINAL_REQUEST.md
- /Users/aidin/antigravity/Janebi-Store/PROJECT.md
- /Users/aidin/antigravity/Janebi-Store/TEST_INFRA.md
- /Users/aidin/antigravity/Janebi-Store/.agents/explorer_survey_3/survey_report.md

Assigned Scope (Milestone 4 - Comprehensive Vitest + Supertest Expansion & Regression Verification):
1. **Standardize Test App Harness & Error Handling**:
   - Ensure all test suites mount `errorHandler` from `server/middleware/errorHandler.ts` or use centralized test app factory so Zod validation errors cleanly return JSON 400 responses.
   - Ensure rate limit is disabled or bypassed in test environment (`NODE_ENV=test`) so high-volume regression test runs never hit 429 Too Many Requests.
2. **Implement Missing Route Test Suites**:
   - Create `tests/api/cart.test.ts`: 401 unauthenticated, add item (200), increment quantity up to max 10 (200), exceed max 10 (400), update quantity (200), delete single item (200), clear all cart (200), invalid productId (400).
   - Create `tests/api/wishlist.test.ts`: 401 unauthenticated, add item (200), idempotent re-add (200), remove item (200), get user wishlist (200), invalid productId (400).
   - Create `tests/api/contact.test.ts`: 400 missing required fields, 200 valid contact submission.
   - Expand `tests/api/products.test.ts`: filter by category, brand, min/max price, inStock, hasDiscount, search query, sorting (price-asc/desc), pagination, 404 for non-existent product, review creation (201), review validation (rating <1 or >5 -> 400), review non-existent product (404).
3. **Exhaustive Negative & RBAC Test Coverage (400, 401, 403, 404)**:
   - Expand `tests/api/auth.test.ts`: expired JWT token (401), malformed/garbage JWT (401), invalid signature (401), missing header (401), duplicate registration phone (400), invalid phone format (400), short password (400).
   - Expand `tests/api/admin.test.ts`: non-admin user attempting all admin routes (strict 403 on `/api/admin/users`, `/api/admin/users/:id/role`, `/api/admin/orders`, `/api/admin/orders/:id/status`, `/api/admin/products`, `/api/admin/coupons`), 404 on missing records, 400 on invalid role/status enum.
   - In `tests/api/orders.test.ts`: tenant isolation (user A cannot fetch `GET /api/orders/:id` or cancel `POST /api/orders/:id/cancel` of user B's order -> 403/404), empty items (400), missing recipient info (400), zero stock (400).
4. **Concurrency & Transaction Rollback Test Suite**:
   - Create `tests/concurrency/race_conditions.test.ts`:
     - Multi-request concurrent checkout racing on the last 1 remaining stock item (`Promise.all` with multiple simultaneous `supertest` requests): assert exactly 1 request succeeds with 201 and all other requests fail with 400 ("تعداد درخواستی بیشتر از موجودی است"), verifying no negative stock and zero SQLite busy lock crashes.
     - Multi-item transaction rollback test: create an order with Item A (in stock) and Item B (out of stock). Verify checkout fails with 400, and assert that Item A's stock was NOT decremented in the database and no partial order was created.
5. **Verify Full Acceptance**:
   - Run `npx vitest run`: 100% test pass rate across all test files.
   - Run `npm run lint`: 0 TypeScript errors.
   - Run `npm run build`: Clean production build.
