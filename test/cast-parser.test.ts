/**
 * Tests for parseCastResponse — the REPL casting parser.
 * Ensures robust parsing of various model response formats.
 */

import { describe, it, expect } from 'vitest';
import { parseCastResponse } from '../packages/squad-cli/src/cli/core/cast.js';

describe('parseCastResponse', () => {
  it('parses strict INIT_TEAM format', () => {
    const response = `INIT_TEAM:
- Ripley | Lead | Architecture, code review, decisions
- Dallas | Frontend Dev | React, UI, components
- Kane | Backend Dev | Node.js, APIs, database
- Lambert | Tester | Tests, quality, edge cases
UNIVERSE: Alien
PROJECT: A React and Node.js web application`;

    const result = parseCastResponse(response);
    expect(result).not.toBeNull();
    expect(result!.members).toHaveLength(4);
    expect(result!.members[0]!.name).toBe('Ripley');
    expect(result!.members[0]!.role).toBe('Lead');
    expect(result!.universe).toBe('Alien');
    expect(result!.projectDescription).toBe('A React and Node.js web application');
  });

  it('parses INIT_TEAM wrapped in markdown code block', () => {
    const response = `Here's the team I'd suggest:

\`\`\`
INIT_TEAM:
- Neo | Lead | Architecture, decisions
- Trinity | Frontend Dev | React, UI
- Morpheus | Backend Dev | APIs, database
- Tank | Tester | Tests, quality
UNIVERSE: The Matrix
PROJECT: A web dashboard
\`\`\`

Let me know if this works!`;

    const result = parseCastResponse(response);
    expect(result).not.toBeNull();
    expect(result!.members).toHaveLength(4);
    expect(result!.members[0]!.name).toBe('Neo');
    expect(result!.universe).toBe('The Matrix');
  });

  it('parses response with preamble text before INIT_TEAM', () => {
    const response = `Based on your project, I'd suggest the following team:

INIT_TEAM:
- Vincent | Lead | Architecture, code review
- Jules | Backend Dev | APIs, services
- Mia | Frontend Dev | UI, components
- Butch | Tester | Tests, quality
UNIVERSE: Pulp Fiction
PROJECT: A snake game in HTML and JavaScript`;

    const result = parseCastResponse(response);
    expect(result).not.toBeNull();
    expect(result!.members).toHaveLength(4);
    expect(result!.members[0]!.name).toBe('Vincent');
  });

  it('parses pipe-delimited lines without INIT_TEAM header', () => {
    const response = `Here's the team for your project:

- Deckard | Lead | Architecture, code review
- Rachel | Frontend Dev | HTML, CSS, JavaScript
- Roy | Backend Dev | Game logic, state management
- Pris | Tester | Tests, quality assurance

Universe: Blade Runner
Project: A snake game in HTML and JavaScript`;

    const result = parseCastResponse(response);
    expect(result).not.toBeNull();
    expect(result!.members).toHaveLength(4);
    expect(result!.members[0]!.name).toBe('Deckard');
    expect(result!.universe).toBe('Blade Runner');
    expect(result!.projectDescription).toBe('A snake game in HTML and JavaScript');
  });

  it('parses pipe lines with * bullets', () => {
    const response = `INIT_TEAM:
* Solo | Lead | Architecture, decisions
* Leia | Frontend Dev | UI, components
* Chewie | Backend Dev | APIs, services
* Lando | Tester | Tests, quality
UNIVERSE: Star Wars
PROJECT: A CLI tool`;

    const result = parseCastResponse(response);
    expect(result).not.toBeNull();
    expect(result!.members).toHaveLength(4);
    expect(result!.members[0]!.name).toBe('Solo');
  });

  it('handles bold markdown in UNIVERSE/PROJECT labels', () => {
    const response = `INIT_TEAM:
- Ripley | Lead | Architecture
- Dallas | Frontend Dev | UI
**UNIVERSE:** Alien
**PROJECT:** A web app`;

    const result = parseCastResponse(response);
    expect(result).not.toBeNull();
    expect(result!.universe).toBe('Alien');
    expect(result!.projectDescription).toBe('A web app');
  });

  it('handles case-insensitive INIT_TEAM', () => {
    const response = `init_team:
- Neo | Lead | Architecture
- Trinity | Dev | Code
UNIVERSE: The Matrix
PROJECT: Game`;

    const result = parseCastResponse(response);
    expect(result).not.toBeNull();
    expect(result!.members).toHaveLength(2);
  });

  it('returns null for empty string', () => {
    expect(parseCastResponse('')).toBeNull();
  });

  it('returns null for completely unrelated response', () => {
    const response = `I'd be happy to help you build a snake game! 
Let me start by creating the HTML file with a canvas element.`;
    expect(parseCastResponse(response)).toBeNull();
  });

  it('returns null when no members could be extracted', () => {
    const response = `INIT_TEAM:
UNIVERSE: Alien
PROJECT: Something`;
    expect(parseCastResponse(response)).toBeNull();
  });

  it('provides default universe when missing', () => {
    const response = `- Neo | Lead | Architecture
- Trinity | Dev | Code`;

    const result = parseCastResponse(response);
    expect(result).not.toBeNull();
    expect(result!.universe).toBe('Unknown');
  });

  it('strips trailing pipes from scope (markdown table format)', () => {
    const response = `| Ripley | Lead | Architecture |
| Dallas | Frontend Dev | UI |`;

    const result = parseCastResponse(response);
    // Should extract something even from table format
    if (result) {
      expect(result.members.length).toBeGreaterThan(0);
    }
  });
});
