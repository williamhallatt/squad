# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- Casting system implementation: universe selection, registry.json (persistent names), history.json (assignment snapshots)
- Drop-box pattern for decisions inbox: agents write to decisions/inbox/{name}-{slug}.md, Scribe merges
- Parallel spawn mechanics: background mode default, sync only for hard data dependencies
- 13 modules: adapter, agents, build, casting, cli, client, config, coordinator, hooks, marketplace, ralph, runtime, sharing, skills, tools
- CLI is zero-dep scaffolding: cli.js stays thin, runtime is modular
- Ralph module: work monitor, queue manager, keep-alive — runs continuous loop until board is clear

### 📌 Team update (2026-02-21T21:23Z): CLI command renames are pending — decided by Keaton
Recommend renaming `squad watch` to `squad triage` (40% better semantic accuracy; aligns with GitHub terminology). Keep `watch` as silent alias for backward compatibility. Do NOT expose `squad ralph` as user-facing CLI; suggest `squad monitor` or `squad loop` instead for the monitoring function. Ralph remains in team identity, not CLI. Confidence: 85% for triage, 90% against ralph.
