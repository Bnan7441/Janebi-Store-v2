## 2026-08-15T09:06:35Z
You are a Worker implementing Milestone 3 for Janebi-Store.

Working directory: /Users/aidin/antigravity/Janebi-Store/.agents/worker_m3
Project root: /Users/aidin/antigravity/Janebi-Store

Read the following files before starting:
- /Users/aidin/antigravity/Janebi-Store/.agents/ORIGINAL_REQUEST.md
- /Users/aidin/antigravity/Janebi-Store/PROJECT.md
- /Users/aidin/antigravity/Janebi-Store/.agents/explorer_survey_2/survey_report.md

Assigned Scope (Milestone 3 - Frontend UI, Persian Digit Sanitization, LTR Inputs & React Portal Modals):
1. **Persian & Mobile Sanitization Utility (`src/lib/utils.ts`)**:
   - Implement `normalizeIranianMobile(phone: string): string` to convert Persian/Arabic numerals to ASCII digits (`toEnglishDigits`), remove spaces/dashes/parentheses, strip `+98` or `0098` country codes, and ensure the format is `09xxxxxxxxx`.
   - Export and test `normalizeIranianMobile`.
2. **Auth & Form Sanitization**:
   - In `src/components/auth/AuthModal.tsx`, `src/pages/Login.tsx`, and `src/pages/Register.tsx`: normalize phone numbers using `normalizeIranianMobile` on submit. Ensure phone and password inputs have `dir="ltr"` and `text-left font-mono`.
   - In `src/components/checkout/CheckoutRecipientForm.tsx`: normalize phone numbers, ensure `dir="ltr"` on phone and postal code inputs, and fix state clearing when switching between addresses (clear postal code if selected address lacks one).
   - In `src/components/cart/CartSummaryCard.tsx`: add `dir="ltr"` to coupon code input.
   - In `src/components/profile/PersonalInfoTab.tsx`: add `dir="ltr"` to phone and password inputs. Connect the password form submit handler to real backend API `PUT /api/users/me/password` using JWT auth header, and handle success/error feedback.
3. **Modal React Portal Architecture & Body Scroll Locking**:
   - Ensure all modals render via `createPortal(..., document.body)` with automated body scroll lock cleanup (`useEffect` locking `document.body.style.overflow = 'hidden'` on open and restoring on close).
   - Refactor the following modals to use Portals:
     - `src/components/profile/AddressBookTab.tsx` (Add/Edit Address Modal)
     - `src/pages/Profile.tsx` (Logout Confirmation Modal)
     - `src/pages/admin/Orders.tsx` (Order Details Modal)
     - `src/pages/admin/Products.tsx` (Product Add/Edit Modal)
     - `src/pages/admin/Coupons.tsx` (Coupon Form Modal)
     - `src/components/products/ProductFilterSidebar.tsx` (Mobile Filter Drawer)
4. **Admin UI Bug Fixes & Digit Parsing**:
   - In `src/pages/admin/Products.tsx`: fix the array unpacking bug on `GET /api/products` response (`setProducts(Array.isArray(data) ? data : data.products || [])`). Convert form numeric inputs using `toEnglishDigits` before calling `parseInt` so Persian digits don't reset to 0.
   - In `src/pages/admin/Coupons.tsx`: convert form numeric inputs using `toEnglishDigits` before calling `parseInt`.
5. **Real Profile Order Cancellation**:
   - In `src/pages/Profile.tsx`: update `handleCancelOrder` to call `POST /api/orders/${orderId}/cancel` with JWT token and refresh order list.
6. Verify:
   - `npm run lint` passes with 0 errors.
   - `npx vitest run` passes 100%.
   - `npm run build` succeeds cleanly with 0 errors.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your implementation report to /Users/aidin/antigravity/Janebi-Store/.agents/worker_m3/changes.md and handoff.md. Report back to orchestrator.
