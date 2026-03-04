# Fragility & Risk Catalog — Waingro
Generated: 2026-02-24

## Known Risks (open issues, not being fixed yet)
| Issue | Title | Severity | Status |
|-------|-------|----------|--------|
| #403 | Stub commands print fake progress then exit | MEDIUM | Open, not being worked on |
| #397 | First message hits cold SDK connection — 5-10s dead air | MEDIUM | Open, not being worked on |
| #387 | Squad init ceremony wastes 2+ seconds on animations | LOW | Open, not being worked on |

---

## NEW Risks (not in any open issue)

### 1. Unbounded Message History Growth
- **Where:** `packages/squad-cli/src/cli/shell/components/App.tsx:44` — `messages` useState grows without bounds
- **Severity:** MEDIUM
- **Reproduction:** Run shell for 20+ minutes, send 100+ messages. Memory grows linearly with no ceiling.
- **Impact:** In long sessions, memory footprint grows unbounded. Ink re-renders all messages on each update. At 1000+ messages, re-render performance degrades.
- **Fix:** Implement a message cap in App state (e.g., keep only last 200 messages for display, archive older ones). Wire up `MemoryManager.trimMessages()` which exists but is unused.
- **Code Path:** `App.tsx:44` → `handleSubmit:104` → `setMessages(prev => [...prev, userMsg])` — unconditional append with no cap.

### 2. StreamBridge Buffers Never Flushed on Error
- **Where:** `packages/squad-cli/src/cli/shell/index.ts:138-160` — StreamBridge callbacks update `streamBuffers` Map but never explicitly clear on error
- **Severity:** MEDIUM
- **Reproduction:** Send message to agent → SDK throws mid-stream → `dispatchToAgent` catch block fires → session is evicted, but the partial `streamBuffers[agentName]` entry is never deleted
- **Impact:** Dead streamBuffer entries accumulate in the Map. If the user re-sends to the same agent 10 times with failures, there are 10 stale entries. Not a crash, but memory waste and potential confusion if buffer is ever inspected.
- **Fix:** On error in `dispatchToAgent` catch (line 340-344), also call `streamBuffers.delete(agentName)` before throwing.
- **Code Path:** `index.ts:340-344` catch block → evicts session but forgets to delete `streamBuffers.get(agentName)`.

### 3. Concurrent Multi-Agent Dispatch Overwrites Streaming Content
- **Where:** `packages/squad-cli/src/cli/shell/index.ts:452-462` — `Promise.allSettled` dispatches multiple agents, each calls `shellApi.setStreamingContent()`
- **Severity:** MEDIUM
- **Reproduction:** Send coordinator message that routes to 3+ agents → all 3 dispatch concurrently via `Promise.allSettled` → each fires `setStreamingContent({ agentName, content })` rapidly → React state `streamingContent` updates from agent 1, then agent 2, then agent 3 — last writer wins. User sees jumbled interleaved partial responses.
- **Impact:** When multiple agents work in parallel, their outputs are not visually separated. The UI displays a single `streamingContent` slot, so overlapping responses clobber each other.
- **Fix:** Change App state from `streamingContent: { agentName, content }` to `streamingContent: Map<agentName, content>`. Render a separate streaming area per agent when multiple are active.
- **Code Path:** `coordinator.ts:452-462` → `dispatchToAgent` → `index.ts:306` → `shellApi?.setStreamingContent()` — all use the same single state slot.

### 4. Router Comma-Match Conflicts with Unambiguous Input
- **Where:** `packages/squad-cli/src/cli/shell/router.ts:51-64` — comma-match regex `/^(\w+),\s*(.*)/s` is too greedy
- **Severity:** LOW
- **Reproduction:** User types "Alice, Bob, fix the bug" → regex matches `(\w+)` = "Alice", remainder = "Bob, fix the bug" → if no agent named "Alice" exists, falls through to coordinator, but the coordinator now receives mangled input where the first agent name was already consumed.
- **Impact:** User's input is misrouted if they accidentally start with "{word}," pattern that isn't an agent name. The coordinator then has to parse "Bob, fix the bug" instead of the original intent. Unlikely in practice, but an edge case.
- **Fix:** Move comma-match after @-match fails AND after explicit agent name check. Or require exact agent name (no abbreviation) for comma syntax.
- **Code Path:** `router.ts:51-64` — checks agents but falls through to coordinator without re-escaping the mangled content.

### 5. Ghost Retry Does Not Differentiate Connection Failure from SDK Race
- **Where:** `packages/squad-cli/src/cli/shell/index.ts:74-104` — `withGhostRetry` retries 3x on empty response, up to 30+ minutes total wait
- **Severity:** MEDIUM
- **Reproduction:** User sends message → SDK connection drops (network error, process kill, timeout) → `sendAndWait` hangs for up to 10 minutes (TIMEOUTS.SESSION_RESPONSE_MS = 600000) → returns empty → ghost retry kicks in → wait 1s → retry → sendAndWait hangs again → repeat 3 times = 30+ minutes of silent waiting.
- **Impact:** User perceives the shell as hung. No indication that the connection is dead vs. SDK is thinking. The 10-minute timeout + 3 retries = 30+ minutes before "Agent did not respond" appears.
- **Fix:** Add a connection health check before retrying. If the SquadClient is disconnected or the SDK reports an error (not empty response), fail fast instead of retrying. Or set a shorter timeout for subsequent retries (1-minute backoff instead of 10-minute block).
- **Code Path:** `index.ts:332-339` → `ghostRetry` → `withGhostRetry:83-103` — retry loop has no connection awareness.

### 6. SessionRegistry Does Not Validate Agent Name Case
- **Where:** `packages/squad-cli/src/cli/shell/sessions.ts:10-19` — `register(name, role)` accepts name as-is
- **Severity:** LOW
- **Reproduction:** Agent "Fenster" is registered via lifecycle. User types "@fenster" → router.ts line 40 does case-insensitive match → finds "Fenster" → dispatches to agent with casing "Fenster". But if lifecycle registers it as "fenster" (lowercase), the Map key is "fenster", and a second agent named "Fenster" (uppercase) can also be registered as a different key. SessionRegistry.get() is case-sensitive, so @Fenster and @fenster point to different Map entries.
- **Impact:** If .squad/team.md has inconsistent agent name casing, the registry can have duplicate entries (e.g., "fenster" and "Fenster" are different Map keys). Status updates to one don't reflect on the other.
- **Fix:** Normalize agent names to lowercase when registering, or enforce case-insensitivity in the Map key.
- **Code Path:** `sessions.ts:17` → `this.sessions.set(name, session)` — no normalization. `lifecycle.ts:87` → `registry.register(agent.name, ...)` — uses name as-is from team.md.

### 7. Streaming Delta Extraction Is Fragile
- **Where:** `packages/squad-cli/src/cli/shell/index.ts:163-168` — `extractDelta` tries fallback keys but logs verbosely
- **Severity:** LOW
- **Reproduction:** If SDK changes event shape (e.g., from `deltaContent` to `delta_content`, or wraps content in a nested object), `extractDelta` returns empty string silently. The message appears incomplete. No warning that the event shape has changed.
- **Impact:** SDK API evolution causes silent data loss. User sees incomplete responses with no indication why.
- **Fix:** If `result` is empty AND we received a `message_delta` event, log a warning and dump the event keys so SDK shape changes are caught early.
- **Code Path:** `index.ts:301-304` → `onDelta` → `extractDelta:164` → if all fallback keys are undefined, returns ''.

### 8. Coordinator Response Parsing Fails on Preamble or Markdown
- **Where:** `packages/squad-cli/src/cli/shell/coordinator.ts:88-134` — `parseCoordinatorResponse` does exact `startsWith` match
- **Severity:** LOW
- **Reproduction:** Coordinator responds: "Sure, I'll route that.\n\nROUTE: Fenster\nTASK: Fix the bug" → trimmed starts with "Sure" not "ROUTE:" → parsing fails → falls through to direct answer → entire response is shown including the preamble.
- **Impact:** If coordinator adds conversational preamble, routing is ignored and the full response is displayed as a direct answer instead of being routed. Unlikely with careful prompting, but LLMs are creative.
- **Fix:** Strip markdown code fences (```...```) and search for routing keywords anywhere in the response, not just at line start. Or improve the coordinator system prompt to forbid preamble.
- **Code Path:** `coordinator.ts:89` → `trimmed` removes leading/trailing space but not markdown or intermediate text.

### 9. MemoryManager Hardcodes Limits But Is Never Instantiated
- **Where:** `packages/squad-cli/src/cli/shell/memory.ts` exports `DEFAULT_LIMITS` (maxMessages=1000, maxStreamBuffer=1MB) but `runShell()` never creates a MemoryManager instance
- **Severity:** LOW
- **Reproduction:** Run shell for hours, send thousands of messages. The limits are defined but never enforced. Messages array and streamBuffers Map grow unbounded.
- **Impact:** Dead code. The guards that would prevent memory runaway don't exist in production. Same as issue #1 above.
- **Fix:** Create a MemoryManager instance in `runShell()`. Call `trimMessages()` on the `messages` array after each message is added. Call `trackBuffer()` before accumulating deltas and reject if over limit.
- **Code Path:** `index.ts:106-132` → creates StreamBridge but not MemoryManager. `App.tsx:44` → messages array grows unchecked.

### 10. InputPrompt Input Buffering Races on Rapid Disable/Enable Cycles
- **Where:** `packages/squad-cli/src/cli/shell/components/InputPrompt.tsx:30-46` — `wasDisabledRef` and `pendingInputRef` are separate refs
- **Severity:** LOW
- **Reproduction:** User types quickly while shell is processing. setProcessing(false) fires → InputPrompt re-renders → useEffect at line 33-46 drains buffer. But if there's a React batch update and processing is set to false then immediately true again (race in handleSubmit), the pending buffer may be drainedPartially, then re-disabled mid-drain.
- **Impact:** Unlikely race condition. In practice, the buffer recovery works well due to the `pendingInputRef` queue. But the logic is complex: `wasDisabledRef`, `bufferRef`, and `pendingInputRef` are three separate ref mutations that could be out of sync under extreme concurrent conditions.
- **Fix:** Consolidate into a single state machine: `inputState: 'active' | 'disabled' | 'draining'`. Clear the logic.
- **Code Path:** `InputPrompt.tsx:30-46` — three separate refs trying to coordinate state.

### 11. Coordinator Session Never Cleared on Successful Route
- **Where:** `packages/squad-cli/src/cli/shell/index.ts:378-435` — coordinatorSession is set at line 385 and never cleared
- **Severity:** LOW
- **Reproduction:** Send message that routes to agent → coordinator session is created → routing succeeds → coordinator session is cached in closure → send another message → reuses same coordinator session → if coordinator's system prompt includes context about previous routing, the LLM might incorrectly remember prior routing decisions.
- **Impact:** Over a long session, the coordinator accumulates message history. If the coordinator's system prompt is context-limited, old routing decisions may leak into new decisions. The session itself doesn't "reset" between routing calls — it accumulates turns.
- **Fix:** Either (1) create a fresh coordinator session for each routing call (slower but isolated), or (2) ensure the coordinator system prompt is stateless and doesn't rely on prior turn context.
- **Code Path:** `index.ts:385` → `coordinatorSession = await client.createSession(...)` — never null'd except on error (line 427).

### 12. App Does Not Handle Command Execution Errors Gracefully
- **Where:** `packages/squad-cli/src/cli/shell/components/App.tsx:96-151` — `handleSubmit` calls `executeCommand` but doesn't wrap in try/catch
- **Severity:** LOW
- **Reproduction:** Command handler throws (e.g., `handleStatus` tries to access `context.registry` but registry is undefined due to a race) → exception propagates to handleSubmit → React error boundary catches it → shell crashes with "Something went wrong."
- **Impact:** A bug in a command handler crashes the shell. The error is caught by ErrorBoundary but shows a generic message instead of a command-specific hint.
- **Fix:** Wrap `executeCommand` call in try/catch. Return `{ handled: false, output: 'Command error: ...' }` instead of crashing.
- **Code Path:** `App.tsx:110` → `executeCommand(parsed.command!, ...)` — no error handling.

### 13. Multiple Event Listeners Accumulate Without Cleanup if Session Reuse Fails
- **Where:** `packages/squad-cli/src/cli/shell/index.ts:310-331` — `session.on('message_delta', onDelta)` and `session.on('tool_call', onToolCall)` are registered before sendAndWait
- **Severity:** LOW
- **Reproduction:** Send message to agent → listener registered at line 310 → sendAndWait hangs/throws → finally block removes listener at line 346. But if the `finally` block's `session.off()` call itself throws (unlikely but possible if session is corrupted), the listener is never removed → next message to the same agent registers another listener → listeners accumulate.
- **Impact:** Memory leak. Each failed dispatch leaves behind a listener. After 100 failed dispatches, the session has 100 stale listeners that fire on every `message_delta` event.
- **Fix:** Wrap the `session.off()` calls in try/catch with debugLog. Or use a WeakMap to track registered listeners and ensure no duplicates.
- **Code Path:** `index.ts:346-347` → `session.off()` calls can throw silently (already wrapped in try/catch, good). But the condition is defensive.

---

## Summary by Category

### Memory & Growth Issues
- **Unbounded message history** (App.tsx:44) — no message cap enforced
- **Stale streamBuffer entries** (index.ts:138-160) — deleted on success but not on error
- **Coordinator session accumulates turns** (index.ts:378-435) — context grows unbounded
- **MemoryManager is unused** (memory.ts) — defined but never instantiated

### Data Loss & Parsing Fragility
- **Concurrent multi-agent streaming overwrites** (index.ts:452-462) — single UI slot for multiple agents
- **Ghost retry masks connection failures** (index.ts:74-104) — no connection awareness
- **Coordinator response parsing fails on preamble** (coordinator.ts:88-134) — exact string match is fragile
- **Streaming delta extraction fails silently** (index.ts:163-168) — event shape change causes silent data loss

### Edge Cases & State Races
- **InputPrompt buffering races on rapid cycles** (InputPrompt.tsx:30-46) — three separate refs, not atomic
- **Router comma-match consumes input** (router.ts:51-64) — can mangle input if agent name not found
- **SessionRegistry allows case-insensitive duplicates** (sessions.ts:10-19) — no name normalization
- **App doesn't catch command handler errors** (App.tsx:110) — unhandled exceptions crash shell

### Long-Term Stability
- **Listener accumulation on session reuse failure** (index.ts:310-347) — unlikely but possible under extreme conditions
- **No health checks on stale sessions** (index.ts:273-293) — dead sessions are evicted only on error, not on startup

---

## Recommended Fix Priority

1. **HIGH:** Add message history cap in App (issue #1) — prevent unbounded memory growth in long sessions
2. **MEDIUM:** Differentiate connection failures in ghost retry (issue #5) — prevent 30+ minute silent hangs
3. **MEDIUM:** Implement per-agent streaming content in App (issue #3) — prevent garbled concurrent output
4. **MEDIUM:** Clear streamBuffer on error (issue #2) — prevent stale buffer entries
5. **LOW:** Improve coordinator response parsing (issue #8) — handle preamble and markdown
6. **LOW:** Normalize agent names in SessionRegistry (issue #6) — prevent case-sensitivity bugs
