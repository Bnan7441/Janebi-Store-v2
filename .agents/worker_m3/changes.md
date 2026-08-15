# Milestone 3 - Record of Changes

## 1. Persian Numeral & Iranian Mobile Phone Sanitization
- **`src/lib/utils.ts`**:
  - Implemented `normalizeIranianMobile(phone: string): string` to convert Persian and Arabic numerals (`toEnglishDigits`), remove separators (spaces, dashes, parentheses, slashes), strip `+98`, `0098`, `98` (12-digit international format), and 10-digit prefixes, converting all valid inputs to canonical `09xxxxxxxxx` format.
  - Updated `isValidIranianMobile(phone: string): boolean` to validate standard 11-digit mobile format (`/^09\d{9}$/`) after running `normalizeIranianMobile`.
- **`tests/unit/utils.test.ts`**:
  - Added unit test coverage for `normalizeIranianMobile` covering Persian/Arabic numbers, `+98`, `0098`, `98`, 10-digit formats, messy formatting with punctuation, and invalid inputs.

## 2. Authentication & Form Input Sanitization
- **`src/components/auth/AuthModal.tsx`**:
  - Updated `handleSubmit` to normalize phone numbers with `normalizeIranianMobile` before login/register dispatch.
  - Verified `dir="ltr"` and `text-left font-mono` styling on phone and password input fields.
- **`src/pages/Login.tsx`**:
  - Updated `handleSubmit` to normalize phone numbers with `normalizeIranianMobile` before login submission.
  - Verified `dir="ltr"` and `text-left font-mono` styling on input fields.
- **`src/pages/Register.tsx`**:
  - Updated `handleSubmit` to normalize phone numbers with `normalizeIranianMobile` before register submission.
  - Verified `dir="ltr"` and `text-left font-mono` styling on input fields.

## 3. Checkout & Cart Sanitization
- **`src/components/checkout/CheckoutRecipientForm.tsx`**:
  - Applied `normalizeIranianMobile` when selecting saved addresses.
  - Fixed postal code state overwrite bug (`updateField('postalCode', addr.postalCode || '')`) so switching to an address without a postal code resets the field rather than leaving stale data.
  - Added `dir="ltr"` and `text-left font-mono` styling to phone and postal code inputs.
- **`src/hooks/useCheckoutForm.ts`**:
  - Added `normalizeIranianMobile` on `formData.phone` and converted `formData.postalCode` with `toEnglishDigits` before submitting `POST /api/orders`.
- **`src/components/cart/CartSummaryCard.tsx`**:
  - Applied `dir="ltr"` and `text-left font-mono` styling to coupon code input field.

## 4. Real Profile Password Update & Order Cancellation APIs
- **`src/components/profile/PersonalInfoTab.tsx`**:
  - Replaced client-only mock password change with real backend API request `PUT /api/users/me/password` using JWT authentication header (`Authorization: Bearer <token>`).
  - Added user feedback toasts on success and error, cleared form inputs on success, and added `dir="ltr"` / `text-left font-mono` styling.
- **`src/pages/Profile.tsx`**:
  - Replaced client-only mock order cancellation with real backend API request `POST /api/orders/${orderId}/cancel` with JWT authentication header.
  - Added order list re-fetching on successful cancellation and error handling toasts.

## 5. React Portal Architecture & Body Scroll Locking Across Modals
- **`src/components/profile/AddressBookTab.tsx`**:
  - Refactored Add/Edit Address modal to render via `createPortal(..., document.body)`.
  - Added `useEffect` body scroll lock (`document.body.style.overflow = 'hidden'` when open, `'unset'` on close and cleanup).
  - Sanitized recipient phone number with `normalizeIranianMobile` and postal code with `toEnglishDigits`.
- **`src/pages/Profile.tsx`**:
  - Refactored Logout Confirmation Modal to render via `createPortal(..., document.body)`.
  - Added `useEffect` body scroll lock on `showLogoutModal`.
- **`src/pages/admin/Orders.tsx`**:
  - Refactored Order Details Modal to render via `createPortal(..., document.body)`.
  - Added `useEffect` body scroll lock on `selectedOrder`.
- **`src/pages/admin/Products.tsx`**:
  - Refactored Product Add/Edit Modal to render via `createPortal(..., document.body)`.
  - Added `useEffect` body scroll lock on `isModalOpen`.
- **`src/pages/admin/Coupons.tsx`**:
  - Refactored Coupon Modal to render via `createPortal(..., document.body)`.
  - Added `useEffect` body scroll lock on `isModalOpen`.
- **`src/components/products/ProductFilterSidebar.tsx`**:
  - Refactored Mobile Drawer Modal to render via `createPortal(..., document.body)`.
  - Added `useEffect` body scroll lock on `mobileFilterOpen`.
  - Added `dir="ltr"` and `text-left font-mono` styling to price range inputs.

## 6. Admin UI Bug Fixes & Digit Parsing
- **`src/pages/admin/Products.tsx`**:
  - Fixed `fetchProducts` array unpacking bug to handle direct array response (`Array.isArray(data) ? data : data.products || []`).
  - Applied `toEnglishDigits` before calling `parseInt` on `price`, `originalPrice`, `discount`, and `stockQuantity` so Persian numerals are safely parsed.
  - Added `dir="ltr"` and `text-left font-mono` to numeric and URL input fields.
- **`src/pages/admin/Coupons.tsx`**:
  - Applied `toEnglishDigits` before calling `parseInt` on `value` and `minTotal`.
  - Added `dir="ltr"` and `text-left font-mono` to code, value, and minimum total inputs.

## 7. RTL / LTR Class Adjustments
- **`src/components/ProductReviews.tsx`**: Replaced invalid Tailwind class `direction-ltr` with `[direction:ltr]` and `dir="ltr"`.
- **`src/pages/static/Contact.tsx`**: Replaced incorrect `dir-ltr text-right` with `dir="ltr" text-left font-mono`.

## 8. Verification Results
- **TypeScript Typecheck**: `npx tsc --noEmit` — 0 errors.
- **Unit & Integration Tests**: `npx vitest run` — 10 test files passed, 80 tests passed.
- **Production Build**: `npm run build` — Vite + esbuild completed successfully.
