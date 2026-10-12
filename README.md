# gq

**Powerful GitHub Search CLI** — search code, repos, issues, PRs, commits, users, and topics directly from your terminal.

Ships as a TypeScript CLI plus a zero-dependency Bash companion:

- `gq` — Full-featured TypeScript CLI with rich formatted output
- `bin/gq.sh` — Lightning-fast Bash companion for quick searches and pipelines

## Requirements

- **Node.js 18+** (for the TypeScript CLI)
- **Bash + curl + jq** (for the `bin/gq.sh` companion)
- _Optional_: **[GitHub CLI (`gh`)](https://cli.github.com)** or a **GitHub Token** (`GITHUB_TOKEN` / `GH_TOKEN` / `--token`) for higher rate limits (5,000 req/hr) and code searches. Unauthenticated public search works out-of-the-box for repos, issues, PRs, commits, users, and topics!

## Install

```bash
npm install
npm run build
npm link
```

After linking, `gq` is available globally. The zero-dependency Bash companion lives at `bin/gq.sh` and can be run directly with `bash bin/gq.sh`.

## Quick Start

```bash
# Search code with a preset
gq --preset resilience --lang TypeScript

# Quick positional terms
gq useState useEffect --lang TypeScript --ext tsx

# Find popular repos
gq -t repo "machine learning" --lang Python --stars ">1000" --sort stars

# Search open issues
gq -t issue "memory leak" --repo facebook/react --state open

# Lightning-fast bash version
gq "circuit breaker" -l TypeScript
gq -t repo "web framework" -l Rust --stars ">500"
```

## Search Types

| Type     | Flag        | Description           |
| -------- | ----------- | --------------------- |
| `code`   | `-t code`   | Code search (default) |
| `repo`   | `-t repo`   | Repository search     |
| `issue`  | `-t issue`  | Issue search          |
| `pr`     | `-t pr`     | Pull request search   |
| `commit` | `-t commit` | Commit search         |
| `user`   | `-t user`   | User search           |
| `topic`  | `-t topic`  | Topic search          |

## Output Formats

| Format  | Flag       | Description                    |
| ------- | ---------- | ------------------------------ |
| `table` | `-f table` | Rich formatted table (default) |
| `json`  | `-f json`  | Full JSON output               |
| `mini`  | `-f mini`  | Minimal — one result per line  |
| `full`  | `-f full`  | Detailed view with snippets    |
| `urls`  | `-f urls`  | One URL per line               |

## Presets (120+)

```bash
gq --list-presets   # see all presets
```

| Category      | Presets                                                              |
| ------------- | -------------------------------------------------------------------- |
| Architecture  | `architecture`, `microservices`, `ddd`, `cqrs`, `clean`, `monorepo`  |
| Resilience    | `resilience`, `circuit-breaker`, `rate-limit`, `backoff`, `bulkhead` |
| Database      | `database`, `orm`, `migration`, `caching`, `prisma`                  |
| Messaging     | `queues`, `events`, `kafka`, `websocket`                             |
| Security      | `auth`, `oauth`, `security`, `encryption`, `rbac`                    |
| Testing       | `testing`, `e2e`, `snapshot`, `benchmark`                            |
| DevOps        | `docker`, `kubernetes`, `cicd`, `terraform`, `helm`                  |
| API           | `api`, `graphql`, `rest`, `grpc`, `openapi`                          |
| Observability | `logging`, `monitoring`, `tracing`, `alerting`                       |
| Performance   | `performance`, `concurrency`, `streaming`                            |
| Frontend      | `react`, `nextjs`, `state`, `a11y`                                   |
| Quality       | `errors`, `validation`                                               |
| AI/ML         | `ml`, `llm`, `rag`                                                   |

## All Options

### Search Terms

| Option              | Description                       |
| ------------------- | --------------------------------- |
| `[positional]`      | Free-form search terms            |
| `--terms <t...>`    | Named search terms                |
| `--exact <p...>`    | Exact phrase match (auto-quoted)  |
| `--regex <pattern>` | Regular expression                |
| `--not <terms...>`  | Exclude terms                     |
| `-q, --query <str>` | Raw GitHub query (bypass builder) |
| `-p, --preset`      | Use a preset                      |

### Scope

| Option              | Description         |
| ------------------- | ------------------- |
| `-r, --repo <o/n>`  | Limit to repository |
| `-o, --org <name>`  | Limit to org        |
| `-u, --user <name>` | Limit to user       |

### Code Filters

| Option                   | Description               |
| ------------------------ | ------------------------- |
| `-l, --lang <name>`      | Language filter           |
| `--path <path>`          | Path glob                 |
| `--filename <name>`      | Filename filter           |
| `--ext <ext>`            | Extension (no dot)        |
| `--symbol <name>`        | Symbol search             |
| `-X, --exclude-path <p>` | Exclude path (repeatable) |

### Repo Filters

| Option              | Description               |
| ------------------- | ------------------------- |
| `--stars <range>`   | Star count (e.g., `>100`) |
| `--forks <range>`   | Fork count                |
| `--size <range>`    | Repo size (KB)            |
| `--license <id>`    | License (mit, apache-2.0) |
| `--topic <name>`    | Topic (repeatable)        |
| `--created <range>` | Created date              |
| `--pushed <range>`  | Last push date            |
| `--archived <bool>` | Archived status           |
| `--fork <bool>`     | Fork status               |

### Issue/PR Filters

| Option                | Description        |
| --------------------- | ------------------ |
| `--state <state>`     | open or closed     |
| `--label <name>`      | Label (repeatable) |
| `--author <user>`     | Author             |
| `--assignee <user>`   | Assignee           |
| `--mentions <user>`   | Mentions           |
| `--milestone <name>`  | Milestone          |
| `--comments <range>`  | Comment count      |
| `--reactions <range>` | Reaction count     |
| `--updated <range>`   | Updated date       |

### Commit Filters

| Option                  | Description   |
| ----------------------- | ------------- |
| `--committer <user>`    | Committer     |
| `--author-date <range>` | Author date   |
| `--merge <bool>`        | Merge commits |

### Output

| Option            | Description                   |
| ----------------- | ----------------------------- |
| `-f, --format`    | table, json, mini, full, urls |
| `-n, --limit <N>` | Max results (default 10)      |
| `--page <N>`      | Page number                   |
| `--sort <field>`  | Sort field                    |
| `--order <dir>`   | asc or desc                   |
| `--no-color`      | Disable colors                |
| `--open`          | Open in browser               |
| `--dry-run`       | Show query only               |
| `--url-only`      | Print URL only                |
| `--count`         | Total count only              |
| `--token <token>` | GitHub Personal Access Token  |

## Examples

```bash
# ── Code Search ────────────────────────────────────────────────
gq --preset resilience --lang TypeScript
gq useState useEffect --lang TypeScript --ext tsx
gq --exact "circuit breaker" --lang Go -X vendor/ -X test/
gq --regex "AbortSignal|CancellationToken" --lang TypeScript
gq --symbol "useAuth" --lang TypeScript

# ── Repository Search ─────────────────────────────────────────
gq -t repo "machine learning" --lang Python --stars ">1000" --sort stars
gq -t repo "cli" --lang Go --license mit --topic cli -f mini
gq -t repo --topic react --topic typescript --stars ">500"

# ── Issue / PR Search ─────────────────────────────────────────
gq -t issue "memory leak" --repo facebook/react --state open
gq -t pr --author octocat --state closed --sort updated -n 20
gq -t issue "bug" --label bug --label "good first issue" --state open

# ── Commit Search ─────────────────────────────────────────────
gq -t commit "fix typo" --repo owner/repo --sort author-date

# ── User Search ───────────────────────────────────────────────
gq -t user "fullstack developer" -f table

# ── Raw Query Power Mode ──────────────────────────────────────
gq -q "repo:kubernetes/kubernetes language:Go path:pkg/"

# ── Output Formats ────────────────────────────────────────────
gq --preset auth -f json -n 20       # JSON for scripting
gq -t repo "cli" -f mini | head -5   # Pipe-friendly
gq --preset security -f urls         # Just URLs
gq "TODO" --repo owner/repo --count  # Count only

# ── Bash Quick Search (bin/gq.sh) ─────────────────────────────
gq "circuit breaker" -l TypeScript
gq -t repo "web framework" -l Rust --stars ">500" --sort stars
gq -p resilience -l TypeScript
gq -t issue "bug" -r facebook/react --state open
gq -p auth -f json -n 20 | jq '.items[].html_url'
gq -t repo "cli" -l Go -f mini | fzf
```

## Architecture

```
src/
├── index.ts       Entry point — orchestrates everything
├── types.ts       Type definitions (search, options, API responses)
├── presets.ts     120+ categorised presets
├── parser.ts      CLI argument parsing
├── query.ts       GitHub search query builder
├── executor.ts    GitHub REST API execution (Node fetch; gh CLI fallback)
├── formatter.ts   Rich output formatting (table, json, mini, full, urls)
└── colors.ts      ANSI color utilities
bin/
└── gq.sh         Bash companion script
```

## Notes

- Searches run directly against the GitHub REST API via Node's built-in `fetch`; the `gh` CLI is only an optional fallback. Code search requires a token (`GITHUB_TOKEN` / `--token`), other searches work unauthenticated.
- Terms are combined with implicit AND.
- `--exact` wraps each value in quotes. `--terms` accepts literal terms.
- `--regex` wraps a pattern in `/.../` for GitHub Code Search.
- GitHub API rate limits apply. Authenticated users get 30 search requests/minute.
- The `bin/gq.sh` bash script requires `jq` (and `curl`) for live searches.
