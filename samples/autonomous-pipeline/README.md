# Autonomous Pipeline — Squad SDK Showcase

> Watch a team of AI agents autonomously execute a development pipeline — picking up tasks, routing follow-ups, recording decisions, and accumulating learnings. All orchestrated by the Squad SDK.

## What This Demonstrates

This is the **showcase sample** for the Squad SDK. It exercises the full runtime stack:

| SDK Component | What It Does Here |
|---------------|-------------------|
| **CastingEngine** | Casts 4 agents from the `usual-suspects` universe with unique personalities |
| **CostTracker** | Accumulates per-agent cost/token data across the entire run |
| **TelemetryCollector** | Collects opt-in telemetry events (init, spawn, run) |
| **SkillRegistry** | Matches domain skills (JWT auth, testing, docs) to tasks by keyword |
| **StreamingPipeline** | Processes simulated message deltas and usage events per session |
| **selectResponseTier** | Selects Direct/Lightweight/Standard/Full tiers based on task complexity |
| **OTel Metrics** | Records agent spawn/duration/destroy and token usage via OpenTelemetry |
| **initSquadTelemetry** | Wires OTel tracing + metrics to Aspire dashboard (when configured) |

### Squad Tool Patterns Demonstrated

- **`squad_route`** — Agents route follow-up tasks to teammates (e.g., developer → tester)
- **`squad_decide`** — Agents record architectural decisions (e.g., "Use JWT with RS256")
- **`squad_memory`** — Agents save learnings for future sessions (e.g., "Pool size 20 optimal")

## Quick Start

```bash
# From the repository root
cd samples/autonomous-pipeline
npm install
npm run dev
```

## What You'll See

1. **Casting** — 4 agents materialize from The Usual Suspects universe
2. **Task Queue** — 10 diverse tasks: API design, auth implementation, testing, docs, security audit
3. **Autonomous Execution** — Agents pick up tasks matching their role and execute with simulated work
4. **Live Dashboard** — Agent status, task progress, timeline, decisions, cost tracking
5. **Final Report** — Scoreboard, total cost, token usage, OTel export status

## OTel / Aspire Integration

To see traces and metrics in the .NET Aspire dashboard:

```bash
# Start Aspire dashboard
docker run -d \
  -p 18888:18888 \
  -p 4317:18889 \
  -e DASHBOARD__FRONTEND__AUTHMODE=Unsecured \
  -e DASHBOARD__OTLP__AUTHMODE=Unsecured \
  mcr.microsoft.com/dotnet/aspire-dashboard:latest

# Run with OTel export
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317 npm run dev

# Open http://localhost:18888 to view traces and metrics
```

Metrics exported:
- `squad.agent.spawns` — Agent spawn counter
- `squad.agent.duration` — Task execution duration histogram
- `squad.tokens.input` / `squad.tokens.output` — Token usage counters
- `squad.sessions.created` / `squad.sessions.closed` — Session lifecycle

## Project Structure

```
autonomous-pipeline/
├── index.ts                              # Main demo application
├── package.json                          # Dependencies (squad-sdk, chalk)
├── tsconfig.json                         # TypeScript config (ES2022, ESM)
├── README.md                             # This file
├── TEST-SCRIPT.md                        # Step-by-step demo walkthrough
└── tests/
    └── autonomous-pipeline.test.ts       # Vitest test suite (SDK integration)
```

## Running Tests

```bash
npm test
```

Tests validate:
- CastingEngine team composition
- CostTracker accumulation and formatting
- TelemetryCollector consent and event collection
- SkillRegistry keyword matching and role affinity
- StreamingPipeline session attachment and event processing
- selectResponseTier routing for different task types
- Full integration wiring of all components

## Requirements

- Node.js ≥ 20.0.0
- TypeScript ≥ 5.0
- ESM-only (`"type": "module"` in package.json)
