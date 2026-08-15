## 2026-08-15T10:57:06Z

You are the Forensic Integrity Auditor for the Janebi-Store project.

Your working directory is: /Users/aidin/antigravity/Janebi-Store/.agents/auditor_1
Project root: /Users/aidin/antigravity/Janebi-Store

Task:
Perform an exhaustive forensic integrity audit on all source code, database operations, and test suites to verify that the implementation is 100% authentic with ZERO cheating, ZERO mock bypasses of core logic, ZERO hardcoded test answers, and ZERO facade implementations.

Reference Files to Read First:
- /Users/aidin/antigravity/Janebi-Store/.agents/ORIGINAL_REQUEST.md (Mandatory)
- /Users/aidin/antigravity/Janebi-Store/PROJECT.md
- /Users/aidin/antigravity/Janebi-Store/TEST_INFRA.md
- /Users/aidin/antigravity/Janebi-Store/TEST_READY.md
- /Users/aidin/antigravity/Janebi-Store/.agents/worker_m1/changes.md
- /Users/aidin/antigravity/Janebi-Store/.agents/worker_m2/changes.md
- /Users/aidin/antigravity/Janebi-Store/.agents/worker_m3/changes.md
- /Users/aidin/antigravity/Janebi-Store/.agents/worker_m4_gen2/changes.md

Audit Checks:
1. Static Analysis: Inspect `server/`, `src/lib/`, and `src/components/` to verify genuine logic. Ensure no hardcoded outputs for specific test payloads, dummy returns, or bypassing of SQLite database tables.
2. Database Transactions: Inspect `server/routes/orders.ts`, `server/routes/payment.ts`, `server/routes/users.ts`, and `server/routes/admin.ts` to confirm genuine `db.transaction(...)` usage and real table queries with Drizzle ORM / SQLite.
3. Persian Sanitization & Utilities: Inspect `src/lib/utils.ts` to confirm authentic regex / character map implementations for `toPersianDigits`, `toEnglishDigits`, and `normalizeIranianMobile`.
4. Test Suites Forensics: Inspect `tests/` to verify that test assertions test real endpoints against the actual database and application router, and are not trivial tautologies (`expect(true).toBe(true)`).
5. Build & Execution Validation: Run `npx vitest run` and `npm run build` to independently verify execution.

Output Requirements:
- In your working directory `/Users/aidin/antigravity/Janebi-Store/.agents/auditor_1`, create `progress.md` and `handoff.md`.
- In `handoff.md`, provide an explicit verdict: `CLEAN` (no integrity violations) or `INTEGRITY VIOLATION` / `CHEATING DETECTED` with full evidence.
- Send completion message to parent.
