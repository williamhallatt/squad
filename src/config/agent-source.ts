/**
 * Agent Source Registry
 * Pluggable agent discovery and loading
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface AgentSource {
  readonly name: string;
  readonly type: 'local' | 'github' | 'marketplace';
  listAgents(): Promise<AgentManifest[]>;
  getAgent(name: string): Promise<AgentDefinition | null>;
  getCharter(name: string): Promise<string | null>;
}

export interface AgentManifest {
  name: string;
  role: string;
  version?: string;
  source: string;
}

export interface AgentDefinition extends AgentManifest {
  charter: string;
  model?: string;
  tools?: string[];
  skills?: string[];
  history?: string;
}

/** Directories to scan for agents, in priority order. */
const AGENT_DIRS = ['.squad/agents', '.ai-team/agents'] as const;

/**
 * Parse charter.md content to extract agent metadata.
 */
export function parseCharterMetadata(content: string): {
  name?: string;
  role?: string;
  model?: string;
  skills?: string[];
  tools?: string[];
} {
  const result: ReturnType<typeof parseCharterMetadata> = {};

  const identityMatch = content.match(/##\s+Identity\s*\n([\s\S]*?)(?=\n##|\n---|$)/i);
  if (identityMatch) {
    const section = identityMatch[1];
    const nameMatch = section.match(/\*\*Name:\*\*\s*(.+)/i);
    if (nameMatch) result.name = nameMatch[1].trim();

    const roleMatch = section.match(/\*\*Role:\*\*\s*(.+)/i);
    if (roleMatch) result.role = roleMatch[1].trim();

    const expertiseMatch = section.match(/\*\*Expertise:\*\*\s*(.+)/i);
    if (expertiseMatch) {
      result.skills = expertiseMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  const modelMatch = content.match(/##\s+Model\s*\n([\s\S]*?)(?=\n##|\n---|$)/i);
  if (modelMatch) {
    const preferredMatch = modelMatch[1].match(/\*\*Preferred:\*\*\s*(.+)/i);
    if (preferredMatch) result.model = preferredMatch[1].trim();
  }

  const toolsMatch = content.match(/##\s+Tools?\s*\n([\s\S]*?)(?=\n##|\n---|$)/i);
  if (toolsMatch) {
    result.tools = toolsMatch[1]
      .split('\n')
      .map(line => {
        const m = line.match(/^\s*[-*]\s+`?([^`\s]+)`?/);
        return m ? m[1].trim() : null;
      })
      .filter((t): t is string => t !== null);
  }

  return result;
}

export class LocalAgentSource implements AgentSource {
  readonly name = 'local';
  readonly type = 'local' as const;

  constructor(private basePath: string) {}

  /**
   * Resolve the agents directory, preferring .squad/agents over .ai-team/agents.
   */
  private async resolveAgentsDir(): Promise<string | null> {
    for (const dir of AGENT_DIRS) {
      const fullPath = path.join(this.basePath, dir);
      try {
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) return fullPath;
      } catch {
        // directory doesn't exist, try next
      }
    }
    return null;
  }

  async listAgents(): Promise<AgentManifest[]> {
    const agentsDir = await this.resolveAgentsDir();
    if (!agentsDir) return [];

    const manifests: AgentManifest[] = [];
    let entries: import('fs').Dirent[];
    try {
      entries = await fs.readdir(agentsDir, { withFileTypes: true });
    } catch {
      return [];
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const charterPath = path.join(agentsDir, entry.name, 'charter.md');
      try {
        const content = await fs.readFile(charterPath, 'utf-8');
        const meta = parseCharterMetadata(content);
        manifests.push({
          name: meta.name || entry.name,
          role: meta.role || 'agent',
          source: 'local',
        });
      } catch {
        // Skip agents with missing/unreadable charter
      }
    }

    return manifests;
  }

  async getAgent(name: string): Promise<AgentDefinition | null> {
    const agentsDir = await this.resolveAgentsDir();
    if (!agentsDir) return null;

    const charterPath = path.join(agentsDir, name, 'charter.md');
    let charter: string;
    try {
      charter = await fs.readFile(charterPath, 'utf-8');
    } catch {
      return null;
    }

    const meta = parseCharterMetadata(charter);

    // Optionally read history.md
    let history: string | undefined;
    try {
      history = await fs.readFile(path.join(agentsDir, name, 'history.md'), 'utf-8');
    } catch {
      // history is optional
    }

    return {
      name: meta.name || name,
      role: meta.role || 'agent',
      source: 'local',
      charter,
      model: meta.model,
      tools: meta.tools,
      skills: meta.skills,
      history,
    };
  }

  async getCharter(name: string): Promise<string | null> {
    const agentsDir = await this.resolveAgentsDir();
    if (!agentsDir) return null;

    try {
      return await fs.readFile(path.join(agentsDir, name, 'charter.md'), 'utf-8');
    } catch {
      return null;
    }
  }
}

export class GitHubAgentSource implements AgentSource {
  readonly name = 'github';
  readonly type = 'github' as const;

  constructor(private repo: string, private ref?: string) {}

  async listAgents(): Promise<AgentManifest[]> {
    return [];
  }

  async getAgent(name: string): Promise<AgentDefinition | null> {
    return null;
  }

  async getCharter(name: string): Promise<string | null> {
    return null;
  }
}

export class MarketplaceAgentSource implements AgentSource {
  readonly name = 'marketplace';
  readonly type = 'marketplace' as const;

  constructor(private apiEndpoint: string) {}

  async listAgents(): Promise<AgentManifest[]> {
    return [];
  }

  async getAgent(name: string): Promise<AgentDefinition | null> {
    return null;
  }

  async getCharter(name: string): Promise<string | null> {
    return null;
  }
}

export class AgentRegistry {
  private sources: Map<string, AgentSource> = new Map();

  register(source: AgentSource): void {
    this.sources.set(source.name, source);
  }

  unregister(name: string): boolean {
    return this.sources.delete(name);
  }

  getSource(name: string): AgentSource | undefined {
    return this.sources.get(name);
  }

  async listAllAgents(): Promise<AgentManifest[]> {
    const results = await Promise.all(
      Array.from(this.sources.values()).map(s => s.listAgents())
    );
    return results.flat();
  }

  async findAgent(name: string): Promise<AgentDefinition | null> {
    for (const source of this.sources.values()) {
      const agent = await source.getAgent(name);
      if (agent) return agent;
    }
    return null;
  }

  async getCharter(name: string): Promise<string | null> {
    for (const source of this.sources.values()) {
      const charter = await source.getCharter(name);
      if (charter) return charter;
    }
    return null;
  }
}
