# Master Plan: Janebi-Store Comprehensive Audit, Edge-Case Testing & Verification

## Objective
Fulfill all requirements in `ORIGINAL_REQUEST.md`:
1. R1: Deep-Dive Edge Case & Stress Testing (Inventory/Concurrency, Coupons, Payment/Order Idempotency, Auth/RBAC, Address Book & Profile).
2. R2: Frontend UI & Form Validation Verification (Phone format, Persian digits, LTR inputs, modal rendering/React Portals).
3. R3: Automated Regression & Test Suite Expansion (Vitest + Supertest 100% pass rate, zero warnings/flake, clean build).

## Phase 0: Survey & Scope Mapping (Parallel Explorers)
- Spawn Explorer 1: Backend Architecture, APIs, DB Schema, Transactions & Concurrency.
- Spawn Explorer 2: Frontend Components, Forms, Modals, RTL/LTR styling, Digit conversion.
- Spawn Explorer 3: Existing Test Suite, Vitest/Supertest configuration, SQLite test isolation, Build setup.

## Phase 1: Global Decomposition & Architecture Specification
- Synthesize survey findings into `PROJECT.md` & `TEST_INFRA.md`.
- Establish Feature Inventory, Milestone breakdowns, and Interface Contracts.

## Phase 2: Dual Track Execution
- **Track 1: Implementation & Hardening**
  - M1: Backend Concurrency, Inventory Lock, Rollbacks, and Order/Payment Idempotency.
  - M2: Coupon Calculation Engine, Expiration/Thresholds, and Address Book Atomicity.
  - M3: Auth & RBAC Security Boundaries (Tokens, Admin 403, Profile mutations).
  - M4: Frontend Form Validation, Persian/English digits, LTR fields, and React Portal Modals.
- **Track 2: Comprehensive Test Suite & Regression**
  - E2E / Integration test expansion across all tiers (Tier 1 Feature Coverage, Tier 2 Boundary/Corner, Tier 3 Cross-Feature, Tier 4 Workloads).
  - Negative tests covering 400, 401, 403, 404 for all endpoints.

## Phase 3: Adversarial Verification & Forensic Audit
- Tier 5 Adversarial Stress & Concurrency Testing (Challenger).
- Code Review & Static Analysis (Reviewer).
- Integrity Forensics Audit (Auditor - Hard Veto).

## Phase 4: Final Acceptance Verification & Reporting
- Full test suite run (100% pass rate).
- Production build validation (`npm run build`).
- Summary reporting to user/parent agent.
