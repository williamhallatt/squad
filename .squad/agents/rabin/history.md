# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- Zero-dependency scaffolding preserved: cli.js vs runtime separation
- Bundle size vigilance: every dependency is a cost, every KB matters
- [CORRECTED] Distribution: npm-native (@bradygaster/squad-cli), NEVER GitHub-native (GitHub-native removed per npm-only decision 2026-02-21; GitHub-native path was tested 2026-07 but rejected)
- esbuild for bundling, tsc for type checking — separate concerns
- Marketplace prep: packaging for distribution, not just local use

### 📌 Team update (2026-02-22T041800Z): Publish workflows verified ready, versions aligned to 0.8.0, both packages published to npm — decided by Rabin, Kobayashi, Coordinator
Rabin verified existing publish workflows already correct — no changes needed. Both SDK and CLI workflows properly configured for npm. Kobayashi aligned all versions to 0.8.0. Coordinator published @bradygaster/squad-sdk@0.8.0 and @bradygaster/squad-cli@0.8.0 to npm registry. Distribution infrastructure production-ready. Release workflows validated end-to-end.

### 📌 Fix (2026-02-22): npx bin resolution — squad-cli 0.8.1 published
Root cause: `npx @bradygaster/squad-cli` resolves the bin by unscoped package name (`squad-cli`), but the only bin entry was named `squad`. This caused npx to fall back to running the package as a script, which hit the orphaned placeholder `dist/cli.js` ("squad-cli placeholder — full CLI coming soon").
Fix: Added `"squad-cli": "./dist/cli-entry.js"` as a second bin entry alongside the existing `squad` entry. Replaced the placeholder `dist/cli.js` with a redirect to `cli-entry.js`. Bumped version to 0.8.1 (can't overwrite 0.8.0). Published and verified: `npx @bradygaster/squad-cli@0.8.1 --version` → `squad 0.8.0` (VERSION from SDK, correct).

### 📌 Assessment (2026-02-22): npm distribution status audit complete
**Published versions:** squad-sdk@0.8.0 (6 versions total), squad-cli@0.8.1 (7 versions total) on npm registry.
**Package contents:** SDK exports 26 public entry points (main, parsers, types, config, skills, agents, adapter, client, coordinator, hooks, tools, runtime + streaming/event-bus/benchmarks/i18n/telemetry/offline/cost-tracker, marketplace, build, sharing, ralph, casting, resolution). Files: dist + README. CLI exports 14 public entry points (main, upgrade, copilot-install, shell/*, core/*, commands/*). Files: dist, templates, README. Both have `prepublishOnly` scripts enforcing build before publish.
**Install paths:** (1) npm: `npm install -g @bradygaster/squad-cli` + `npx squad init` works correctly; squad-cli@0.8.1 has both bin entries (squad, squad-cli). (2) [CORRECTED] GitHub-native (npx github:bradygaster/squad) was initial distribution path per beta, but npm is now canonical (npm-only decision finalized 2026-02-21; GitHub-native tested feasibility 2026-07 but rejected for UX reasons). Root package.json version is 0.6.0-alpha.0 (private workspace marker, not published).
**Publish workflows:** Both squad-publish.yml (on tags) and squad-insider-publish.yml (on insider branch) correctly configured — build → test → publish with public access. No missing steps or auth issues.
**Distribution gaps:** None. Distribution infrastructure production-ready. Version skew is intentional: SDK 0.8.0, CLI 0.8.1 (CLI had minor bin entry fix). README accurately reflects npm as primary install method.

### 📌 Team update (2026-02-22T070156Z): npx bin resolution fix merged to decisions, npm distribution fully operational — decided by Rabin
- **npx bin resolution decision:** Fixed `npx @bradygaster/squad-cli` by adding second bin entry `"squad-cli": "./dist/cli-entry.js"` alongside existing `"squad"` entry. npx resolves by unscoped package name, not custom bin names.
- **Version bump to 0.8.1:** 0.8.0 immutable on npm; bin fix required patch release.
- **Both bin entries active:** `squad` works for global installs, `squad-cli` works for npx resolution. Future releases must maintain both.
- **Distribution status:** Both packages published and verified on npm. SDK@0.8.0, CLI@0.8.1 (intentional skew). Install paths working correctly.
- **Decision merged to decisions.md.** Status: npm distribution production-ready, all package metadata and bin entries validated.

### 📌 Manual publish (2026-02-22): CI publish broken, manual publish to 0.8.2 successful
- **Root cause:** CI publish workflow failed due to pre-existing test job configuration issue (test job doesn't build first, causing test failures).
- **Workaround:** Manual publish required. Logged into npm interactively, published squad-sdk@0.8.2 first (prepublishOnly hook ran build), then squad-cli@0.8.2 (CLI depends on SDK).
- **Verification:** Both packages confirmed published at 0.8.2 via `npm view`.
- **CI fix needed:** Test job in CI workflow needs to run build step before tests to prevent future publish failures.

### 📌 Public Readiness Assessment (2026-02-24): Distribution ready with caveats — 🟡
**Requested by:** Brady — assessing whether SDK and CLI are ready to go public (source and all).

**Package health (🟢):**
- Both packages have complete metadata: name, version, description, keywords, license (MIT), repository with directory field
- Engines correctly set to node >=20
- SDK@0.8.5 (published 0.8.5), CLI@0.8.5.1 (published 0.8.5) — versions aligned
- No `private: true` flags in published packages
- Zero npm audit vulnerabilities

**Files field correctness (🟢):**
- SDK ships: dist + README (no test fixtures, no .squad, no src)
- CLI ships: dist + templates + README (templates needed for `squad init`)
- Both have `prepublishOnly: npm run build` — enforced build before publish
- Verified via `npm pack --dry-run` — clean package contents

**Install experience (🟢):**
- `npx @bradygaster/squad-cli` works (both `squad` and `squad-cli` bin entries present)
- Root cli.js has deprecation notice steering users to npm (correct)
- CLI entry point clean: shebang, env loading, no orphaned placeholders
- Zero-dependency CLI entry maintained

**Missing metadata (🟡):**
- No `homepage` field in either package (recommend: https://github.com/bradygaster/squad)
- No `bugs` field (recommend: https://github.com/bradygaster/squad/issues)
- No `author` field (optional, but nice for attribution)

**Version readiness (🟡):**
- Current: 0.8.5.x — still in pre-1.0 territory
- For public source release, consider explicit stability signal:
  - Stay 0.x.x with clear stability docs, OR
  - Bump to 1.0.0 signaling production-ready
- README already says "status: production" — version should match that confidence

**Recommendation:** 🟡 **Ready with caveats**
- ✅ Core distribution infrastructure is production-ready
- ✅ Package contents clean, no leaks
- ✅ Install paths work correctly
- ⚠️ Add homepage/bugs fields for discoverability
- ⚠️ Decide on version strategy: 0.9.0 → 1.0.0 or explicit "0.x = stable" docs
- ⚠️ Consider adding CHANGELOG.md to published packages (currently only in root)

**Verdict:** Green-light for public source release. Add homepage/bugs metadata in next patch. Version bump decision is strategic (marketing), not technical.

### 2026-02-24T17-25-08Z : Team consensus on public readiness
📌 Full team assessment complete. All 7 agents: 🟡 Ready with caveats. Consensus: ship after 3 must-fixes (LICENSE, CI workflow, debug console.logs). No blockers to public source release. See .squad/log/2026-02-24T17-25-08Z-public-readiness-assessment.md and .squad/decisions.md for details.

### 📌 npm-only distribution sweep (2026-03-01)
Brady directed: stop distributing via npx github:. All distribution is now npm-only (`npm install -g @bradygaster/squad-cli` or `npx @bradygaster/squad-cli`). Swept 34 files across source, templates, docs, tests, and workflows. Updated github-dist.ts default template from `npx github:{{owner}}/{{repo}}` to `npx @bradygaster/squad-cli`. Updated install-migration.ts paths. Updated all 4 copies of squad.agent.md (Ralph Watch Mode) and all 4 insider-release workflows. Updated rabin charter from "GitHub-native, never npmjs.com" to "npm-native, always npmjs.com". All 68 bundle tests pass. Distribution is GitHub-native: ~~WRONG~~. Distribution is npm-native: ✅ CORRECT.

### 📌 Beta migration compatibility analysis (2026-03-01)
**Requested by:** Brady — analyzing npx compatibility between beta repo (bradygaster/squad, GitHub-native) and origin repo (bradygaster/squad-pr, npm-native) for upcoming migration.

**Problem:** Beta repo distributes via `npx github:bradygaster/squad` (single-file, root bin entry). Origin repo is npm-native monorepo with `"private": true` root (no root bin entry). After migration, `npx github:bradygaster/squad` will break.

**Analysis:**
- `npx github:` works by cloning repo → reading root package.json → running bin entry. Origin has no root bin entry → will error.
- [CORRECTED] Upgrade path (beta v0.5.4 → origin v0.8.17+) is ✅ **fully supported**. CLI handles `.ai-team/` → `.squad/`, runs migrations, refreshes templates. No data loss.
- Package name change (`@bradygaster/create-squad` → `@bradygaster/squad-cli`) is a non-issue — CLI detects by directory structure, not package name.

**Recommendation:** Error-only shim with clear guidance (Option 5):
- Add root bin entry pointing to `cli.js` (for error handling only, not functionality)
- `cli.js` prints bold error: "GitHub-native distribution removed. Use: npm install -g @bradygaster/squad-cli"
- Exit immediately with code 1
- Update beta README with migration guide
- Remove shim in v1.0.0

**Verdict:**
- Distribution compatibility: 🔴 Breaking change required (aligns with npm-only decision)
- Upgrade compatibility: 🟢 Fully supported (beta projects upgrade seamlessly)
- User experience: 🟡 Clear error > cryptic npm error. Users get actionable guidance.

**Decision written to:** `.squad/decisions/inbox/rabin-npx-compatibility.md`

### 📌 Team update (2026-03-02T22:33:50Z): npx distribution migration strategy — error-only shim recommended (Option 5) — decided by Rabin
- **Problem:** Beta repo (`npx github:bradygaster/squad`) will break after migration to npm-only origin repo (root `package.json` has `"private": true`, no bin entry).
- **5-option analysis completed:** Evaluated all backwards compatibility approaches (keep working, print error, time-limited shim, just break, error-only shim).
- **Recommendation:** Option 5 (error-only shim) — balances user experience + team decision compliance:
  1. Add root bin entry pointing to cli.js (for error handling only)
  2. cli.js prints bold, clear error: "GitHub-native distribution removed. Use: npm install -g @bradygaster/squad-cli"
  3. Exit with code 1 (fail fast, no silent redirection)
  4. Update beta README with migration guide
  5. Remove shim in v1.0.0 when beta users have migrated
- **Why Option 5:**
  - ✅ User-first principle: Clear error message > cryptic npm error
  - ✅ Aligns with npm-only team decision (no perpetuation of GitHub-native path)
  - ✅ Low maintenance burden (simple error script, can be removed later)
  - ✅ Clean break with clear migration path
- **Upgrade path:** Beta projects (v0.5.4) upgrade seamlessly to origin (v0.8.17+) via `squad upgrade` command. CLI detects legacy `.ai-team/`, runs migrations, refreshes templates. No data loss.
- **Distribution compatibility:** 🔴 Breaking change required (intended, aligns with npm-only decision)
- **Upgrade compatibility:** 🟢 Fully supported (no issues upgrading from beta to origin)
- **Decision merged to decisions.md.** Status: npx migration strategy finalized for implementation post-banana gate.
- **Cross-agent sync:** Kobayashi's migration plan (separate decision) complements this distribution analysis. Both decisions now in merged decisions.md for coordinated beta → origin migration.

### 📌 Research (2026-03-02 continued): GitHub npx dual-distribution feasibility analysis
**Requested by:** Brady — can we support `npx github:bradygaster/squad` alongside the npm channel?

**How `npx github:` works:**
- npx clones the repo via git → runs `npm install` (including devDependencies for git sources) → runs `prepare` script → executes root `bin` entry.
- Only reads the **root** `package.json` bin field. Does NOT traverse into workspace packages.

**What would be needed (3 changes):**
1. Add `"bin": { "squad": "./cli.js" }` to root `package.json`
2. Add `"prepare": "npm run build"` to root scripts (so TypeScript compiles after clone)
3. Update `cli.js` to forward without deprecation notice

**Why it's not worth it:**
- **Speed:** GitHub path clones entire repo, installs ALL devDeps (TS, esbuild, Vitest, Playwright — hundreds of MB), builds from source. ~30+ seconds vs ~3 seconds for npm tarball.
- **Fragility:** Any build failure = broken distribution. npm tarball is pre-built and tested.
- **No caching:** Git clones aren't cached by npm the way registry packages are.
- **Version pinning:** Uses `#tag` syntax, not semver-aware like `@version`.
- **devDependencies:** All of them get installed (unlike npm registry which only installs production deps).
- **Workspaces:** npm install respects them, but npx only sees root bin — requires root bin entry as redirect.

**Recommendation:** Keep npm-only. The GitHub channel is technically possible with 3 small changes but provides a strictly worse UX (slower, heavier, more fragile). The only benefit is URL aesthetics. Not worth the maintenance or user-experience cost.

**Alternative if "GitHub URL" is important:** Publish to GitHub Packages (npm registry on GitHub) for `npx @bradygaster/squad-cli --registry=https://npm.pkg.github.com` — same pre-built experience, different registry. But adds auth complexity.

### History Audit — 2026-03-03

**Corrections applied:**
1. Line 13: "Distribution: GitHub-native... NEVER npmjs.com" → [CORRECTED] "Distribution: npm-native, NEVER GitHub-native" (reversed decision per npm-only 2026-02-21)
2. Line 27: "GitHub-native referenced in README as legacy/alternative" → [CORRECTED] "npm is now canonical (npm-only decision finalized 2026-02-21)"
3. Line 101: "origin v0.8.18" → [CORRECTED] "origin v0.8.17+" (consistent with other entries)
4. Line 138: Date "(2026-07)" → [CORRECTED] "(2026-03-02 continued)" (date skew — research was same day as team update, not July)

**Status:** 4 corrections applied. History is now clean and consistent with decisions.md npm-only policy.
