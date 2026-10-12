import type { Preset } from "./types.js";

export const PRESETS: Record<string, Preset> = {
  // ── Architecture & Design Patterns ──────────────────────────────────────────
  architecture: {
    terms: ['"Repository"', '"Service"', '"Controller"', '"Middleware"', '"Factory"'],
    desc: "Layered architecture building blocks (Repository, Service, Controller)",
    category: "Architecture",
  },
  microservices: {
    terms: ['"service mesh"', '"circuit breaker"', '"service discovery"', '"saga"'],
    desc: "Microservices architecture patterns",
    category: "Architecture",
  },
  ddd: {
    terms: ['"aggregate"', '"value object"', '"domain event"', '"bounded context"'],
    desc: "Domain-Driven Design patterns",
    category: "Architecture",
  },
  cqrs: {
    terms: ['"command handler"', '"query handler"', '"event sourcing"', '"projection"'],
    desc: "CQRS and Event Sourcing",
    category: "Architecture",
  },
  clean: {
    terms: ['"use case"', '"interactor"', '"presenter"', '"gateway"'],
    desc: "Clean / Hexagonal architecture",
    category: "Architecture",
  },
  hexagonal: {
    terms: ['"adapter"', '"port"', '"driving"', '"driven"'],
    desc: "Ports and adapters (hexagonal) architecture",
    category: "Architecture",
  },
  "design-patterns": {
    terms: ['"singleton"', '"observer"', '"strategy"', '"decorator"'],
    desc: "Classic design patterns",
    category: "Architecture",
  },
  monorepo: {
    terms: ['"workspace"', '"turborepo"', '"lerna"', '"pnpm-workspace"'],
    desc: "Monorepo tooling patterns",
    category: "Architecture",
  },
  serverless: {
    terms: ['"lambda"', '"serverless"', '"cold start"', '"handler"'],
    desc: "Serverless architecture",
    category: "Architecture",
  },
  "feature-flags": {
    terms: ['"feature flag"', '"launchdarkly"', '"unleash"', '"rollout"'],
    desc: "Feature flags and progressive rollout",
    category: "Architecture",
  },

  // ── Resilience & Reliability ────────────────────────────────────────────────
  resilience: {
    terms: ['"AbortSignal"', '"timeout"', '"retry"', '"fallback"'],
    desc: "Resilience patterns (abort, timeout, retry, fallback)",
    category: "Resilience",
  },
  "circuit-breaker": {
    terms: ['"circuit breaker"', '"CircuitBreaker"', '"half-open"', '"fallback"'],
    desc: "Circuit breaker implementations",
    category: "Resilience",
  },
  "rate-limit": {
    terms: ['"rate limit"', '"throttle"', '"token bucket"', '"sliding window"'],
    desc: "Rate limiting and throttling",
    category: "Resilience",
  },
  backoff: {
    terms: ['"exponential backoff"', '"jitter"', '"retryDelay"'],
    desc: "Backoff and retry strategies",
    category: "Resilience",
  },
  bulkhead: {
    terms: ['"bulkhead"', '"isolation"', '"semaphore"', '"concurrency limit"'],
    desc: "Bulkhead / isolation patterns",
    category: "Resilience",
  },
  idempotency: {
    terms: ['"idempotency"', '"idempotencyKey"', '"dedupe"', '"exactly-once"'],
    desc: "Idempotency and exactly-once handling",
    category: "Resilience",
  },
  "graceful-shutdown": {
    terms: ['"SIGTERM"', '"graceful shutdown"', '"drain"', '"shutdown"'],
    desc: "Graceful shutdown and connection draining",
    category: "Resilience",
  },
  "health-check": {
    terms: ['"healthcheck"', '"readiness"', '"liveness"', '"/health"'],
    desc: "Health, readiness and liveness probes",
    category: "Resilience",
  },
  "dead-letter": {
    terms: ['"dead letter"', '"DLQ"', '"poison"', '"requeue"'],
    desc: "Dead letter queue handling",
    category: "Resilience",
  },
  chaos: {
    terms: ['"chaos"', '"fault injection"', '"toxiproxy"', '"chaosmonkey"'],
    desc: "Chaos engineering and fault injection",
    category: "Resilience",
  },

  // ── Database ────────────────────────────────────────────────────────────────
  database: {
    terms: ['"transaction"', '"idempotency"', '"migration"', '"schema"'],
    desc: "Database patterns (transactions, idempotency, migrations)",
    category: "Database",
  },
  orm: {
    terms: ['"@Entity"', '"@Column"', '"findOne"', '"createQueryBuilder"'],
    desc: "ORM patterns (TypeORM, Prisma, Sequelize)",
    category: "Database",
  },
  migration: {
    terms: ['"createTable"', '"addColumn"', '"migrate"', '"knex"'],
    desc: "Database migration patterns",
    category: "Database",
  },
  caching: {
    terms: ['"cache"', '"Redis"', '"TTL"', '"invalidate"'],
    desc: "Caching patterns and strategies",
    category: "Database",
  },
  prisma: {
    terms: ['"prisma"', '"$transaction"', '"findUnique"', '"PrismaClient"'],
    desc: "Prisma ORM patterns",
    category: "Database",
  },
  postgres: {
    terms: ['"postgres"', '"plpgsql"', '"jsonb"', '"pg"'],
    desc: "PostgreSQL patterns",
    lang: "SQL",
    category: "Database",
  },
  mongodb: {
    terms: ['"mongoose"', '"aggregate"', '"ObjectId"', '"collection"'],
    desc: "MongoDB / Mongoose patterns",
    category: "Database",
  },
  "query-optimization": {
    terms: ['"N+1"', '"eager loading"', '"query plan"', '"index"'],
    desc: "Query optimisation (N+1, eager loading, indexes)",
    category: "Database",
  },
  locking: {
    terms: ['"optimistic lock"', '"pessimistic lock"', '"SELECT FOR UPDATE"', '"version"'],
    desc: "Optimistic and pessimistic locking",
    category: "Database",
  },
  "connection-pool": {
    terms: ['"connection pool"', '"PgBouncer"', '"maxConnections"', '"pool"'],
    desc: "Connection pooling",
    category: "Database",
  },
  sharding: {
    terms: ['"shard"', '"partition"', '"replica"', '"routing"'],
    desc: "Sharding, partitioning and replicas",
    category: "Database",
  },

  // ── Messaging & Events ──────────────────────────────────────────────────────
  queues: {
    terms: ['"attempts"', '"backoff"', '"dead letter"', '"BullMQ"'],
    desc: "Message queue patterns",
    category: "Messaging",
  },
  events: {
    terms: ['"EventEmitter"', '"publish"', '"subscribe"', '"EventBus"'],
    desc: "Event-driven architecture",
    category: "Messaging",
  },
  kafka: {
    terms: ['"Kafka"', '"consumer group"', '"offset"', '"partition"'],
    desc: "Kafka / event streaming",
    category: "Messaging",
  },
  rabbitmq: {
    terms: ['"amqp"', '"RabbitMQ"', '"exchange"', '"routing key"'],
    desc: "RabbitMQ / AMQP messaging",
    category: "Messaging",
  },
  websocket: {
    terms: ['"WebSocket"', '"socket.io"', '"wss://"', '"onmessage"'],
    desc: "WebSocket / real-time communication",
    category: "Messaging",
  },
  "server-sent-events": {
    terms: ['"text/event-stream"', '"EventSource"', '"server-sent"', '"SSE"'],
    desc: "Server-Sent Events (SSE)",
    category: "Messaging",
  },
  pubsub: {
    terms: ['"pubsub"', '"topic"', '"subscription"', '"publish"'],
    desc: "Publish/subscribe patterns",
    category: "Messaging",
  },
  sqs: {
    terms: ['"SQS"', '"visibility timeout"', '"MessageId"', '"QueueUrl"'],
    desc: "AWS SQS patterns",
    category: "Messaging",
  },

  // ── Auth & Security ─────────────────────────────────────────────────────────
  auth: {
    terms: ['"authorize"', '"tenantId"', '"JWT"', '"session"'],
    desc: "Authentication and authorization",
    category: "Security",
  },
  oauth: {
    terms: ['"OAuth"', '"access_token"', '"refresh_token"', '"authorization_code"'],
    desc: "OAuth 2.0 flows",
    category: "Security",
  },
  jwt: {
    terms: ['"jsonwebtoken"', '"jwt.verify"', '"jwt.sign"', '"bearer"'],
    desc: "JWT issuing and verification",
    category: "Security",
  },
  security: {
    terms: ['"XSS"', '"CSRF"', '"sanitize"', '"Content-Security-Policy"'],
    desc: "Web security patterns",
    category: "Security",
  },
  cors: {
    terms: ['"cors"', '"Access-Control-Allow-Origin"', '"preflight"', '"OPTIONS"'],
    desc: "CORS configuration",
    category: "Security",
  },
  encryption: {
    terms: ['"encrypt"', '"decrypt"', '"AES"', '"crypto"'],
    desc: "Encryption and cryptography",
    category: "Security",
  },
  rbac: {
    terms: ['"role"', '"permission"', '"hasPermission"', '"canAccess"'],
    desc: "Role-based access control",
    category: "Security",
  },
  session: {
    terms: ['"session"', '"cookie"', '"SameSite"', '"HttpOnly"'],
    desc: "Session and cookie handling",
    category: "Security",
  },
  secrets: {
    terms: ['"dotenv"', '"process.env"', '"vault"', '"secret"'],
    desc: "Secret and environment management",
    category: "Security",
  },
  sso: {
    terms: ['"SAML"', '"SSO"', '"IdP"', '"assertion"'],
    desc: "SSO / SAML integration",
    category: "Security",
  },
  mtls: {
    terms: ['"mTLS"', '"client certificate"', '"handshake"', '"TLS"'],
    desc: "Mutual TLS and certificates",
    category: "Security",
  },

  // ── Testing ─────────────────────────────────────────────────────────────────
  testing: {
    terms: ['"rejects"', '"toHaveBeenCalled"', '"mock"', '"expect"'],
    desc: "Testing patterns (mocking, assertions)",
    category: "Testing",
  },
  "unit-test": {
    terms: ['"describe"', '"beforeEach"', '"jest"', '"vitest"'],
    desc: "Unit test structure",
    category: "Testing",
  },
  e2e: {
    terms: ['"playwright"', '"cypress"', '"puppeteer"', '"browser"'],
    desc: "End-to-end testing",
    category: "Testing",
  },
  snapshot: {
    terms: ['"toMatchSnapshot"', '"toMatchInlineSnapshot"'],
    desc: "Snapshot testing",
    category: "Testing",
  },
  mocking: {
    terms: ['"vi.fn"', '"sinon"', '"stub"', '"spy"'],
    desc: "Mocking, stubbing and spying",
    category: "Testing",
  },
  fixtures: {
    terms: ['"fixture"', '"factory"', '"seed"', '"builder"'],
    desc: "Test fixtures and data factories",
    category: "Testing",
  },
  coverage: {
    terms: ['"coverage"', '"istanbul"', '"nyc"', '"c8"'],
    desc: "Code coverage tooling",
    category: "Testing",
  },
  benchmark: {
    terms: ['"benchmark"', '"perf_hooks"', '"performance.now"', '"ops/sec"'],
    desc: "Benchmarking and performance testing",
    category: "Testing",
  },
  "property-testing": {
    terms: ['"fast-check"', '"property"', '"arbitrary"', '"shrink"'],
    desc: "Property-based testing",
    category: "Testing",
  },
  fuzzing: {
    terms: ['"fuzz"', '"fuzzer"', '"corpus"', '"afl"'],
    desc: "Fuzzing",
    category: "Testing",
  },

  // ── DevOps & Infrastructure ─────────────────────────────────────────────────
  docker: {
    terms: ['"Dockerfile"', '"docker-compose"', '"container"'],
    desc: "Docker and containerisation",
    lang: "Dockerfile",
    category: "DevOps",
  },
  kubernetes: {
    terms: ['"apiVersion"', '"kind: Deployment"', '"spec:"'],
    desc: "Kubernetes manifests",
    lang: "YAML",
    category: "DevOps",
  },
  cicd: {
    terms: ['"github-actions"', '"pipeline"', '"deploy"', '"workflow"'],
    desc: "CI/CD pipeline patterns",
    category: "DevOps",
  },
  "github-actions": {
    terms: ['"runs-on"', '"jobs:"', '"steps:"', '"uses:"'],
    desc: "GitHub Actions workflows",
    lang: "YAML",
    category: "DevOps",
  },
  terraform: {
    terms: ['"resource"', '"provider"', '"module"', '"terraform"'],
    desc: "Terraform / IaC patterns",
    lang: "HCL",
    category: "DevOps",
  },
  helm: {
    terms: ['"Chart.yaml"', '"values.yaml"', '"templates"', '"helm"'],
    desc: "Helm charts",
    lang: "YAML",
    category: "DevOps",
  },
  ansible: {
    terms: ['"ansible"', '"playbook"', '"inventory"', '"tasks:"'],
    desc: "Ansible automation",
    lang: "YAML",
    category: "DevOps",
  },
  nginx: {
    terms: ['"nginx"', '"proxy_pass"', '"upstream"', '"location"'],
    desc: "Nginx configuration",
    category: "DevOps",
  },
  gitops: {
    terms: ['"argocd"', '"fluxcd"', '"GitOps"', '"sync"'],
    desc: "GitOps (Argo CD / Flux)",
    category: "DevOps",
  },
  aws: {
    terms: ['"aws-sdk"', '"S3"', '"Lambda"', '"DynamoDB"'],
    desc: "AWS SDK usage",
    category: "DevOps",
  },
  gcp: {
    terms: ['"google-cloud"', '"Firestore"', '"BigQuery"', '"GCS"'],
    desc: "Google Cloud usage",
    category: "DevOps",
  },
  azure: {
    terms: ['"@azure"', '"Cosmos"', '"BlobClient"', '"DefaultAzureCredential"'],
    desc: "Azure SDK usage",
    category: "DevOps",
  },

  // ── API Design ──────────────────────────────────────────────────────────────
  api: {
    terms: ['"endpoint"', '"middleware"', '"router"'],
    desc: "API design patterns",
    category: "API",
  },
  graphql: {
    terms: ['"resolver"', '"typeDefs"', '"mutation"', '"subscription"'],
    desc: "GraphQL implementation",
    category: "API",
  },
  rest: {
    terms: ['"@Get"', '"@Post"', '"@Controller"', '"OpenAPI"'],
    desc: "RESTful API patterns",
    category: "API",
  },
  grpc: {
    terms: ['"protobuf"', '"gRPC"', '"service"', '".proto"'],
    desc: "gRPC and Protocol Buffers",
    category: "API",
  },
  openapi: {
    terms: ['"openapi"', '"swagger"', '"paths"', '"components"'],
    desc: "OpenAPI / Swagger specs",
    category: "API",
  },
  webhook: {
    terms: ['"webhook"', '"HMAC"', '"signature"', '"callback"'],
    desc: "Webhook handling and verification",
    category: "API",
  },
  trpc: {
    terms: ['"trpc"', '"procedure"', '"query"', '"mutation"'],
    desc: "tRPC typed APIs",
    category: "API",
  },
  pagination: {
    terms: ['"cursor"', '"pagination"', '"limit"', '"offset"'],
    desc: "Pagination patterns",
    category: "API",
  },
  versioning: {
    terms: ['"api/v1"', '"deprecate"', '"breaking change"', '"version"'],
    desc: "API versioning",
    category: "API",
  },

  // ── Observability ───────────────────────────────────────────────────────────
  logging: {
    terms: ['"winston"', '"pino"', '"logger"', '"log level"'],
    desc: "Logging frameworks",
    category: "Observability",
  },
  monitoring: {
    terms: ['"prometheus"', '"metric"', '"histogram"', '"counter"'],
    desc: "Monitoring and metrics",
    category: "Observability",
  },
  tracing: {
    terms: ['"opentelemetry"', '"trace"', '"span"', '"baggage"'],
    desc: "Distributed tracing",
    category: "Observability",
  },
  otel: {
    terms: ['"otel"', '"tracer"', '"exporter"', '"spanId"'],
    desc: "OpenTelemetry instrumentation",
    category: "Observability",
  },
  sentry: {
    terms: ['"sentry"', '"captureException"', '"breadcrumb"', '"dsn"'],
    desc: "Sentry error tracking",
    category: "Observability",
  },
  alerting: {
    terms: ['"alert"', '"PagerDuty"', '"Datadog"', '"threshold"'],
    desc: "Alerting and incident response",
    category: "Observability",
  },

  // ── Performance ─────────────────────────────────────────────────────────────
  performance: {
    terms: ['"memoize"', '"debounce"', '"throttle"', '"lazy"'],
    desc: "Performance optimisation patterns",
    category: "Performance",
  },
  concurrency: {
    terms: ['"Promise.all"', '"worker_threads"', '"mutex"', '"semaphore"'],
    desc: "Concurrency and parallelism",
    category: "Performance",
  },
  streaming: {
    terms: ['"Readable"', '"Transform"', '"pipeline"', '"backpressure"'],
    desc: "Node.js streaming patterns",
    category: "Performance",
  },
  profiling: {
    terms: ['"flamegraph"', '"cpuprofile"', '"heap snapshot"', '"profiler"'],
    desc: "Profilers and flamegraphs",
    category: "Performance",
  },
  memory: {
    terms: ['"memory leak"', '"heap"', '"WeakMap"', '"gc"'],
    desc: "Memory management and leaks",
    category: "Performance",
  },
  bundle: {
    terms: ['"tree-shaking"', '"code splitting"', '"bundle"', '"chunk"'],
    desc: "Bundle size optimisation",
    category: "Performance",
  },
  "lazy-loading": {
    terms: ['"lazy"', '"dynamic import"', '"IntersectionObserver"', '"Suspense"'],
    desc: "Lazy loading techniques",
    category: "Performance",
  },

  // ── Frontend ────────────────────────────────────────────────────────────────
  react: {
    terms: ['"useState"', '"useEffect"', '"useCallback"', '"useMemo"'],
    desc: "React hooks and patterns",
    lang: "TypeScript",
    category: "Frontend",
  },
  nextjs: {
    terms: ['"getServerSideProps"', '"getStaticProps"', '"App Router"', '"middleware"'],
    desc: "Next.js framework patterns",
    lang: "TypeScript",
    category: "Frontend",
  },
  vue: {
    terms: ['"createApp"', '"defineComponent"', '"computed"', '"onMounted"'],
    desc: "Vue.js patterns",
    category: "Frontend",
  },
  svelte: {
    terms: ['"$state"', '"$derived"', '"onMount"', '"svelte"'],
    desc: "Svelte patterns",
    category: "Frontend",
  },
  angular: {
    terms: ['"@Component"', '"@Injectable"', '"NgModule"', '"signal"'],
    desc: "Angular patterns",
    lang: "TypeScript",
    category: "Frontend",
  },
  state: {
    terms: ['"Redux"', '"Zustand"', '"createStore"', '"useSelector"'],
    desc: "State management patterns",
    category: "Frontend",
  },
  "data-fetching": {
    terms: ['"useQuery"', '"useSWR"', '"react-query"', '"mutate"'],
    desc: "Client data fetching",
    category: "Frontend",
  },
  forms: {
    terms: ['"useForm"', '"react-hook-form"', '"register"', '"handleSubmit"'],
    desc: "Form handling",
    category: "Frontend",
  },
  routing: {
    terms: ['"react-router"', '"useNavigate"', '"Route"', '"Link"'],
    desc: "Client-side routing",
    category: "Frontend",
  },
  i18n: {
    terms: ['"i18n"', '"useTranslation"', '"locale"', '"formatMessage"'],
    desc: "Internationalisation",
    category: "Frontend",
  },
  animation: {
    terms: ['"framer-motion"', '"motion"', '"transition"', '"animate"'],
    desc: "UI animation",
    category: "Frontend",
  },
  a11y: {
    terms: ['"aria-"', '"role="', '"tabIndex"', '"screen reader"'],
    desc: "Accessibility patterns",
    category: "Frontend",
  },

  // ── Error Handling & Validation ─────────────────────────────────────────────
  errors: {
    terms: ['"ErrorBoundary"', '"AppError"', '"custom error"', '"error handler"'],
    desc: "Error handling and recovery",
    category: "Quality",
  },
  validation: {
    terms: ['"zod"', '"yup"', '"schema"', '"validate"'],
    desc: "Input validation patterns",
    category: "Quality",
  },
  "result-type": {
    terms: ['"Result"', '"Either"', '"isOk"', '"isErr"'],
    desc: "Result / Either error types",
    category: "Quality",
  },

  // ── AI / ML ─────────────────────────────────────────────────────────────────
  ml: {
    terms: ['"model"', '"tensor"', '"training"', '"inference"'],
    desc: "Machine learning patterns",
    lang: "Python",
    category: "AI/ML",
  },
  llm: {
    terms: ['"prompt"', '"completion"', '"embedding"', '"ChatCompletion"'],
    desc: "LLM / AI integration patterns",
    category: "AI/ML",
  },
  rag: {
    terms: ['"retrieval"', '"vector"', '"embedding"', '"chunk"'],
    desc: "RAG (Retrieval-Augmented Generation)",
    category: "AI/ML",
  },
  agents: {
    terms: ['"tool calling"', '"function calling"', '"ReAct"', '"agent"'],
    desc: "AI agents and tool calling",
    category: "AI/ML",
  },
  "vector-db": {
    terms: ['"pinecone"', '"weaviate"', '"qdrant"', '"pgvector"'],
    desc: "Vector databases",
    category: "AI/ML",
  },
  "prompt-engineering": {
    terms: ['"system prompt"', '"few-shot"', '"chain of thought"', '"temperature"'],
    desc: "Prompt engineering techniques",
    category: "AI/ML",
  },
  "fine-tuning": {
    terms: ['"fine-tune"', '"LoRA"', '"PEFT"', '"checkpoint"'],
    desc: "Model fine-tuning",
    category: "AI/ML",
  },
  mcp: {
    terms: ['"Model Context Protocol"', '"mcp"', '"tools"', '"resources"'],
    desc: "Model Context Protocol servers",
    category: "AI/ML",
  },

  // ── Payments ────────────────────────────────────────────────────────────────
  stripe: {
    terms: ['"stripe"', '"PaymentIntent"', '"checkout.session"', '"webhook"'],
    desc: "Stripe payments",
    category: "Payments",
  },
  billing: {
    terms: ['"subscription"', '"invoice"', '"proration"', '"billing"'],
    desc: "Subscriptions and billing",
    category: "Payments",
  },
  payments: {
    terms: ['"checkout"', '"refund"', '"charge"', '"payment"'],
    desc: "Payment flows",
    category: "Payments",
  },

  // ── Blockchain ──────────────────────────────────────────────────────────────
  web3: {
    terms: ['"ethers"', '"provider"', '"signer"', '"web3"'],
    desc: "Web3 / Ethereum integration",
    category: "Blockchain",
  },
  solidity: {
    terms: ['"contract"', '"modifier"', '"require"', '"event"'],
    desc: "Solidity smart contracts",
    lang: "Solidity",
    category: "Blockchain",
  },
  defi: {
    terms: ['"swap"', '"liquidity"', '"pool"', '"slippage"'],
    desc: "DeFi protocols",
    category: "Blockchain",
  },

  // ── Community & Contribution ────────────────────────────────────────────────
  "good-first-issue": {
    terms: ['"good first issue"'],
    desc: "Beginner-friendly issues",
    type: "issue",
    category: "Community",
  },
  "help-wanted": {
    terms: ['"help wanted"'],
    desc: "Issues seeking contributors",
    type: "issue",
    category: "Community",
  },
  hacktoberfest: {
    terms: ['"hacktoberfest"'],
    desc: "Hacktoberfest issues and PRs",
    type: "issue",
    category: "Community",
  },
  awesome: {
    terms: ['"awesome"', '"curated"', '"list"'],
    desc: "Awesome lists and curated collections",
    type: "repo",
    category: "Community",
  },
};
