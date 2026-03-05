/**
 * Tests for Cast createTeam Guard Logic
 * Ensures createTeam() does not overwrite existing non-empty charter.md and history.md files.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createTeam, type CastProposal, type CastMember } from '../packages/squad-cli/src/cli/core/cast.js';

describe('Cast createTeam Guard Logic', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'cast-guard-test-'));
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  function createMinimalProposal(members: CastMember[]): CastProposal {
    return {
      members,
      universe: 'Test Universe',
      projectDescription: 'Test project for cast guard tests'
    };
  }

  describe('charter.md guard', () => {
    it('should NOT overwrite an existing non-empty charter.md', async () => {
      const squadDir = join(testDir, '.squad');
      const agentsDir = join(squadDir, 'agents');
      const testAgentDir = join(agentsDir, 'tester');
      
      // Create existing charter with content
      mkdirSync(testAgentDir, { recursive: true });
      const existingCharter = '# Existing Charter\n\nThis is my real charter.\n';
      writeFileSync(join(testAgentDir, 'charter.md'), existingCharter);

      const proposal = createMinimalProposal([
        { name: 'Tester', role: 'QA Engineer', scope: 'Testing', emoji: '🧪' }
      ]);

      await createTeam(testDir, proposal);

      // Charter should remain unchanged
      const actualCharter = readFileSync(join(testAgentDir, 'charter.md'), 'utf8');
      expect(actualCharter).toBe(existingCharter);
    });

    it('should write charter.md if the file does not exist', async () => {
      const proposal = createMinimalProposal([
        { name: 'Developer', role: 'Backend Dev', scope: 'APIs', emoji: '🔧' }
      ]);

      await createTeam(testDir, proposal);

      const charterPath = join(testDir, '.squad', 'agents', 'developer', 'charter.md');
      expect(existsSync(charterPath)).toBe(true);

      const content = readFileSync(charterPath, 'utf8');
      expect(content).toContain('# Developer — Backend Dev');
    });

    it('should write charter.md if the file exists but is empty', async () => {
      const squadDir = join(testDir, '.squad');
      const agentsDir = join(squadDir, 'agents');
      const devDir = join(agentsDir, 'developer');
      
      mkdirSync(devDir, { recursive: true });
      writeFileSync(join(devDir, 'charter.md'), '');

      const proposal = createMinimalProposal([
        { name: 'Developer', role: 'Backend Dev', scope: 'APIs', emoji: '🔧' }
      ]);

      await createTeam(testDir, proposal);

      const content = readFileSync(join(devDir, 'charter.md'), 'utf8');
      expect(content).toContain('# Developer — Backend Dev');
    });

    it('should write charter.md if the file contains only whitespace', async () => {
      const squadDir = join(testDir, '.squad');
      const agentsDir = join(squadDir, 'agents');
      const devDir = join(agentsDir, 'developer');
      
      mkdirSync(devDir, { recursive: true });
      writeFileSync(join(devDir, 'charter.md'), '   \n  \t  \n  ');

      const proposal = createMinimalProposal([
        { name: 'Developer', role: 'Backend Dev', scope: 'APIs', emoji: '🔧' }
      ]);

      await createTeam(testDir, proposal);

      const content = readFileSync(join(devDir, 'charter.md'), 'utf8');
      expect(content).toContain('# Developer — Backend Dev');
      expect(content.trim().length).toBeGreaterThan(0);
    });
  });

  describe('history.md guard', () => {
    it('should NOT overwrite an existing non-empty history.md', async () => {
      const squadDir = join(testDir, '.squad');
      const agentsDir = join(squadDir, 'agents');
      const testAgentDir = join(agentsDir, 'tester');
      
      // Create existing history with content
      mkdirSync(testAgentDir, { recursive: true });
      const existingHistory = '# Tester — History\n\n## Learnings\n\nI found a critical bug.\n';
      writeFileSync(join(testAgentDir, 'history.md'), existingHistory);

      const proposal = createMinimalProposal([
        { name: 'Tester', role: 'QA Engineer', scope: 'Testing', emoji: '🧪' }
      ]);

      await createTeam(testDir, proposal);

      // History should remain unchanged
      const actualHistory = readFileSync(join(testAgentDir, 'history.md'), 'utf8');
      expect(actualHistory).toBe(existingHistory);
    });

    it('should write history.md if the file does not exist', async () => {
      const proposal = createMinimalProposal([
        { name: 'Developer', role: 'Backend Dev', scope: 'APIs', emoji: '🔧' }
      ]);

      await createTeam(testDir, proposal);

      const historyPath = join(testDir, '.squad', 'agents', 'developer', 'history.md');
      expect(existsSync(historyPath)).toBe(true);

      const content = readFileSync(historyPath, 'utf8');
      expect(content).toContain('# Developer — History');
    });

    it('should write history.md if the file exists but is empty', async () => {
      const squadDir = join(testDir, '.squad');
      const agentsDir = join(squadDir, 'agents');
      const devDir = join(agentsDir, 'developer');
      
      mkdirSync(devDir, { recursive: true });
      writeFileSync(join(devDir, 'history.md'), '');

      const proposal = createMinimalProposal([
        { name: 'Developer', role: 'Backend Dev', scope: 'APIs', emoji: '🔧' }
      ]);

      await createTeam(testDir, proposal);

      const content = readFileSync(join(devDir, 'history.md'), 'utf8');
      expect(content).toContain('# Developer — History');
    });

    it('should write history.md if the file contains only whitespace', async () => {
      const squadDir = join(testDir, '.squad');
      const agentsDir = join(squadDir, 'agents');
      const devDir = join(agentsDir, 'developer');
      
      mkdirSync(devDir, { recursive: true });
      writeFileSync(join(devDir, 'history.md'), '  \n\t\n  ');

      const proposal = createMinimalProposal([
        { name: 'Developer', role: 'Backend Dev', scope: 'APIs', emoji: '🔧' }
      ]);

      await createTeam(testDir, proposal);

      const content = readFileSync(join(devDir, 'history.md'), 'utf8');
      expect(content).toContain('# Developer — History');
      expect(content.trim().length).toBeGreaterThan(0);
    });
  });

  describe('combined guard behavior', () => {
    it('should protect both charter.md and history.md when both have content', async () => {
      const squadDir = join(testDir, '.squad');
      const agentsDir = join(squadDir, 'agents');
      const testAgentDir = join(agentsDir, 'tester');
      
      mkdirSync(testAgentDir, { recursive: true });
      
      const existingCharter = '# My Real Charter\n';
      const existingHistory = '# My Real History\n';
      
      writeFileSync(join(testAgentDir, 'charter.md'), existingCharter);
      writeFileSync(join(testAgentDir, 'history.md'), existingHistory);

      const proposal = createMinimalProposal([
        { name: 'Tester', role: 'QA Engineer', scope: 'Testing', emoji: '🧪' }
      ]);

      await createTeam(testDir, proposal);

      expect(readFileSync(join(testAgentDir, 'charter.md'), 'utf8')).toBe(existingCharter);
      expect(readFileSync(join(testAgentDir, 'history.md'), 'utf8')).toBe(existingHistory);
    });

    it('should write charter.md but protect history.md when only history has content', async () => {
      const squadDir = join(testDir, '.squad');
      const agentsDir = join(squadDir, 'agents');
      const testAgentDir = join(agentsDir, 'tester');
      
      mkdirSync(testAgentDir, { recursive: true });
      
      writeFileSync(join(testAgentDir, 'charter.md'), '');
      const existingHistory = '# My Real History\n';
      writeFileSync(join(testAgentDir, 'history.md'), existingHistory);

      const proposal = createMinimalProposal([
        { name: 'Tester', role: 'QA Engineer', scope: 'Testing', emoji: '🧪' }
      ]);

      await createTeam(testDir, proposal);

      const newCharter = readFileSync(join(testAgentDir, 'charter.md'), 'utf8');
      expect(newCharter).toContain('# Tester — QA Engineer');
      
      expect(readFileSync(join(testAgentDir, 'history.md'), 'utf8')).toBe(existingHistory);
    });

    it('should write history.md but protect charter.md when only charter has content', async () => {
      const squadDir = join(testDir, '.squad');
      const agentsDir = join(squadDir, 'agents');
      const testAgentDir = join(agentsDir, 'tester');
      
      mkdirSync(testAgentDir, { recursive: true });
      
      const existingCharter = '# My Real Charter\n';
      writeFileSync(join(testAgentDir, 'charter.md'), existingCharter);
      writeFileSync(join(testAgentDir, 'history.md'), '   ');

      const proposal = createMinimalProposal([
        { name: 'Tester', role: 'QA Engineer', scope: 'Testing', emoji: '🧪' }
      ]);

      await createTeam(testDir, proposal);

      expect(readFileSync(join(testAgentDir, 'charter.md'), 'utf8')).toBe(existingCharter);
      
      const newHistory = readFileSync(join(testAgentDir, 'history.md'), 'utf8');
      expect(newHistory).toContain('# Tester — History');
    });
  });
});
