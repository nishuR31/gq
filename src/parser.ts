import type { Options, SearchType, OutputFormat } from "./types.js";

const SEARCH_TYPES = new Set<string>(["code", "repo", "issue", "pr", "commit", "user", "topic"]);
const OUTPUT_FORMATS = new Set<string>(["table", "json", "mini", "full", "urls"]);

function need(args: string[], i: number, flag: string): string {
  const v = args[i + 1];
  if (v === undefined || v.startsWith("--")) {
    throw new Error(`Missing value for ${flag}`);
  }
  return v;
}

function collect(args: string[], start: number): [string[], number] {
  const values: string[] = [];
  let i = start;
  while (i + 1 < args.length && !args[i + 1].startsWith("--")) {
    values.push(args[++i]);
  }
  return [values, i];
}

export function parseArgs(argv: string[]): Options {
  const opts: Options = {
    help: false,
    version: false,
    listPresets: false,
    type: "code",
    terms: [],
    exact: [],
    not: [],
    excludePaths: [],
    topics: [],
    labels: [],
    format: "table",
    limit: 10,
    page: 1,
    noColor: false,
    open: false,
    dryRun: false,
    urlOnly: false,
    count: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      // ── Actions ───────────────────────────────────────────────────────────
      case "-h": case "--help":
        opts.help = true; break;
      case "-V": case "--version":
        opts.version = true; break;
      case "--list-presets": case "--presets":
        opts.listPresets = true; break;

      // ── Search type ───────────────────────────────────────────────────────
      case "-t": case "--type": {
        const v = need(argv, i, a);
        if (!SEARCH_TYPES.has(v)) throw new Error(`Unknown type "${v}". Use: ${[...SEARCH_TYPES].join(", ")}`);
        opts.type = v as SearchType; i++; break;
      }

      // ── Search terms ──────────────────────────────────────────────────────
      case "-p": case "--preset":
        opts.preset = need(argv, i, a); i++; break;
      case "--terms": {
        const [vals, ni] = collect(argv, i);
        if (!vals.length) throw new Error("--terms requires at least one value");
        opts.terms.push(...vals); i = ni; break;
      }
      case "--exact": {
        const [vals, ni] = collect(argv, i);
        if (!vals.length) throw new Error("--exact requires at least one value");
        opts.exact.push(...vals); i = ni; break;
      }
      case "--regex":
        opts.regex = need(argv, i, a); i++; break;
      case "-q": case "--query":
        opts.rawQuery = need(argv, i, a); i++; break;
      case "--not": {
        const [vals, ni] = collect(argv, i);
        opts.not.push(...vals); i = ni; break;
      }

      // ── Scope ─────────────────────────────────────────────────────────────
      case "-r": case "--repo":
        opts.repo = need(argv, i, a); i++; break;
      case "-o": case "--org":
        opts.org = need(argv, i, a); i++; break;
      case "-u": case "--user":
        opts.user = need(argv, i, a); i++; break;

      // ── Code qualifiers ───────────────────────────────────────────────────
      case "-l": case "--lang": case "--language":
        opts.language = need(argv, i, a); i++; break;
      case "--path":
        opts.path = need(argv, i, a); i++; break;
      case "--filename":
        opts.filename = need(argv, i, a); i++; break;
      case "--ext": case "--extension":
        opts.extension = need(argv, i, a).replace(/^\./, ""); i++; break;
      case "--symbol":
        opts.symbol = need(argv, i, a); i++; break;
      case "-X": case "--exclude-path":
        opts.excludePaths.push(need(argv, i, a)); i++; break;

      // ── Repo qualifiers ───────────────────────────────────────────────────
      case "--stars":
        opts.stars = need(argv, i, a); i++; break;
      case "--forks":
        opts.forks = need(argv, i, a); i++; break;
      case "--size":
        opts.repoSize = need(argv, i, a); i++; break;
      case "--license":
        opts.license = need(argv, i, a); i++; break;
      case "--topic":
        opts.topics.push(need(argv, i, a)); i++; break;
      case "--created":
        opts.created = need(argv, i, a); i++; break;
      case "--pushed":
        opts.pushed = need(argv, i, a); i++; break;
      case "--archived":
        opts.archived = need(argv, i, a); i++; break;
      case "--fork":
        opts.isFork = need(argv, i, a); i++; break;

      // ── Issue/PR qualifiers ───────────────────────────────────────────────
      case "--state":
        opts.state = need(argv, i, a); i++; break;
      case "--label":
        opts.labels.push(need(argv, i, a)); i++; break;
      case "--author":
        opts.author = need(argv, i, a); i++; break;
      case "--assignee":
        opts.assignee = need(argv, i, a); i++; break;
      case "--mentions":
        opts.mentions = need(argv, i, a); i++; break;
      case "--milestone":
        opts.milestone = need(argv, i, a); i++; break;
      case "--comments":
        opts.comments = need(argv, i, a); i++; break;
      case "--reactions":
        opts.reactions = need(argv, i, a); i++; break;
      case "--updated":
        opts.updated = need(argv, i, a); i++; break;

      // ── Commit qualifiers ─────────────────────────────────────────────────
      case "--committer":
        opts.committer = need(argv, i, a); i++; break;
      case "--author-date":
        opts.authorDate = need(argv, i, a); i++; break;
      case "--committer-date":
        opts.committerDate = need(argv, i, a); i++; break;
      case "--merge":
        opts.merge = need(argv, i, a); i++; break;
      case "--hash":
        opts.hash = need(argv, i, a); i++; break;

      // ── Output ────────────────────────────────────────────────────────────
      case "-f": case "--format": {
        const v = need(argv, i, a);
        if (!OUTPUT_FORMATS.has(v)) throw new Error(`Unknown format "${v}". Use: ${[...OUTPUT_FORMATS].join(", ")}`);
        opts.format = v as OutputFormat; i++; break;
      }
      case "-n": case "--limit": {
        const n = parseInt(need(argv, i, a), 10);
        if (isNaN(n) || n < 1) throw new Error("--limit must be a positive integer");
        opts.limit = Math.min(n, 100); i++; break;
      }
      case "--page": {
        const n = parseInt(need(argv, i, a), 10);
        if (isNaN(n) || n < 1) throw new Error("--page must be a positive integer");
        opts.page = n; i++; break;
      }
      case "--sort":
        opts.sort = need(argv, i, a); i++; break;
      case "--order":
        opts.order = need(argv, i, a); i++; break;
      case "--no-color":
        opts.noColor = true; break;
      case "--open":
        opts.open = true; break;
      case "--dry-run": case "--dry":
        opts.dryRun = true; break;
      case "--url-only": case "--url":
        opts.urlOnly = true; break;
      case "--count":
        opts.count = true; break;
      case "--token":
        opts.token = need(argv, i, a); i++; break;

      default:
        // Positional args → search terms
        if (!a.startsWith("-")) {
          opts.terms.push(a);
        } else {
          throw new Error(`Unknown option "${a}". Run gq --help.`);
        }
    }
  }

  return opts;
}
