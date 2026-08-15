# Dispatch Assignment

## 2026-08-15T09:00:20Z

You are a Worker implementing Milestone 2 for Janebi-Store.

Working directory: /Users/aidin/antigravity/Janebi-Store/.agents/worker_m2
Project root: /Users/aidin/antigravity/Janebi-Store

Read the following files before starting:
- /Users/aidin/antigravity/Janebi-Store/.agents/ORIGINAL_REQUEST.md
- /Users/aidin/antigravity/Janebi-Store/PROJECT.md
- /Users/aidin/antigravity/Janebi-Store/.agents/explorer_survey_1/survey_report.md

Assigned Scope (Milestone 2):
1. Address Book Atomicity & Fallbacks (`server/routes/users.ts`):
   - In `PUT /me/addresses/:id/default`: check that the address exists and belongs to `req.user.id`. If not found, return 404 `{ error: 'آدرس مورد نظر یافت نشد' }`. Atomically inside a transaction reset all other addresses to `isDefault: false` and set the target to `isDefault: true`.
   - In `DELETE /me/addresses/:id`: verify ownership; if address not found, return 404. If the deleted address was default (`isDefault: true`), atomically designate the most recent remaining address (if any) as the new default.
   - In `PUT /me/addresses/:id`: verify ownership and return 404 if not found.
2. User Password Update Endpoint (`server/routes/users.ts`):
   - Implement `PUT /me/password`: authenticate user, validate body with Zod schema (`currentPassword: string`, `newPassword: string` min 6 chars). Verify current password against `user.password` with `bcrypt.compare`. If mismatch, return 400 `{ error: 'کلمه عبور فعلی نادرست است' }`. Hash new password with `bcrypt.hash(newPassword, 10)` and update user in database. Return 200 `{ message: 'کلمه عبور با موفقیت بهروزرسانی شد' }`.
3. Admin Cascade Deletion & Route Hardening (`server/routes/admin.ts`):
   - In `DELETE /admin/products/:id`: check if product exists (return 404 if not). In a database transaction, delete associated `productFeatures`, `cartItems`, `wishlistItems`, `reviews`, and then the `product` itself to prevent foreign key errors and orphaned records.
   - In `DELETE /admin/coupons/:code`: return 404 if coupon not found.
   - In `PUT /admin/orders/:id/status`: return 404 if order not found. Validate status value against allowed values ('pending_payment', 'processing', 'shipped', 'delivered', 'cancelled').
   - In `PUT /admin/users/:id/role`: return 404 if user not found.
4. Coupon Calculation Engine (`server/routes/coupons.ts`):
   - Validate coupon input with Zod (`code: string`, `cartTotal: number`).
   - Query case-insensitively using upper-cased code.
   - Check if coupon exists and `active: true` (if inactive/not found, return 400 `{ error: 'کد تخفیف نامعتبر یا منقضی شده است' }`).
   - Check `cartTotal >= coupon.minTotal` (if violated, return 400 `{ error: 'حداقل مبلغ سفارش برای این کد تخفیف رعایت نشده است' }`).
   - Calculate discount correctly (percentage vs fixed amount, capped to `cartTotal`).
5. Update & expand unit/integration tests in `tests/api/users.test.ts`, `tests/api/admin.test.ts`, and create `tests/api/coupons.test.ts`.
6. Verify:
   - `npm run lint` passes with 0 errors.
   - `npx vitest run` passes 100%.
   - `npm run build` succeeds cleanly.
