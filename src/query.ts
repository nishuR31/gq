import type { Options, SearchType } from "./types.js";
import { PRESETS } from "./presets.js";

function quote(s: string): string {
  const t = s.trim();
  if (!t) throw new Error("Search terms cannot be empty.");
  if (t.startsWith('"') && t.endsWith('"')) return t;
  return /\s/.test(t) ? `"${t.replace(/"/g, '\\"')}"` : t;
}

/**
 * Builds a GitHub search query string from parsed options.
 * Mutates `opts.language` and `opts.type` if a preset provides defaults.
 */
export function buildQuery(opts: Options): string {
  // Raw query bypass — skip the builder entirely
  if (opts.rawQuery) return opts.rawQuery;

  const parts: string[] = [];

  // ── Preset terms ────────────────────────────────────────────────────────────
  if (opts.preset) {
    const preset = PRESETS[opts.preset];
    if (!preset) {
      const available = Object.keys(PRESETS).join(", ");
      throw new Error(`Unknown preset "${opts.preset}". Available: ${available}`);
    }
    parts.push(...preset.terms);
    if (preset.lang && !opts.language) opts.language = preset.lang;
    if (preset.type && opts.type === "code") opts.type = preset.type;
  }

  // ── User-supplied terms ─────────────────────────────────────────────────────
  for (const t of opts.terms) parts.push(quote(t));
  for (const t of opts.exact) parts.push(`"${t.replace(/"/g, '\\"')}"`);
  if (opts.regex) parts.push(`/${opts.regex.replace(/\//g, "\\/")}/`);
  for (const t of opts.not) parts.push(`NOT ${quote(t)}`);

  // ── Issue / PR type qualifier ───────────────────────────────────────────────
  if (opts.type === "issue") parts.push("is:issue");
  if (opts.type === "pr") parts.push("is:pull-request");

  // ── Scope qualifiers ───────────────────────────────────────────────────────
  if (opts.repo) parts.push(`repo:${opts.repo}`);
  if (opts.org) parts.push(`org:${opts.org}`);
  if (opts.user) parts.push(`user:${opts.user}`);

  // ── Code qualifiers ────────────────────────────────────────────────────────
  if (opts.language) parts.push(`language:${opts.language}`);
  if (opts.path) parts.push(`path:${opts.path}`);
  if (opts.filename) parts.push(`filename:${opts.filename}`);
  if (opts.extension) parts.push(`extension:${opts.extension}`);
  if (opts.symbol) parts.push(`symbol:${opts.symbol}`);
  for (const p of opts.excludePaths) parts.push(`NOT path:${p}`);

  // ── Repo qualifiers ────────────────────────────────────────────────────────
  if (opts.stars) parts.push(`stars:${opts.stars}`);
  if (opts.forks) parts.push(`forks:${opts.forks}`);
  if (opts.repoSize) parts.push(`size:${opts.repoSize}`);
  if (opts.license) parts.push(`license:${opts.license}`);
  for (const t of opts.topics) parts.push(`topic:${t}`);
  if (opts.created) parts.push(`created:${opts.created}`);
  if (opts.pushed) parts.push(`pushed:${opts.pushed}`);
  if (opts.archived) parts.push(`archived:${opts.archived}`);
  if (opts.isFork) parts.push(`fork:${opts.isFork}`);

  // ── Issue / PR qualifiers ──────────────────────────────────────────────────
  if (opts.state) parts.push(`state:${opts.state}`);
  for (const l of opts.labels) parts.push(`label:"${l}"`);
  if (opts.author) parts.push(`author:${opts.author}`);
  if (opts.assignee) parts.push(`assignee:${opts.assignee}`);
  if (opts.mentions) parts.push(`mentions:${opts.mentions}`);
  if (opts.milestone) parts.push(`milestone:"${opts.milestone}"`);
  if (opts.comments) parts.push(`comments:${opts.comments}`);
  if (opts.reactions) parts.push(`reactions:${opts.reactions}`);
  if (opts.updated) parts.push(`updated:${opts.updated}`);

  // ── Commit qualifiers ──────────────────────────────────────────────────────
  if (opts.committer) parts.push(`committer:${opts.committer}`);
  if (opts.authorDate) parts.push(`author-date:${opts.authorDate}`);
  if (opts.committerDate) parts.push(`committer-date:${opts.committerDate}`);
  if (opts.merge) parts.push(`merge:${opts.merge}`);
  if (opts.hash) parts.push(`hash:${opts.hash}`);

  if (parts.length === 0) {
    throw new Error("No search terms. Use --preset, --terms, --exact, --regex, or -q.");
  }

  return parts.join(" ");
}

/** Maps a SearchType to the corresponding GitHub API endpoint. */
export function getEndpoint(type: SearchType): string {
  switch (type) {
    case "code":   return "search/code";
    case "repo":   return "search/repositories";
    case "issue":
    case "pr":     return "search/issues";
    case "commit": return "search/commits";
    case "user":   return "search/users";
    case "topic":  return "search/topics";
  }
}

/** Builds the github.com/search URL for the given query and type. */
export function getSearchUrl(query: string, type: SearchType): string {
  const urlType: Record<SearchType, string> = {
    code: "code",
    repo: "repositories",
    issue: "issues",
    pr: "pullrequests",
    commit: "commits",
    user: "users",
    topic: "topics",
  };
  return `https://github.com/search?q=${encodeURIComponent(query)}&type=${urlType[type]}`;
}
