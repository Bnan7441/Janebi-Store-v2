# Handoff Report: Milestone 2 (Janebi-Store)

## 1. Observation
- In `server/routes/users.ts`, `PUT /me/addresses/:id/default` previously updated records without verifying that the targeted address existed for the user, resulting in a silent 200 OK while wiping default flags. `DELETE /me/addresses/:id` previously deleted default addresses without promoting remaining addresses to default. `PUT /me/password` was completely missing.
- In `server/routes/admin.ts`, `DELETE /admin/products/:id` only deleted `reviews` and `products`, leaving `productFeatures`, `cartItems`, and `wishlistItems` orphaned or risking FK constraint violations. Routes `PUT /admin/orders/:id/status`, `DELETE /admin/coupons/:code`, and `PUT /admin/users/:id/role` lacked 404 handlers when targets did not exist and allowed unvalidated status transitions.
- In `server/routes/coupons.ts`, discount calculation was missing, and responses lacked discount amounts, final total calculations, and threshold error messages.
- Command executions:
  - `npm run lint` output: `> tsc --noEmit` -> Exited with code 0.
  - `npx vitest run` output: `Test Files 10 passed (10), Tests 71 passed (71)` -> Exited with code 0.
  - `npm run build` output: `vite v8.2.0 building client environment for production... ✓ built in 291ms; dist/server.cjs 82.7kb` -> Exited with code 0.

## 2. Logic Chain
- **Step 1 (Address Book Atomicity & Fallbacks):** By verifying address existence inside a database transaction before updating, `PUT /me/addresses/:id/default` returns a 404 when the address is not found and atomically resets other addresses and sets the target to default. In `DELETE /me/addresses/:id`, deleting within a transaction and checking `target.isDefault` allows query of the most recent remaining address (`orderBy(desc(addresses.id))`) to designate it as the new default.
- **Step 2 (Password Update Endpoint):** Authenticated `PUT /me/password` uses Zod to validate input (`currentPassword` string, `newPassword` min 6 chars), uses `bcrypt.compare` against stored hash, returns 400 on mismatch, and hashes the new password with `bcrypt.hash(..., 10)` before storing.
- **Step 3 (Admin Route Hardening & Cascade Deletions):** `DELETE /admin/products/:id` checks product existence (404 on missing) and wraps deletions of `productFeatures`, `cartItems`, `wishlistItems`, `reviews`, and `products` in an atomic database transaction. `DELETE /admin/coupons/:code`, `PUT /admin/orders/:id/status`, and `PUT /admin/users/:id/role` return 404 if the record is not found, and `PUT /admin/orders/:id/status` enforces valid status enums (`pending_payment`, `processing`, `shipped`, `delivered`, `cancelled`).
- **Step 4 (Coupon Calculation Engine):** `server/routes/coupons.ts` uses `couponValidationSchema`, upper-cases code for case-insensitivity, validates `active` status and `cartTotal >= coupon.minTotal`, clamps discount to `Math.min(discount, cartTotal)`, and calculates `finalTotal = Math.max(0, cartTotal - discount)`.
- **Step 5 (Validation Middleware):** `server/middleware/validate.ts` handles `ZodError` to directly return a 400 JSON response with error messages and issues.

## 3. Caveats
- Historical `orderItems` referencing products are preserved so order histories remain intact.
- If a user deletes all addresses, no address is set as default because no addresses remain.

## 4. Conclusion
Milestone 2 implementation is complete and verified. Address book operations are atomic with automatic fallback designation, user password change endpoint is fully secure with bcrypt hashing, admin operations cleanly cascade and reject invalid/missing records with 400/404, coupon calculation correctly handles all bounds and edge cases, and all automated tests (71 tests across 10 suites) pass 100%.

## 5. Verification Method
1. `npm run lint` — Verifies TypeScript compilation with 0 errors.
2. `npx vitest run` — Runs all 10 unit, integration, and E2E test suites (including `tests/api/users.test.ts`, `tests/api/admin.test.ts`, and `tests/api/coupons.test.ts`).
3. `npm run build` — Validates client bundle generation and server CJS packaging with esbuild.
