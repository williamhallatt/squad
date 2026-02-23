# Cheritto — History

## Project Context
- **Project:** Squad — programmable multi-agent runtime for GitHub Copilot
- **Owner:** Brady
- **Stack:** TypeScript (strict, ESM), Node.js ≥20, Ink 6 (React for CLI), Vitest
- **CLI:** Ink-based interactive shell with AgentPanel, MessageStream, InputPrompt components
- **Key files:** packages/squad-cli/src/cli/shell/components/*.tsx, packages/squad-cli/src/cli/shell/terminal.ts

## Learnings

### 2026-02-23: Fix 2-minute timeout (#325)
- Replaced hard-coded `120_000ms` in `sendAndWait()` with `TIMEOUTS.SESSION_RESPONSE_MS` (default 600_000ms / 10 min)
- New constant added to `packages/squad-sdk/src/runtime/constants.ts` under `TIMEOUTS`
- Configurable via `SQUAD_SESSION_TIMEOUT_MS` env var
- Shell entry: `packages/squad-cli/src/cli/shell/index.ts` line 123 (`awaitStreamedResponse`)
- Test file: `test/repl-streaming.test.ts` — 6 assertions updated to use constant
- Pattern: all timeouts in this project live in `TIMEOUTS` object in constants.ts, env-overridable via `parseInt(process.env[...] ?? 'default', 10)`
- PR #347 on branch `squad/325-fix-timeout`

### 2026-02-24: Engaging thinking feedback (#331)
- Created standalone `ThinkingIndicator.tsx` component in `packages/squad-cli/src/cli/shell/components/`
- Two-layer design: Layer 1 rotates 10 thinking phrases every 2.5s (Claude-style), Layer 2 shows SDK activity hints (Copilot-style, takes priority)
- Props: `isThinking`, `elapsedMs`, `activityHint` — elapsed tracked in MessageStream via `useEffect` + `setInterval`
- Added `setActivityHint` to `ShellApi` interface in App.tsx for pipeline integration
- Shell `index.ts` listens for `tool_call` SDK events and pushes activity hints (e.g., "Reading file...", "Spawning specialist...")
- Hints clear automatically when content starts streaming (in `onDelta`)
- Color shifts over time: cyan (<5s) → yellow (<15s) → magenta (15s+) — borrowed from original spinner
- 16 new tests in `test/repl-ux.test.ts` sections 7 + 8
- PR #351 on branch `squad/331-thinking-feedback`

### 2026-02-25: Ghost response detection and retry logic (#332)
- Created `withGhostRetry()` — exported, testable function with callback-based UI integration
- Detects empty responses (both accumulated deltas and fallback content empty) from `awaitStreamedResponse()`
- Retries up to 3 times with exponential backoff: 1s, 2s, 4s (configurable via `GhostRetryOptions`)
- Shows user-facing retry status: "⚠ No response received. Retrying (attempt N/3)..."
- Shows exhaustion message: "❌ Agent did not respond after 3 attempts. Try again or run `squad doctor`."
- Logs ghost metadata via `debugLog`: timestamp, attempt number, prompt preview (truncated to 80 chars)
- Wired into both `dispatchToAgent()` and `dispatchToCoordinator()` via `ghostRetry()` convenience wrapper
- 14 new tests in `test/ghost-response.test.ts` covering unit + integration + backoff timing
- Pattern: `withGhostRetry` is pure (no closure deps); `ghostRetry` is the shell-bound wrapper inside `runShell()`
- PR on branch `squad/332-ghost-response`
