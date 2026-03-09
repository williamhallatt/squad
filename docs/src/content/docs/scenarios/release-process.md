# Release Process for Squad Maintainers

**Try this to ship a new version:**
```
We're ready to ship v1.2.0 — run the release process: changelog, tags, and publish
```

**Try this to promote to production:**
```
Merge preview to main and cut a production release
```

Complete step-by-step guide for Squad maintainers: three-branch model (dev/preview/main), guard workflows, PR merging, and production release procedures.

---

## Table of Contents

1. [Branch Model Overview](#branch-model-overview)
2. [Preview Build Workflow](#preview-build-workflow)
3. [Pull Request Workflow](#pull-request-workflow)
4. [Merging Back to Dev](#merging-back-to-dev)
5. [Full Release Lifecycle](#full-release-lifecycle)
6. [Branch Protection Rules](#branch-protection-rules)
7. [Testing the Guard Workflow](#testing-the-guard-workflow)
8. [Troubleshooting](#troubleshooting)
9. [Sample Prompts](#sample-prompts)

---

## Branch Model Overview

Squad uses a **three-branch model** for release safety:

| Branch | Purpose | Who Commits | Guard Active? | Files Allowed |
|--------|---------|------------|---------------|---------------|
| **dev** | Development — all work happens here | All team members | ❌ No | Everything (`.ai-team/`, team-docs, etc.) |
| **preview** | Staging/testing — validated product only | Release coordinator | ✅ Yes | Distribution files only (`.ai-team/` blocked) |
| **main** | Production — release source for `npx` | Release coordinator | ✅ Yes | Distribution files only (`.ai-team/` blocked) |

**Key principle:** `.ai-team/` (team state) and internal `team-docs/` (except blog) never leave dev. When code ships, it ships clean.

---

## Preview Build Workflow

Purpose: Create a staging environment to test the full release before pushing to production.

### Step 1: Create the Preview Branch

Start on `dev` and ensure you have the latest commits:

```bash
git checkout dev
git pull origin dev
```

Create a preview branch (or reset if it exists):

```bash
git checkout -b preview 2>/dev/null || git checkout preview
git reset --hard dev
```

### Step 2: Remove Forbidden Files (Guard Enforcement)

Before pushing to `preview`, remove forbidden paths that the guard workflow will block:

```bash
# Remove .ai-team/ (keep local copy via .gitignore)
git rm --cached -r .ai-team/

# Remove team-docs/
git rm --cached -r team-docs/
```

If nothing was removed, that's fine:

```bash
git status
# On branch preview
# nothing to commit, working tree clean
```

If there are changes:

```bash
git commit -m "chore: remove forbidden paths for preview branch"
git push -f origin preview
```

### Step 3: Review and Test

Verify your release PR is ready for merge by checking CI status in GitHub. Ensure all tests pass and code review is complete:

```bash
# View PR status
gh pr view --web
```

Expected output: ✅ All checks pass and PR is approved.

If checks fail, review the logs and fix any issues.

### Step 4: Test on Preview

Push test branches off `preview` and create PRs back to `preview` to validate the release:

```bash
# Create a feature branch off preview
git checkout -b test/release-validation
echo "# Release validation" > RELEASE_TEST.md
git add RELEASE_TEST.md
git commit -m "test: release validation"
git push -u origin test/release-validation
```

Create a PR via `gh`:

```bash
gh pr create --base preview --title "Release validation test" --body "Validate preview build."
```

The guard checks this PR. If it passes, your preview branch is clean.

---

## Pull Request Workflow

### Creating a PR (Feature Work on Dev)

When a feature is complete on `dev`, create a PR for review:

```bash
git checkout -b feature/my-feature
# ... make changes ...
git add .
git commit -m "feat: my new feature"
git push -u origin feature/my-feature
```

Create the PR:

```bash
gh pr create --base dev --title "feat: my new feature" --body "Description of changes"
```

### Reviewing a PR

Reviewers use the GitHub UI or `gh` CLI:

```bash
# View open PRs
gh pr list --base dev

# Review a specific PR
gh pr view 123 --web
```

Comments, approvals, and change requests flow through GitHub. No special commands needed.

### Merging a PR to Dev

Once approved, merge to `dev`:

```bash
gh pr merge 123 --merge --auto
```

This squash-merges the PR and deletes the feature branch. To keep history with merge commits:

```bash
gh pr merge 123 --create-branch-off-target --auto
```

After merge, update your local dev:

```bash
git checkout dev
git pull origin dev
```

---

## Merging Back to Dev

After a release ships from `main`, sync changes back to `dev` (for docs updates, changelog, version bumps made during release):

### Step 1: Create a Sync PR

On your `dev` branch:

```bash
git checkout dev
git pull origin dev
git checkout -b chore/sync-from-main
```

Merge `main` into the sync branch:

```bash
git merge main --no-ff --no-edit
```

This brings all production commits back to dev, preserving the release tag and history.

### Step 2: Resolve Conflicts (if any)

If conflicts exist, resolve them:

```bash
git status
# Lists conflicted files
git add .
git commit -m "chore: resolve merge conflicts from main"
```

### Step 3: Push and Create PR

```bash
git push -u origin chore/sync-from-main
gh pr create --base dev --title "chore: sync from main" --body "Bring production changes back to dev"
```

### Step 4: Merge Back

```bash
gh pr merge --merge --auto
git checkout dev && git pull origin dev
```

---

## Full Release Lifecycle

Complete journey from feature work to production tag.

### Phase 1: Preparation (on `dev`)

**Time:** Before release day. All features complete, all tests passing.

1. **Update CHANGELOG.md:**

```bash
# Edit CHANGELOG.md with new version entry
# Format: ## [X.Y.Z] — YYYY-MM-DD
# Sections: Added, Changed, Community, Deprecated, Removed, Fixed
nano CHANGELOG.md
```

Example entry:

```markdown
## [0.4.0] — 2026-02-15

### Added
- MCP tool discovery and integration
- Plugin marketplace support
- Notification system (Trello, Teams, GitHub)
- 11 new universes (Futurama, Seinfeld, The Office, etc.)
- Branch protection guard (squad-main-guard.yml)

### Changed
- VS Code support now fully compatible (zero code changes)
- Agent progress signals with [MILESTONE] markers
- Universe count: 20 → 31

### Community
- @csharpfritz: MCP tool discovery (#11), user docs (#16)
- @spboyer: VS Code compatibility (#17)
```

2. **Update version in package.json:**

```bash
# Edit version field
nano package.json
# "version": "0.4.0"
```

3. **Commit to dev:**

```bash
git add CHANGELOG.md package.json
git commit -m "chore: prepare release v0.4.0"
git push origin dev
```

### Phase 2: Preview Build (on `preview`)

**Time:** Release day morning. Validate all files before shipping.

Follow [Preview Build Workflow](#preview-build-workflow) above. Summary:

```bash
git checkout preview
git reset --hard origin/dev
git rm --cached -r .ai-team/ 2>/dev/null
git rm --cached -r team-docs/ 2>/dev/null
git commit -m "chore: remove forbidden paths for preview" 2>/dev/null
git push -f origin preview
# Wait for guard workflow to pass
```

Check GitHub Actions:

```bash
gh run list --branch preview --status completed --limit 1
```

Expected: ✅ All checks pass.

### Phase 3: Merge to Main (on `main`)

**Time:** Release day afternoon, after preview validation.

1. **Create a release PR to main:**

```bash
git checkout main
git pull origin main
git checkout -b release/v0.4.0
git merge --no-ff preview -m "Release v0.4.0"
git push -u origin release/v0.4.0
```

2. **Create PR for final review:**

```bash
gh pr create --base main --title "Release v0.4.0" --body "Final release PR. Guard enforces file restrictions."
```

3. **Wait for guard to pass**, then merge:

```bash
gh pr merge --merge --auto
```

The guard validates that only distribution-safe files reach `main`.

### Phase 4: Tag the Release (on `main`)

**Time:** After merge to `main`. This triggers the release workflow.

```bash
git checkout main
git pull origin main
git tag -a v0.4.0 -m "Release v0.4.0: MCP integration, Plugin marketplace, Notifications"
git push origin v0.4.0
```

Tag format: `vX.Y.Z` (semantic versioning). The version MUST match `package.json` version.

### Phase 5: Verify the Release

The tag push triggers `.github/workflows/release.yml`:

```bash
# Monitor the release workflow
gh run list --workflow release.yml --status in_progress
gh run list --workflow release.yml --status completed --limit 1
```

Check what the workflow does:

1. Runs full test suite
2. Creates a GitHub Release with notes
3. Validates that only distribution files were shipped

If the workflow fails, see [Troubleshooting](#troubleshooting).

### Phase 6: Sync Back to Dev

After release, bring version/changelog updates back to dev:

```bash
git checkout dev
git pull origin dev
git checkout -b chore/sync-from-main
git merge main --no-ff
git push -u origin chore/sync-from-main
gh pr merge --merge --auto
git pull origin dev
```

---

## Branch Protection Rules

The repository enforces protection rules on `main` and `preview` to prevent accidental shipping of forbidden files.

### What's Protected

| Branch | Rule | Effect |
|--------|------|--------|
| `main` | Require PR review | All PRs require at least 1 approval |
| `main` | Require status checks to pass | Tests must pass before merge allowed |
| `preview` | Require status checks to pass | Tests must pass before merge allowed |


## File Integrity

Always verify before pushing to main or preview that you have not accidentally included team runtime state files (.squad/, .ai-team/, etc.). These files should only exist on dev branches.

---

## Troubleshooting

### Issue: Forbidden Files Detected in PR

**Problem:** You accidentally committed `.ai-team/` or other team state files to your PR.

**Prevention:** Use `.gitignore` rules and verify `git status` before pushing:

```bash
# Check what will be committed
git status

# If you see .ai-team/ or similar, remove it:
git rm --cached -r .ai-team/
git commit -m "chore: remove runtime state files"
git push
```

---

### Issue: SSH Hangs During Push

**Symptom:** `git push` hangs indefinitely.

**Cause:** SSH authentication timeout or network issue.

**Fix:**

```bash
# Try with HTTP instead (if you have auth configured)
git remote set-url origin https://github.com/bradygaster/squad.git
git push origin <branch>

# Or explicitly use SSH with a shorter timeout
GIT_SSH_COMMAND="ssh -v" git push origin <branch>

# If still stuck, check your SSH key
ssh -T git@github.com
```

---

### Issue: .ai-team/ Files Keep Getting Committed

**Symptom:** `.ai-team/` shows as untracked but somehow appears in commits.

**Cause:** Files were previously tracked (added with `git add -f` before `.gitignore` was updated).

**Fix:** Remove tracked copies permanently (one time per repo):

```bash
# Remove .ai-team/ from git tracking
git rm --cached -r .ai-team/

# Verify .gitignore has .ai-team/
grep ".ai-team" .gitignore

# If not, add it
echo ".ai-team/" >> .gitignore

# Commit
git add .gitignore
git commit -m "chore: ensure .ai-team/ is untracked"
git push origin dev
```

---

### Issue: Missing Workflows in .github/workflows/

**Symptom:** Other Squad workflows are missing or accidentally deleted.

**Cause:** Workflows not installed during Squad init, or accidentally deleted.

**Fix:** Re-run upgrade to restore workflows:

```bash
npx github:bradygaster/squad upgrade
git add .github/workflows/
git commit -m "chore: restore Squad workflows"
git push origin dev
```

Available Squad workflows:
- `squad-heartbeat.yml` — Ralph's periodic triage and labeling
- `squad-issue-assign.yml` — Auto-assign labeled issues
- `squad-label-enforce.yml` — Enforce label namespace integrity
- `squad-triage.yml` — Triage unlabeled issues
- `sync-squad-labels.yml` — Sync static label definitions

---

### Issue: GitHub Release Not Created After Tag

**Symptom:** Tag pushed but no GitHub Release appears.

**Cause:** Release workflow failed, or release already exists for that tag.

**Fix:**

```bash
# Check workflow status
gh run list --workflow release.yml --status completed --limit 1

# View the latest run details
gh run view <RUN_ID>

# If the workflow failed, check logs
gh run view <RUN_ID> --log

# If no release exists, create manually
gh release create v0.4.0 --title "v0.4.0" \
  --notes-file CHANGELOG.md

# To set as prerelease (for 0.x versions)
gh release create v0.4.0 --title "v0.4.0" --prerelease \
  --notes-file CHANGELOG.md
```

---

## Sample Prompts

Use these with Kobayashi or in Copilot sessions to guide release work.

### To Prepare for Release

```
Kobayashi, prepare v0.4.0 for release:
1. Update CHANGELOG.md with the new version entry
2. Update version in package.json
3. Commit both changes to dev branch

Use these features as the new entry:
- MCP tool discovery and integration
- Plugin marketplace support
- Notification system
- 11 new universes
- Branch protection guard
```

### To Build a Preview

```
Kobayashi, build a preview branch:
1. Create preview branch from dev
2. Remove .ai-team/ and team-docs/ (except blog)
3. Commit the removal
4. Push to origin
5. Wait for guard workflow to pass
6. Confirm the guard result
```

### To Tag a Release

```
Kobayashi, tag the release:
1. Checkout main
2. Create and push tag v0.4.0
3. Verify the release workflow starts
4. Report when it completes
```

### To Sync After Release

```
Kobayashi, sync main back to dev:
1. Create a chore/sync-from-main branch
2. Merge main into it
3. Create and merge PR back to dev
4. Confirm dev is up to date
```

### To Test the Guard

```
Kobayashi, test the guard workflow:
1. Create a test branch test/guard-ai-team-block
2. Add .ai-team/agents/test/history.md with dummy content
3. Commit and push
4. Create PR to main
5. Report the guard result (should fail)
6. Remove the file and push again
7. Report the final guard result (should pass)
8. Clean up the branch
```

### To Fix a Blocked PR

```
Kobayashi, fix this blocked PR:
1. Fetch the current PR state
2. Remove all .ai-team/ and team-docs/ files
3. Commit the removal
4. Push to update the PR
5. Wait for guard to pass
```

---

## Key Files Reference

- **Release workflow:** `.github/workflows/release.yml` (if it exists)
- **Changelog:** `CHANGELOG.md`
- **Distribution config:** `package.json` (version, files array)
- **Ignore rules:** `.gitignore`, `.npmignore`, `.gitattributes`
- **Branch protection settings:** GitHub repo Settings → Branches
- **Distributed via:** `npx github:bradygaster/squad`

---

## Tips

- **Preview is your staging environment.** Test everything there before merging to main.
- **Guard is your safety net.** Let it block forbidden files—it's preventing distribution corruption.
- **`.ai-team/` never leaves dev.** It's runtime state, not product.
- **Tag from main only.** This is your single source of truth for releases.
- **Version in package.json must match git tag.** Keep them in sync.
- **Communicate releases.** Update team.md, decisions.md, and CHANGELOG.md before shipping.
- **Use `gh` CLI for everything.** It's faster and more reliable than web UI for scripting.

