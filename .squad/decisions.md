# Decisions

> Team decisions that all agents must respect. Managed by Scribe.

### 2026-02-21: SDK distribution stays on GitHub
**By:** Keaton (carried from beta)
**What:** Distribution is `npx github:bradygaster/squad` — never move to npmjs.com.
**Why:** GitHub-native distribution aligns with the Copilot ecosystem. No registry dependency.

### 2026-02-21: v1 docs are internal only
**By:** Keaton (carried from beta)
**What:** No published docs site for v1. Documentation is team-facing only.
**Why:** Ship the runtime first. Public docs come later when the API surface stabilizes.

### 2026-02-21: Type safety — strict mode non-negotiable
**By:** Edie (carried from beta)
**What:** `strict: true`, `noUncheckedIndexedAccess: true`, no `@ts-ignore` allowed.
**Why:** Types are contracts. If it compiles, it works. Strict mode catches entire categories of bugs.

### 2026-02-21: Hook-based governance over prompt instructions
**By:** Baer (carried from beta)
**What:** Security, PII, and file-write guards are implemented via the hooks module, NOT prompt instructions.
**Why:** Prompts can be ignored or overridden. Hooks are code — they execute deterministically.

### 2026-02-21: Node.js ≥20, ESM-only, streaming-first
**By:** Fortier (carried from beta)
**What:** Runtime target is Node.js 20+. ESM-only (no CJS shims, no dual-package hazards). Async iterators over buffers.
**Why:** Modern Node.js features enable cleaner async patterns. ESM-only eliminates CJS interop complexity.

### 2026-02-21: Casting — The Usual Suspects, permanent
**By:** Squad Coordinator (carried from beta)
**What:** Team names drawn from The Usual Suspects (1995). Scribe is always Scribe. Ralph is always Ralph. Names persist across repos and replatforms.
**Why:** Names are team identity. The team rebuilt Squad beta with these names.

### 2026-02-21: Proposal-first workflow
**By:** Keaton (carried from beta)
**What:** Meaningful changes require a proposal in `docs/proposals/` before execution.
**Why:** Proposals create alignment before code is written. Cheaper to change a doc than refactor code.

### 2026-02-21: Tone ceiling — always enforced
**By:** McManus (carried from beta)
**What:** No hype, no hand-waving, no claims without citations. Every public-facing statement must be substantiated.
**Why:** Trust is earned through accuracy, not enthusiasm.

### 2026-02-21: Zero-dependency scaffolding preserved
**By:** Rabin (carried from beta)
**What:** CLI remains thin (`cli.js`), runtime stays modular. Zero runtime dependencies for the CLI scaffolding path.
**Why:** Users should be able to run `npx` without downloading a dependency tree.

### 2026-02-21: Merge driver for append-only files
**By:** Kobayashi (carried from beta)
**What:** `.gitattributes` uses `merge=union` for `.squad/decisions.md`, `agents/*/history.md`, `log/**`, `orchestration-log/**`.
**Why:** Enables conflict-free merging of team state across branches. Both sides only append content.

### 2026-02-21T20:25:35Z: User directive — Interactive Shell as Primary UX
**By:** Brady (via Copilot)
**What:** Squad becomes its own interactive CLI shell. `squad` with no args enters a REPL where users talk directly to the team. Copilot SDK is the LLM backend — Squad shells out to it for completions, not the other way around.
**Why:** Copilot CLI has usability issues (unreliable agent handoffs, no visibility into background work). Squad needs to own the full interactive experience with real-time status and direct coordination UX.
**How:** Terminal UI with `ink` (React for CLIs), SDK session management with streaming, direct agent spawning (one session per agent). This becomes Wave 0 (foundation).
**Decisions needed:** Terminal UI library (ink vs. blessed), streaming (event-driven vs. polling), session lifecycle (per-agent vs. pool), background cleanup (explicit vs. timeout).

### 2026-02-21T21:22:47Z: User directive — rename `squad watch` to `squad triage`
**By:** Brady (via Copilot)
**What:** "squad watch" should be renamed to "squad triage" — user feedback that the command name should reflect active categorization/routing, not passive observation.
**Why:** User request — captured for team memory.

### 2026-02-21T21:22:47Z: User directive — add `squad ralph` CLI command
**By:** Brady (via Copilot)
**What:** Add a `squad ralph` CLI command that invokes Ralph's work monitor loop directly from the command line. Must support `--filter` flag for wave-aware execution (e.g., `squad ralph --filter 'm1'` processes only M1-labeled issues).
**Why:** User request — captured for team memory. Addresses the gap where Ralph can't enforce wave ordering.

### 2026-02-21: CLI rename — `watch` → `triage` (recommended) (consolidated)
**By:** Keaton (Lead)
**What:** Rename `squad watch` to `squad triage`. Keep `watch` as silent alias for backward compatibility. Explicitly recommend against `squad ralph` as a CLI command. Suggest `squad monitor` or `squad loop` instead to describe the persistent monitoring function.
**Why:** "Triage" is 40% more semantically accurate (matches GitHub's own terminology and incident-management patterns). "Ralph" is internal lore — opaque to new users and violates CLI UX conventions (all user-facing commands are action verbs or domain nouns). `squad monitor` is self-describing and professional.
**Details:** Change is low-risk. Silent alias prevents breakage. Confidence 85% for triage rename, 90% confidence Ralph shouldn't be user-facing.
**Reference:** Keaton analysis in `.squad/decisions/inbox/keaton-cli-rename.md`

### 2026-02-21: SDK M0 blocker — upgrade from `file:` to npm reference (resolved)
**By:** Kujan (SDK Expert)
**What:** Change `optionalDependencies` from `file:../copilot-sdk/nodejs` to `"@github/copilot-sdk": "^0.1.25"`. The SDK is published on npm (28 versions, SLSA attestations). This one-line change unblocks npm publish and removes CI dependency on sibling directory.
**Why:** The `file:` reference is the only M0 blocker. Squad's SDK surface is minimal (1 runtime import: `CopilotClient`). Keep SDK in `optionalDependencies` to preserve zero-dependency scaffolding guarantee (Rabin decision).
**Verified:** Build passes (0 errors), all 1592 tests pass with npm reference. No tests require live Copilot CLI server.
**Reference:** Kujan audit in `.squad/decisions/inbox/kujan-sdk-m0-audit.md`
