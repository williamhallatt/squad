# Skill Discovery Sample

Demonstrates the **Squad SDK skills system** — how agents load domain knowledge from SKILL.md files, match skills to tasks, and discover new patterns at runtime.

## What It Shows

| Step | SDK API | What Happens |
|------|---------|-------------|
| 1 | `loadSkillsFromDirectory()` | Loads 3 pre-built skills from a temp directory |
| 2 | `SkillRegistry.registerSkill()` | Registers loaded skills in the registry |
| 3 | `SkillRegistry.matchSkills()` | Matches skills to task descriptions by triggers + role affinity |
| 4 | `parseSkillFile()` | Agent discovers a new pattern and creates a skill at runtime |
| 5 | `matchSkills()` | Newly discovered skill matches error-related tasks |
| 6 | `parseFrontmatter()` | Shows the confidence lifecycle: low → medium → high |

## Prerequisites

- Node.js ≥ 20
- The SDK must be built first: `npm run build` from the repo root

## Run the Demo

From the repository root:

```bash
npx tsx samples/skill-discovery/index.ts
```

Or from this directory:

```bash
npm start
```

## Run the Tests

From the repository root:

```bash
npx vitest run samples/skill-discovery/tests/skill-discovery.test.ts
```

## Key SDK Imports

```typescript
import {
  SkillRegistry,
  loadSkillsFromDirectory,
  parseSkillFile,
  parseFrontmatter,
} from '@bradygaster/squad-sdk/skills';
```

## SKILL.md Format

Skills are stored as `SKILL.md` files with YAML-like frontmatter:

```markdown
---
name: TypeScript Patterns
domain: development
triggers: [typescript, types, generics]
roles: [developer, lead]
confidence: low
---
## TypeScript Patterns

Prefer `unknown` over `any` for type-safe narrowing.
```

### Confidence Levels

| Level | Icon | Meaning |
|-------|------|---------|
| `low` | 🔴 | First observation — pattern just noticed |
| `medium` | 🟡 | Confirmed — validated across sessions |
| `high` | 🟢 | Established — proven team standard |

## Matching Algorithm

`SkillRegistry.matchSkills(task, role)` scores skills by:

- **+0.5** per trigger keyword found in the task (capped at 0.7)
- **+0.3** if the agent's role matches the skill's `roles` list
- Scores clamped to **[0, 1]**, sorted descending
