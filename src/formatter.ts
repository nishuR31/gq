import process from "node:process";
import type {
  SearchType,
  OutputFormat,
  SearchResponse,
  CodeItem,
  RepoItem,
  IssueItem,
  CommitItem,
  UserItem,
} from "./types.js";
import { c, strip } from "./colors.js";
import { PRESETS } from "./presets.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cols(): number {
  return process.stdout.columns ?? 120;
}

function trunc(s: string, max: number): string {
  const plain = strip(s);
  if (plain.length <= max) return s;
  // Simple truncation on the plain text, preserving leading ANSI
  return s.slice(0, max - 1) + "…";
}

function pad(s: string, w: number): string {
  const visible = strip(s).length;
  return s + " ".repeat(Math.max(0, w - visible));
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(n);
}

function ago(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.floor(mo / 12)}y`;
}

function line(ch: string, len: number): string {
  return ch.repeat(len);
}

function stateColor(state: string): string {
  if (state === "open") return c.green;
  if (state === "closed") return c.red;
  return c.gray;
}

function highlightMatch(fragment: string): string {
  // Simple: wrap matched text in bold+yellow
  return fragment
    .replace(/\n/g, " ")
    .slice(0, 120);
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function formatHeader(query: string, url: string, type: SearchType): void {
  console.log("");
  console.log(`${c.bold}${c.cyan}  ⚡ GitHub ${type.toUpperCase()} Search${c.reset}`);
  console.log(`${c.dim}  ${line("─", 60)}${c.reset}`);
  console.log(`  ${c.bold}Query${c.reset}  ${c.yellow}${query}${c.reset}`);
  console.log(`  ${c.bold}URL${c.reset}    ${c.dim}${url}${c.reset}`);
  console.log("");
}

// ─── Count ────────────────────────────────────────────────────────────────────

export function formatCount(total: number): void {
  console.log(`${c.bold}${fmtNum(total)}${c.reset}`);
}

// ─── Preset List ──────────────────────────────────────────────────────────────

export function formatPresetList(): void {
  console.log("");
  console.log(`${c.bold}${c.cyan}  📚 Available Presets${c.reset}`);
  console.log(`${c.dim}  ${line("─", 60)}${c.reset}`);

  // Group by category
  const groups = new Map<string, [string, typeof PRESETS[string]][]>();
  for (const [name, preset] of Object.entries(PRESETS)) {
    const cat = preset.category;
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push([name, preset]);
  }

  for (const [category, items] of groups) {
    console.log("");
    console.log(`  ${c.bold}${c.magenta}${category}${c.reset}`);
    for (const [name, preset] of items) {
      const langTag = preset.lang ? ` ${c.dim}[${preset.lang}]${c.reset}` : "";
      console.log(`    ${c.cyan}${pad(name, 20)}${c.reset} ${c.dim}${preset.desc}${c.reset}${langTag}`);
    }
  }
  console.log("");
}

// ─── Results Formatter ────────────────────────────────────────────────────────

export function formatResults(
  response: SearchResponse,
  type: SearchType,
  format: OutputFormat,
  query: string,
  url: string,
): void {
  const { total_count, items, incomplete_results } = response;

  // JSON format — raw structured output
  if (format === "json") {
    console.log(JSON.stringify({ query, url, total_count, incomplete_results, items }, null, 2));
    return;
  }

  // URLs format — one URL per line
  if (format === "urls") {
    for (const item of items) {
      const u = (item as { html_url?: string }).html_url;
      if (u) console.log(u);
    }
    return;
  }

  // Print header for table/mini/full
  formatHeader(query, url, type);

  const showing = items.length;
  const totalStr = fmtNum(total_count);
  console.log(`  ${c.dim}Showing ${c.bold}${c.white}${showing}${c.reset}${c.dim} of ${c.bold}${c.white}${totalStr}${c.reset}${c.dim} results${incomplete_results ? " (results may be incomplete)" : ""}${c.reset}`);
  console.log("");

  if (items.length === 0) {
    console.log(`  ${c.yellow}No results found.${c.reset}`);
    console.log("");
    return;
  }

  switch (type) {
    case "code":   formatCode(items as CodeItem[], format); break;
    case "repo":   formatRepos(items as RepoItem[], format); break;
    case "issue":
    case "pr":     formatIssues(items as IssueItem[], format, type); break;
    case "commit": formatCommits(items as CommitItem[], format); break;
    case "user":   formatUsers(items as UserItem[], format); break;
    case "topic":  formatTopics(items, format); break;
  }
}

// ─── Code Results ─────────────────────────────────────────────────────────────

function formatCode(items: CodeItem[], format: OutputFormat): void {
  if (format === "mini") {
    for (const item of items) {
      console.log(`${item.repository.full_name}/${item.path}`);
    }
    console.log("");
    return;
  }

  const w = cols();
  const repoW = 30;
  const pathW = Math.max(30, w - repoW - 12);

  if (format === "table") {
    console.log(`  ${c.dim}${pad("REPOSITORY", repoW)}  ${pad("PATH", pathW)}${c.reset}`);
    console.log(`  ${c.dim}${line("─", repoW)}  ${line("─", pathW)}${c.reset}`);
    for (const item of items) {
      const repo = trunc(`${c.cyan}${item.repository.full_name}${c.reset}`, repoW);
      const path = trunc(`${c.white}${item.path}${c.reset}`, pathW);
      console.log(`  ${pad(repo, repoW)}  ${pad(path, pathW)}`);
    }
    console.log("");
    return;
  }

  // Full format — include snippets
  for (const item of items) {
    console.log(`  ${c.cyan}${c.bold}${item.repository.full_name}${c.reset} ${c.dim}/${c.reset} ${c.white}${item.path}${c.reset}`);
    console.log(`  ${c.dim}${item.html_url}${c.reset}`);
    if (item.text_matches?.length) {
      for (const match of item.text_matches.slice(0, 2)) {
        const snippet = highlightMatch(match.fragment);
        console.log(`  ${c.dim}│${c.reset} ${c.yellow}${snippet}${c.reset}`);
      }
    }
    console.log("");
  }
}

// ─── Repo Results ─────────────────────────────────────────────────────────────

function formatRepos(items: RepoItem[], format: OutputFormat): void {
  if (format === "mini") {
    for (const item of items) console.log(item.full_name);
    console.log("");
    return;
  }

  const w = cols();
  const nameW = 32;
  const starsW = 9;
  const forksW = 9;
  const langW = 14;
  const descW = Math.max(20, w - nameW - starsW - forksW - langW - 14);

  if (format === "table") {
    console.log(`  ${c.dim}${pad("REPOSITORY", nameW)}  ${pad("★ STARS", starsW)}  ${pad("🍴 FORKS", forksW)}  ${pad("LANGUAGE", langW)}  ${pad("DESCRIPTION", descW)}${c.reset}`);
    console.log(`  ${c.dim}${line("─", nameW)}  ${line("─", starsW)}  ${line("─", forksW)}  ${line("─", langW)}  ${line("─", descW)}${c.reset}`);
    for (const item of items) {
      const name = trunc(`${c.cyan}${item.full_name}${c.reset}`, nameW);
      const stars = `${c.yellow}${fmtNum(item.stargazers_count)}${c.reset}`;
      const forks = `${c.dim}${fmtNum(item.forks_count)}${c.reset}`;
      const lang = trunc(item.language ?? "—", langW);
      const desc = trunc(item.description ?? "", descW);
      console.log(`  ${pad(name, nameW)}  ${pad(stars, starsW)}  ${pad(forks, forksW)}  ${pad(lang, langW)}  ${c.dim}${desc}${c.reset}`);
    }
    console.log("");
    return;
  }

  // Full format
  for (const item of items) {
    const tags = item.topics.slice(0, 5).map((t) => `${c.dim}#${t}${c.reset}`).join(" ");
    const license = item.license ? `${c.dim}[${item.license.spdx_id}]${c.reset}` : "";
    console.log(`  ${c.cyan}${c.bold}${item.full_name}${c.reset} ${license} ${item.archived ? `${c.yellow}[archived]${c.reset}` : ""}`);
    if (item.description) console.log(`  ${item.description}`);
    console.log(`  ${c.yellow}★ ${fmtNum(item.stargazers_count)}${c.reset}  ${c.dim}🍴 ${fmtNum(item.forks_count)}${c.reset}  ${item.language ?? ""}  ${c.dim}updated ${ago(item.updated_at)}${c.reset}`);
    if (tags) console.log(`  ${tags}`);
    console.log(`  ${c.dim}${item.html_url}${c.reset}`);
    console.log("");
  }
}

// ─── Issue / PR Results ───────────────────────────────────────────────────────

function formatIssues(items: IssueItem[], format: OutputFormat, type: SearchType): void {
  if (format === "mini") {
    for (const item of items) console.log(`#${item.number} ${item.title}`);
    console.log("");
    return;
  }

  const w = cols();
  const numW = 8;
  const titleW = Math.max(20, w - numW - 36);
  const stateW = 8;
  const authorW = 14;
  const dateW = 8;

  if (format === "table") {
    const label = type === "pr" ? "PULL REQUESTS" : "ISSUES";
    console.log(`  ${c.dim}${pad("#", numW)}  ${pad("TITLE", titleW)}  ${pad("STATE", stateW)}  ${pad("AUTHOR", authorW)}  ${pad("AGE", dateW)}${c.reset}`);
    console.log(`  ${c.dim}${line("─", numW)}  ${line("─", titleW)}  ${line("─", stateW)}  ${line("─", authorW)}  ${line("─", dateW)}${c.reset}`);
    for (const item of items) {
      const num = `${c.dim}#${item.number}${c.reset}`;
      const title = trunc(item.title, titleW);
      const st = `${stateColor(item.state)}${item.state}${c.reset}`;
      const author = trunc(item.user.login, authorW);
      const date = ago(item.created_at);
      console.log(`  ${pad(num, numW)}  ${pad(title, titleW)}  ${pad(st, stateW)}  ${pad(`${c.cyan}${author}${c.reset}`, authorW)}  ${c.dim}${date}${c.reset}`);
    }
    console.log("");
    return;
  }

  // Full format
  for (const item of items) {
    const labels = item.labels.slice(0, 4).map((l) => `${c.magenta}[${l.name}]${c.reset}`).join(" ");
    console.log(`  ${stateColor(item.state)}●${c.reset} ${c.bold}#${item.number}${c.reset} ${item.title}`);
    console.log(`  ${c.cyan}@${item.user.login}${c.reset}  ${c.dim}${ago(item.created_at)}  💬 ${item.comments}${c.reset}  ${labels}`);
    if (item.body) {
      const preview = item.body.replace(/\r?\n/g, " ").slice(0, 120);
      console.log(`  ${c.dim}${preview}${c.reset}`);
    }
    console.log(`  ${c.dim}${item.html_url}${c.reset}`);
    console.log("");
  }
}

// ─── Commit Results ───────────────────────────────────────────────────────────

function formatCommits(items: CommitItem[], format: OutputFormat): void {
  if (format === "mini") {
    for (const item of items) {
      const msg = item.commit.message.split("\n")[0].slice(0, 80);
      console.log(`${item.sha.slice(0, 7)} ${msg}`);
    }
    console.log("");
    return;
  }

  const w = cols();
  const shaW = 10;
  const repoW = 28;
  const authorW = 16;
  const msgW = Math.max(20, w - shaW - repoW - authorW - 14);

  if (format === "table") {
    console.log(`  ${c.dim}${pad("SHA", shaW)}  ${pad("REPOSITORY", repoW)}  ${pad("AUTHOR", authorW)}  ${pad("MESSAGE", msgW)}${c.reset}`);
    console.log(`  ${c.dim}${line("─", shaW)}  ${line("─", repoW)}  ${line("─", authorW)}  ${line("─", msgW)}${c.reset}`);
    for (const item of items) {
      const sha = `${c.yellow}${item.sha.slice(0, 7)}${c.reset}`;
      const repo = trunc(`${c.cyan}${item.repository.full_name}${c.reset}`, repoW);
      const author = trunc(item.commit.author.name, authorW);
      const msg = trunc(item.commit.message.split("\n")[0], msgW);
      console.log(`  ${pad(sha, shaW)}  ${pad(repo, repoW)}  ${pad(author, authorW)}  ${c.dim}${msg}${c.reset}`);
    }
    console.log("");
    return;
  }

  // Full format
  for (const item of items) {
    console.log(`  ${c.yellow}${item.sha.slice(0, 10)}${c.reset} ${c.bold}${item.commit.message.split("\n")[0]}${c.reset}`);
    console.log(`  ${c.cyan}${item.repository.full_name}${c.reset}  ${c.dim}by ${item.commit.author.name}  ${ago(item.commit.author.date)}${c.reset}`);
    console.log(`  ${c.dim}${item.html_url}${c.reset}`);
    console.log("");
  }
}

// ─── User Results ─────────────────────────────────────────────────────────────

function formatUsers(items: UserItem[], format: OutputFormat): void {
  if (format === "mini") {
    for (const item of items) console.log(item.login);
    console.log("");
    return;
  }

  if (format === "table") {
    console.log(`  ${c.dim}${pad("LOGIN", 24)}  ${pad("TYPE", 16)}  URL${c.reset}`);
    console.log(`  ${c.dim}${line("─", 24)}  ${line("─", 16)}  ${line("─", 40)}${c.reset}`);
    for (const item of items) {
      const login = `${c.cyan}${item.login}${c.reset}`;
      console.log(`  ${pad(login, 24)}  ${pad(item.type, 16)}  ${c.dim}${item.html_url}${c.reset}`);
    }
    console.log("");
    return;
  }

  // Full format
  for (const item of items) {
    console.log(`  ${c.cyan}${c.bold}@${item.login}${c.reset}  ${c.dim}(${item.type})${c.reset}`);
    console.log(`  ${c.dim}${item.html_url}${c.reset}`);
    console.log("");
  }
}

// ─── Topic Results ────────────────────────────────────────────────────────────

interface TopicItem {
  name: string;
  display_name?: string;
  short_description?: string;
  description?: string;
  created_by?: string;
  curated?: boolean;
  featured?: boolean;
}

function formatTopics(items: unknown[], format: OutputFormat): void {
  const topics = items as TopicItem[];
  if (format === "mini") {
    for (const t of topics) console.log(t.name);
    console.log("");
    return;
  }

  if (format === "table") {
    console.log(`  ${c.dim}${pad("TOPIC", 24)}  ${pad("DISPLAY NAME", 24)}  DESCRIPTION${c.reset}`);
    console.log(`  ${c.dim}${line("─", 24)}  ${line("─", 24)}  ${line("─", 40)}${c.reset}`);
    for (const t of topics) {
      const name = `${c.cyan}${t.name}${c.reset}`;
      const display = t.display_name ?? "—";
      const desc = trunc(t.short_description ?? t.description ?? "", 50);
      console.log(`  ${pad(name, 24)}  ${pad(display, 24)}  ${c.dim}${desc}${c.reset}`);
    }
    console.log("");
    return;
  }

  // Full format
  for (const t of topics) {
    const curated = t.curated ? `${c.green}[curated]${c.reset}` : "";
    const featured = t.featured ? `${c.yellow}[featured]${c.reset}` : "";
    console.log(`  ${c.cyan}${c.bold}${t.name}${c.reset} ${curated} ${featured}`);
    if (t.display_name) console.log(`  ${t.display_name}`);
    if (t.short_description) console.log(`  ${c.dim}${t.short_description}${c.reset}`);
    console.log("");
  }
}
