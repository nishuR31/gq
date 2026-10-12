import process from "node:process";
import { spawnSync } from "node:child_process";
import type { SearchType, SearchResponse } from "./types.js";
import { getEndpoint } from "./query.js";

export class GitHubApiError extends Error {
  statusCode?: number;
  isAuthRequired: boolean;
  rateLimitReset?: Date;

  constructor(message: string, statusCode?: number, isAuthRequired = false, rateLimitReset?: Date) {
    super(message);
    this.name = "GitHubApiError";
    this.statusCode = statusCode;
    this.isAuthRequired = isAuthRequired;
    this.rateLimitReset = rateLimitReset;
  }
}

let _ghAvailable: boolean | null = null;
let _ghTokenCached: string | null = null;

/**
 * Media type GitHub expects per search category. GitHub returns the first
 * media type it can satisfy, so we send exactly one instead of a comma list.
 * `text-match` is what makes code search return match fragments.
 */
function acceptHeader(type: SearchType): string {
  return type === "code"
    ? "application/vnd.github.text-match+json"
    : "application/vnd.github+json";
}

/** Check whether the `gh` CLI is available on PATH. */
export function hasGh(): boolean {
  if (_ghAvailable !== null) return _ghAvailable;
  try {
    const r = spawnSync("gh", ["--version"], { encoding: "utf-8", timeout: 3_000, stdio: "ignore" });
    _ghAvailable = r.status === 0;
  } catch {
    _ghAvailable = false;
  }
  return _ghAvailable;
}

/** Check whether `gh auth` has a valid token. */
export function isAuthenticated(): boolean {
  if (!hasGh()) return false;
  try {
    const r = spawnSync("gh", ["auth", "status"], { encoding: "utf-8", timeout: 3_000, stdio: "ignore" });
    return r.status === 0;
  } catch {
    return false;
  }
}

/**
 * Resolve an authentication token from:
 * 1. CLI option (`--token`)
 * 2. GITHUB_TOKEN environment variable
 * 3. GH_TOKEN environment variable
 * 4. `gh auth token` from gh CLI
 */
export function resolveToken(customToken?: string): string | undefined {
  if (customToken) return customToken;
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;

  if (_ghTokenCached !== null) return _ghTokenCached || undefined;

  if (hasGh()) {
    try {
      const res = spawnSync("gh", ["auth", "token"], {
        encoding: "utf-8",
        timeout: 3_000,
        stdio: ["ignore", "pipe", "ignore"],
      });
      if (res.status === 0 && res.stdout) {
        const tok = res.stdout.trim();
        if (tok) {
          _ghTokenCached = tok;
          return tok;
        }
      }
    } catch {
      // ignore
    }
  }

  _ghTokenCached = "";
  return undefined;
}

/**
 * Execute search via direct GitHub REST API using Node.js fetch.
 * Falls back to `gh api` if needed.
 */
export async function executeSearch(
  type: SearchType,
  query: string,
  limit: number,
  page: number,
  sort?: string,
  order?: string,
  customToken?: string,
): Promise<SearchResponse> {
  const token = resolveToken(customToken);
  const endpoint = getEndpoint(type);

  // Use direct HTTP fetch (fast, non-blocking, works everywhere without dependencies)
  const url = new URL(`https://api.github.com/${endpoint}`);
  url.searchParams.set("q", query);
  url.searchParams.set("per_page", String(Math.min(limit, 100)));
  url.searchParams.set("page", String(page));
  if (sort) url.searchParams.set("sort", sort);
  if (order) url.searchParams.set("order", order);

  // GitHub picks the first matched media type, so send exactly one per request:
  // text-match is required for code search snippets; everything else uses the
  // current stable JSON media type.
  const accept = acceptHeader(type);
  const headers: Record<string, string> = {
    "User-Agent": "gq/2.0.0",
    "Accept": accept,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (res.ok) {
      return (await res.json()) as SearchResponse;
    }

    if (res.status === 401) {
      throw new GitHubApiError(
        "Authentication required for this search. Provide a token via GITHUB_TOKEN or --token, or run 'gh auth login'.",
        401,
        true,
      );
    }

    if (res.status === 403) {
      const remaining = res.headers.get("x-ratelimit-remaining");
      const resetEpoch = res.headers.get("x-ratelimit-reset");
      if (remaining === "0" && resetEpoch) {
        const resetDate = new Date(parseInt(resetEpoch, 10) * 1000);
        const diffMinutes = Math.max(1, Math.ceil((resetDate.getTime() - Date.now()) / 60_000));
        throw new GitHubApiError(
          `GitHub API rate limit exceeded. Resets in ~${diffMinutes}m (${resetDate.toLocaleTimeString()}).\nPass --token or set GITHUB_TOKEN to get 5,000 requests/hr.`,
          403,
          false,
          resetDate,
        );
      }
      const data = await res.json().catch(() => ({})) as { message?: string };
      throw new GitHubApiError(data.message || "Forbidden (403)", 403);
    }

    if (res.status === 422) {
      const data = await res.json().catch(() => ({})) as { message?: string; errors?: Array<{ message?: string }> };
      const detail = data.errors?.map((e) => e.message).filter(Boolean).join("; ") || data.message || "Query validation failed";
      throw new GitHubApiError(
        `GitHub rejected the query (422 Unprocessable Entity): ${detail}\nQuery: ${query}`,
        422,
      );
    }

    const data = await res.json().catch(() => ({})) as { message?: string };
    throw new GitHubApiError(`GitHub API error (${res.status}): ${data.message || res.statusText}`, res.status);
  } catch (err) {
    if (err instanceof GitHubApiError) throw err;

    // If network fetch failed and gh CLI is available, try fallback to gh api
    if (hasGh() && isAuthenticated()) {
      return executeViaGhCli(type, query, limit, page, sort, order);
    }

    throw new Error(`Search request failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/** Fallback runner using `gh api` CLI if fetch encounters network error */
function executeViaGhCli(
  type: SearchType,
  query: string,
  limit: number,
  page: number,
  sort?: string,
  order?: string,
): SearchResponse {
  const endpoint = getEndpoint(type);
  const args: string[] = [
    "api", endpoint,
    "--method", "GET",
    "-f", `q=${query}`,
    "-f", `per_page=${Math.min(limit, 100)}`,
    "-f", `page=${page}`,
    "-H", `Accept: ${acceptHeader(type)}`,
    "-H", "X-GitHub-Api-Version: 2022-11-28",
  ];
  if (sort) args.push("-f", `sort=${sort}`);
  if (order) args.push("-f", `order=${order}`);

  const result = spawnSync("gh", args, {
    encoding: "utf-8",
    maxBuffer: 50 * 1024 * 1024,
    timeout: 30_000,
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    const msg = (result.stderr ?? "").trim();
    throw new Error(`gh api failed (exit ${result.status}): ${msg}`);
  }

  return JSON.parse(result.stdout) as SearchResponse;
}
