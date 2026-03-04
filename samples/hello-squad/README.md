# hello-squad

**Beginner sample** for `@bradygaster/squad-sdk` — demonstrates casting a themed agent team and onboarding them with persistent identities.

## What It Demonstrates

| SDK Feature | What You'll See |
|---|---|
| `resolveSquad()` | Locate (or create) a `.squad/` directory |
| `CastingEngine` | Cast a team of 4 agents from "The Usual Suspects" universe |
| `onboardAgent()` | Create charter + history files for each agent |
| `CastingHistory` | Record casts and prove names are deterministic |

## Prerequisites

- Node.js ≥ 20
- The SDK must be built first: `cd ../../ && npm run build`

## Run It

```bash
npm install
npm start
```

## Expected Output

```
🎬 hello-squad — Squad SDK beginner sample

────────────────────────────────────────────────────────────
  Step 1 — Resolve .squad/ directory
────────────────────────────────────────────────────────────
✅ Created demo .squad/ at: /tmp/hello-squad-demo/.squad
   resolveSquad() → /tmp/hello-squad-demo/.squad

────────────────────────────────────────────────────────────
  Step 2 — Cast a team from "The Usual Suspects"
────────────────────────────────────────────────────────────
  Universe: The Usual Suspects
  Team size: 4

  🎭 Keyser — Lead
     Personality: Quietly commanding; sees the whole board before anyone else.
     ...

────────────────────────────────────────────────────────────
  Step 3 — Onboard agents
────────────────────────────────────────────────────────────
  ✅ Keyser — Lead
  ✅ McManus — Developer
  ✅ Fenster — Tester
  ✅ Verbal — Scribe

────────────────────────────────────────────────────────────
  Step 4 — Team roster
────────────────────────────────────────────────────────────
  ┌─────────────┬──────────────────┬──────────────────────────────────────────┐
  │ Name        │ Role             │ Personality                              │
  ...

────────────────────────────────────────────────────────────
  Step 5 — Casting history (persistent names)
────────────────────────────────────────────────────────────
  Casting records: 2
  Names match across casts: ✅ Yes
```

## Run Tests

```bash
npm test
```

## Files

| File | Purpose |
|---|---|
| `index.ts` | Main demo script |
| `tests/hello-squad.test.ts` | Acceptance tests |
| `TEST-SCRIPT.md` | Manual test walkthrough |
