# Comprehensive Frontend Survey & Codebase Audit Report

**Project:** Janebi-Store (جانبی آرنا - E-Commerce Platform)  
**Surveyor:** Explorer Agent (Subagent `explorer_survey_2`)  
**Date:** 2026-08-15  
**Working Directory:** `/Users/aidin/antigravity/Janebi-Store/.agents/explorer_survey_2`  
**Project Root:** `/Users/aidin/antigravity/Janebi-Store`

---

## Executive Summary

A comprehensive architectural and code-level investigation of the Janebi-Store frontend was conducted. The application is built with **React 19**, **Vite 8**, **React Router v7**, **Tailwind CSS v4**, and **Framer Motion 12**, styled with Persian typography (**Vazirmatn**) in full **RTL** (`dir="rtl"`).

The survey identified significant discrepancies, missing input normalizations (specifically regarding Persian numerals and phone formatting), modal portal mounting vulnerabilities, body scroll locking omissions, and critical functional UI bugs (such as Admin Products table showing empty data due to array parsing mismatches and mocked profile mutations).

---

## 1. Architectural & Technology Stack Survey

| Layer / Concern | Technology / Library | Version / Details | Status & Notes |
|---|---|---|---|
| **Core UI Framework** | React / React-DOM | `19.0.1` | Modern React 19 architecture |
| **Build & Bundler** | Vite / @vitejs/plugin-react | `8.2.0` / `6.0.5` | Fast HMR & ESBuild server bundling |
| **Client Routing** | React Router DOM | `7.18.2` | Declarative route structure with nested layout |
| **CSS & Design System** | Tailwind CSS v4 | `4.1.14` | CSS-first `@import "tailwindcss"`, custom dark mode |
| **Motion & Animation** | Motion (Framer Motion) | `12.43.0` | `AnimatePresence`, page transitions, drawer animations |
| **Iconography** | Lucide React | `1.28.0` | SVG iconography |
| **Validation Schema** | Zod | `4.4.3` | Backend/API validation schemas |
| **Typography & Direction** | Vazirmatn font | Google Fonts | Full RTL `<html lang="fa" dir="rtl">` |

### Component Hierarchy & Layout Structure
- **Root Entrypoint**: `src/main.tsx` mounts `<App />` into `#root`.
- **Global Layout**: `src/components/Layout.tsx` encapsulates:
  - Top ambient background blurs (`pointer-events-none`).
  - Sticky Header (`<Header />`, `sticky top-0 z-50`).
  - Main container (`<main>` with `<DynamicBreadcrumbs />` and `<AnimatePresence mode="wait">` wrapping `<Outlet />`).
  - Footer (`<Footer />`), Floating BackToTop (`<BackToTop />`), AI Assistant (`<ChatWidget />`), and Mobile Bottom Navigation (`<MobileBottomNav />`, `fixed bottom-0 z-40`).
- **Context Providers**:
  - `AuthProvider`: Manages user authentication, token storage, address book CRUD, and profile updating.
  - `CartContext`: Manages cart persistence, item quantity changes, and coupon application.
  - `ToastContext`: Floating notification manager (`fixed bottom-4 right-4 z-50`).
  - `ThemeContext`: Toggles `.dark` class on root HTML element.
  - `WishlistContext` & `CompareContext`: Local/in-memory product interactions.

---

## 2. Form Inputs, Validation & Persian Digit Handling

### 2.1 Persian Digit Normalization Vulnerability in Auth & Addresses
- **Observation:**
  - In `src/lib/utils.ts`, `isValidIranianMobile(phone)` uses `toEnglishDigits(phone)` to validate Iranian numbers (e.g. `۰۹۱۲۳۴۵۶۷۸۹` or `09123456789`).
  - In `src/components/auth/AuthModal.tsx`, `src/pages/Login.tsx`, and `src/pages/Register.tsx`, when a user types Persian digits, `isValidIranianMobile(phone)` returns `true`.
  - **However**, the raw non-normalized `phone` string (containing Persian digits like `۰۹۱۲۳۴۵۶۷۸۹`) is passed directly to `login(phone, password)` or `register(name, phone, password)`.
  - In `server/validators/index.ts`, the backend Zod schemas (`registerSchema`, `loginSchema`, `addressSchema`) enforce:
    ```typescript
    phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست")
    ```
  - Because Persian digits (`۰-۹`, Unicode 1776–1785) do NOT match ASCII regex `\d`, the backend rejects the request with HTTP 400 (`شماره موبایل معتبر نیست`).
  - **Conclusion:** Users typing Persian digits on mobile or Persian keyboards are completely blocked from logging in, registering, or adding addresses.

### 2.2 Missing Phone Format Standardization
- **Observation:**
  - Iranian users frequently enter phone numbers with prefixes (`+989123456789`, `00989123456789`, `9123456789`) or spaces/dashes (`0912 345 6789`).
  - While `isValidIranianMobile` accepts these variations, there is no canonical normalizer (`normalizeIranianMobile` or `toStandardMobile`) converting them to `09xxxxxxxxx` before dispatching to API endpoints.

### 2.3 Persian Number Parsing in Admin Forms (Data Corruption Risk)
- **Observation:**
  - In `src/pages/admin/Products.tsx` (`handleSubmit`):
    ```typescript
    price: parseInt(formData.price) || 0,
    originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : null,
    discount: parseInt(formData.discount) || 0,
    stockQuantity: parseInt(formData.stockQuantity) || 0
    ```
  - In JavaScript, `parseInt("۱۲۰۰۰۰", 10)` evaluates to `NaN`. Because of the `|| 0` fallback, any price or stock quantity entered with Persian digits is saved to the database as `0`!
  - In `src/pages/admin/Coupons.tsx` (`handleSubmit`):
    ```typescript
    percent: formData.type === 'percent' ? parseInt(formData.value) : undefined,
    amount: formData.type === 'amount' ? parseInt(formData.value) : undefined,
    minTotal: parseInt(formData.minTotal) || 0,
    ```
    Persian digits will cause `parseInt` to fail, generating `NaN` or `0` minTotal for newly created coupons.

### 2.4 Missing LTR Direction (`dir="ltr"`) in RTL Context
In an RTL document (`<html dir="rtl">`), numeric, password, and code inputs must have explicit LTR text direction (`dir="ltr"`) and left alignment to prevent inverted number formatting, cursor jumping, or misplaced icons:
- `src/components/profile/PersonalInfoTab.tsx`: Phone input (`line 113`) and Password inputs (`lines 164, 181`) lack `dir="ltr"` and `text-left`.
- `src/components/checkout/CheckoutRecipientForm.tsx`: Phone input (`line 131`) and Postal code input (`line 198`) lack `dir="ltr"` and `text-left`.
- `src/components/cart/CartSummaryCard.tsx`: Coupon code input (`line 42`) lacks `dir="ltr"`.
- `src/components/ProductReviews.tsx`: Rating stars container (line 387) specifies invalid class `direction-ltr` instead of `dir-ltr` or `[direction:ltr]`.
- `src/pages/static/Contact.tsx`: Contact info input (line 149) has conflicting `dir-ltr text-right`.

---

## 3. Modal Implementations, React Portals & CSS Layering

| Modal Component | File Location | Mounting Target | Uses `createPortal`? | Body Scroll Locked? | Stacking Context / Clipping Risk |
|---|---|---|---|---|---|
| **AuthModal** | `src/components/auth/AuthModal.tsx` | `document.body` | ✅ **Yes** | ✅ **Yes** | **Safe** (Escapes parent headers & motion containers) |
| **AddressModal** (Add/Edit) | `src/components/profile/AddressBookTab.tsx` | Inline in `<main>` | ❌ **No** | ❌ **No** | ⚠️ **High Risk** (Trapped inside `Profile` `motion.div` & `overflow-x-hidden`) |
| **LogoutModal** | `src/pages/Profile.tsx` | Inline in `Profile` | ❌ **No** | ❌ **No** | ⚠️ **Medium Risk** (No portal; background scrollable) |
| **OrderDetailsModal** (Admin) | `src/pages/admin/Orders.tsx` | Inline in `AdminOrders` | ❌ **No** | ❌ **No** | ⚠️ **Medium Risk** (Collides with sticky admin layout) |
| **ProductFormModal** (Admin) | `src/pages/admin/Products.tsx` | Inline in `AdminProducts` | ❌ **No** | ❌ **No** | ⚠️ **Medium Risk** (Trapped inside page scroll) |
| **CouponFormModal** (Admin) | `src/pages/admin/Coupons.tsx` | Inline in `AdminCoupons` | ❌ **No** | ❌ **No** | ⚠️ **Medium Risk** (Background scrolls when open) |
| **FilterDrawerModal** (Mobile) | `src/components/products/ProductFilterSidebar.tsx` | Inline in Sidebar | ❌ **No** | ❌ **No** | ⚠️ **High Risk** (Trapped in page layout hierarchy) |

### Key CSS Layering & Stacking Context Vulnerabilities
1. **Framer Motion Transform Trapping:**
   - In `Layout.tsx`, the `<Outlet />` is wrapped in `<motion.div>` with animate/exit transitions.
   - When CSS `transform`, `filter`, or `perspective` is applied to a container, the CSS standard dictates that this element becomes the containing block for all `position: fixed` children.
   - Modals without `createPortal` (`AddressBookTab`, `AdminOrders`, etc.) do not attach to the viewport root; their `fixed inset-0` coordinates are scoped to the transformed parent container.
2. **Missing Body Scroll Lock:**
   - When any modal except `AuthModal` is open, scrolling the mouse wheel or touching mobile screens scrolls the underlying page content.
3. **Z-Index Layering Collisions:**
   - Sticky Header (`z-50`, `backdrop-blur-xl`), Mobile Bottom Nav (`z-40`), AI Chat Widget (`z-50`), and inline modals (`z-50`) occupy identical stacking levels, causing backdrop clipping and component bleeding.

---

## 4. UI Bugs, Broken Flows & Missing Features

### 4.1 Admin Products Table Data Mismatch (Critical Bug)
- **File:** `src/pages/admin/Products.tsx` (Line 27-29)
- **Code:**
  ```typescript
  const res = await fetch('/api/products');
  const data = await res.json();
  setProducts(data.products || []);
  ```
- **Bug Mechanism:**
  - `GET /api/products` (defined in `server/routes/products.ts`) returns a JSON array directly: `res.json(formatted)`.
  - In `AdminProducts.tsx`, `data` is an Array (`Product[]`). Accessing `data.products` evaluates to `undefined`.
  - The fallback `|| []` assigns an empty array.
- **Impact:** The Admin Products and Inventory management page displays `هیچ محصولی یافت نشد` ("No products found") at all times, rendering product management unusable.

### 4.2 Order Cancellation is a Client-Only Mock
- **File:** `src/pages/Profile.tsx` (Lines 64-75)
- **Code:**
  ```typescript
  const handleCancelOrder = (orderId: string) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: 'cancelled', statusText: 'لغو شده' } : o
    );
    setOrders(updated);
    try {
      localStorage.setItem('user_orders', JSON.stringify(updated));
    } catch {
      // ignore
    }
    addToast(`سفارش ${orderId} با موفقیت لغو شد`, 'info');
  };
  ```
- **Impact:** Order cancellation never contacts the server (`PUT /api/admin/orders/:id/status` or dedicated cancel endpoint). Orders revert to their previous status upon page refresh.

### 4.3 Password Update in Profile is a Client-Only Mock
- **File:** `src/components/profile/PersonalInfoTab.tsx` (Lines 41-56)
- **Impact:** Submitting the password update form only triggers a toast message (`کلمه عبور با موفقیت تغییر یافت`) without dispatching an API call. Password is never updated in the backend.

### 4.4 Inconsistent Shipping Rates Across Cart, Checkout, and Backend
- **Cart Summary (`CartSummaryCard.tsx` line 90):** Displays shipping fee as **49,000 تومان**.
- **Checkout Form (`useCheckoutForm.ts` lines 42-44):** Sets express shipping to **69,000 تومان** and standard to **39,000 تومان**.
- **Backend Orders Route (`server/routes/orders.ts` line 117):** Sets `shippingMethod === 'express' ? 50000 : 35000` and ignores the 2,000,000 Toman free shipping threshold.
- **Impact:** Price discrepancies between cart preview, checkout calculations, and final order total stored in SQLite.

### 4.5 Checkout Saved Address Postal Code State Leak
- **File:** `src/components/checkout/CheckoutRecipientForm.tsx` (Lines 37-45)
- **Code:**
  ```typescript
  if (addr.postalCode) updateField('postalCode', addr.postalCode);
  ```
- **Bug:** When switching from an address that has a postal code to an address without one, the previous postal code persists in `formData.postalCode`.

### 4.6 TypeScript Lint / Build Failures
- `server/data/seed.ts(18,9)`: Seed script specifies explicit `id` on autoincrement primary key table insertion.
- `server/routes/products.ts(44,33)`: Queries nonexistent `products.inStock` column instead of `stockQuantity`.

---

## 5. Recommended Remediation Plan

1. **Persian & Mobile Sanitization Utility:**
   - Create a unified `normalizeIranianMobile(phone: string): string` utility that converts Persian/Arabic digits, strips non-numeric characters (except leading zero), strips `+98` or `0098`, and formats cleanly as `09xxxxxxxxx`.
   - Apply `toEnglishDigits` to all numeric input handlers before calling `parseInt` or sending payloads.
2. **Global React Portal Wrapper (`ModalPortal`):**
   - Create a reusable `ModalPortal` or `Modal` component utilizing `createPortal(children, document.body)`.
   - Apply automated `document.body.style.overflow = 'hidden'` cleanup on mount/unmount across all modals.
   - Refactor `AddressBookTab`, `Profile` logout modal, and all Admin modals to use the Portal.
3. **Direction & RTL Class Standardization:**
   - Add `dir="ltr"` and `text-left font-mono` to phone, postal code, password, and coupon inputs.
   - Replace any invalid `direction-ltr` with `dir-ltr`.
4. **Fix Admin Products Data Unpacking:**
   - Change `AdminProducts.tsx` to handle array response: `setProducts(Array.isArray(data) ? data : data.products || [])`.
5. **Harmonize Shipping Fee Calculation:**
   - Centralize shipping rate constants (`EXPRESS_SHIPPING_FEE`, `STANDARD_SHIPPING_FEE`, `FREE_SHIPPING_THRESHOLD`) in shared constants and synchronize frontend and backend.
6. **Implement Real Backend Endpoints for User Password & Order Cancellation:**
   - Add `PUT /api/users/me/password` and `POST /api/orders/:id/cancel`.

---

Report completed and verified against source files.
