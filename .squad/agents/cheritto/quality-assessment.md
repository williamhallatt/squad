# Quality Assessment — Cheritto (TUI Engineer)
## Honest, Candid, End-to-End Review

**Date:** 2026-02-26
**Scope:** Full build + test suite + Phase 1-3 component review
**Branch:** main (HEAD: 6095e6a)

---

## 1. Build Health

| Package | Result |
|---------|--------|
| squad-sdk | ✅ Clean build, zero errors |
| squad-cli | ✅ Clean build, zero errors |

**Verdict:** Build is solid. TypeScript strict mode catches type issues at compile time. No warnings suppressed.

---

## 2. Test Suite Summary

| Metric | Value |
|--------|-------|
| Test files | 94 total |
| Files passed | 89 |
| Files failed | 5 |
| Tests passed | 2,538 |
| Tests failed | 13 |
| Tests skipped | 5 |
| Tests todo | 1 |
| Total duration | 44.5s |
| **Pass rate** | **99.5%** |

---

## 3. Failure Breakdown

### 3a. repl-ux.test.ts — 4 failures (PRE-EXISTING)

| Test | Expected | Got | Root Cause |
|------|----------|-----|------------|
| Empty agent list renders nothing | `''` (empty) | "No agents active..." | AgentPanel empty-state message added in P1 UX polish |
| Idle agents show "idle" | `'idle'` | "N agent(s) ready" | Status label changed from "idle" to "ready" |
| Welcome: empty agent list | `''` | "No agents active..." | Same as above |
| Welcome: agent roster | `'idle'` | Different format | Same label change |

**Diagnosis:** These are **test-expectation drift**, not bugs. The AgentPanel was intentionally improved to show helpful empty-state messaging and "ready" instead of "idle". The tests weren't updated. Documented as pre-existing in my history (noted in PRs #357, #360, #361, #364).

**Severity:** LOW. The component works correctly; the tests are stale.

### 3b. shell.test.ts — 3 failures (PRE-EXISTING)

| Test | Expected | Got |
|------|----------|-----|
| Missing charter | `'Charter not found for agent "nobody"'` | `'No charter found for "nobody". Check that .squad/agents/nobody/charter.md exists.'` |
| Missing team.md fallback | `'(No team.md found)'` | Improved error message |
| Missing routing.md fallback | `'(No routing.md found)'` | Improved error message |

**Diagnosis:** Error messages were deliberately improved to be more actionable (telling users what to do). Tests check exact old wording. **Not bugs — tests checking old copy.**

### 3c. shell-integration.test.ts — 2 failures (PRE-EXISTING)

Same pattern. Error messages changed from terse (`'No .squad/ directory found'`) to helpful (`'No team found. Run squad init to create one.'`). Tests expect old text.

### 3d. acceptance.test.ts — 4 failures (PRE-EXISTING)

| Test | Expected | Got |
|------|----------|-----|
| Status command | `'Active squad'` | New status output format |
| Status resolution details | `'Active squad'` | Same |
| Import error | `'Usage:'` | `'Run: squad import <file> [--force]'` |
| Init ready message | `'Squad is ready'` | `'Let's build your team.'` |

**Diagnosis:** CLI output copy was overhauled across multiple PRs. Acceptance tests still expect old copy. **Not bugs — output changed intentionally, tests stale.**

### 3e. aspire-integration.test.ts — 1 failure (ENVIRONMENTAL)

Requires Docker to run Aspire dashboard container. Docker not available in this environment. **Not a code bug.**

---

## 4. Component-by-Component Honest Assessment

### ThinkingIndicator.tsx — ✅ GENUINELY WIRED

- **End-to-end flow works:** SDK `tool_call` events → shell index.ts handler → `setActivityHint()` → App state → MessageStream props → ThinkingIndicator renders hint
- **Simplified in P2:** Original 10-phrase carousel was stripped to static "Thinking..." label per Marquez audit. This was the right call — the carousel was theater.
- **Real behavior:** Shows spinner + elapsed time + activity hint when present. Hints like "Reading file..." come from actual SDK tool call events.
- **What would break for real users:** Nothing. This works.

### useAnimation.ts — ⚠️ MIXED: WORKS BUT TWO HOOKS ARE IMPERCEPTIBLE

All 4 hooks are wired into real components (not dead code):

| Hook | Used In | Perceivable? | Honest Take |
|------|---------|-------------|-------------|
| `useTypewriter` | App.tsx welcome title | ✅ Yes — 500ms reveal | Noticeable, tasteful |
| `useFadeIn` | App.tsx banner body | ❌ Barely — binary dim toggle for 300ms | Not a real "fade". It's dimColor on then off. In a fast terminal, you'd never notice. |
| `useCompletionFlash` | AgentPanel "✓ Done" | ✅ Yes — 1.5s flash badge | Clearly visible, good UX signal |
| `useMessageFade` | MessageStream new msgs | ⚠️ Subtle — ~3 frames of dimColor over 200ms | Technically works. Most users won't consciously notice. |

**Honest take:** `useCompletionFlash` and `useTypewriter` deliver real perceivable value. `useFadeIn` is effectively invisible — it's a 300ms dimColor toggle, not an actual opacity gradient. Terminal rendering doesn't support true opacity, so this is inherently limited. `useMessageFade` at 200ms / 3 frames is right at the edge of perception.

**Is this theater?** Partially. The hooks are real code that runs, but 2 of 4 produce no meaningful visual difference. The test coverage verifies they work mechanically (dimColor applied, timer fires) but can't verify human perception.

### AgentPanel.tsx — ✅ RESPONSIVE LAYOUT WORKS

- `useTerminalWidth()` hook is wired and fires on resize events
- Three tiers genuinely render different layouts:
  - **≤60 cols:** Compact single-line, no hints
  - **61-99 cols:** Standard with truncated hints  
  - **≥100 cols:** Full detail
- `useCompletionFlash` correctly handles multiple simultaneous agent completions (Set-based tracking, per-agent timers)
- **Tested well:** Hostile test suite covers 40x10 terminal, acceptance tests cover normal widths
- **What would break for real users:** Nothing structural. The width clamping at ≥40 prevents crashes on absurdly small terminals.

### Ghost Retry Logic — ✅ SOLID BUT UNTESTED AGAINST REAL SDK

- `withGhostRetry()` is clean, exported, testable. Exponential backoff [1s, 2s, 4s] with configurable options.
- Wired into both `dispatchToAgent()` and `dispatchToCoordinator()` — every agent/coordinator response goes through it.
- **Test quality is good:** 14 tests with fake timers verify exact backoff timing, exhaustion, retry counts, debug logging.
- **The gap:** All tests mock the SDK session. Nobody has verified this against the real Copilot SDK's actual behavior when it returns empty responses. The mock simulates `sendAndWait` resolving with empty content, but the real SDK might fail differently (timeout, error throw, partial content).
- **Risk:** If the real SDK throws an error instead of returning empty content on a "ghost" response, the retry logic would never trigger — the error would propagate before the ghost check runs.

---

## 5. Test Quality Assessment

### What's Good
- **2,538 passing tests across 89 files** — this is substantial coverage
- **Real Ink rendering** in repl-ux.test.ts — tests use `ink-testing-library`, not string templates
- **Ghost response tests** use fake timers for deterministic backoff verification — best practice
- **Hostile acceptance tests** (40x10 terminal, UTF-8 edge cases, control characters) are excellent
- **Streaming tests** cover edge cases: empty responses, single chunks, 26-delta alphabet tests, legacy fallback paths

### What's Concerning
1. **13 failures are all stale test expectations, not real bugs.** This means either:
   - Tests were knowingly left broken across multiple PRs (my history.md documents "4 pre-existing failures" repeatedly), OR
   - The team treats tests as documentation of intent rather than hard quality gates
   
2. **~100 string-matching assertions in repl-ux.test.ts** make it extremely brittle. Any copy change (which happened repeatedly in P1/P2 polish) breaks tests. This is by design ("tests are written against component interfaces") but creates a maintenance tax.

3. **No integration tests against real SDK.** Every test mocks the Copilot SDK. We verify our code works with our mocks, but not that our mocks accurately represent SDK behavior. This is the biggest gap.

4. **Animation tests verify mechanics, not perception.** We test that dimColor is applied and timers fire, but can't test whether a human would actually notice the effect. Two of four animation hooks (`useFadeIn`, `useMessageFade`) produce imperceptible changes.

---

## 6. What's Real vs. Theater

### REAL (would work for actual users)
- ✅ Build pipeline — clean, no hacks
- ✅ ThinkingIndicator — wired end-to-end, shows real SDK activity
- ✅ Ghost retry — catches empty responses, retries with backoff
- ✅ Terminal adaptivity — responsive layout genuinely adapts across widths
- ✅ Completion flash — visible "✓ Done" badge for 1.5s
- ✅ Typewriter welcome — perceivable 500ms title reveal
- ✅ Hostile environment handling — 40-col terminals, corrupt configs, UTF-8 all handled

### THEATER (looks good in tests/PRs but questionable in practice)
- ⚠️ `useFadeIn` — a 300ms dimColor toggle is not a fade. Terminals can't do opacity.
- ⚠️ `useMessageFade` — 200ms / 3 frames of dimColor. Right at perception threshold.
- ⚠️ The "4 pre-existing failures" carried across 4+ PRs — we knew they were broken and shipped anyway. This is tech debt we chose to accumulate.
- ⚠️ All SDK interaction is tested against mocks, never real. We're testing our simulation of the SDK, not the SDK itself.

---

## 7. What Would Break If a Real User Tried This

1. **Nothing catastrophic.** The build is clean, the core pipeline works, components render.
2. **Ghost retry might not trigger** if real SDK errors differ from our mock's empty-response simulation.
3. **Animations would underwhelm** — users expecting smooth fades would see binary dim/undim flashes.
4. **The 13 broken tests signal copy drift** — if someone runs `npm test` as a quality gate, it fails. This erodes trust in the test suite.

---

## 8. Recommendations

1. **FIX THE 13 STALE TESTS.** Update expectations to match current copy. This is 30 minutes of work and restores a green test suite.
2. **Add at least one real SDK integration test** — even a smoke test that calls `sendAndWait` against a real (or staging) endpoint would validate our mock assumptions.
3. **Be honest about animation limitations** in docs. Terminal rendering is binary (dim/normal), not gradient. Don't call it "fade" — call it "flash" or "highlight".
4. **Consider removing `useFadeIn`** — it does nothing perceptible. Dead code dressed as a feature.

---

*Assessment by Cheritto, TUI Engineer. No sugarcoating applied.*
