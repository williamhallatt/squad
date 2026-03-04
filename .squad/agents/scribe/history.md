# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- decisions/inbox/ → decisions.md merge flow: read inbox, append to decisions.md, delete inbox files
- Deduplication: parse decision blocks (### headers), remove exact duplicates, consolidate overlapping decisions
- Cross-agent propagation: when a decision affects other agents, append 📌 Team update to their history.md
- Windows compatibility: do NOT use git -C (unreliable), do NOT embed newlines in git commit -m
- Write commit message to temp file, commit with -F flag
- Scribe is silent: never speaks to user, works in background only

### 2026-02-24T17-25-08Z : Team consensus on public readiness
📌 Full team assessment complete. All 7 agents: 🟡 Ready with caveats. Consensus: ship after 3 must-fixes (LICENSE, CI workflow, debug console.logs). No blockers to public source release. See .squad/log/2026-02-24T17-25-08Z-public-readiness-assessment.md and .squad/decisions.md for details.
