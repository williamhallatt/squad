# Kujan: Process.exit() Refactor (2026-02-22T02:07:14Z)

**Status:** ✅ COMPLETE

**Outcome:**
- `fatal()` now throws `SquadError` instead of calling `process.exit(1)`
- `runWatch()` resolves Promise on SIGINT/SIGTERM
- `runShell()` closes readline on SIGINT
- Closes #189
- Enables library-safe error handling for SquadUI

**Decision:**
- Library functions throw `SquadError` or return results
- Only CLI entry point (`src/cli-entry.ts`) calls `process.exit()`
- `SquadError` is public API

**Tests:** All 1683 passing

**Reference:** `.squad/decisions.md` → Process.exit() refactor
