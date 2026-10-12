#!/usr/bin/env bash
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  gq — Lightning-fast GitHub Search from the terminal                    ║
# ║  Bash companion to gq. Zero Node.js overhead.                      ║
# ╚═══════════════════════════════════════════════════════════════════════════╝
set -euo pipefail

VERSION="2.0.0"

# ─── Colors ────────────────────────────────────────────────────────────────────
if [[ -t 1 ]] && [[ -z "${NO_COLOR:-}" ]]; then
  B='\033[1m'; D='\033[2m'; U='\033[4m'; R='\033[0m'
  RED='\033[31m'; GRN='\033[32m'; YLW='\033[33m'; BLU='\033[34m'
  MAG='\033[35m'; CYN='\033[36m'; GRY='\033[90m'; WHT='\033[37m'
else
  B='' D='' U='' R=''
  RED='' GRN='' YLW='' BLU='' MAG='' CYN='' GRY='' WHT=''
fi

# ─── Presets (subset for quick bash access) ────────────────────────────────────
declare -A PRESET_TERMS=(
  [architecture]='"Repository" "Service" "Factory"'
  [microservices]='"service mesh" "circuit breaker" "service discovery"'
  [resilience]='"AbortSignal" "timeout" "retry"'
  [circuit-breaker]='"circuit breaker" "CircuitBreaker" "half-open"'
  [rate-limit]='"rate limit" "throttle" "token bucket"'
  [backoff]='"exponential backoff" "jitter" "retryDelay"'
  [database]='"transaction" "idempotency" "migration"'
  [caching]='"cache" "Redis" "TTL" "invalidate"'
  [prisma]='"prisma" "$transaction" "findUnique" "PrismaClient"'
  [queues]='"attempts" "backoff" "dead letter" "BullMQ"'
  [events]='"EventEmitter" "publish" "subscribe" "EventBus"'
  [kafka]='"Kafka" "consumer group" "offset" "partition"'
  [websocket]='"WebSocket" "socket.io" "wss://"'
  [auth]='"authorize" "tenantId" "JWT"'
  [oauth]='"OAuth" "access_token" "refresh_token"'
  [security]='"XSS" "CSRF" "sanitize" "Content-Security-Policy"'
  [encryption]='"encrypt" "decrypt" "AES" "crypto"'
  [rbac]='"role" "permission" "hasPermission" "canAccess"'
  [testing]='"rejects" "toHaveBeenCalled" "mock"'
  [e2e]='"playwright" "cypress" "puppeteer"'
  [docker]='"Dockerfile" "docker-compose" "container"'
  [kubernetes]='"apiVersion" "kind: Deployment" "spec:"'
  [cicd]='"github-actions" "pipeline" "deploy"'
  [terraform]='"resource" "provider" "module" "terraform"'
  [api]='"endpoint" "middleware" "router"'
  [graphql]='"resolver" "typeDefs" "mutation" "subscription"'
  [rest]='"@Get" "@Post" "@Controller" "OpenAPI"'
  [grpc]='"protobuf" "gRPC" "service"'
  [logging]='"winston" "pino" "logger" "log level"'
  [monitoring]='"prometheus" "metric" "histogram" "counter"'
  [tracing]='"opentelemetry" "trace" "span"'
  [performance]='"lazy" "memoize" "debounce" "cache"'
  [concurrency]='"Promise.all" "worker_threads" "mutex"'
  [react]='"useState" "useEffect" "useCallback" "useMemo"'
  [nextjs]='"getServerSideProps" "getStaticProps" "App Router"'
  [state]='"Redux" "Zustand" "createStore" "useSelector"'
  [errors]='"ErrorBoundary" "AppError" "custom error"'
  [validation]='"zod" "yup" "schema" "validate"'
  [ddd]='"aggregate" "value object" "domain event"'
  [cqrs]='"command handler" "query handler" "event sourcing"'
  [clean]='"use case" "interactor" "presenter" "gateway"'
  [llm]='"prompt" "completion" "embedding" "ChatCompletion"'
  [rag]='"retrieval" "vector" "embedding" "chunk"'
)

declare -A PRESET_DESC=(
  [architecture]="Software architecture patterns"
  [microservices]="Microservices architecture"
  [resilience]="Resilience (abort, timeout, retry)"
  [circuit-breaker]="Circuit breaker implementations"
  [rate-limit]="Rate limiting and throttling"
  [backoff]="Backoff and retry strategies"
  [database]="Database patterns"
  [caching]="Caching strategies"
  [prisma]="Prisma ORM patterns"
  [queues]="Message queue patterns"
  [events]="Event-driven architecture"
  [kafka]="Kafka / event streaming"
  [websocket]="WebSocket / real-time"
  [auth]="Authentication & authorization"
  [oauth]="OAuth 2.0 flows"
  [security]="Web security patterns"
  [encryption]="Encryption & cryptography"
  [rbac]="Role-based access control"
  [testing]="Testing patterns"
  [e2e]="End-to-end testing"
  [docker]="Docker & containerisation"
  [kubernetes]="Kubernetes manifests"
  [cicd]="CI/CD pipelines"
  [terraform]="Terraform / IaC"
  [api]="API design patterns"
  [graphql]="GraphQL implementation"
  [rest]="RESTful API patterns"
  [grpc]="gRPC & Protobuf"
  [logging]="Logging frameworks"
  [monitoring]="Monitoring & metrics"
  [tracing]="Distributed tracing"
  [performance]="Performance optimisation"
  [concurrency]="Concurrency & parallelism"
  [react]="React hooks & patterns"
  [nextjs]="Next.js framework"
  [state]="State management"
  [errors]="Error handling"
  [validation]="Input validation"
  [ddd]="Domain-Driven Design"
  [cqrs]="CQRS & Event Sourcing"
  [clean]="Clean / Hexagonal Architecture"
  [llm]="LLM / AI integration"
  [rag]="RAG (Retrieval-Augmented Generation)"
)

# ─── Usage ─────────────────────────────────────────────────────────────────────
usage() {
  cat <<EOF

${B}gq${R} ${D}v${VERSION}${R} — ${CYN}Lightning-fast GitHub Search${R}

${B}${CYN}USAGE${R}
  gq <terms>                          Quick code search
  gq <terms> --lang <language>        Code search + language
  gq -t repo <terms> --stars ">100"   Repo search
  gq -t issue <terms> --repo o/r      Issue search
  gq -p <preset> [options]            Preset search

${B}${CYN}OPTIONS${R}
  -t <type>       Search type: code repo issue pr commit user topic
  -p <preset>     Use a preset (use --presets to list)
  -l <lang>       Language filter
  -r <owner/repo> Repo scope
  -o <org>        Org scope
  -u <user>       User scope
  -n <limit>      Max results (default 10)
  -f <format>     json, mini, table (default)
  --stars <range> Star count filter (repo search)
  --state <state> Issue/PR state
  --label <name>  Issue/PR label
  --author <user> Issue/PR/commit author
  --sort <field>  Sort by field
  --order <dir>   asc or desc
  --path <path>   Path filter
  --ext <ext>     Extension filter
  --not <terms>   Exclude terms
  --dry           Show query only
  --url           Print URL only
  --count         Show total count only
  --token <token> GitHub personal access token (or set GITHUB_TOKEN)
  --open          Open in browser
  --presets       List available presets
  -h, --help      Show this help
  -V              Version

${B}${CYN}EXAMPLES${R}
  ${D}# Quick search${R}
  gq "circuit breaker" -l TypeScript

  ${D}# Popular repos${R}
  gq -t repo "web framework" -l Rust --stars ">500" --sort stars

  ${D}# Open issues${R}
  gq -t issue "bug" -r facebook/react --state open --label bug

  ${D}# Preset search${R}
  gq -p resilience -l TypeScript

  ${D}# JSON output for scripting${R}
  gq -p auth -l Go -f json -n 20

  ${D}# Count results${R}
  gq "TODO" -r owner/repo --count

  ${D}# Pipe to fzf${R}
  gq -t repo "cli" -l Go -f mini | fzf

  ${D}# Pipe URLs to browser${R}
  gq -p security -l Python -f json | jq -r '.items[].html_url'

EOF
}

# ─── Helpers ───────────────────────────────────────────────────────────────────
die()  { echo -e "${RED}✖${R} $*" >&2; exit 1; }
warn() { echo -e "${YLW}⚠${R} $*" >&2; }

# Percent-encode a value for a URL query string. Never interpolates the value
# into code: jq reads it on stdin, or python3 receives it as an argv element.
urlencode() {
  if command -v jq &>/dev/null; then
    printf '%s' "$1" | jq -sRr @uri
  else
    python3 -c 'import sys, urllib.parse; sys.stdout.write(urllib.parse.quote(sys.argv[1]))' "$1"
  fi
}

# Open a URL in the platform default browser (best effort, detached).
open_url() {
  if command -v xdg-open &>/dev/null; then xdg-open "$1" &>/dev/null &
  elif command -v open &>/dev/null; then open "$1" &>/dev/null &
  elif command -v cygstart &>/dev/null; then cygstart "$1" &>/dev/null &
  fi
}

resolve_token() {
  if [[ -n "${TOKEN:-}" ]]; then
    echo "$TOKEN"
    return
  fi
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    echo "$GITHUB_TOKEN"
    return
  fi
  if [[ -n "${GH_TOKEN:-}" ]]; then
    echo "$GH_TOKEN"
    return
  fi
  if command -v gh &>/dev/null; then
    local tok
    tok="$(gh auth token 2>/dev/null || true)"
    if [[ -n "$tok" ]]; then
      echo "$tok"
      return
    fi
  fi
  echo ""
}

fmtnum() {
  awk -v n="$1" 'BEGIN {
    if (n >= 1000000) printf "%.1fM", n / 1000000;
    else if (n >= 1000) printf "%.1fk", n / 1000;
    else printf "%d", n;
  }'
}

list_presets() {
  echo ""
  echo -e "  ${B}${CYN}📚 Available Presets${R}"
  echo -e "  ${D}────────────────────────────────────────────────${R}"
  echo ""
  for key in $(echo "${!PRESET_DESC[@]}" | tr ' ' '\n' | sort); do
    printf "  ${CYN}%-20s${R} ${D}%s${R}\n" "$key" "${PRESET_DESC[$key]}"
  done
  echo ""
}

# ─── Parse Args ────────────────────────────────────────────────────────────────
TYPE="code"
PRESET=""
TERMS=""
LANG=""
REPO=""
ORG=""
USER_SCOPE=""
LIMIT=10
TOKEN=""
FORMAT="table"
SORT=""
ORDER=""
DRY=0
URL_ONLY=0
COUNT_ONLY=0
OPEN=0
EXTRA_QUALIFIERS=""

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -h|--help)     usage; exit 0 ;;
      -V|--version)  echo "gq v${VERSION}"; exit 0 ;;
      --presets)     list_presets; exit 0 ;;
      -t)            TYPE="${2:?Missing type}"; shift ;;
      -p)            PRESET="${2:?Missing preset}"; shift ;;
      -l|--lang)     LANG="${2:?Missing language}"; shift ;;
      -r|--repo)     REPO="${2:?Missing repo}"; shift ;;
      -o|--org)      ORG="${2:?Missing org}"; shift ;;
      -u|--user)     USER_SCOPE="${2:?Missing user}"; shift ;;
      -n|--limit)    LIMIT="${2:?Missing limit}"; shift ;;
      -f|--format)   FORMAT="${2:?Missing format}"; shift ;;
      --sort)        SORT="${2:?Missing sort}"; shift ;;
      --order)       ORDER="${2:?Missing order}"; shift ;;
      --stars)       EXTRA_QUALIFIERS+=" stars:${2:?Missing value}"; shift ;;
      --forks)       EXTRA_QUALIFIERS+=" forks:${2:?Missing value}"; shift ;;
      --state)       EXTRA_QUALIFIERS+=" state:${2:?Missing value}"; shift ;;
      --label)       EXTRA_QUALIFIERS+=" label:\"${2:?Missing value}\""; shift ;;
      --author)      EXTRA_QUALIFIERS+=" author:${2:?Missing value}"; shift ;;
      --assignee)    EXTRA_QUALIFIERS+=" assignee:${2:?Missing value}"; shift ;;
      --path)        EXTRA_QUALIFIERS+=" path:${2:?Missing value}"; shift ;;
      --ext)         EXTRA_QUALIFIERS+=" extension:${2:?Missing value}"; shift ;;
      --filename)    EXTRA_QUALIFIERS+=" filename:${2:?Missing value}"; shift ;;
      --symbol)      EXTRA_QUALIFIERS+=" symbol:${2:?Missing value}"; shift ;;
      --topic)       EXTRA_QUALIFIERS+=" topic:${2:?Missing value}"; shift ;;
      --license)     EXTRA_QUALIFIERS+=" license:${2:?Missing value}"; shift ;;
      --created)     EXTRA_QUALIFIERS+=" created:${2:?Missing value}"; shift ;;
      --pushed)      EXTRA_QUALIFIERS+=" pushed:${2:?Missing value}"; shift ;;
      --archived)    EXTRA_QUALIFIERS+=" archived:${2:?Missing value}"; shift ;;
      --fork)        EXTRA_QUALIFIERS+=" fork:${2:?Missing value}"; shift ;;
      --comments)    EXTRA_QUALIFIERS+=" comments:${2:?Missing value}"; shift ;;
      --updated)     EXTRA_QUALIFIERS+=" updated:${2:?Missing value}"; shift ;;
      --not)         TERMS+=" NOT \"$2\""; shift ;;
      --dry)         DRY=1 ;;
      --url)         URL_ONLY=1 ;;
      --count)       COUNT_ONLY=1 ;;
      --token)       TOKEN="${2:?Missing token}"; shift ;;
      --open)        OPEN=1 ;;
      --no-color)    B='' D='' U='' R='' RED='' GRN='' YLW='' BLU='' MAG='' CYN='' GRY='' WHT='' ;;
      -*)            die "Unknown option: $1. Use gq --help." ;;
      *)             TERMS+=" $1" ;;
    esac
    shift
  done
}

# ─── Build Query ───────────────────────────────────────────────────────────────
build_query() {
  local query=""

  # Preset terms
  if [[ -n "$PRESET" ]]; then
    if [[ -z "${PRESET_TERMS[$PRESET]+x}" ]]; then
      die "Unknown preset \"$PRESET\". Use gq --presets to list."
    fi
    query="${PRESET_TERMS[$PRESET]}"
  fi

  # User terms
  query+="${TERMS}"

  # Type qualifiers
  case "$TYPE" in
    issue) query+=" is:issue" ;;
    pr)    query+=" is:pull-request" ;;
  esac

  # Scope
  [[ -n "$REPO" ]]       && query+=" repo:${REPO}"
  [[ -n "$ORG" ]]        && query+=" org:${ORG}"
  [[ -n "$USER_SCOPE" ]] && query+=" user:${USER_SCOPE}"
  [[ -n "$LANG" ]]       && query+=" language:${LANG}"

  # Extra qualifiers
  query+="${EXTRA_QUALIFIERS}"

  # Trim whitespace
  query="$(echo "$query" | sed 's/^ *//;s/ *$//')"

  if [[ -z "$query" ]]; then
    die "No search terms. Provide terms or use -p <preset>."
  fi

  echo "$query"
}

# ─── Get endpoint ─────────────────────────────────────────────────────────────
get_endpoint() {
  case "$TYPE" in
    code)   echo "search/code" ;;
    repo)   echo "search/repositories" ;;
    issue|pr) echo "search/issues" ;;
    commit) echo "search/commits" ;;
    user)   echo "search/users" ;;
    topic)  echo "search/topics" ;;
    *)      die "Unknown type: $TYPE" ;;
  esac
}

get_url_type() {
  case "$TYPE" in
    code)   echo "code" ;;
    repo)   echo "repositories" ;;
    issue)  echo "issues" ;;
    pr)     echo "pullrequests" ;;
    commit) echo "commits" ;;
    user)   echo "users" ;;
    topic)  echo "topics" ;;
  esac
}

# ─── Format Results ───────────────────────────────────────────────────────────
format_code() {
  local json="$1"
  if [[ "$FORMAT" == "mini" ]]; then
    echo "$json" | jq -r '.items[] | "\(.repository.full_name)/\(.path)"'
  elif [[ "$FORMAT" == "json" ]]; then
    echo "$json" | jq .
  else
    echo -e "  ${D}$(printf '%-30s  %-50s' 'REPOSITORY' 'PATH')${R}"
    echo -e "  ${D}$(printf '%-30s  %-50s' '──────────────────────────────' '──────────────────────────────────────────────────')${R}"
    echo "$json" | jq -r '.items[] | "\(.repository.full_name)\t\(.path)"' | while IFS=$'\t' read -r repo path; do
      printf "  ${CYN}%-30s${R}  ${WHT}%s${R}\n" "$repo" "$path"
    done
  fi
}

format_repos() {
  local json="$1"
  if [[ "$FORMAT" == "mini" ]]; then
    echo "$json" | jq -r '.items[].full_name'
  elif [[ "$FORMAT" == "json" ]]; then
    echo "$json" | jq .
  else
    echo -e "  ${D}$(printf '%-30s  %-8s  %-8s  %-12s  %s' 'REPOSITORY' '★ STARS' 'FORKS' 'LANGUAGE' 'DESCRIPTION')${R}"
    echo -e "  ${D}$(printf '%-30s  %-8s  %-8s  %-12s  %s' '──────────────────────────────' '────────' '────────' '────────────' '───────────────────────────────')${R}"
    echo "$json" | jq -r '.items[] | "\(.full_name)\t\(.stargazers_count)\t\(.forks_count)\t\(.language // "—")\t\(.description // "" | .[0:50])"' | while IFS=$'\t' read -r name stars forks lang desc; do
      printf "  ${CYN}%-30s${R}  ${YLW}%-8s${R}  ${D}%-8s${R}  %-12s  ${D}%s${R}\n" "$name" "$stars" "$forks" "$lang" "$desc"
    done
  fi
}

format_issues() {
  local json="$1"
  if [[ "$FORMAT" == "mini" ]]; then
    echo "$json" | jq -r '.items[] | "#\(.number) \(.title)"'
  elif [[ "$FORMAT" == "json" ]]; then
    echo "$json" | jq .
  else
    echo -e "  ${D}$(printf '%-8s  %-50s  %-8s  %-14s' '#' 'TITLE' 'STATE' 'AUTHOR')${R}"
    echo -e "  ${D}$(printf '%-8s  %-50s  %-8s  %-14s' '────────' '──────────────────────────────────────────────────' '────────' '──────────────')${R}"
    echo "$json" | jq -r '.items[] | "#\(.number)\t\(.title | .[0:50])\t\(.state)\t\(.user.login)"' | while IFS=$'\t' read -r num title state author; do
      local sc="${GRY}"
      [[ "$state" == "open" ]] && sc="${GRN}"
      [[ "$state" == "closed" ]] && sc="${RED}"
      printf "  ${D}%-8s${R}  %-50s  ${sc}%-8s${R}  ${CYN}%-14s${R}\n" "$num" "$title" "$state" "$author"
    done
  fi
}

format_commits() {
  local json="$1"
  if [[ "$FORMAT" == "mini" ]]; then
    echo "$json" | jq -r '.items[] | "\(.sha[0:7]) \(.commit.message | split("\n")[0] | .[0:80])"'
  elif [[ "$FORMAT" == "json" ]]; then
    echo "$json" | jq .
  else
    echo -e "  ${D}$(printf '%-10s  %-28s  %-16s  %s' 'SHA' 'REPOSITORY' 'AUTHOR' 'MESSAGE')${R}"
    echo -e "  ${D}$(printf '%-10s  %-28s  %-16s  %s' '──────────' '────────────────────────────' '────────────────' '──────────────────────────────')${R}"
    echo "$json" | jq -r '.items[] | "\(.sha[0:7])\t\(.repository.full_name)\t\(.commit.author.name | .[0:16])\t\(.commit.message | split("\n")[0] | .[0:60])"' | while IFS=$'\t' read -r sha repo author msg; do
      printf "  ${YLW}%-10s${R}  ${CYN}%-28s${R}  %-16s  ${D}%s${R}\n" "$sha" "$repo" "$author" "$msg"
    done
  fi
}

format_users() {
  local json="$1"
  if [[ "$FORMAT" == "mini" ]]; then
    echo "$json" | jq -r '.items[].login'
  elif [[ "$FORMAT" == "json" ]]; then
    echo "$json" | jq .
  else
    echo -e "  ${D}$(printf '%-24s  %-16s  %s' 'LOGIN' 'TYPE' 'URL')${R}"
    echo -e "  ${D}$(printf '%-24s  %-16s  %s' '────────────────────────' '────────────────' '────────────────────────────────')${R}"
    echo "$json" | jq -r '.items[] | "\(.login)\t\(.type)\t\(.html_url)"' | while IFS=$'\t' read -r login type url; do
      printf "  ${CYN}%-24s${R}  %-16s  ${D}%s${R}\n" "$login" "$type" "$url"
    done
  fi
}

format_topics() {
  local json="$1"
  if [[ "$FORMAT" == "mini" ]]; then
    echo "$json" | jq -r '.items[].name'
  elif [[ "$FORMAT" == "json" ]]; then
    echo "$json" | jq .
  else
    echo -e "  ${D}$(printf '%-24s  %-24s  %s' 'TOPIC' 'DISPLAY NAME' 'DESCRIPTION')${R}"
    echo -e "  ${D}$(printf '%-24s  %-24s  %s' '────────────────────────' '────────────────────────' '───────────────────────────────')${R}"
    echo "$json" | jq -r '.items[] | "\(.name)\t\(.display_name // "—")\t\(.short_description // "" | .[0:50])"' | while IFS=$'\t' read -r name disp desc; do
      printf "  ${CYN}%-24s${R}  %-24s  ${D}%s${R}\n" "$name" "$disp" "$desc"
    done
  fi
}

format_results() {
  local json="$1"
  local total
  total=$(echo "$json" | jq '.total_count')
  local count
  count=$(echo "$json" | jq '.items | length')

  if [[ "$FORMAT" == "json" ]]; then
    echo "$json" | jq .
    return
  fi

  echo ""
  echo -e "  ${B}${CYN}⚡ GitHub ${TYPE^^} Search${R}"
  echo -e "  ${D}────────────────────────────────────────────────${R}"
  echo -e "  ${B}Query${R}  ${YLW}${QUERY}${R}"
  echo -e "  ${B}URL${R}    ${D}${SEARCH_URL}${R}"
  echo ""
  echo -e "  ${D}Showing ${B}${WHT}${count}${R}${D} of ${B}${WHT}$(fmtnum "$total")${R}${D} results${R}"
  echo ""

  if (( count == 0 )); then
    echo -e "  ${YLW}No results found.${R}"
    echo ""
    return
  fi

  case "$TYPE" in
    code)        format_code "$json" ;;
    repo)        format_repos "$json" ;;
    issue|pr)    format_issues "$json" ;;
    commit)      format_commits "$json" ;;
    user)        format_users "$json" ;;
    topic)       format_topics "$json" ;;
    *)           echo "$json" | jq '.items' ;;
  esac
  echo ""
}

# ─── Main ──────────────────────────────────────────────────────────────────────
main() {
  parse_args "$@"

  QUERY="$(build_query)"
  ENDPOINT="$(get_endpoint)"
  URL_TYPE="$(get_url_type)"
  SEARCH_URL="https://github.com/search?q=$(urlencode "$QUERY")&type=${URL_TYPE}"

  # URL only
  if (( URL_ONLY )); then
    echo "$SEARCH_URL"
    (( OPEN )) && open_url "$SEARCH_URL"
    exit 0
  fi

  # Dry run
  if (( DRY )); then
    echo ""
    echo -e "  ${B}${CYN}⚡ GitHub ${TYPE^^} Search${R} ${D}(dry run)${R}"
    echo -e "  ${D}────────────────────────────────────────────────${R}"
    echo -e "  ${B}Query${R}  ${YLW}${QUERY}${R}"
    echo -e "  ${B}URL${R}    ${D}${SEARCH_URL}${R}"
    echo ""
    (( OPEN )) && open_url "$SEARCH_URL"
    exit 0
  fi

  local auth_token
  auth_token="$(resolve_token)"

  # If code search without auth, give helpful guidance
  if [[ "$TYPE" == "code" ]] && [[ -z "$auth_token" ]]; then
    echo -e "  ${YLW}⚠${R}  ${B}Code search requires authentication${R}" >&2
    echo -e "     Provide a token via: ${CYN}--token <token>${R} or ${CYN}export GITHUB_TOKEN=...${R}" >&2
    echo -e "     Or authenticate via GitHub CLI: ${CYN}gh auth login${R}" >&2
    echo "" >&2
    echo -e "  ${B}${CYN}⚡ GitHub CODE Search${R}"
    echo -e "  ${D}────────────────────────────────────────────────${R}"
    echo -e "  ${B}Query${R}  ${YLW}${QUERY}${R}"
    echo -e "  ${B}URL${R}    ${D}${SEARCH_URL}${R}"
    echo ""
    (( OPEN )) && open_url "$SEARCH_URL"
    exit 0
  fi

  # Execute search via curl (fast) or gh CLI
  local result
  if command -v curl &>/dev/null; then
    # GitHub returns the first media type it can satisfy, so send exactly one.
    local accept="application/vnd.github+json"
    [[ "$TYPE" == "code" ]] && accept="application/vnd.github.text-match+json"
    local -a curl_headers=(
      "-H" "User-Agent: gq/2.0.0"
      "-H" "Accept: ${accept}"
      "-H" "X-GitHub-Api-Version: 2022-11-28"
    )

    local encoded_q
    encoded_q="$(urlencode "$QUERY")"
    local api_url="https://api.github.com/${ENDPOINT}?q=${encoded_q}&per_page=${LIMIT}"
    [[ -n "$SORT" ]]  && api_url+="&sort=${SORT}"
    [[ -n "$ORDER" ]] && api_url+="&order=${ORDER}"

    # Send the token through curl's stdin config so it never appears in `ps`,
    # and avoid -L: following redirects can leak the Authorization header to
    # another host.
    if [[ -n "$auth_token" ]]; then
      result=$(printf 'header = "Authorization: Bearer %s"\n' "$auth_token" \
        | curl -sS -K - "${curl_headers[@]}" "$api_url")
    else
      result=$(curl -sS "${curl_headers[@]}" "$api_url")
    fi
  elif command -v gh &>/dev/null; then
    local gh_accept="application/vnd.github+json"
    [[ "$TYPE" == "code" ]] && gh_accept="application/vnd.github.text-match+json"
    local -a api_args=("api" "$ENDPOINT" "--method" "GET"
      "-f" "q=${QUERY}"
      "-f" "per_page=${LIMIT}"
      "-H" "Accept: ${gh_accept}"
      "-H" "X-GitHub-Api-Version: 2022-11-28"
    )
    [[ -n "$SORT" ]]  && api_args+=("-f" "sort=${SORT}")
    [[ -n "$ORDER" ]] && api_args+=("-f" "order=${ORDER}")
    result=$(gh "${api_args[@]}" 2>&1) || die "gh api failed: ${result}"
  else
    die "Neither curl nor gh CLI found. Please install curl."
  fi

  # Check if response has errors
  if echo "$result" | jq -e '.message' &>/dev/null && ! echo "$result" | jq -e '.total_count' &>/dev/null; then
    local msg
    msg=$(echo "$result" | jq -r '.message // "API request failed"')
    local err_detail
    err_detail=$(echo "$result" | jq -r '.errors[0].message // ""')
    [[ -n "$err_detail" ]] && msg="${msg}: ${err_detail}"
    die "GitHub API error: ${msg}\nQuery: ${QUERY}"
  fi

  # Count only
  if (( COUNT_ONLY )); then
    echo "$result" | jq '.total_count'
    exit 0
  fi

  # Format
  format_results "$result"

  (( OPEN )) && open_url "$SEARCH_URL"
}

main "$@"
