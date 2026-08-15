# Milestone 2 Implementation Changes Report

## Overview
Milestone 2 focused on hardening address book operations with atomic default switching and automatic fallback promotion upon deletion, implementing user password updates with bcrypt verification and hashing, implementing admin cascading product deletions and route hardening, and creating the coupon calculation engine with discount clamping and threshold checks.

---

## Detailed File Modifications

### 1. `server/validators/index.ts`
- Added `updatePasswordSchema` verifying `currentPassword` (string, min 1) and `newPassword` (string, min 6).
- Enhanced `couponValidationSchema` ensuring `cartTotal` is a non-negative number.

### 2. `server/middleware/validate.ts`
- Handled `ZodError` directly in middleware to guarantee uniform 400 Bad Request responses containing validation error details across all routes and test suites.

### 3. `server/routes/users.ts`
- **Address Default Switching (`PUT /me/addresses/:id/default`):**
  - Validates ownership; if address is not found or not owned by user, returns 404 `{ error: 'آدرس مورد نظر یافت نشد' }`.
  - Atomically inside a transaction clears `isDefault: false` across all user addresses and sets the target address to `isDefault: true`.
- **Address Deletion with Fallback (`DELETE /me/addresses/:id`):**
  - Validates ownership; returns 404 if address is not found.
  - In a transaction, deletes the target address. If the deleted address had `isDefault: true`, automatically designates the most recent remaining address (`orderBy(desc(addresses.id))`) as the new default.
- **Address Editing (`PUT /me/addresses/:id`):**
  - Validates ownership; returns 404 if address is not found.
- **User Password Update (`PUT /me/password`):**
  - Validates request body with `updatePasswordSchema`.
  - Verifies `currentPassword` against `user.password` using `bcrypt.compare`.
  - Returns 400 `{ error: 'کلمه عبور فعلی نادرست است' }` upon password mismatch.
  - Securely hashes `newPassword` using `bcrypt.hash(..., 10)` and updates database record.
  - Returns 200 `{ message: 'کلمه عبور با موفقیت به‌روزرسانی شد' }`.

### 4. `server/routes/admin.ts`
- **Cascade Product Deletion (`DELETE /admin/products/:id`):**
  - Checks if product exists and returns 404 `{ error: 'محصول یافت نشد' }` if missing.
  - Inside a transaction, deletes associated records in `productFeatures`, `cartItems`, `wishlistItems`, `reviews`, and then the `products` record itself to maintain referential integrity without orphaned data or foreign key lockups.
- **Coupon Deletion (`DELETE /admin/coupons/:code`):**
  - Queries coupon case-insensitively and returns 404 `{ error: 'کد تخفیف یافت نشد' }` if not found.
- **Order Status Update (`PUT /admin/orders/:id/status`):**
  - Validates `status` against allowed enum values (`pending_payment`, `processing`, `shipped`, `delivered`, `cancelled`), returning 400 for invalid statuses.
  - Returns 404 if the order ID is not found.
- **User Role Update (`PUT /admin/users/:id/role`):**
  - Validates `role` against `['admin', 'user']`.
  - Returns 404 if the user ID is not found.

### 5. `server/routes/coupons.ts`
- Validates request body with `couponValidationSchema`.
- Case-insensitively queries coupon using upper-cased code.
- Checks if coupon exists and `coupon.active === true`; returns 400 `{ error: 'کد تخفیف نامعتبر یا منقضی شده است' }` if inactive or not found.
- Validates `cartTotal >= coupon.minTotal`; returns 400 `{ error: 'حداقل مبلغ سفارش برای این کد تخفیف رعایت نشده است' }` if threshold is not met.
- Accurately computes discount for percentage and fixed-amount coupons, clamping discount to `cartTotal` (`Math.min(discount, cartTotal)`) and calculating `finalTotal = Math.max(0, cartTotal - discount)`.
- Supports both `POST /api/coupons/validate` and `POST /api/coupons`.

### 6. Automated Test Suites
- **`tests/api/users.test.ts`:**
  - Added test cases for password update success, wrong current password failure (400), and short password validation (400).
  - Added test cases for address default switching atomicity, 404 on non-existent address, and automatic promotion of remaining address when default address is deleted.
- **`tests/api/admin.test.ts`:**
  - Added cascading deletion verification confirming dependent `productFeatures`, `cartItems`, `wishlistItems`, and `reviews` are fully removed.
  - Added 404 error testing for product deletion, coupon deletion, order status update, and user role update.
  - Added status and role validation failure tests (400).
- **`tests/api/coupons.test.ts`:**
  - Added unit and integration tests covering percentage discount calculation, fixed amount calculation, case-insensitivity, inactive coupons, non-existent coupons, minimum subtotal violations, discount clamping, and schema validation.

---

## Verification Results
1. `npm run lint` (`tsc --noEmit`): Passed with 0 errors.
2. `npx vitest run`: 10/10 test files passed (71/71 tests passed, 100% pass rate).
3. `npm run build`: Succeeded cleanly with zero TypeScript or bundling errors.
