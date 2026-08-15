## 2026-08-15T08:53:33Z
You are a Worker implementing Milestone 1 for Janebi-Store.

Working directory: /Users/aidin/antigravity/Janebi-Store/.agents/worker_m1
Project root: /Users/aidin/antigravity/Janebi-Store

Read the following files before starting:
- /Users/aidin/antigravity/Janebi-Store/.agents/ORIGINAL_REQUEST.md
- /Users/aidin/antigravity/Janebi-Store/PROJECT.md
- /Users/aidin/antigravity/Janebi-Store/.agents/explorer_survey_1/survey_report.md

Assigned Scope (Milestone 1):
1. Fix TypeScript compilation & schema bug:
   - In `server/routes/products.ts` (around line 44), replace `eq(products.inStock, true)` with `gt(products.stockQuantity, 0)`.
   - In `server/data/seed.ts`, fix the product insertion types so `npm run lint` (`tsc --noEmit`) passes cleanly.
2. In `server/routes/orders.ts`:
   - Aggregate duplicate item IDs in `items` before stock verification so ordering duplicate items in the same payload cannot bypass inventory checks.
   - Clamp discount amount to `Math.min(realDiscount, realSubtotal)` and order total to `Math.max(0, realTotal)` to prevent negative totals.
   - Implement `POST /api/orders/:id/cancel` endpoint (authenticated): verify order ownership, check status allows cancellation (`pending_payment` or `processing`), atomically update order status to `cancelled` and restock product inventory in `products.stockQuantity` inside a database transaction.
3. In `server/routes/payment.ts`:
   - Add `authenticate` middleware to `POST /api/payment/request`, verify order ownership.
   - Use `env.ZARINPAL_MERCHANT_ID` instead of a hardcoded merchant string.
   - In `GET /api/payment/verify`: When payment status is not 'OK' or verification fails, mark the order as `cancelled` AND atomically restore item stock quantities in `products.stockQuantity` within a database transaction. Ensure verify handler executes idempotently.
4. Verify by running:
   - `npm run lint` (must pass with 0 errors).
   - `npx vitest run` (all existing tests must pass).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your implementation report to /Users/aidin/antigravity/Janebi-Store/.agents/worker_m1/changes.md and handoff.md. Report back to orchestrator.
