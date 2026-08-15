# Handoff Report — Frontend Survey & Codebase Inspection

**Agent:** Explorer Agent (`explorer_survey_2`)  
**Parent Agent:** `e22c3267-7268-4f99-a8e7-004e467ebba3`  
**Date:** 2026-08-15  
**Handoff Type:** Hard (Task Complete)

---

## 1. Observation

1. **Frontend Stack & Architecture:**
   - `package.json` specifies `"react": "^19.0.1"`, `"react-dom": "^19.0.1"`, `"react-router-dom": "^7.18.2"`, `"@tailwindcss/vite": "^4.1.14"`, `"motion": "^12.43.0"`, `"lucide-react": "^1.28.0"`.
   - `index.html` (lines 1–24) defines `<html lang="fa" dir="rtl">` with `<div id="root"></div>`. No secondary portal target (e.g. `#modal-root`) exists.
   - `src/components/Layout.tsx` (lines 24–33) wraps all route outlets in `<AnimatePresence mode="wait"><motion.div ...><Outlet /></motion.div></AnimatePresence>`. Parent container has `relative overflow-x-hidden`.

2. **Persian Digits & Validation Normalization:**
   - `src/lib/utils.ts` (lines 14–29): `isValidIranianMobile(phone)` calls `toEnglishDigits(phone)` and checks `/^(0|0098|\+98)?9\d{9}$/`.
   - `src/components/auth/AuthModal.tsx` (lines 49–78), `src/pages/Login.tsx` (lines 22–32), and `src/pages/Register.tsx` (lines 29–49): The raw, un-normalized `phone` state is sent to `login` and `register`.
   - `server/validators/index.ts` (lines 66, 73, 90): Enforces `phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست")`.
   - `src/components/profile/AddressBookTab.tsx` (lines 67–103): `handleSave` does not sanitize Persian digits before sending `phone` and `postalCode`.
   - `src/pages/admin/Products.tsx` (lines 60–68) & `src/pages/admin/Coupons.tsx` (lines 40–50): Directly execute `parseInt(formData.price)` or `parseInt(formData.minTotal)` which yields `NaN` (and falls back to `0`) if input contains Persian digits (`۱۲۰۰۰۰`).

3. **LTR vs RTL Inputs:**
   - Missing `dir="ltr"` on `src/components/profile/PersonalInfoTab.tsx` (lines 113, 164, 181), `src/components/checkout/CheckoutRecipientForm.tsx` (lines 131, 198), and `src/components/cart/CartSummaryCard.tsx` (line 42).
   - Invalid class `direction-ltr` in `src/components/ProductReviews.tsx` (line 387).

4. **Modals, Portals & Scroll Lock:**
   - `src/components/auth/AuthModal.tsx` (lines 33–42, 258) uses `createPortal(modalContent, document.body)` and sets `document.body.style.overflow = 'hidden'`.
   - All other modals (`src/components/profile/AddressBookTab.tsx` line 232, `src/pages/Profile.tsx` line 147, `src/pages/admin/Orders.tsx` line 163, `src/pages/admin/Products.tsx` line 193, `src/pages/admin/Coupons.tsx` line 153, and `src/components/products/ProductFilterSidebar.tsx` line 363) are rendered inline in their component DOM tree without `createPortal` and without body scroll locking.

5. **Critical Functional UI Bugs & Discrepancies:**
   - `src/pages/admin/Products.tsx` (line 29): `setProducts(data.products || [])`. But `server/routes/products.ts` (line 101) returns `Product[]` directly. Result: Admin product table is permanently empty.
   - `src/pages/Profile.tsx` (lines 64–75): `handleCancelOrder` only mutates local state and `localStorage.setItem('user_orders', ...)`; no backend API call is made.
   - `src/components/profile/PersonalInfoTab.tsx` (lines 41–56): `handlePasswordChange` displays a success toast with no API call.
   - `src/components/checkout/CheckoutRecipientForm.tsx` (line 44): Postal code is not cleared when switching to an address without postal code.
   - Shipping fee mismatch: `CartSummaryCard.tsx` displays 49,000; `useCheckoutForm.ts` calculates 69,000 / 39,000; `server/routes/orders.ts` hardcodes 50,000 / 35,000 and ignores the free shipping threshold.
   - `npm run lint` yields TS errors on `server/data/seed.ts:18` (primary key insert) and `server/routes/products.ts:44` (`products.inStock`).

---

## 2. Logic Chain

1. **Persian Input Authentication Barrier:**
   - Because `isValidIranianMobile` converts Persian digits for checking but does not normalize the state variable, user inputs like `۰۹۱۲۳۴۵۶۷۸۹` are sent to the backend.
   - Because backend Zod schema matches strictly `/^09\d{9}$/`, all Persian-digit login/register/address attempts fail with HTTP 400.
2. **Modal Backdrop & Stacking Context Clipping:**
   - Because `Layout.tsx` wraps route components in animated `motion.div` containers, CSS `transform`/`filter` causes the container to become the containing block for all descendant elements with `position: fixed`.
   - Consequently, inline modals in `AddressBookTab`, `admin/Orders`, `admin/Products`, etc., do not span the true viewport window, can be clipped by parent overflow, and allow background page scrolling.
3. **Admin Products Table Inoperability:**
   - `server/routes/products.ts` responds with `[ {...}, {...} ]`.
   - `AdminProducts.tsx` queries `data.products`. On an array, `data.products` is `undefined`.
   - `undefined || []` evaluates to `[]`, leaving the table empty on all renders.

---

## 3. Caveats

- Backend route implementation details were inspected primarily to verify contract compatibility with frontend payloads.
- Automated API test suite (`npm test`) passes 37/37 tests because current tests mock/submit ASCII English payloads. Testing with Persian digit payloads or concurrent orders is required to surface real-world edge cases.

---

## 4. Conclusion

The frontend foundation is modern and visually polished, but has 6 critical architectural and input-handling defects:
1. Persian digits are not normalized to ASCII English before dispatching to API endpoints (causing 400 errors).
2. Admin products page fails to display products due to an array unpacking error.
3. Multiple modals lack React Portal (`createPortal`) mounting and body scroll locking.
4. Several numeric/password inputs lack `dir="ltr"` in the RTL context.
5. Shipping calculations differ across Cart, Checkout, and Backend.
6. Order cancellation and password change features on Profile page are currently client-only mocks.

---

## 5. Verification Method

To independently verify these observations:
1. **Admin Products Table:** Open `/admin/products` or inspect `src/pages/admin/Products.tsx:29` vs `server/routes/products.ts:101`.
2. **Persian Digits in Auth:** Attempt calling `POST /api/auth/login` with `{ "phone": "۰۹۱۲۳۴۵۶۷۸۹", "password": "..." }` and observe Zod validation error 400.
3. **Modal DOM Tree:** Inspect DOM when Address Modal is open on `/profile?tab=addresses` — verify it is mounted inside `<main>` `<motion.div>` rather than `document.body`.
4. **TypeScript Lint Check:** Run `npm run lint` and verify the two compiler errors in `server/data/seed.ts` and `server/routes/products.ts`.
