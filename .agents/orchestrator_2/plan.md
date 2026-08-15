# Execution Plan — Orchestrator Generation 2

## Context & Objectives
Janebi-Store e-commerce platform verification and hardening.
M1 (Inventory concurrency, rollback, payment security), M2 (Coupons, address atomicity, admin cascade, user APIs), M3 (Persian digits, LTR inputs, React Portal modals) have been completed.
Our goal is to complete Milestone 4 (comprehensive test suite expansion + build verification), execute multi-agent gate checks, and produce the final acceptance report.

## Step-by-Step Execution Plan

### Step 1: Milestone 4 - Test Expansion & Build Verification Worker
- Dispatch `teamwork_preview_worker` to:
  1. Inspect existing test suites in `tests/` and backend code in `server/`.
  2. Implement/complete all missing tests across:
     - `tests/api/auth.test.ts` (expired/malformed JWT, missing headers, registration validation)
     - `tests/api/products.test.ts` (category filters, search, pagination, negative bounds)
     - `tests/api/cart.test.ts` & `tests/api/wishlist.test.ts` (CRUD, unauthenticated handling, bounds)
     - `tests/api/coupons.test.ts` (percentage, fixed amount, minTotal, inactive, case-insensitivity)
     - `tests/api/orders.test.ts` (multi-item stock reduction, discount clamp, order cancellation API)
     - `tests/api/payment.test.ts` (callback idempotency, restocking on failure, verification authority)
     - `tests/api/users.test.ts` (address book atomicity, default switch, password change API)
     - `tests/api/admin.test.ts` (RBAC 403 enforcement, cascade product deletion, order status mutation)
     - `tests/concurrency/inventory-race.test.ts` (simultaneous checkouts competing for last item)
     - `tests/unit/transaction-rollback.test.ts` (multi-item order failure rollback integrity)
     - `tests/unit/persian-utils.test.ts` (Persian digit normalization, phone number sanitization)
  3. Execute `npm run test` (or `npx vitest run`) and ensure 100% tests pass with zero failures and zero unhandled rejections.
  4. Execute `npm run build` and ensure clean TypeScript compilation and Vite bundling with zero errors.
  5. Publish `TEST_READY.md` summarizing the test suite tiers and pass status.

### Step 2: Phase 3 Gate Checks (Multi-Agent Verification)
- Dispatch Reviewers (2 independent `teamwork_preview_reviewer` subagents) to audit code quality, requirements compliance, and test robustness.
- Dispatch Challengers (2 independent `teamwork_preview_challenger` subagents) to stress-test edge cases, concurrency, and adversarial conditions.
- Dispatch Forensic Auditor (1 `teamwork_preview_auditor` subagent) to verify integrity and ensure no mock bypasses or hardcoded test shortcuts exist.
- Synthesize all findings in `GATE_STATUS.md`.

### Step 3: Phase 4 Full Acceptance & Final Synthesis
- Verify all gate criteria passed.
- Compile final comprehensive summary and send handoff report to parent.
