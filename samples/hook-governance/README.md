# hook-governance

**Beginner sample** for `@bradygaster/squad-sdk` — demonstrates the four governance hooks that enforce rules as code, not prompts.

## What It Demonstrates

| Hook | What You'll See |
|---|---|
| **File-Write Guards** | Block writes to `/etc/passwd`, allow writes to `src/**/*.ts` |
| **PII Scrubbing** | Redact email addresses from tool output automatically |
| **Reviewer Lockout** | Lock an agent out of a file after a review rejection |
| **Ask-User Rate Limiter** | Cap user prompts at 3 per session, then block |

## Prerequisites

- Node.js ≥ 20
- The SDK must be built first: `cd ../../ && npm run build`

## Run It

```bash
npm install
npm start
```

## Expected Output

```
🛡️  hook-governance — Squad SDK governance hooks sample

────────────────────────────────────────────────────────────
  Demo 1 — File-Write Guards
────────────────────────────────────────────────────────────
  Only writes to src/**/*.ts and .squad/** are allowed.

  Write to src/utils/helper.ts: allow ✅
  Write to /etc/passwd: block 🚫
  Reason: File write blocked: "/etc/passwd" does not match allowed paths...

────────────────────────────────────────────────────────────
  Demo 2 — PII Scrubbing
────────────────────────────────────────────────────────────
  Before: Deploy fix by brady@example.com — cc: alice@company.io, bob@test.org
  After:  Deploy fix by [EMAIL_REDACTED] — cc: [EMAIL_REDACTED], [EMAIL_REDACTED]

────────────────────────────────────────────────────────────
  Demo 3 — Reviewer Lockout
────────────────────────────────────────────────────────────
  Backend edits src/auth.ts: block 🚫
  Frontend edits src/auth.ts: allow ✅

────────────────────────────────────────────────────────────
  Demo 4 — Ask-User Rate Limiter
────────────────────────────────────────────────────────────
    Ask #1: allow ✅
    Ask #2: allow ✅
    Ask #3: allow ✅
    Ask #4: block 🚫
    Ask #5: block 🚫
```

## Run Tests

```bash
npm test
```

## Files

| File | Purpose |
|---|---|
| `index.ts` | Main demo script — runs all four hook demos |
| `tests/hook-governance.test.ts` | Acceptance tests for each hook |
| `TEST-SCRIPT.md` | Manual test walkthrough |
