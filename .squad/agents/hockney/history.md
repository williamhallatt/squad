# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- Multi-agent concurrency tests: spawning is the heart of the system, test it thoroughly
- Casting overflow edge cases: universe exhaustion, diegetic expansion, thematic promotion — all need test coverage
- GitHub Actions CI/CD pipeline: tests must pass before merge
- 80% coverage floor, 100% on critical paths (casting, spawning, coordinator routing)
- 1551 tests across 45 test files — this is the baseline to maintain or exceed
- Vitest is the test runner — fast, ESM-native, good TypeScript support

### Issue #214: Resolution & CLI global/status tests (2026-02-21)
- Added 14 new tests to resolution.test.ts: deeply nested dirs, nearest .squad/ wins, symlink support
- Created cli-global.test.ts with 10 tests: status routing (repo/personal/none), --global flag for init/upgrade
- Test count grew from ~1592 to 1616 across 51 files — all passing
- Symlink test skipped on Windows (requires elevated privileges) — pattern: `if (process.platform === 'win32') return;`
- CLI routing testable without spawning processes by replicating the conditional logic from src/index.ts main()
- resolveGlobalSquadPath() always creates the directory — tests that check global .squad/ must clean up after themselves

### Issue #248: Shell module integration tests (2026-02-21)
- Created test/shell.test.ts with 47 tests covering all shell module components
- **SessionRegistry** (9 tests): register, get, getAll, getActive filter, updateStatus, remove (true/false), clear
- **Spawn infrastructure** (6 tests): loadAgentCharter (load, case-insensitive, missing), buildAgentPrompt (charter, systemContext, omit)
- **Coordinator** (11 tests): buildCoordinatorPrompt (team.md, routing.md, fallbacks), parseCoordinatorResponse (DIRECT, ROUTE, ROUTE no-context, MULTI, fallback), formatConversationContext (all, maxMessages, agentName prefix)
- **ShellLifecycle** (10 tests): init state, ready transition, agent discovery, registry population, addUserMessage, addAgentMessage, addSystemMessage, getHistory (all/filtered), shutdown
- **StreamBridge** (11 tests): message_delta, buffer accumulation, usage, reasoning_delta, flush, flush empty, getBuffer unknown, clear, streaming/idle status transitions
- Created test-fixtures/.squad/ with team.md, routing.md, and agent charters for hockney/fenster
- Test count grew from 1621 to 1668 across 52 files — all passing
- Shell modules are well-structured for testing: pure functions (coordinator parsing), simple classes (SessionRegistry), callback-based bridges (StreamBridge)
- loadAgentCharter accepts optional teamRoot param — critical for test isolation (avoids resolveSquad() cwd dependency)
- Ink components (render.ts replacement) left untested — separate issue per task brief

### Issue #228: CRLF normalization tests (2026-02-21)
- Created test/crlf-normalization.test.ts with 13 CRLF-specific test cases across all 5 parsers
- `withCRLF(input)` helper converts \n → \r\n to replay happy-path inputs with Windows line endings
- `expectNoCR(value)` recursive helper asserts no \r in strings, arrays, or object values
- **parseTeamMarkdown** (4 tests): table format, section format, mixed endings, skill list values
- **parseDecisionsMarkdown** (3 tests): headings, body content, config relevance detection
- **parseRoutingMarkdown** (2 tests): basic routing table, multi-agent routing rows
- **parseCharterMarkdown** (3 tests): identity section, boundaries/ownership, model preference
- **loadSkillsFromDirectory** (1 test): CRLF SKILL.md frontmatter written to disk with \r\n
- All 13 tests pass — Fenster's normalizeEol() is already applied to all 5 parsers
- Note: `npm run build` has a pre-existing TS error (VERSION export in cli-entry.ts) unrelated to this work
- Pattern: test CRLF by wrapping existing happy-path markdown in withCRLF(), assert identical outputs with no \r contamination

### 📌 Team update (2026-02-22T020714Z): CRLF test suite added
Hockney added 13 CRLF-specific test cases covering Windows line ending handling. All passing. Validates that parsers are robust to CRLF input. Issue #228 closed. 1683 tests passing. Complements Fenster's normalize-eol.ts utility.

### Issue #230: Consumer-perspective import tests (2026-02-22)
- Created test/consumer-imports.test.ts with 6 tests validating package exports from a consumer's perspective
- **Main barrel** (3 tests): key parser functions (parseTeamMarkdown, parseDecisionsMarkdown, parseRoutingMarkdown), CLI functions (runInit, runExport, runImport, scrubEmails), VERSION export as string
- **Parsers barrel** (1 test): parseTeamMarkdown and parseCharterMarkdown importable from src/parsers.js
- **Types barrel** (1 test): Object.keys(types).length === 0 confirms pure type re-exports produce no runtime values
- **Side-effect-free import** (1 test): importing index.ts doesn't mutate process.argv or trigger CLI behavior — test completing without hanging proves clean separation
- Dynamic `await import()` used throughout to keep tests independent and avoid module caching issues
- All 6 tests pass on first run; validates the barrel file split (index.ts / parsers.ts / types.ts) works correctly for consumers

### Post-restructure verification (2026-02-22)
- **Build:** `npm run build` compiles both `@bradygaster/squad-sdk` and `@bradygaster/squad-cli` cleanly via workspace scripts. Exit code 0.
- **Tests:** All 1719 tests pass across 56 test files. `npm run build && npm test` exits clean.
- **vitest.config.ts:** Works as-is — no path aliases needed while root `src/` still exists.
- **Import state:** All 56 test files still import from root `../src/` (the old monolith barrel). Only `consumer-imports.test.ts` had 3 workspace package references but dynamically imports from `../src/index.js`.
- **Import migration deferred:** Cannot blindly rewrite `../src/X.js` → `@bradygaster/squad-sdk/X` because:
  1. Tests import deep internal modules (e.g., `../src/config/agent-doc.js`, `../src/casting/casting-engine.js`) that aren't exposed via the SDK package's `exports` map — only 18 subpath exports exist.
  2. CLI test files import from `../src/cli/...` which lives in `@bradygaster/squad-cli`, but that package has no subpath exports at all.
  3. Root `src/index.ts` (v0.7.0) still re-exports CLI functions (`runInit`, `runExport`, etc.) which SDK package (v0.8.0) correctly does not export — the `consumer-imports.test.ts` tests CLI exports that don't exist in the SDK barrel.
  4. Migrating requires either expanding the `exports` maps in both packages or adding vitest `resolve.alias` config. Both are non-trivial.
- **Recommendation:** Migration should happen as a dedicated task when root `src/` is actually removed. Attempting it now risks breaking 1719 passing tests for no immediate benefit.
- **Flaky test observed:** One run showed 1 failure / 1718 pass in CLI export-import tests (timing-sensitive fs operations). Not reproducible on immediate re-run — pre-existing flake.

### 📌 Team update (2026-02-22T041800Z): SDK/CLI split verified, all 1719 tests passing, test import migration deferred — decided by Hockney
Build clean + all 1719 tests pass post-SDK/CLI migration. Fenster's import rewriting (6 cross-package imports) verified correct. Test import migration deferred until root `src/` deletion blocks (lazy approach reduces risk). Tests remain on old `../src/` paths for now — migration requires expanding exports maps or vitest alias config, both non-trivial. Exports map gap + CLI no exports + barrel divergence make premature migration risky. Decision merged to decisions.md (hockney-test-import-migration.md).

### Test infrastructure: coverage config + package exports test (2026-02-22)
- **Coverage:** Installed `@vitest/coverage-v8@^3.2.0`, configured vitest with `v8` provider and `text`, `text-summary`, `html` reporters. Coverage output goes to `./coverage/` (already in `.gitignore`). Include patterns cover `src/**/*.ts` and `packages/*/src/**/*.ts`.
- **Package exports test:** Created `test/package-exports.test.ts` with 8 tests covering SDK exports map: root (`VERSION`), `/config` (`DEFAULT_CONFIG`), `/resolution` (`resolveSquad`), `/parsers` (`parseTeamMarkdown`), `/types` (type-only, no runtime values), `/agents`, `/skills`, `/tools`.
- Discovered `types` subpath has zero runtime exports (pure `export type` statements) — test only verifies module resolves.
- Config subpath exports `DEFAULT_CONFIG`, `AgentRegistry`, `ModelRegistry`, etc. — not `loadSquadConfig` as initially assumed.
- `npm install` needed `--legacy-peer-deps` flag due to `workspace:*` protocol in squad-cli's package.json (pnpm syntax, not native npm).
- Build passes cleanly. All 8 package-exports tests pass with coverage reporting.
