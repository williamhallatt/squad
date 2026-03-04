/**
 * Tests for error message templates and recovery guidance.
 *
 * @module test/error-messages
 */

import { describe, it, expect } from 'vitest';
import {
  sdkDisconnectGuidance,
  teamConfigGuidance,
  agentSessionGuidance,
  genericGuidance,
  formatGuidance,
} from '@bradygaster/squad-cli/shell/error-messages';

describe('error-messages', () => {
  // ---------- sdkDisconnectGuidance ----------
  describe('sdkDisconnectGuidance', () => {
    it('returns default message when no detail provided', () => {
      const g = sdkDisconnectGuidance();
      expect(g.message).toBe('SDK disconnected.');
      expect(g.recovery.length).toBeGreaterThan(0);
    });

    it('includes detail in message when provided', () => {
      const g = sdkDisconnectGuidance('timeout after 30s');
      expect(g.message).toBe('SDK disconnected: timeout after 30s');
    });

    it('suggests squad doctor', () => {
      const g = sdkDisconnectGuidance();
      expect(g.recovery.some(r => r.includes('squad doctor'))).toBe(true);
    });
  });

  // ---------- teamConfigGuidance ----------
  describe('teamConfigGuidance', () => {
    it('includes the issue description in message', () => {
      const g = teamConfigGuidance('team.md not found');
      expect(g.message).toBe('Team configuration issue: team.md not found');
    });

    it('suggests squad init as recovery', () => {
      const g = teamConfigGuidance('invalid YAML');
      expect(g.recovery.some(r => r.includes('squad init'))).toBe(true);
    });
  });

  // ---------- agentSessionGuidance ----------
  describe('agentSessionGuidance', () => {
    it('includes agent name in message', () => {
      const g = agentSessionGuidance('Kovash');
      expect(g.message).toBe('Kovash session failed.');
    });

    it('includes detail when provided', () => {
      const g = agentSessionGuidance('Kovash', 'connection reset');
      expect(g.message).toBe('Kovash session failed: connection reset.');
    });

    it('suggests retrying with @agent', () => {
      const g = agentSessionGuidance('Kovash');
      expect(g.recovery.some(r => r.includes('@Kovash'))).toBe(true);
    });

    it('suggests auto-reconnect', () => {
      const g = agentSessionGuidance('Kovash');
      expect(g.recovery.some(r => r.includes('auto-reconnect'))).toBe(true);
    });
  });

  // ---------- genericGuidance ----------
  describe('genericGuidance', () => {
    it('uses detail as message', () => {
      const g = genericGuidance('something broke');
      expect(g.message).toBe('something broke');
    });

    it('suggests squad doctor', () => {
      const g = genericGuidance('oops');
      expect(g.recovery.some(r => r.includes('squad doctor'))).toBe(true);
    });
  });

  // ---------- formatGuidance ----------
  describe('formatGuidance', () => {
    it('starts with error icon and message', () => {
      const output = formatGuidance({ message: 'bad stuff', recovery: [] });
      expect(output).toBe('❌ bad stuff');
    });

    it('includes Try header and bullet points', () => {
      const output = formatGuidance({
        message: 'fail',
        recovery: ['do A', 'do B'],
      });
      expect(output).toContain('Try:');
      expect(output).toContain('• do A');
      expect(output).toContain('• do B');
    });

    it('formats full guidance as multi-line string', () => {
      const g = agentSessionGuidance('Mira', 'timeout');
      const output = formatGuidance(g);
      const lines = output.split('\n');
      expect(lines[0]).toContain('Mira session failed: timeout');
      expect(lines.length).toBeGreaterThanOrEqual(4); // message + Try: + at least 2 bullets
    });
  });
});
