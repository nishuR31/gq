// ─── Search & Output ──────────────────────────────────────────────────────────

export type SearchType = "code" | "repo" | "issue" | "pr" | "commit" | "user" | "topic";
export type OutputFormat = "table" | "json" | "mini" | "full" | "urls";

// ─── Presets ──────────────────────────────────────────────────────────────────

export interface Preset {
  terms: string[];
  desc: string;
  lang?: string;
  type?: SearchType;
  category: string;
}

// ─── CLI Options ──────────────────────────────────────────────────────────────

export interface Options {
  // Actions
  help: boolean;
  version: boolean;
  listPresets: boolean;

  // Search type
  type: SearchType;

  // Search terms
  preset?: string;
  terms: string[];
  exact: string[];
  regex?: string;
  rawQuery?: string;
  not: string[];

  // Scope
  repo?: string;
  org?: string;
  user?: string;

  // Code qualifiers
  language?: string;
  path?: string;
  filename?: string;
  extension?: string;
  symbol?: string;
  excludePaths: string[];

  // Repo qualifiers
  stars?: string;
  forks?: string;
  repoSize?: string;
  license?: string;
  topics: string[];
  created?: string;
  pushed?: string;
  archived?: string;
  isFork?: string;

  // Issue / PR qualifiers
  state?: string;
  labels: string[];
  assignee?: string;
  author?: string;
  mentions?: string;
  milestone?: string;
  comments?: string;
  reactions?: string;
  updated?: string;

  // Commit qualifiers
  committer?: string;
  authorDate?: string;
  committerDate?: string;
  merge?: string;
  hash?: string;

  // Output
  format: OutputFormat;
  limit: number;
  page: number;
  sort?: string;
  order?: string;
  noColor: boolean;
  open: boolean;
  dryRun: boolean;
  urlOnly: boolean;
  count: boolean;
  token?: string;
}

// ─── GitHub API Responses ─────────────────────────────────────────────────────

export interface SearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: unknown[];
}

export interface CodeItem {
  name: string;
  path: string;
  sha: string;
  html_url: string;
  repository: { full_name: string; html_url: string; description?: string };
  text_matches?: { fragment: string; matches: { text: string; indices: number[] }[] }[];
}

export interface RepoItem {
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  license: { spdx_id: string } | null;
  topics: string[];
  updated_at: string;
  open_issues_count: number;
  archived: boolean;
  fork: boolean;
}

export interface IssueItem {
  number: number;
  title: string;
  state: string;
  html_url: string;
  user: { login: string };
  labels: { name: string; color: string }[];
  created_at: string;
  updated_at: string;
  comments: number;
  body: string | null;
  pull_request?: unknown;
}

export interface CommitItem {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name: string; date: string };
    committer: { name: string; date: string };
  };
  repository: { full_name: string };
}

export interface UserItem {
  login: string;
  html_url: string;
  type: string;
  avatar_url: string;
  score: number;
}
