# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- VS Code runSubagent spawn patterns: different from CLI task tool — no agent_type, mode, model params
- Model selection gap: CLI has per-spawn model control, VS Code uses session model only
- Platform parity strategies: what works on CLI must work in VS Code
- SQL tool is CLI-only: never depend on it in cross-platform code paths
- Multiple subagents in one turn run concurrently on VS Code (equivalent to background mode)

### 2026-02-24T17-25-08Z : Team consensus on public readiness
📌 Full team assessment complete. All 7 agents: 🟡 Ready with caveats. Consensus: ship after 3 must-fixes (LICENSE, CI workflow, debug console.logs). No blockers to public source release. See .squad/log/2026-02-24T17-25-08Z-public-readiness-assessment.md and .squad/decisions.md for details.

---

### History Audit — 2026-03-03

**Audit Result:** CLEAN

**Findings:**
- ✓ No conflicting entries detected.
- ✓ No stale or reversed decisions left unresolved.
- ✓ No v0.6.0 references (correct target: v0.8.17).
- ✓ No intermediate states recorded as final outcomes.
- ✓ All learnings properly attributed (Beta-carried vs. session-specific).
- ✓ Clear traceability for future spawns reading cold.

**Notes:**
History.md is concise and accurate. Project context and learnings are properly separated. Team consensus entry correctly references decision file location. No corrections needed.
