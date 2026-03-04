# @bradygaster/squad-cli

The programmable multi-agent CLI for GitHub Copilot. Build an AI team, assign roles, and let them work your repo.

## Installation

```bash
# Global (recommended)
npm install -g @bradygaster/squad-cli

# Project-local
npm install --save-dev @bradygaster/squad-cli

# One-shot (no install)
npx @bradygaster/squad-cli

# Insider channel (pre-release builds)
npm install -g @bradygaster/squad-cli@insider
```

## Quick Start

```bash
# 1. Initialize Squad in your repo
squad init

# 2. Create your first agent
squad hire --name aria --role "frontend engineer"

# 3. Launch the interactive shell
squad
```

That's it. You have a working AI team.

## Commands

| Command | Description |
|---------|-------------|
| `squad` | Launch interactive shell |
| `squad init` | Initialize Squad in current repo. `--global` for a personal squad. |
| `squad upgrade` | Update Squad-owned files. `--global`, `--migrate-directory` |
| `squad status` | Show which squad is active (repo vs personal) and why |
| `squad triage` | Scan for work and categorize issues |
| `squad loop` | Continuous work loop. `--filter <pattern>`, `--interval <seconds>` |
| `squad hire` | Team creation wizard. `--name <name>`, `--role <role>` |
| `squad copilot` | Add/remove @copilot coding agent. `--off`, `--auto-assign` |
| `squad plugin` | Manage plugin marketplaces (add/remove/list/browse) |
| `squad export` | Export squad to JSON snapshot. `--out <path>` |
| `squad import <file>` | Import squad from export file. `--force` to overwrite |
| `squad scrub-emails` | Remove email addresses from Squad state files |
| `squad help` | Show help |

## Interactive Shell

Running `squad` with no arguments launches a REPL where you talk directly to your team.

- **Slash commands:** `/status`, `/history`, `/agents`, `/clear`, `/help`, `/quit`
- **@mentions:** Route messages to a specific agent (e.g. `@aria fix the login bug`)
- **Tab completion:** Agents and commands auto-complete

The shell coordinates work across agents, streams responses in real time, and keeps a session history.

## Requirements

- **Node.js ≥ 20**
- **GitHub CLI** (`gh`) — required for issue/PR operations and the work loop
- **GitHub Copilot** — provides the AI backend for agent orchestration

## Links

- **SDK:** [@bradygaster/squad-sdk](https://www.npmjs.com/package/@bradygaster/squad-sdk)
- **Issues:** [github.com/bradygaster/squad/issues](https://github.com/bradygaster/squad/issues)

## License

See [LICENSE](https://github.com/bradygaster/squad/blob/main/LICENSE) in the repository root.
