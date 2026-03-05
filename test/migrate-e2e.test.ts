/**
 * E2E tests for `squad migrate` command.
 *
 * Tests the full migration flow:
 * - squad migrate --dry-run
 * - squad migrate (backup + reinit + restore)
 * - squad migrate --restore (auto-detect + explicit path)
 * - Shell reinit guard (no .first-run after migrate)
 *
 * Uses execFileSync for non-interactive CLI testing.
 * @see packages/squad-cli/src/cli/core/migrate.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

// ─── CLI configuration ──────────────────────────────────────────────────────

// Use the built CLI since index.js has syntax issues (type:module in package.json but CJS syntax)
const CLI = join(__dirname, '..', 'packages', 'squad-cli', 'dist', 'cli-entry.js');

interface SquadResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

function runSquad(args: string[], cwd: string): SquadResult {
  try {
    const stdout = execFileSync(process.execPath, [CLI, ...args], {
      cwd,
      encoding: 'utf8',
      timeout: 30000,
      env: { ...process.env, NO_COLOR: '1' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (err: any) {
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.status ?? 1,
    };
  }
}

// ─── Test fixtures ──────────────────────────────────────────────────────────

/**
 * Create a realistic populated .squad/ directory with agents and history.
 * This simulates a project that has been used and has user content.
 */
function createPopulatedSquadDir(root: string, opts?: { includeFirstRun?: boolean }): void {
  const { includeFirstRun = false } = opts ?? {};
  const squadDir = join(root, '.squad');
  const agentsDir = join(squadDir, 'agents');
  const identityDir = join(squadDir, 'identity');

  // Create directory structure
  mkdirSync(join(agentsDir, 'keaton'), { recursive: true });
  mkdirSync(join(agentsDir, 'fenster'), { recursive: true });
  mkdirSync(identityDir, { recursive: true });

  // team.md with populated roster (at least one agent = post-init state)
  writeFileSync(
    join(squadDir, 'team.md'),
    `# Squad Team — Test Project

> A test project for squad migrate E2E tests.

## Members

| Name    | Role       | Charter                                | Status     |
|---------|------------|----------------------------------------|------------|
| Keaton  | Lead       | \`.squad/agents/keaton/charter.md\`    | ✅ Active  |
| Fenster | Core Dev   | \`.squad/agents/fenster/charter.md\`   | ✅ Active  |

## Project

We're building E2E test coverage for Squad.
`
  );

  // Agent charters (user-owned files that must be preserved)
  writeFileSync(
    join(agentsDir, 'keaton', 'charter.md'),
    `# Keaton — Lead

## Role
Technical lead and architect.

## Scope
- System design
- Code review
- Mentoring

## Outputs
- Architecture docs
- Design reviews
`
  );

  writeFileSync(
    join(agentsDir, 'fenster', 'charter.md'),
    `# Fenster — Core Dev

## Role
Core contributor and implementer.

## Scope
- Feature implementation
- Bug fixes
- Unit tests

## Outputs
- Working code
- Test suites
`
  );

  // Agent history files (user-owned, must be preserved)
  writeFileSync(
    join(agentsDir, 'keaton', 'history.md'),
    `# Keaton — History

## Learnings

- Always design before coding
- Document key decisions
`
  );

  writeFileSync(
    join(agentsDir, 'fenster', 'history.md'),
    `# Fenster — History

## Learnings

- Write tests first
- Refactor incrementally
`
  );

  // Identity file
  writeFileSync(
    join(identityDir, 'now.md'),
    `---
updated_at: 2025-01-15T12:00:00.000Z
focus_area: E2E testing
active_issues: []
---

# What We're Focused On

Building E2E test coverage.
`
  );

  // Add .first-run marker if requested (simulates pre-migration state)
  if (includeFirstRun) {
    writeFileSync(join(squadDir, '.first-run'), '');
  }
}

/**
 * Create a backup directory with known content for --restore tests.
 */
function createBackupDir(root: string, backupName: string): string {
  const backupDir = join(root, backupName);
  mkdirSync(backupDir, { recursive: true });

  writeFileSync(
    join(backupDir, 'team.md'),
    `# Squad Team — Backup

> This is backup content.

## Members

| Name   | Role    | Charter                             | Status     |
|--------|---------|-------------------------------------|------------|
| Backup | Agent   | \`.squad/agents/backup/charter.md\` | ✅ Active  |
`
  );

  const agentsDir = join(backupDir, 'agents', 'backup');
  mkdirSync(agentsDir, { recursive: true });

  writeFileSync(
    join(agentsDir, 'charter.md'),
    `# Backup Agent

This is a backup charter.
`
  );

  return backupDir;
}

// ═══════════════════════════════════════════════════════════════════════════
// Test suite
// ═══════════════════════════════════════════════════════════════════════════

describe('E2E: squad migrate', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'squad-migrate-e2e-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 1. squad migrate --dry-run
  // ─────────────────────────────────────────────────────────────────────────

  describe('migrate --dry-run', () => {
    it('exits 0 and outputs [dry-run] marker', () => {
      createPopulatedSquadDir(tempDir);
      const result = runSquad(['migrate', '--dry-run'], tempDir);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('[dry-run]');
    });

    it('creates no .squad-backup-* directories', () => {
      createPopulatedSquadDir(tempDir);
      runSquad(['migrate', '--dry-run'], tempDir);

      const entries = readdirSync(tempDir);
      const backups = entries.filter((e) => e.startsWith('.squad-backup-'));
      expect(backups).toHaveLength(0);
    });

    it('leaves .squad/ untouched (contents identical)', () => {
      createPopulatedSquadDir(tempDir);
      const beforeTeam = readFileSync(join(tempDir, '.squad', 'team.md'), 'utf8');
      const beforeKeaton = readFileSync(
        join(tempDir, '.squad', 'agents', 'keaton', 'charter.md'),
        'utf8'
      );

      runSquad(['migrate', '--dry-run'], tempDir);

      const afterTeam = readFileSync(join(tempDir, '.squad', 'team.md'), 'utf8');
      const afterKeaton = readFileSync(
        join(tempDir, '.squad', 'agents', 'keaton', 'charter.md'),
        'utf8'
      );

      expect(afterTeam).toBe(beforeTeam);
      expect(afterKeaton).toBe(beforeKeaton);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. squad migrate (full migration flow)
  // ─────────────────────────────────────────────────────────────────────────

  describe('migrate (full flow)', () => {
    it('creates exactly one .squad-backup-* directory', () => {
      createPopulatedSquadDir(tempDir);
      const result = runSquad(['migrate'], tempDir);

      expect(result.exitCode).toBe(0);
      const entries = readdirSync(tempDir);
      const backups = entries.filter((e) => e.startsWith('.squad-backup-'));
      expect(backups).toHaveLength(1);
    });

    it('backup contains the original team.md', () => {
      createPopulatedSquadDir(tempDir);
      const originalTeam = readFileSync(join(tempDir, '.squad', 'team.md'), 'utf8');

      runSquad(['migrate'], tempDir);

      const entries = readdirSync(tempDir);
      const backupDir = entries.find((e) => e.startsWith('.squad-backup-'));
      expect(backupDir).toBeTruthy();

      const backedUpTeam = readFileSync(join(tempDir, backupDir!, 'team.md'), 'utf8');
      expect(backedUpTeam).toBe(originalTeam);
    });

    it('removes .squad/.first-run after migration', () => {
      createPopulatedSquadDir(tempDir, { includeFirstRun: true });
      expect(existsSync(join(tempDir, '.squad', '.first-run'))).toBe(true);

      runSquad(['migrate'], tempDir);

      expect(existsSync(join(tempDir, '.squad', '.first-run'))).toBe(false);
    });

    it('removes .squad/.init-prompt after migration', () => {
      createPopulatedSquadDir(tempDir);
      writeFileSync(join(tempDir, '.squad', '.init-prompt'), 'init prompt data');
      expect(existsSync(join(tempDir, '.squad', '.init-prompt'))).toBe(true);

      runSquad(['migrate'], tempDir);

      expect(existsSync(join(tempDir, '.squad', '.init-prompt'))).toBe(false);
    });

    it('preserves agents/ directory with user content', () => {
      createPopulatedSquadDir(tempDir);
      const originalCharter = readFileSync(
        join(tempDir, '.squad', 'agents', 'keaton', 'charter.md'),
        'utf8'
      );

      runSquad(['migrate'], tempDir);

      expect(existsSync(join(tempDir, '.squad', 'agents'))).toBe(true);
      expect(
        existsSync(join(tempDir, '.squad', 'agents', 'keaton', 'charter.md'))
      ).toBe(true);

      const restoredCharter = readFileSync(
        join(tempDir, '.squad', 'agents', 'keaton', 'charter.md'),
        'utf8'
      );
      expect(restoredCharter).toBe(originalCharter);
    });

    it('preserves user team.md content after migration', () => {
      createPopulatedSquadDir(tempDir);
      const originalTeam = readFileSync(join(tempDir, '.squad', 'team.md'), 'utf8');

      runSquad(['migrate'], tempDir);

      // team.md should have user roster preserved
      const migratedTeam = readFileSync(join(tempDir, '.squad', 'team.md'), 'utf8');
      expect(migratedTeam).toContain('Keaton');
      expect(migratedTeam).toContain('Fenster');
      // Basic structure should be maintained (not identical due to reinit template)
      expect(migratedTeam).toContain('## Members');
    });

    it('exit code is 0 for successful migration', () => {
      createPopulatedSquadDir(tempDir);
      const result = runSquad(['migrate'], tempDir);
      expect(result.exitCode).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. squad migrate --restore (auto-detect)
  // ─────────────────────────────────────────────────────────────────────────

  describe('migrate --restore (auto-detect)', () => {
    it('finds and restores from .squad-backup-* directory', () => {
      createPopulatedSquadDir(tempDir);
      const backupDir = createBackupDir(tempDir, '.squad-backup-20250115-120000');

      // Overwrite current .squad/team.md with different content
      writeFileSync(join(tempDir, '.squad', 'team.md'), '# Modified Team\n');

      const result = runSquad(['migrate', '--restore'], tempDir);

      expect(result.exitCode).toBe(0);
      const restoredTeam = readFileSync(join(tempDir, '.squad', 'team.md'), 'utf8');
      expect(restoredTeam).toContain('# Squad Team — Backup');
      expect(restoredTeam).toContain('Backup');
    });

    it('team.md after restore matches backup team.md', () => {
      createPopulatedSquadDir(tempDir);
      const backupDir = createBackupDir(tempDir, '.squad-backup-20250115-120000');
      const backupTeam = readFileSync(join(backupDir, 'team.md'), 'utf8');

      runSquad(['migrate', '--restore'], tempDir);

      const restoredTeam = readFileSync(join(tempDir, '.squad', 'team.md'), 'utf8');
      expect(restoredTeam).toBe(backupTeam);
    });

    it('exit code is 0 for successful restore', () => {
      createPopulatedSquadDir(tempDir);
      createBackupDir(tempDir, '.squad-backup-20250115-120000');

      const result = runSquad(['migrate', '--restore'], tempDir);
      expect(result.exitCode).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. squad migrate --restore <explicit-path>
  // ─────────────────────────────────────────────────────────────────────────

  describe('migrate --restore <explicit-path>', () => {
    it('restores from explicit relative path', () => {
      createPopulatedSquadDir(tempDir);
      const backupName = '.squad-backup-explicit';
      createBackupDir(tempDir, backupName);

      const result = runSquad(['migrate', '--restore', backupName], tempDir);

      expect(result.exitCode).toBe(0);
      const restoredTeam = readFileSync(join(tempDir, '.squad', 'team.md'), 'utf8');
      expect(restoredTeam).toContain('# Squad Team — Backup');
    });

    it('restores from explicit absolute path', () => {
      createPopulatedSquadDir(tempDir);
      const backupName = '.squad-backup-absolute';
      const backupPath = createBackupDir(tempDir, backupName);

      const result = runSquad(['migrate', '--restore', backupPath], tempDir);

      expect(result.exitCode).toBe(0);
      const restoredTeam = readFileSync(join(tempDir, '.squad', 'team.md'), 'utf8');
      expect(restoredTeam).toContain('# Squad Team — Backup');
    });

    it('team.md after restore matches explicit backup', () => {
      createPopulatedSquadDir(tempDir);
      const backupName = '.squad-backup-explicit2';
      const backupPath = createBackupDir(tempDir, backupName);
      const backupTeam = readFileSync(join(backupPath, 'team.md'), 'utf8');

      runSquad(['migrate', '--restore', backupName], tempDir);

      const restoredTeam = readFileSync(join(tempDir, '.squad', 'team.md'), 'utf8');
      expect(restoredTeam).toBe(backupTeam);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 5. No .squad/ directory (fresh init)
  // ─────────────────────────────────────────────────────────────────────────

  describe('migrate with no .squad/ directory', () => {
    it('exits 0 and creates .squad/ (fresh init path)', () => {
      // tempDir has no .squad/ at all
      const result = runSquad(['migrate'], tempDir);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Initialized fresh .squad/');
      expect(existsSync(join(tempDir, '.squad'))).toBe(true);
      expect(existsSync(join(tempDir, '.squad', 'team.md'))).toBe(true);
    });

    it('creates fresh team.md with roster', () => {
      runSquad(['migrate'], tempDir);

      const teamMd = readFileSync(join(tempDir, '.squad', 'team.md'), 'utf8');
      expect(teamMd).toContain('## Members');
    });

    it('fresh init via migrate leaves .first-run marker (IS a first run)', () => {
      // When migrate does a fresh init, it's genuinely a first run
      runSquad(['migrate'], tempDir);

      // .first-run SHOULD exist because this is a brand new initialization
      expect(existsSync(join(tempDir, '.squad', '.first-run'))).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Shell reinit guard: .first-run absent after migrate
  // ─────────────────────────────────────────────────────────────────────────

  describe('shell reinit guard (filesystem assertion)', () => {
    it('.first-run does NOT exist after migrate (ONLY when migrating existing .squad/)', () => {
      createPopulatedSquadDir(tempDir, { includeFirstRun: true });

      // Pre-condition: .first-run exists
      expect(existsSync(join(tempDir, '.squad', '.first-run'))).toBe(true);

      runSquad(['migrate'], tempDir);

      // Post-condition: .first-run is removed by migrate (line 246-251 in migrate.ts)
      // This is the critical bug fix: migrate cleans up .first-run after reinit
      expect(existsSync(join(tempDir, '.squad', '.first-run'))).toBe(false);
    });

    it('agents/ directory still exists after migrate', () => {
      createPopulatedSquadDir(tempDir, { includeFirstRun: true });

      runSquad(['migrate'], tempDir);

      expect(existsSync(join(tempDir, '.squad', 'agents'))).toBe(true);
      expect(
        existsSync(join(tempDir, '.squad', 'agents', 'keaton', 'charter.md'))
      ).toBe(true);
    });

    it('.init-prompt cleanup prevents orphan state', () => {
      createPopulatedSquadDir(tempDir);
      writeFileSync(join(tempDir, '.squad', '.init-prompt'), 'orphan data');

      runSquad(['migrate'], tempDir);

      // .init-prompt should be cleaned up by migrate (line 246-251)
      expect(existsSync(join(tempDir, '.squad', '.init-prompt'))).toBe(false);
    });

    it('team.md with populated roster blocks shell reinit', () => {
      createPopulatedSquadDir(tempDir, { includeFirstRun: true });

      runSquad(['migrate'], tempDir);

      const teamMd = readFileSync(join(tempDir, '.squad', 'team.md'), 'utf8');

      // Verify roster has entries (hasRosterEntries() would return true)
      expect(teamMd).toMatch(/\|\s*Keaton\s*\|/);
      expect(teamMd).toMatch(/\|\s*Fenster\s*\|/);

      // Combined with no .first-run, shell won't trigger init
      expect(existsSync(join(tempDir, '.squad', '.first-run'))).toBe(false);
    });
  });
});
