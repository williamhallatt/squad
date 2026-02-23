# Decision: Ghost response retry pattern

**By:** Cheritto (TUI Engineer)
**Date:** 2026-02-25
**PR:** squad/332-ghost-response
**Closes:** #332

## What
Ghost responses (empty `sendAndWait()` results) are now detected and retried automatically with exponential backoff.

## Design
- `withGhostRetry(sendFn, options)` is a pure, exported function — no closure dependencies on shell state.
- The shell-bound `ghostRetry()` wrapper inside `runShell()` wires UI feedback (retry/exhaustion messages) via callbacks.
- Both `dispatchToAgent()` and `dispatchToCoordinator()` use the same retry path.
- On each retry, `accumulated` is reset before re-calling `awaitStreamedResponse()` so the delta handler re-accumulates from the new response.

## Why
The SDK occasionally fires `session.idle` before `assistant.message`, causing `sendAndWait()` to resolve with `undefined`. Without retry, the user sees nothing — a silent failure. Exponential backoff (1s, 2s, 4s) avoids hammering the backend while giving the LLM time to recover.

## Team impact
- If anyone adds new dispatch paths, they should use `ghostRetry()` (inside `runShell()`) or `withGhostRetry()` (standalone) to handle empty responses.
- The `GhostRetryOptions` interface is exported for testing and extensibility.
