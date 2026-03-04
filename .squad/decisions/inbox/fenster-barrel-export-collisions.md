# Decision: Use named exports in SDK barrel when symbol names collide

**Author:** Fenster  
**Date:** 2026-03-XX  
**Context:** Adding `export * from './runtime/constants.js'` to the SDK barrel caused a TS2308 collision — `AgentRole` was already exported from `casting/index.js`.

**Decision:** When adding new `export *` lines to `packages/squad-sdk/src/index.ts`, always check for symbol name collisions with existing exports. If a collision exists, use explicit named exports instead of wildcard.

**Rationale:** TypeScript's TS2308 error ("Module X has already exported a member named Y") is a hard compile error. Wildcard re-exports are convenient but brittle when multiple modules define the same symbol name.

**Applies to:** Anyone editing `packages/squad-sdk/src/index.ts`.
