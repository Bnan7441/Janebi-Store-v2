# Handoff Report — Challenger 2 (Boundary & Security Edge-Case Challenger)

**Verdict**: **`APPROVE`**  
**Date**: 2026-08-15  
**Scope**: RBAC Security, Coupon Engine Edge Cases, Payment Verification Idempotency, User Address Book Atomicity, Full Test Suite Execution.

---

## 1. Observation

### 1.1 RBAC Enforcement Across Admin Endpoints (`/api/admin/*`)
- **Inspected Files**: `server/middleware/auth.ts:12-46`, `server/routes/admin.ts:1-285`
- **Observed Behavior**:
  - `router.use(authenticate, requireAdmin)` is applied globally at line 10 of `server/routes/admin.ts`.
  - `authenticate` extracts Bearer tokens, decodes JWT, and does a database lookup (`db.query.users.findFirst({ where: eq(users.id, decoded.userId) })`), ensuring forged JWT role claims cannot bypass DB role checks.
  - Unauthenticated requests to all 11 admin endpoints return HTTP `401 Unauthorized` (`{ message: 'Unauthorized: No token provided' }`).
  - Expired tokens, invalid secrets, malformed Authorization headers, and non-existent user tokens return HTTP `401 Unauthorized`.
  - Non-admin user tokens return HTTP `403 Forbidden` (`{ message: 'Forbidden: Requires admin privileges' }`).
  - Non-admin users attempting to escalate privilege via `PUT /api/admin/users/:id/role` are rejected with `403`, and user role in DB remains `user`.

### 1.2 Coupon Engine Boundary & Math Edge Cases
- **Inspected Files**: `server/routes/coupons.ts:10-56`, `server/routes/orders.ts:114-138`, `server/validators/index.ts:24-29`
- **Observed Behavior**:
  - Percentage coupons calculate discounts accurately with `Math.round(cartTotal * (coupon.percent / 100))`.
  - Fixed amount coupons apply flat discounts correctly.
  - Minimum threshold boundary conditions:
    - `cartTotal = minTotal - 1` returns `400 Bad Request` (`valid: false`, minTotal threshold violation message).
    - `cartTotal = minTotal` returns `200 OK` (`valid: true`).
    - `cartTotal = minTotal + 1` returns `200 OK` (`valid: true`).
  - Case-insensitivity: coupon codes in lowercase (`welcome10`), uppercase (`WELCOME10`), mixed case (`WeLcOmE10`), and with leading/trailing whitespace (`  welcome10  `) resolve to the same database coupon record.
  - Inactive coupons (`active: false`) are rejected with `400 Bad Request`.
  - Large discounts exceeding `cartTotal` or `subtotal`:
    - In `server/routes/coupons.ts`: `discount = Math.min(discount, cartTotal); finalTotal = Math.max(0, cartTotal - discount);` ensures discount is clamped and `finalTotal` is never negative.
    - In `server/routes/orders.ts`: `realDiscount = Math.min(realDiscount, realSubtotal); realTotal = Math.max(0, realSubtotal + realShippingFee - realDiscount);` ensuring orders with massive coupons charge shipping correctly and never result in negative totals.
  - Negative `cartTotal` (`-100`) and empty coupon codes (`""`) are rejected with `400 Bad Request` via Zod schema validation.

### 1.3 Payment Verification Idempotency
- **Inspected Files**: `server/routes/payment.ts:102-220`
- **Observed Behavior**:
  - `GET /api/payment/verify` checks if `order.status !== 'pending_payment'` before performing any state transition or inventory modification.
  - On `Status=NOK` (failure): order status transitions to `cancelled`, and product stock is incremented by order items qty.
  - Repeated calls with `Status=NOK` redirect to failed callback and do NOT duplicate stock restoration (stock remains unchanged).
  - 5 concurrent requests with `Status=NOK` against the same authority result in exactly-once stock restoration without race condition.
  - On `Status=OK` (success): order transitions to `processing`, and `refId` is recorded. Repeated calls return redirect with identical `ref_id` and do NOT alter order state.
  - Cross-state tampering (attempting `Status=NOK` on an already `processing` order) does not cancel the order.

### 1.4 User Address Book Default Atomicity
- **Inspected Files**: `server/routes/users.ts:80-224`
- **Observed Behavior**:
  - The first address created for a user automatically gets `isDefault: true`; subsequent addresses receive `isDefault: false`.
  - Switching default address (`PUT /api/users/me/addresses/:id/default`) runs inside `db.transaction((tx) => ...)`: unsets `isDefault: false` on all user addresses, then sets `isDefault: true` on the targeted address. Exactly one address remains default.
  - Deleting the current default address (`DELETE /api/users/me/addresses/:id`) runs inside `db.transaction((tx) => ...)`: deletes the address and automatically promotes a remaining address to `isDefault: true`.
  - Deleting a non-default address preserves the default status of the default address.
  - Setting default on non-existent address ID or another user's address ID returns `404 Not Found`.

### 1.5 Test Suite Execution Output
```
$ npx vitest run
 Test Files  19 passed (19)
      Tests  230 passed (230)
   Start at  14:32:51
   Duration  24.93s
```

---

## 2. Logic Chain

1. **RBAC Logic**: `server/routes/admin.ts` mounts `router.use(authenticate, requireAdmin)` as the first handler. `authenticate` verifies token signature, expiration, and resolves user identity against the database. `requireAdmin` checks `req.user?.role === 'admin'`. Because `req.user` is loaded from the SQLite database rather than blindly trusting token claims, privilege escalation and role tampering are prevented. Tests empirically confirmed `401` on unauthenticated/malformed tokens and `403` on standard user tokens across all 11 admin endpoints.
2. **Coupon Engine Logic**: `server/routes/coupons.ts` applies `typeof code === 'string' ? code.trim().toUpperCase() : ''`, correctly neutralizing case and whitespace variations. `if (cartTotal < coupon.minTotal)` blocks orders below threshold. `Math.min(discount, cartTotal)` and `Math.max(0, ...)` prevent negative calculations. Tests confirmed 100% precision across percentage, fixed, threshold boundary, inactive, and oversized discounts.
3. **Payment Idempotency Logic**: `server/routes/payment.ts` executes state changes inside SQLite transactions and checks `if (order.status !== 'pending_payment') return;`. This guard guarantees that once an order transitions out of `pending_payment`, subsequent callback executions (whether repeated or concurrent) exit cleanly without double restocking or status corruption. Tests confirmed 5 concurrent callbacks incremented stock by exactly the ordered amount once.
4. **Address Atomicity Logic**: `server/routes/users.ts` wraps address updates and deletions in transactions. When a default address is deleted, `tx.select().from(addresses)...orderBy(desc(addresses.id)).limit(1).get()` promotes a remaining address to `isDefault: true`. Database queries verify exactly 1 default address is maintained.

---

## 3. Caveats

- **No caveats**: All 4 challenge scopes, boundary conditions, negative cases, concurrency, tenant isolation, and security constraints were directly tested and empirically verified against the live test database and running Express application.

---

## 4. Conclusion

**Verdict: `APPROVE`**

The Janebi-Store backend demonstrates excellent defensive programming, strict RBAC enforcement, robust edge-case handling in the coupon engine, idempotent payment verification, and atomic address default state management. All 19 test files (230 tests) pass with zero warnings, zero flakes, and zero locking issues.

---

## 5. Verification Method

To independently reproduce and verify this assessment:

```bash
# 1. Run the newly created Adversarial Challenge Suite (23 tests)
npx vitest run tests/api/adversarial_challenge.test.ts

# 2. Run the Full Test Suite across all 19 test files (230 tests)
npx vitest run

# 3. Verify TypeScript build
npm run build
```
