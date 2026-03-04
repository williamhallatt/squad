# streaming-chat

> Interactive multi-agent streaming chat — Squad SDK sample for MVP Summit.

Three agents (Backend, Frontend, Tester) cast from the **Usual Suspects** universe. Type a message, watch the right agent respond token-by-token in real time.

## Quick Start

```bash
# From the repo root
cd samples/streaming-chat
npm install

# Demo mode (no Copilot auth required — simulated streaming)
npx tsx index.ts
# or
SQUAD_DEMO_MODE=true npx tsx index.ts

# Live mode (requires @github/copilot-sdk auth)
npx tsx index.ts
```

## What It Demonstrates

| SDK Feature | Usage |
|---|---|
| **SquadClientWithPool** | Connection lifecycle + integrated session pool |
| **CastingEngine** | Casts 3 agents from the `usual-suspects` universe |
| **SessionPool** | One session per agent, managed by the pool |
| **EventBus** | Cross-session event pub/sub wired to client events |
| **StreamingPipeline** | Token-by-token output via `onDelta()` handlers |
| **Keyword Routing** | Simple content-based routing to the right agent |

## Commands

| Command | Action |
|---|---|
| _any text_ | Routes to an agent and streams the response |
| `/quit` | Exit the chat |

## Routing Keywords

- **Backend (McManus):** `api`, `server`, `database`, `backend`, `endpoint`, `rest`, `sql`, `auth`
- **Frontend (Kobayashi):** `ui`, `frontend`, `component`, `css`, `react`, `style`, `layout`, `ux`
- **Tester (Fenster):** `test`, `bug`, `qa`, `coverage`, `assert`, `fixture`, `mock`, `spec`

Messages that don't match any keyword are routed to Backend by default.

## Demo Mode

When `SQUAD_DEMO_MODE=true` is set (or when Copilot auth is unavailable), the sample runs with simulated streaming. Pre-written responses are delivered word-by-word with realistic timing to demonstrate the StreamingPipeline's `onDelta` handler pattern.

## Architecture

```
User Input (readline)
    │
    ▼
routeMessage()  ──→  keyword matching  ──→  AgentInfo
    │
    ▼
┌─── Live Mode ───────────────────────────────┐
│ SquadClientWithPool.resumeSession()         │
│   → session.sendAndWait()                   │
│   → message_delta events → pipeline         │
└─────────────────────────────────────────────┘
┌─── Demo Mode ───────────────────────────────┐
│ simulateStreaming()                          │
│   → synthetic StreamDelta events → pipeline │
└─────────────────────────────────────────────┘
    │
    ▼
StreamingPipeline.onDelta()  ──→  process.stdout.write()
```

## Files

| File | Purpose |
|---|---|
| `index.ts` | Main interactive chat application |
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration (ESM, strict) |
| `README.md` | This file |
| `TEST-SCRIPT.md` | Manual test walkthrough |
| `tests/streaming-chat.test.ts` | Unit tests |
