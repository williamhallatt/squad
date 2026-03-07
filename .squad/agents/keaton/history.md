# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Core Context — Keaton's Focus Areas

**Architectural & Planning Lead:** Keaton owns proposal-first workflow, SDK/CLI split design, observability patterns, wave planning and readiness assessments, cleanup audits, public release decisions. Pattern: decisions that compound — each architectural choice makes future features easier.

**Pre-Phase-1 Architecture (2026-02-21 to 2026-03-04):**
- SDK/CLI split executed: 154 files migrated, clean DAG (CLI → SDK → Copilot SDK)
- Proposal-first workflow established in docs/proposals/
- Type safety decision (strict: true, noUncheckedIndexedAccess: true)
- Hook-based governance (security, PII, file-write guards)
- Runtime target: Node.js ≥20, ESM-only, streaming-first
- Merge driver for append-only files (.gitattributes union strategy)
- Zero-dependency scaffolding preserved (cli.js thin, zero runtime deps)
- Casting — The Usual Suspects team names permanent
- User directive — Interactive Shell as Primary UX
- Distribution: npm-only (GitHub-native path removed)
- Coordinator prompt: Three routing modes (DIRECT, ROUTE, MULTI)
- CLI entry point split: index.ts pure barrel, cli-entry.ts contains main()
- Process.exit() refactor: library-safe (fatal() throws SquadError)
- Docs: Tone ceiling enforced (no hype, substantiated claims)

**Pre-Phase-1 Wave Completion (2026-02-22 to 2026-03-05):**
- Waves A–D completion verified: 30 issues closed, 2930→2931 tests passing
- Wave D readiness assessment + 6 issues filed (#488–#493)
- Public release readiness verdict: 🟡 ready with caveats (dogfood #324, architecture docs needed)
- Issue #306 cleanup audit: 47 findings catalogued (18 hardcoded, 16 code quality, 8 tests, 5 UX)
- Runtime EventBus established as canonical: colon-notation (session:created), error isolation
- Subpath exports in SDK with types-first condition ordering
- User directive — Aspire testing requirements (OTel telemetry validation)
- User directive — Code fences: backticks only (no / or \)
- User directive — Docs overhaul with publication pause until Brady's approval
- REPL cancellation and configurable timeout (SQUAD_REPL_TIMEOUT)
- Shell observability metrics under squad.shell.* namespace
- Telemetry in both CLI and agent modes

## Learnings

## 📌 Phase 1 Completion — 2026-03-05T21:37:09Z

**PHASE 1 SDK-FIRST COMPLETE.** Keaton's scoping decision + Edie's builders + Fenster's CLI + Hockney's tests + Kujan's OTel assessment + Verbal's coordinator update. 6 agents fanned out in parallel.

**Team Cross-Pollination:**
- **Edie:** Built 8 builder functions + type surface in packages/squad-sdk/src/builders/. Zero new deps. Runtime validation included. Type unification: runtime/config.ts canonical.
- **Fenster:** Implemented squad build --check CLI command. Works with SquadSDKConfig. Generated files stamped with HTML headers. Wired into cli-entry.ts.
- **Hockney:** 60 contract-first tests (36 builders, 24 build command). All passing. Stubs in place.
- **Kujan:** OTel readiness: all 8 runtime modules compile cleanly. Phase 3 unblocked.
- **Verbal:** Coordinator prompt updated with SDK Mode Detection section. Session-start heuristic for squad/ or squad.config.ts.

**Next:** Phase 2 (scaffolding + markdown generation), Phase 3 (SDK runtime + OTel), Phase 4 (migrations).

## 📌 Phase 2 Community PR Merges — 2026-03-07T01-13-00Z

**PHASE 2 COMMUNITY PR MERGES COMPLETE.** Brady approved 3 community PRs from external contributors. All merged to dev successfully.

- PR #230 (EmmittJ): CLI wire-up for squad link + squad init --mode remote (6d0bd56)
- PR #217 (williamhallatt): TUI /init no-args flow fix (20970f9)
- PR #219 (williamhallatt): Fork contribution workflow docs in CONTRIBUTING.md (157b8c0)

**Zero conflicts.** All three showed UNSTABLE merge state (dev progressed past their base), but all merged cleanly. Fork-first contributor procedure now standardized. 52+ tests passing.

**Team Status:** External contributors now viable for parallel work. Merge conflicts due to base drift, not code — low friction, normal pattern. Fork-first procedure repeatable.
