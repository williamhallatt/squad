/**
 * squad link <team-repo-path> — link a project to a remote team root.
 *
 * Writes `.squad/config.json` with a relative `teamRoot` path so the
 * dual-root resolver (resolveSquadPaths) can find the team identity dir.
 *
 * Remote squad mode concept by @spboyer (Shayne Boyer), PR bradygaster/squad#131.
 *
 * @module cli/commands/link
 */

import fs from 'node:fs';
import path from 'node:path';
import { fatal } from '../core/errors.js';

/**
 * Link the current project to a remote team root.
 *
 * @param projectDir - Project root (cwd or explicit).
 * @param teamRepoPath - Path (relative or absolute) to the team repo.
 */
export function runLink(projectDir: string, teamRepoPath: string): void {
  // Resolve the team repo path to an absolute path
  const absoluteTeam = path.resolve(projectDir, teamRepoPath);

  // Validate the target exists
  if (!fs.existsSync(absoluteTeam)) {
    fatal(`Target path does not exist: ${absoluteTeam}`);
  }

  if (!fs.statSync(absoluteTeam).isDirectory()) {
    fatal(`Target path is not a directory: ${absoluteTeam}`);
  }

  // Validate the target contains a .squad/ or .ai-team/ directory
  const hasSquad = fs.existsSync(path.join(absoluteTeam, '.squad'));
  const hasAiTeam = fs.existsSync(path.join(absoluteTeam, '.ai-team'));
  if (!hasSquad && !hasAiTeam) {
    fatal(`Target does not contain a .squad/ directory: ${absoluteTeam}`);
  }

  // Ensure .squad/ exists locally
  const squadDir = path.join(projectDir, '.squad');
  fs.mkdirSync(squadDir, { recursive: true });

  // Compute relative path from project root to team repo
  const relativePath = path.relative(projectDir, absoluteTeam);

  const config = {
    version: 1,
    teamRoot: relativePath,
    projectKey: null,
  };

  fs.writeFileSync(
    path.join(squadDir, 'config.json'),
    JSON.stringify(config, null, 2) + '\n',
    'utf-8',
  );

  console.log(`✅ Linked to team root: ${relativePath}`);
}
