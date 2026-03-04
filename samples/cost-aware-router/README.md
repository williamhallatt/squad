# Cost-Aware Router

A Squad SDK sample that demonstrates **response tier selection** and **cost tracking** — the two features that keep multi-agent runs from blowing through your budget.

## What It Shows

| SDK Feature | How It's Used |
|---|---|
| `selectResponseTier()` | Routes each task to the cheapest tier that can handle it |
| `getTier()` | Retrieves tier definitions (direct / lightweight / standard / full) |
| `CostTracker` | Accumulates per-agent, per-session cost and token data |
| `MODELS` | Model catalogue with fallback chains by tier |

## Quick Start

```bash
cd samples/cost-aware-router
npm install
npm run dev
```

## What You'll See

The demo processes five tasks of increasing complexity:

1. **Typo Fix** → routed to `direct` (no model needed)
2. **Docs Update** → routed to `lightweight` (fast model)
3. **Feature Impl** → routed to `standard` (standard model)
4. **Arch Review** → routed to `full` (premium model)
5. **Security Audit** → routed to `full` (premium model)

For each task the output shows:

- **Tier badge** — color-coded decision with rationale
- **Model selection** — which model the tier maps to
- **Cost estimate** — based on token counts and model pricing
- **Budget bar** — visual progress toward a $0.50 demo limit
- **Warnings** — when budget consumption crosses 70% and 90%

After all tasks run, you get:

- **Tier distribution** — bar chart of how many tasks hit each tier
- **Agent cost table** — per-agent breakdown with tokens, cost, and turns
- **Final report** — total spend, remaining budget, and completion status

## Project Structure

```
samples/cost-aware-router/
├── index.ts              # Main demo script
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── README.md             # You are here
├── TEST-SCRIPT.md        # Manual walkthrough for live demos
└── tests/
    └── cost-aware-router.test.ts   # Automated tests
```

## SDK Imports

```typescript
import {
  CostTracker,
  selectResponseTier,
  getTier,
  MODELS,
} from '@bradygaster/squad-sdk';
```

## License

MIT
