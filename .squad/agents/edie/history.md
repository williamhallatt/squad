# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- Strict mode non-negotiable: strict: true, noUncheckedIndexedAccess: true, no @ts-ignore
- Declaration files are public API — treat .d.ts as contracts
- Generics over unions for recurring patterns
- ESM-only: no CJS shims, no dual-package hazards
- Build pipeline: esbuild for bundling, tsc for type checking
- Public API: src/index.ts exports everything — this is the contract surface

### 📌 Team update (2026-02-21T21:23Z): SDK dependency can be swapped from file: to npm reference — decided by Kujan
The `file:../copilot-sdk/nodejs` reference can be upgraded to `"@github/copilot-sdk": "^0.1.25"` (already published on npm with SLSA attestations). This is a one-line change; build and all 1592 tests verified to pass. This unblocks npm publish and removes CI sibling-directory dependency.
