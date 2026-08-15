# Original User Request

## 2026-08-15T08:42:14Z

Comprehensive deep-dive audit, edge-case testing, and multi-layered verification suite for the Janebi-Store e-commerce platform.

Working directory: /Users/aidin/antigravity/Janebi-Store
Integrity mode: development

## Requirements

### R1. Deep-Dive Edge Case & Stress Testing
Exhaustively test boundary conditions, concurrency, and error states:
- **Inventory & Concurrency:** Multi-request race conditions, ordering more than available stock, zero stock handling, rollback integrity during checkout errors, and high-frequency SQLite read/write lock prevention.
- **Coupons & Calculations:** Percentage vs fixed amount discounts, minimum cart threshold violations, case insensitivity, inactive/expired coupons, discount exceeding subtotal, and rounding checks.
- **Payment & Order Idempotency:** Duplicate payment verification callbacks, tampering with order totals, status mutation transitions (pending -> processing -> shipped -> delivered -> cancelled), and invalid tracking details.
- **Authentication & RBAC Security:** Expired/malformed JWT tokens, missing authorization headers, non-admin access to admin endpoints (strict 403 enforcement), and profile modification boundaries.
- **User Address Book & Profile:** Adding/editing addresses, setting default address atomically, deleting default addresses safely, and updating user details.

### R2. Frontend UI & Form Validation Verification
- Ensure form inputs (phone number formatting, Persian digits, LTR inputs for phones/passwords, required fields) validate cleanly.
- Verify that modals (AuthModal, AddressModal, OrderDetailsModal) render with proper React Portal mounting and do not get clipped by sticky headers or backdrop filters.

### R3. Automated Regression & Test Suite Expansion
- Expand automated test suites with Vitest + Supertest to cover all edge cases, negative flows, and failure branches.
- Run complete test suite and ensure 100% pass rate with zero warnings or flake.
- Ensure production build (`npm run build`) builds cleanly with zero TypeScript errors.

## Acceptance Criteria

### Test Execution & Robustness
- [ ] Automated test suite runs with 100% pass rate (all test files and tests pass without SQLite locking or timeouts).
- [ ] Every API endpoint has comprehensive negative/edge-case tests covering 400, 401, 403, and 404 responses.
- [ ] Database transactions consistently rollback changes upon failures (verified by unit/integration tests).
- [ ] Production build (`npm run build`) executes cleanly with zero TypeScript or bundling errors.
