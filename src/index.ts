#!/usr/bin/env node
import process from "node:process";
import { spawn } from "node:child_process";
import { parseArgs } from "./parser.js";
import { buildQuery, getSearchUrl } from "./query.js";
import { executeSearch, GitHubApiError } from "./executor.js";
import { formatResults, formatHeader, formatCount, formatPresetList } from "./formatter.js";
import { c, disableColors } from "./colors.js";

const VERSION = "2.0.0";

// ─── Help ─────────────────────────────────────────────────────────────────────

function usage(): void {
  console.log(`
${c.bold}gq${c.reset} ${c.dim}v${VERSION}${c.reset} — ${c.cyan}Powerful GitHub Search CLI${c.reset}

${c.bold}${c.cyan}USAGE${c.reset}
  gq [terms...] [options]
  gq --preset <name> [options]
  gq -q "raw github query" [options]

${c.bold}${c.cyan}SEARCH TYPES${c.reset} ${c.dim}(-t, --type)${c.reset}
  code ${c.dim}(default)${c.reset}  repo       issue      pr
  commit         user       topic

${c.bold}${c.cyan}SEARCH TERMS${c.reset}
  ${c.dim}[positional]${c.reset}              Free-form search terms
  --terms <t...>            Named search terms
  --exact <phrase...>       Exact phrase match (auto-quoted)
  --regex <pattern>         Regular expression
  --not <terms...>          Exclude terms (NOT)
  -q, --query <str>         Raw GitHub query (bypass builder)
  -p, --preset <name>       Use a preset (see --list-presets)

${c.bold}${c.cyan}SCOPE${c.reset}
  -r, --repo <owner/name>   Limit to repository
  -o, --org <name>           Limit to organization
  -u, --user <name>          Limit to user

${c.bold}${c.cyan}CODE FILTERS${c.reset}
  -l, --lang <name>         Language (TypeScript, Python, etc.)
  --path <path>             Path glob (e.g. src/**)
  --filename <name>         Filename filter
  --ext <ext>               Extension (no dot)
  --symbol <name>           Symbol search
  -X, --exclude-path <p>    Exclude path (repeatable)

${c.bold}${c.cyan}REPO FILTERS${c.reset}
  --stars <range>           Stars (e.g. >100, 50..200)
  --forks <range>           Forks
  --size <range>            Repo size (KB)
  --license <id>            License (mit, apache-2.0…)
  --topic <name>            Topic (repeatable)
  --created <range>         Created date (>2024-01-01)
  --pushed <range>          Last push date
  --archived <bool>         Archived status
  --fork <bool|only>        Fork status

${c.bold}${c.cyan}ISSUE / PR FILTERS${c.reset}
  --state <open|closed>     State
  --label <name>            Label (repeatable)
  --author <user>           Author
  --assignee <user>         Assignee
  --mentions <user>         Mentions
  --milestone <name>        Milestone
  --comments <range>        Comment count
  --reactions <range>       Reaction count
  --updated <range>         Updated date

${c.bold}${c.cyan}COMMIT FILTERS${c.reset}
  --committer <user>        Committer
  --author-date <range>     Author date
  --merge <bool>            Merge commits

${c.bold}${c.cyan}OUTPUT${c.reset}
  -f, --format <fmt>        table ${c.dim}(default)${c.reset} | json | mini | full | urls
  -n, --limit <N>           Max results (default 10, max 100)
  --page <N>                Page number
  --sort <field>            Sort field
  --order <asc|desc>        Sort order
  --no-color                Disable colors
  --open                    Open in browser
  --dry-run                 Show query only
  --url-only                Print URL only
  --count                   Show total count only
  --token <token>           GitHub token (or GITHUB_TOKEN env var)

${c.bold}${c.cyan}INFO${c.reset}
  --list-presets             List all 40+ presets
  -h, --help                Show this help
  -V, --version             Version

${c.bold}${c.cyan}EXAMPLES${c.reset}
  ${c.dim}# Search code with a preset${c.reset}
  gq --preset resilience --lang TypeScript

  ${c.dim}# Quick positional terms${c.reset}
  gq useState useEffect --lang TypeScript --ext tsx

  ${c.dim}# Find popular repos${c.reset}
  gq -t repo "machine learning" --lang Python --stars ">1000" --sort stars

  ${c.dim}# Search open issues${c.reset}
  gq -t issue "memory leak" --repo facebook/react --state open

  ${c.dim}# PRs by author${c.reset}
  gq -t pr --author octocat --state closed -n 20

  ${c.dim}# Regex search${c.reset}
  gq --regex "AbortSignal|CancellationToken" --lang TypeScript

  ${c.dim}# Exact phrase, exclude dirs${c.reset}
  gq --exact "circuit breaker" --lang Go -X vendor/ -X test/

  ${c.dim}# Raw query power mode${c.reset}
  gq -q "repo:kubernetes/kubernetes language:Go path:pkg/"

  ${c.dim}# JSON output for scripting${c.reset}
  gq --preset auth --lang TypeScript -f json -n 20

  ${c.dim}# Pipe-friendly minimal output${c.reset}
  gq -t repo "cli tool" --stars ">500" -f mini | head -5

  ${c.dim}# Just URLs${c.reset}
  gq --preset security --lang Python -f urls

  ${c.dim}# Count matching results${c.reset}
  gq "TODO" --repo owner/repo --count

  ${c.dim}# Open in browser${c.reset}
  gq --preset docker --open
`);
}

// ─── Browser ──────────────────────────────────────────────────────────────────

function openBrowser(url: string): void {
  const p = process.platform;
  const cmd = p === "win32" ? "cmd" : p === "darwin" ? "open" : "xdg-open";
  const args = p === "win32" ? ["/c", "start", "", url] : [url];
  const child = spawn(cmd, args, { detached: true, stdio: "ignore" });
  child.on("error", (err) => {
    console.error(`${c.red}✖ Could not open browser:${c.reset} ${err.message}`);
    console.error(`  Open manually: ${url}`);
  });
  child.unref();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  try {
    const opts = parseArgs(process.argv.slice(2));

    if (opts.noColor) disableColors();
    if (opts.version) { console.log(`gq v${VERSION}`); return; }
    if (opts.help) { usage(); return; }
    if (opts.listPresets) { formatPresetList(); return; }

    const query = buildQuery(opts);
    const url = getSearchUrl(query, opts.type);

    // ── URL-only mode ─────────────────────────────────────────────────────
    if (opts.urlOnly) {
      console.log(url);
      if (opts.open) openBrowser(url);
      return;
    }

    // ── Dry-run mode ──────────────────────────────────────────────────────
    if (opts.dryRun) {
      formatHeader(query, url, opts.type);
      if (opts.open) openBrowser(url);
      return;
    }

    // ── Execute the search ────────────────────────────────────────────────
    let result;
    try {
      result = await executeSearch(
        opts.type,
        query,
        opts.limit,
        opts.page,
        opts.sort,
        opts.order,
        opts.token,
      );
    } catch (err) {
      if (err instanceof GitHubApiError && err.isAuthRequired) {
        console.error(`${c.yellow}⚠${c.reset}  ${c.bold}Code search requires authentication${c.reset}`);
        console.error(`   Provide a token with ${c.cyan}--token <token>${c.reset} or ${c.cyan}export GITHUB_TOKEN=...${c.reset}`);
        console.error(`   Or authenticate via GitHub CLI: ${c.cyan}gh auth login${c.reset}`);
        console.error("");
        formatHeader(query, url, opts.type);
        if (opts.open) openBrowser(url);
        return;
      }
      throw err;
    }

    // Count-only mode
    if (opts.count) {
      formatCount(result.total_count);
      return;
    }

    // Render results
    formatResults(result, opts.type, opts.format, query, url);

    if (opts.open) openBrowser(url);
  } catch (err) {
    console.error(`${c.red}✖${c.reset} ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
  }
}

void main();
