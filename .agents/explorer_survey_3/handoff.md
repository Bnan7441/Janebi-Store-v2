# Handoff Report — Testing Infrastructure & Build Setup Survey

**Working directory:** `/Users/aidin/antigravity/Janebi-Store/.agents/explorer_survey_3`  
**Report target:** `survey_report.md`  

---

## 1. Observation

1. **Test Runner & Execution:**
   - Vitest v4.1.10 (`vitest.config.ts`: `fileParallelism: false`, `environment: 'node'`) + Supertest v7.2.2.
   - Command: `npm test` runs 8 test files, 37 tests, 0 failures in 3.24s.
   - Coverage tool (`@vitest/coverage-v8`) is missing from dependencies (`npx vitest run --coverage` exits with code 1).
   - Frontend test framework (React Testing Library / Jest DOM / jsdom) is completely absent.

2. **TypeScript & Build:**
   - `npm run lint` (`tsc --noEmit`) fails with 2 compilation errors:
     - `server/data/seed.ts:18:9` — TS2769: No overload matches this call (inserting `id` and non-existent `inStock` on `schema.products`).
     - `server/routes/products.ts:44:33` — TS2339: Property `inStock` does not exist on `products` table (schema defines `stockQuantity`).
   - `tsconfig.json` excludes `["tests", "vitest.config.ts"]`.
   - `npm run build` succeeds in 254ms (Vite client bundle 1.08 MB, esbuild server bundle 69.8 kB) only because Vite and esbuild strip types without running `tsc`.

3. **Database Architecture & Test Isolation:**
   - `server/db/index.ts` connects directly to `./data/janebi.db` (`journal_mode = WAL`, `busy_timeout = 5000`).
   - Test suites mutate the development database file (`./data/janebi.db`) with manual `beforeAll`/`afterAll` inserts/deletes. No in-memory (`:memory:`) or ephemeral test database is configured.
   - SQLite transactions are synchronous `db.transaction((tx) => ...)`. Zero tests exist for multi-request concurrent checkouts or transaction rollback upon mid-flight error.

4. **API Endpoint Coverage Gaps:**
   - 6 route modules have 0 dedicated tests: `cart.ts` (GET, POST, PUT, DELETE), `wishlist.ts` (GET, POST, DELETE), `coupons.ts` (POST `/validate`), `payment.ts` (POST `/request`, GET `/verify`), `contact.ts` (POST `/`), and product reviews (`POST /api/products/:id/reviews`).
   - Major negative testing gaps exist: missing 400 validation tests across all routes, missing 401 token variation tests (malformed, expired, invalid signature), missing 403 admin tests on coupon/role mutations, and missing 404/tenant isolation tests on orders/addresses.
   - Test harness discrepancy: `orders.test.ts`, `admin.test.ts`, `users.test.ts`, and `e2e_journey.test.ts` create ad-hoc `express()` apps without mounting `errorHandler`, causing Zod validation errors to trigger default Express 500 HTML responses instead of JSON 400 `{ error: 'Validation Error', details: ... }`.

5. **Frontend UI Modals & Portals:**
   - `AuthModal.tsx` correctly uses `createPortal(modalContent, document.body)`.
   - In contrast, `AddressBookTab.tsx`, `admin/Orders.tsx`, `admin/Products.tsx`, `admin/Coupons.tsx`, and `Profile.tsx` render modal overlays inline in the component tree, risking stacking context clipping and backdrop filter containment.

---

## 2. Logic Chain

1. **Build & Type Safety:** `npm run build` passes while `npm run lint` fails because bundlers (Vite + esbuild) do not validate types. Therefore, the codebase has unresolved type errors in `products.ts` and `seed.ts` that will break strict CI or production typechecking.
2. **Database Test Pollution & Flake Risk:** Because tests read and write to `./data/janebi.db`, test runs are not hermetic. Any test failure before `afterAll` pollutes the development database with test data, potentially affecting future test assertions and development state.
3. **Validation Error Mismatch:** Because test files construct separate Express apps without `errorHandler`, testing negative validation paths (400) against these ad-hoc apps fails with unhandled 500 errors. A unified test app harness is necessary.
4. **Coverage & Security Gaps:** Because 6 route modules have no tests and existing routes only test happy paths, edge cases (zero stock, race conditions, expired coupons, duplicate payment callbacks, non-admin privilege escalation) remain unverified.

---

## 3. Caveats

- **Network Mode:** Investigation was conducted locally without live external ZarinPal payment gateway network calls. Payment tests should rely on ZarinPal sandbox / dummy authority fallback logic present in `payment.ts`.
- **Read-Only Scope:** In accordance with the Explorer persona, no source code or configuration files outside `.agents/explorer_survey_3/` were modified.

---

## 4. Conclusion

The testing infrastructure requires four core enhancements before expanding regression suites:
1. **Fix 2 blocking TypeScript errors** in `server/routes/products.ts` and `server/data/seed.ts`.
2. **Standardize test harness** with a shared test app that mounts global middleware (`errorHandler`).
3. **Implement comprehensive test suites** covering all 6 missing route modules, all 400/401/403/404 negative branches, SQLite transaction rollback, and concurrent checkout race conditions.
4. **Wrap inline modals** in `createPortal(..., document.body)` to fix stacking context issues.

---

## 5. Verification Method

To independently verify these findings, execute:

1. **Verify TypeScript errors:**
   ```bash
   npm run lint
   ```
   *Expected Output:* TS2769 in `server/data/seed.ts:18:9` and TS2339 in `server/routes/products.ts:44:33`.

2. **Verify current test pass status:**
   ```bash
   npm test
   ```
   *Expected Output:* 8 test files pass, 37 tests pass.

3. **Verify build behavior:**
   ```bash
   npm run build
   ```
   *Expected Output:* Vite and esbuild build successfully in <1s despite TypeScript errors.

4. **Inspect full survey findings:**
   - View `/Users/aidin/antigravity/Janebi-Store/.agents/explorer_survey_3/survey_report.md`
