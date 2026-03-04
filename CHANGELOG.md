# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added — Remote Squad Mode (ported from @spboyer's [bradygaster/squad#131](https://github.com/bradygaster/squad/pull/131))
- `resolveSquadPaths()` dual-root resolver — project-local vs team identity directories (#311)
- `squad doctor` command — 9-check setup validation with emoji output (#312)
- `squad link <path>` command — link a project to a remote team root (#313)
- `squad init --mode remote` — initialize with remote team root config (#313)
- `ensureSquadPathDual()` / `ensureSquadPathResolved()` — dual-root write guards (#314)

Thanks to **Shayne Boyer** ([@spboyer](https://github.com/spboyer)) for the original remote mode design.

### Changed — Distribution & Versioning
- **Distribution:** npm-only distribution channel. No more GitHub-native distribution (`npx github:bradygaster/squad`). Users now install via `npm install -g @bradygaster/squad-cli` or `npx @bradygaster/squad-cli` from npm registry.
- **Semantic Versioning fix (#692):** Version format changed from `X.Y.Z.N-preview` to `X.Y.Z-preview.N` to comply with semantic versioning spec (prerelease identifier after patch, build metadata after prerelease). Example: `0.8.6-preview.1` instead of `0.8.6.1-preview`.
- **Version transition:** Public repo final version was `0.8.5.1`. Private repo continues at `0.8.x` cadence (next publish after 0.8.17 is 0.8.18), following semver prerelease convention for development.

## [0.8.18-preview] - TBD

### Added — Remote Squad Mode (ported from @spboyer's [bradygaster/squad#131](https://github.com/bradygaster/squad/pull/131))
- `resolveSquadPaths()` dual-root resolver — project-local vs team identity directories (#311)
- `squad doctor` command — 9-check setup validation with emoji output (#312)
- `squad link <path>` command — link a project to a remote team root (#313)
- `squad init --mode remote` — initialize with remote team root config (#313)
- `ensureSquadPathDual()` / `ensureSquadPathResolved()` — dual-root write guards (#314)

### Changed — npm Distribution & Monorepo Structure
- **Distribution:** Migrated from GitHub-native (`npx github:bradygaster/squad`) to npm packages (`npm install -g @bradygaster/squad-cli` / `npx @bradygaster/squad-cli`)
- **Packages:** Independent versioning via @changesets/cli — `@bradygaster/squad-sdk` and `@bradygaster/squad-cli` evolve on separate cadences
- **Structure:** Monorepo layout with workspace packages (SDK + CLI)
- **Directory:** `.squad/` directory structure (migration from `.ai-team/`)
- **Semantic Versioning:** All versions now comply with semver spec (prerelease format `X.Y.Z-preview.N`)

### Fixed
- CLI entry point moved from `dist/index.js` to `dist/cli-entry.js`. If you reference the binary directly, update your path. `npx` and `npm` bin resolution is unchanged. (#187)
- CRLF normalization: All parsers now normalize line endings before parsing. Windows users with `core.autocrlf=true` no longer get `\r`-tainted values. (#220, #221)
- `process.exit()` removed from library-consumable functions. VS Code extensions can now safely import CLI functions without risking extension host termination. (#189)
- Removed `.squad` branch protection guard (`squad-main-guard.yml`) — no longer needed with npm workspace `files` field exclusions

### Internal
- New utility: `normalizeEol()` in `src/utils/normalize-eol.ts`
- New entry point: `src/cli-entry.ts` (CLI bootstrap separated from library exports)
- Migrated to npm workspace publishing (`@bradygaster/squad-sdk`, `@bradygaster/squad-cli`)
- Changesets infrastructure for independent package versioning


