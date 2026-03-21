import type { AgentResult, AgentId } from '@/lib/types'

const MOCK_RESULTS: Record<AgentId, Omit<AgentResult, 'agentId' | 'status'>> = {
  frontend: {
    imageDescription: 'Component tree diagram showing App layout with sidebar navigation, main dashboard panel containing PipelineDashboard, ConnectorCard grid, and StatusBar components. Dark background with amber/orange neon connection lines between components.',
    analysis: `### Component Architecture\n\nThe workflow indicates a multi-step data pipeline that needs a **dashboard view** as the primary interface. I recommend a split-panel layout: a sidebar for pipeline status and a main area for data visualization.\n\nThe source nodes (data inputs) should each have a dedicated **connector card** component showing connection health, last sync time, and record counts. The processing nodes map to a **pipeline stages** visualization component.\n\n### Recommended Stack\n\nUse Zustand for local pipeline state, React Server Components for initial data load, and Framer Motion for status transition animations. All components should follow the existing glass-morphism design system.`,
    codeSnippets: [
      {
        filename: 'src/components/pipeline/PipelineDashboard.tsx',
        language: 'typescript',
        code: `'use client'\n\nimport { useState } from 'react'\nimport { motion } from 'framer-motion'\n\ninterface PipelineStage {\n  id: string\n  name: string\n  status: 'idle' | 'running' | 'complete' | 'error'\n  recordCount: number\n}\n\nexport function PipelineDashboard({ stages }: { stages: PipelineStage[] }) {\n  const [selectedStage, setSelectedStage] = useState<string | null>(null)\n\n  return (\n    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">\n      {stages.map((stage, i) => (\n        <motion.div\n          key={stage.id}\n          initial={{ opacity: 0, y: 16 }}\n          animate={{ opacity: 1, y: 0 }}\n          transition={{ delay: i * 0.1 }}\n          onClick={() => setSelectedStage(stage.id)}\n          className="rounded-2xl p-5 cursor-pointer transition-all hover:brightness-110"\n          style={{\n            background: 'rgba(255,255,255,.03)',\n            border: selectedStage === stage.id\n              ? '1.5px solid var(--green-400)'\n              : '1px solid rgba(255,255,255,.06)',\n          }}\n        >\n          <div className="flex items-center justify-between mb-3">\n            <span className="font-semibold text-sm">{stage.name}</span>\n            <StatusDot status={stage.status} />\n          </div>\n          <p className="text-xs" style={{ color: 'var(--ink-20)' }}>\n            {stage.recordCount.toLocaleString()} records\n          </p>\n        </motion.div>\n      ))}\n    </div>\n  )\n}\n\nfunction StatusDot({ status }: { status: PipelineStage['status'] }) {\n  const colors = { idle: '#6b7280', running: '#22c55e', complete: '#3d9e1c', error: '#ef4444' }\n  return (\n    <span\n      className={status === 'running' ? 'animate-pulse' : ''}\n      style={{\n        width: 8, height: 8, borderRadius: '50%',\n        background: colors[status], display: 'inline-block',\n      }}\n    />\n  )\n}`,
        description: 'Main pipeline dashboard with animated stage cards',
      },
    ],
    recommendations: [
      'Use React.lazy for the dashboard to reduce initial bundle size',
      'Add skeleton loading states for each pipeline stage card',
      'Implement keyboard navigation between stage cards for accessibility',
      'Consider adding a real-time WebSocket connection for live pipeline status',
    ],
    relevantNodeIds: [],
    estimatedHours: 12,
  },

  backend: {
    imageDescription: 'API route architecture diagram showing /api/pipeline, /api/pipeline/[stageId], and /api/status endpoints with request flow arrows, middleware layers, and streaming response paths. Dark background with indigo neon accents.',
    analysis: `### API Route Architecture\n\nThis workflow requires **3 primary API routes**: one for pipeline orchestration, one for individual stage execution, and one for status polling.\n\nThe pipeline orchestrator should use a **streaming response** to push progress events as each stage completes. This follows the existing pattern from \`/api/chat\` but adapted for pipeline events.\n\n### Error Handling\n\nEach stage should have independent error boundaries. A failure in one connector shouldn't crash the entire pipeline — instead, mark it as failed and continue with available data.`,
    codeSnippets: [
      {
        filename: 'src/app/api/pipeline/route.ts',
        language: 'typescript',
        code: `import { NextResponse } from 'next/server'\n\ninterface PipelineRequest {\n  stages: string[]\n  config: Record<string, unknown>\n}\n\nexport async function POST(request: Request) {\n  const { stages, config } = (await request.json()) as PipelineRequest\n  const encoder = new TextEncoder()\n\n  const readable = new ReadableStream({\n    async start(controller) {\n      for (const stageId of stages) {\n        controller.enqueue(\n          encoder.encode(JSON.stringify({ type: 'stage_start', stageId }) + '\\n')\n        )\n        try {\n          const result = await executeStage(stageId, config)\n          controller.enqueue(\n            encoder.encode(JSON.stringify({ type: 'stage_complete', stageId, result }) + '\\n')\n          )\n        } catch (error) {\n          controller.enqueue(\n            encoder.encode(JSON.stringify({\n              type: 'stage_error', stageId,\n              error: error instanceof Error ? error.message : 'Unknown error',\n            }) + '\\n')\n          )\n        }\n      }\n      controller.close()\n    },\n  })\n\n  return new Response(readable, {\n    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },\n  })\n}\n\nasync function executeStage(stageId: string, config: Record<string, unknown>) {\n  // Stage execution logic\n  return { recordsProcessed: 0, duration: 0 }\n}`,
        description: 'Streaming pipeline orchestration API route',
      },
    ],
    recommendations: [
      'Add request validation with Zod schemas for all pipeline inputs',
      'Implement idempotency keys to prevent duplicate pipeline runs',
      'Add rate limiting per user to prevent API abuse',
      'Log pipeline execution metrics to Supabase for observability',
    ],
    relevantNodeIds: [],
    estimatedHours: 10,
  },

  database: {
    imageDescription: 'Entity relationship diagram showing pipelines, pipeline_stages, pipeline_runs, and stage_results tables with foreign key relationships, primary keys highlighted, and cascade delete arrows. Dark background with indigo neon table borders.',
    analysis: `### Schema Design\n\nThe workflow maps cleanly to a **pipeline-centric schema** with 4 core tables: \`pipelines\`, \`pipeline_stages\`, \`pipeline_runs\`, and \`stage_results\`.\n\nEach pipeline run creates a new row in \`pipeline_runs\` with a status tracker. Individual stage results link back to both the run and the stage definition.\n\n### Indexing Strategy\n\nAdd composite indexes on \`(pipeline_id, created_at)\` for the runs table and \`(run_id, stage_id)\` for results. This optimizes the two most common queries: "show recent runs" and "show results for a run."`,
    codeSnippets: [
      {
        filename: 'supabase/migrations/001_pipeline_tables.sql',
        language: 'sql',
        code: `-- Pipeline definitions\ncreate table if not exists pipelines (\n  id uuid primary key default gen_random_uuid(),\n  session_id uuid references sessions(id) on delete cascade,\n  name text not null,\n  description text,\n  schedule text, -- cron expression\n  is_active boolean default true,\n  created_at timestamptz default now(),\n  updated_at timestamptz default now()\n);\n\n-- Pipeline stages (ordered steps)\ncreate table if not exists pipeline_stages (\n  id uuid primary key default gen_random_uuid(),\n  pipeline_id uuid references pipelines(id) on delete cascade,\n  name text not null,\n  type text not null, -- 'source' | 'transform' | 'output'\n  config jsonb default '{}',\n  order_index int not null,\n  unique(pipeline_id, order_index)\n);\n\n-- Pipeline execution runs\ncreate table if not exists pipeline_runs (\n  id uuid primary key default gen_random_uuid(),\n  pipeline_id uuid references pipelines(id) on delete cascade,\n  status text default 'pending', -- pending | running | complete | failed\n  started_at timestamptz,\n  completed_at timestamptz,\n  error text,\n  created_at timestamptz default now()\n);\n\n-- Individual stage results per run\ncreate table if not exists stage_results (\n  id uuid primary key default gen_random_uuid(),\n  run_id uuid references pipeline_runs(id) on delete cascade,\n  stage_id uuid references pipeline_stages(id) on delete cascade,\n  status text default 'pending',\n  records_in int default 0,\n  records_out int default 0,\n  duration_ms int,\n  error text,\n  created_at timestamptz default now()\n);\n\n-- Indexes\ncreate index idx_pipeline_runs_pipeline on pipeline_runs(pipeline_id, created_at desc);\ncreate index idx_stage_results_run on stage_results(run_id, stage_id);\n\n-- RLS\nalter table pipelines enable row level security;\nalter table pipeline_stages enable row level security;\nalter table pipeline_runs enable row level security;\nalter table stage_results enable row level security;`,
        description: 'Complete pipeline schema with tables, indexes, and RLS',
      },
    ],
    recommendations: [
      'Add a trigger to auto-update pipelines.updated_at on row changes',
      'Consider partitioning pipeline_runs by month for high-volume pipelines',
      'Add a materialized view for pipeline success rates dashboard',
      'Implement soft deletes on pipelines to preserve run history',
    ],
    relevantNodeIds: [],
    estimatedHours: 6,
  },

  auth: {
    imageDescription: 'Authentication flow diagram showing user login through Clerk, middleware route protection, role-based access control branching (owner/editor/viewer), and protected API endpoints. Dark background with green neon flow arrows.',
    analysis: `### Access Control Requirements\n\nThe workflow needs **role-based pipeline access**: owners can edit/delete, team members can execute, and viewers can only see results.\n\n### Middleware Strategy\n\nExtend the existing Clerk middleware to add pipeline-specific route protection. The \`/api/pipeline\` routes should require authentication, and pipeline ownership should be verified server-side before any mutation.`,
    codeSnippets: [
      {
        filename: 'src/lib/pipeline-auth.ts',
        language: 'typescript',
        code: `import { auth } from '@clerk/nextjs/server'\nimport { createClient } from '@supabase/supabase-js'\n\ntype PipelineRole = 'owner' | 'editor' | 'viewer'\n\nexport async function getPipelineRole(\n  pipelineId: string\n): Promise<PipelineRole | null> {\n  const { userId } = await auth()\n  if (!userId) return null\n\n  const supabase = createClient(\n    process.env.NEXT_PUBLIC_SUPABASE_URL!,\n    process.env.SUPABASE_SERVICE_ROLE_KEY!\n  )\n\n  const { data } = await supabase\n    .from('pipelines')\n    .select('session_id, sessions!inner(user_id)')\n    .eq('id', pipelineId)\n    .single()\n\n  if (!data) return null\n  const session = data.sessions as unknown as { user_id: string }\n  return session.user_id === userId ? 'owner' : 'viewer'\n}\n\nexport async function requirePipelineAccess(\n  pipelineId: string,\n  minRole: PipelineRole = 'viewer'\n) {\n  const role = await getPipelineRole(pipelineId)\n  if (!role) throw new Error('Pipeline not found')\n\n  const hierarchy: PipelineRole[] = ['viewer', 'editor', 'owner']\n  if (hierarchy.indexOf(role) < hierarchy.indexOf(minRole)) {\n    throw new Error('Insufficient permissions')\n  }\n  return role\n}`,
        description: 'Pipeline access control with role-based checks',
      },
    ],
    recommendations: [
      'Add API route middleware that checks pipeline ownership before mutations',
      'Implement audit logging for pipeline access and modifications',
      'Add rate limiting per user on pipeline execution endpoints',
      'Consider adding team/org support for shared pipeline access',
    ],
    relevantNodeIds: [],
    estimatedHours: 8,
  },

  'ai-llm': {
    imageDescription: 'AI pipeline architecture showing data flow from upstream stages through Claude API calls with system prompts, tool_use for structured output, token tracking, and response parsing. Dark background with cyan neon data flow lines.',
    analysis: `### AI Integration Architecture\n\nThe workflow includes AI processing nodes that should use **Claude\'s streaming API** with structured tool use. Each AI node in the pipeline maps to a Claude API call with a specialized system prompt.\n\n### Prompt Engineering\n\nDesign node-specific system prompts that receive upstream data as context. Use Claude's tool_use feature to enforce structured output from each AI stage. This ensures downstream stages always receive valid, typed data.\n\n### Token Optimization\n\nEstimate ~2K tokens input per stage, ~1K output. For a 5-stage pipeline with 3 AI nodes, that's ~9K tokens per run. At current Claude pricing, that's approximately $0.027 per pipeline execution.`,
    codeSnippets: [
      {
        filename: 'src/lib/ai-pipeline-stage.ts',
        language: 'typescript',
        code: `import Anthropic from '@anthropic-ai/sdk'\n\ninterface AIStageConfig {\n  systemPrompt: string\n  outputSchema: Anthropic.Tool\n  maxTokens?: number\n}\n\ninterface AIStageResult {\n  output: unknown\n  tokensUsed: { input: number; output: number }\n  duration: number\n}\n\nexport async function executeAIStage(\n  input: unknown,\n  config: AIStageConfig\n): Promise<AIStageResult> {\n  const anthropic = new Anthropic()\n  const start = performance.now()\n\n  const response = await anthropic.messages.create({\n    model: 'claude-sonnet-4-20250514',\n    max_tokens: config.maxTokens ?? 2048,\n    system: config.systemPrompt,\n    tools: [config.outputSchema],\n    tool_choice: { type: 'tool', name: config.outputSchema.name },\n    messages: [{\n      role: 'user',\n      content: JSON.stringify(input, null, 2),\n    }],\n  })\n\n  const toolBlock = response.content.find((b) => b.type === 'tool_use')\n  if (!toolBlock || toolBlock.type !== 'tool_use') {\n    throw new Error('AI stage did not return structured output')\n  }\n\n  return {\n    output: toolBlock.input,\n    tokensUsed: {\n      input: response.usage.input_tokens,\n      output: response.usage.output_tokens,\n    },\n    duration: performance.now() - start,\n  }\n}`,
        description: 'AI pipeline stage executor with structured Claude output',
      },
    ],
    recommendations: [
      'Cache AI responses for identical inputs using a content hash',
      'Add fallback to a smaller model if rate limits are hit',
      'Implement token budget tracking per pipeline to prevent cost overruns',
      'Use Claude\'s batch API for non-time-sensitive pipeline stages',
    ],
    relevantNodeIds: [],
    estimatedHours: 10,
  },

  integration: {
    imageDescription: 'Service integration map showing the application at center connected to external APIs (Stripe, Clerk, Supabase, Anthropic) with webhook arrows, retry loops, and rate limit indicators. Dark background with cyan neon connection lines.',
    analysis: `### External Service Map\n\nThe workflow connects to multiple external services. Each integration needs a **typed API client** with retry logic, rate limiting, and proper error handling.\n\n### Webhook Architecture\n\nFor real-time data sources, set up webhook endpoints that trigger pipeline runs automatically. Use signature validation for security and idempotency keys to prevent duplicate processing.`,
    codeSnippets: [
      {
        filename: 'src/lib/api-client.ts',
        language: 'typescript',
        code: `interface APIClientConfig {\n  baseUrl: string\n  headers?: Record<string, string>\n  maxRetries?: number\n  timeoutMs?: number\n}\n\nexport class APIClient {\n  private config: Required<APIClientConfig>\n\n  constructor(config: APIClientConfig) {\n    this.config = {\n      headers: {},\n      maxRetries: 3,\n      timeoutMs: 30_000,\n      ...config,\n    }\n  }\n\n  async get<T>(path: string): Promise<T> {\n    return this.request<T>('GET', path)\n  }\n\n  async post<T>(path: string, body: unknown): Promise<T> {\n    return this.request<T>('POST', path, body)\n  }\n\n  private async request<T>(\n    method: string,\n    path: string,\n    body?: unknown,\n    attempt = 1\n  ): Promise<T> {\n    const controller = new AbortController()\n    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs)\n\n    try {\n      const res = await fetch(this.config.baseUrl + path, {\n        method,\n        headers: { 'Content-Type': 'application/json', ...this.config.headers },\n        body: body ? JSON.stringify(body) : undefined,\n        signal: controller.signal,\n      })\n      if (!res.ok) {\n        if (res.status >= 500 && attempt < this.config.maxRetries) {\n          await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt))\n          return this.request<T>(method, path, body, attempt + 1)\n        }\n        throw new Error(\`API error: \${res.status}\`)\n      }\n      return (await res.json()) as T\n    } finally {\n      clearTimeout(timeout)\n    }\n  }\n}`,
        description: 'Typed API client with retry and timeout support',
      },
    ],
    recommendations: [
      'Create service-specific client subclasses for each external API',
      'Add circuit breaker pattern for unreliable external services',
      'Implement request/response logging for debugging integrations',
      'Store API credentials in environment variables, never in code',
    ],
    relevantNodeIds: [],
    estimatedHours: 14,
  },

  'data-pipeline': {
    imageDescription: 'ETL pipeline flowchart showing Extract stage (multiple data sources), Transform stage (parallel processing branches), and Load stage (output destinations) with data volume annotations. Dark background with cyan neon flow arrows.',
    analysis: `### Pipeline Architecture\n\nThe workflow describes a classic **ETL pipeline** with extract (source nodes), transform (processor nodes), and load (output nodes) stages.\n\n### Data Flow Design\n\nUse a **typed pipeline builder** pattern where each stage declares its input and output types. This enables compile-time validation of the pipeline graph and catches type mismatches before runtime.`,
    codeSnippets: [
      {
        filename: 'src/lib/pipeline-builder.ts',
        language: 'typescript',
        code: `type StageFunction<TIn, TOut> = (input: TIn) => Promise<TOut>\n\ninterface PipelineStage<TIn, TOut> {\n  name: string\n  execute: StageFunction<TIn, TOut>\n}\n\nexport class Pipeline<TIn, TCurrent> {\n  private stages: PipelineStage<unknown, unknown>[] = []\n\n  private constructor(stages: PipelineStage<unknown, unknown>[]) {\n    this.stages = stages\n  }\n\n  static create<T>(): Pipeline<T, T> {\n    return new Pipeline([])\n  }\n\n  then<TNext>(name: string, fn: StageFunction<TCurrent, TNext>): Pipeline<TIn, TNext> {\n    return new Pipeline([...this.stages, { name, execute: fn as StageFunction<unknown, unknown> }])\n  }\n\n  async run(input: TIn): Promise<TCurrent> {\n    let current: unknown = input\n    for (const stage of this.stages) {\n      current = await stage.execute(current)\n    }\n    return current as TCurrent\n  }\n}`,
        description: 'Type-safe pipeline builder with chained stages',
      },
    ],
    recommendations: [
      'Add parallel stage execution for independent data branches',
      'Implement checkpointing to resume failed pipelines from last successful stage',
      'Add data validation between stages using Zod schemas',
      'Consider adding dead-letter queues for failed records',
    ],
    relevantNodeIds: [],
    estimatedHours: 16,
  },

  deployment: {
    imageDescription: 'Deployment pipeline diagram showing GitHub push triggering Vercel build, preview deployment branch, production deployment path, environment variable injection, and health check verification. Dark background with indigo neon flow lines.',
    analysis: `### Deployment Strategy\n\nThe application should deploy to **Vercel** with automatic deployments from the main branch. Environment variables should be managed through Vercel's dashboard with separate values for preview and production.\n\n### Build Optimization\n\nEnable ISR for dashboard pages, use edge runtime for API routes where possible, and ensure the \`@anthropic-ai/sdk\` is properly externalized in the server bundle.`,
    codeSnippets: [
      {
        filename: 'vercel.json',
        language: 'json',
        code: `{\n  "framework": "nextjs",\n  "buildCommand": "npm run build",\n  "installCommand": "npm install",\n  "regions": ["iad1"],\n  "headers": [\n    {\n      "source": "/api/(.*)",\n      "headers": [\n        { "key": "Cache-Control", "value": "no-store" },\n        { "key": "X-Content-Type-Options", "value": "nosniff" }\n      ]\n    }\n  ]\n}`,
        description: 'Vercel deployment configuration',
      },
    ],
    recommendations: [
      'Set up preview deployments for all feature branches',
      'Configure Vercel Speed Insights for production performance monitoring',
      'Add a deployment health check endpoint that verifies all service connections',
      'Consider adding a staging environment for pre-production testing',
    ],
    relevantNodeIds: [],
    estimatedHours: 4,
  },

  testing: {
    imageDescription: 'Testing pyramid diagram showing unit tests at the base (Vitest), integration tests in the middle (API routes), and E2E tests at the top (Playwright). Coverage percentages annotated per layer. Dark background with cyan neon pyramid edges.',
    analysis: `### Testing Strategy\n\nImplement a **testing pyramid**: unit tests for utilities and stores, integration tests for API routes, and E2E tests for critical user flows.\n\n### Priority Tests\n\nStart with the pipeline execution path — this is the highest-risk area. Test each stage independently with mocked inputs, then test the full pipeline with integration tests.`,
    codeSnippets: [
      {
        filename: 'src/__tests__/pipeline.test.ts',
        language: 'typescript',
        code: `import { describe, it, expect, vi } from 'vitest'\n\ndescribe('Pipeline execution', () => {\n  it('should execute stages in order', async () => {\n    const log: string[] = []\n\n    const stages = [\n      { id: 'extract', execute: async () => { log.push('extract'); return [1, 2, 3] } },\n      { id: 'transform', execute: async (data: number[]) => { log.push('transform'); return data.map(x => x * 2) } },\n      { id: 'load', execute: async (data: number[]) => { log.push('load'); return { count: data.length } } },\n    ]\n\n    let result: unknown = undefined\n    for (const stage of stages) {\n      result = await stage.execute(result as never)\n    }\n\n    expect(log).toEqual(['extract', 'transform', 'load'])\n    expect(result).toEqual({ count: 3 })\n  })\n\n  it('should handle stage failures gracefully', async () => {\n    const failingStage = {\n      id: 'broken',\n      execute: async () => { throw new Error('Connection timeout') },\n    }\n\n    await expect(failingStage.execute()).rejects.toThrow('Connection timeout')\n  })\n})`,
        description: 'Pipeline execution unit tests with Vitest',
      },
    ],
    recommendations: [
      'Aim for 80% code coverage on pipeline logic and API routes',
      'Add snapshot tests for complex data transformations',
      'Create test fixtures that mirror production data shapes',
      'Set up CI to run tests on every PR before merge',
    ],
    relevantNodeIds: [],
    estimatedHours: 12,
  },

  security: {
    imageDescription: 'Security layers diagram showing concentric rings: outer (WAF/CDN), middleware (rate limiting, CORS), application (input validation, auth), data (RLS, encryption). Threat vectors shown as red arrows. Dark background with green neon rings.',
    analysis: `### Security Audit\n\nThe workflow handles external data inputs which introduces several attack vectors. The primary concerns are:\n\n1. **Input validation** — All data entering the pipeline must be validated and sanitized\n2. **API key exposure** — Ensure no API keys are logged or included in client responses\n3. **Rate limiting** — Prevent abuse of AI-powered pipeline endpoints\n4. **SSRF prevention** — Validate URLs if the pipeline fetches external resources`,
    codeSnippets: [
      {
        filename: 'src/middleware/security.ts',
        language: 'typescript',
        code: `import { NextRequest, NextResponse } from 'next/server'\n\nconst RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>()\nconst RATE_LIMIT = 60 // requests per minute\n\nexport function rateLimit(request: NextRequest): NextResponse | null {\n  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'\n  const now = Date.now()\n  const entry = RATE_LIMIT_MAP.get(ip)\n\n  if (!entry || now > entry.resetAt) {\n    RATE_LIMIT_MAP.set(ip, { count: 1, resetAt: now + 60_000 })\n    return null\n  }\n\n  entry.count++\n  if (entry.count > RATE_LIMIT) {\n    return NextResponse.json(\n      { error: 'Rate limit exceeded' },\n      { status: 429, headers: { 'Retry-After': '60' } }\n    )\n  }\n  return null\n}\n\nexport function sanitizeHeaders(headers: Headers): Record<string, string> {\n  const safe: Record<string, string> = {}\n  const BLOCKED = ['authorization', 'cookie', 'x-api-key']\n  headers.forEach((value, key) => {\n    if (!BLOCKED.includes(key.toLowerCase())) safe[key] = value\n  })\n  return safe\n}`,
        description: 'Rate limiting and header sanitization middleware',
      },
    ],
    recommendations: [
      'Add Content-Security-Policy headers to prevent XSS',
      'Implement input validation on all API route handlers using Zod',
      'Audit all environment variable usage to ensure no client-side leaks',
      'Add CORS configuration to restrict API access to your domain only',
    ],
    relevantNodeIds: [],
    estimatedHours: 8,
  },

  devops: {
    imageDescription: 'Observability stack diagram showing three pillars: Logs (structured JSON), Metrics (pipeline duration, error rates), Traces (request correlation IDs). Health check endpoint at center. Dark background with indigo neon connections.',
    analysis: `### Observability Strategy\n\nThe pipeline system needs three layers of observability:\n\n1. **Health checks** — A \`/api/health\` endpoint that verifies all service connections\n2. **Structured logging** — JSON logs for every pipeline stage with correlation IDs\n3. **Metrics** — Pipeline execution times, success rates, and error counts`,
    codeSnippets: [
      {
        filename: 'src/app/api/health/route.ts',
        language: 'typescript',
        code: `import { NextResponse } from 'next/server'\n\ninterface HealthCheck {\n  service: string\n  status: 'ok' | 'degraded' | 'down'\n  latencyMs?: number\n}\n\nexport async function GET() {\n  const checks: HealthCheck[] = await Promise.all([\n    checkSupabase(),\n    checkAnthropic(),\n  ])\n\n  const overall = checks.every((c) => c.status === 'ok') ? 'healthy' : 'degraded'\n\n  return NextResponse.json({\n    status: overall,\n    timestamp: new Date().toISOString(),\n    checks,\n  })\n}\n\nasync function checkSupabase(): Promise<HealthCheck> {\n  const start = performance.now()\n  try {\n    const url = process.env.NEXT_PUBLIC_SUPABASE_URL\n    if (!url) return { service: 'supabase', status: 'down' }\n    await fetch(url + '/rest/v1/', {\n      headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY! },\n    })\n    return { service: 'supabase', status: 'ok', latencyMs: performance.now() - start }\n  } catch {\n    return { service: 'supabase', status: 'down', latencyMs: performance.now() - start }\n  }\n}\n\nasync function checkAnthropic(): Promise<HealthCheck> {\n  const key = process.env.ANTHROPIC_API_KEY\n  return { service: 'anthropic', status: key ? 'ok' : 'down' }\n}`,
        description: 'Health check endpoint with service status monitoring',
      },
    ],
    recommendations: [
      'Add structured logging with correlation IDs for pipeline tracing',
      'Set up Vercel Analytics for production performance monitoring',
      'Create a /api/metrics endpoint for Prometheus-compatible scraping',
      'Add error alerting via webhook for pipeline failures',
    ],
    relevantNodeIds: [],
    estimatedHours: 6,
  },

  'ux-design': {
    imageDescription: 'User flow wireframe showing three phases: Configure (data source cards), Execute (real-time progress view with animated stage indicators), Review (results dashboard with export options). Dark background with amber neon flow arrows between phases.',
    analysis: `### User Flow Analysis\n\nThe workflow translates to a **3-phase user experience**:\n\n1. **Configure** — User connects data sources and sets up pipeline stages\n2. **Execute** — User triggers a pipeline run and watches progress in real-time\n3. **Review** — User inspects results, views data quality metrics, and exports output\n\n### Interaction Patterns\n\nUse progressive disclosure: show only the current phase's controls. Add animated transitions between phases using Framer Motion. Each pipeline stage should have a clear visual state (idle, running, complete, error) communicated through color and iconography.\n\n### Accessibility\n\nAll interactive elements need keyboard navigation, focus indicators, and ARIA labels. Pipeline status changes should announce to screen readers via live regions.`,
    codeSnippets: [
      {
        filename: 'src/components/pipeline/UserFlow.tsx',
        language: 'typescript',
        code: `'use client'\n\nimport { motion, AnimatePresence } from 'framer-motion'\n\ntype Phase = 'configure' | 'execute' | 'review'\n\ninterface PhaseIndicatorProps {\n  currentPhase: Phase\n}\n\nconst PHASES: { key: Phase; label: string; icon: string }[] = [\n  { key: 'configure', label: 'Configure', icon: 'settings' },\n  { key: 'execute', label: 'Execute', icon: 'play' },\n  { key: 'review', label: 'Review', icon: 'check' },\n]\n\nexport function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {\n  const currentIdx = PHASES.findIndex((p) => p.key === currentPhase)\n\n  return (\n    <nav aria-label="Pipeline phases" className="flex items-center gap-4">\n      {PHASES.map((phase, i) => (\n        <div key={phase.key} className="flex items-center gap-2">\n          <motion.div\n            animate={{\n              background: i <= currentIdx ? 'var(--green-400)' : 'rgba(255,255,255,.06)',\n              scale: i === currentIdx ? 1.1 : 1,\n            }}\n            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"\n            aria-current={i === currentIdx ? 'step' : undefined}\n          >\n            {i + 1}\n          </motion.div>\n          <span\n            className="text-sm font-medium"\n            style={{ color: i <= currentIdx ? 'white' : 'var(--ink-20)' }}\n          >\n            {phase.label}\n          </span>\n          {i < PHASES.length - 1 && (\n            <div\n              className="w-8 h-px mx-2"\n              style={{ background: i < currentIdx ? 'var(--green-400)' : 'rgba(255,255,255,.08)' }}\n            />\n          )}\n        </div>\n      ))}\n    </nav>\n  )\n}`,
        description: 'Accessible phase indicator component with animations',
      },
    ],
    recommendations: [
      'Add keyboard shortcuts for common actions (Ctrl+Enter to run pipeline)',
      'Include empty states with helpful guidance for first-time users',
      'Use toast notifications for pipeline completion/failure events',
      'Add dark/light theme support using CSS custom properties',
    ],
    relevantNodeIds: [],
    estimatedHours: 10,
  },

  documentation: {
    imageDescription: 'Documentation hierarchy diagram showing README at top, branching to API Reference, Developer Guide, and User Guide. Each section shows key pages as cards beneath it. Dark background with amber neon tree lines.',
    analysis: `### Documentation Structure\n\nThe project needs **4 documentation layers**:\n\n1. **README.md** — Quick start, architecture overview, and deployment guide\n2. **API Reference** — All route handlers with request/response schemas\n3. **Developer Guide** — How to add new pipeline stages, extend the system\n4. **User Guide** — End-user facing documentation for the pipeline builder`,
    codeSnippets: [
      {
        filename: 'docs/api-reference.md',
        language: 'markdown',
        code: `# API Reference\n\n## Pipeline Endpoints\n\n### POST /api/pipeline\nExecute a pipeline run.\n\n**Request Body:**\n\`\`\`json\n{\n  "stages": ["extract", "transform", "load"],\n  "config": { "source": "api", "format": "json" }\n}\n\`\`\`\n\n**Response:** Server-Sent Events stream\n\`\`\`\ndata: {"type":"stage_start","stageId":"extract"}\ndata: {"type":"stage_complete","stageId":"extract","result":{"records":150}}\ndata: {"type":"stage_start","stageId":"transform"}\n...\n\`\`\`\n\n### GET /api/health\nReturns service health status.\n\n**Response:**\n\`\`\`json\n{\n  "status": "healthy",\n  "timestamp": "2025-01-01T00:00:00Z",\n  "checks": [\n    { "service": "supabase", "status": "ok", "latencyMs": 45 },\n    { "service": "anthropic", "status": "ok" }\n  ]\n}\n\`\`\``,
        description: 'API reference documentation with examples',
      },
    ],
    recommendations: [
      'Add inline JSDoc comments to all exported functions and types',
      'Create a CONTRIBUTING.md with coding standards and PR guidelines',
      'Add architecture decision records (ADRs) for major design choices',
      'Set up automated API documentation generation from TypeScript types',
    ],
    relevantNodeIds: [],
    estimatedHours: 8,
  },

  'cost-infra': {
    imageDescription: 'Cost breakdown chart showing stacked bar graph with Vercel ($0), Supabase ($0), and Claude API ($27) costs per month. Optimization opportunities highlighted with green arrows showing potential 30-50% reduction. Dark background with green neon bars.',
    analysis: `### Infrastructure Cost Estimate\n\nBased on the workflow architecture, here's the monthly cost breakdown for moderate usage (1000 pipeline runs/month):\n\n| Service | Free Tier | Estimated Cost |\n|---------|-----------|----------------|\n| Vercel (Hobby) | Included | $0 |\n| Supabase (Free) | 500MB, 50K rows | $0 |\n| Claude API | N/A | ~$27/month |\n| **Total** | | **~$27/month** |\n\n### Optimization Opportunities\n\n1. **Cache AI responses** for identical inputs — could reduce Claude costs by 30-50%\n2. **Use Haiku** for simple classification stages instead of Sonnet\n3. **Batch API calls** for non-real-time processing at 50% cost reduction`,
    codeSnippets: [
      {
        filename: 'src/lib/cost-tracker.ts',
        language: 'typescript',
        code: `interface TokenUsage {\n  model: string\n  inputTokens: number\n  outputTokens: number\n  timestamp: number\n}\n\nconst PRICING: Record<string, { input: number; output: number }> = {\n  'claude-sonnet-4-20250514': { input: 3.0 / 1_000_000, output: 15.0 / 1_000_000 },\n  'claude-haiku-4-20250514': { input: 0.25 / 1_000_000, output: 1.25 / 1_000_000 },\n}\n\nexport class CostTracker {\n  private usage: TokenUsage[] = []\n\n  record(model: string, inputTokens: number, outputTokens: number) {\n    this.usage.push({ model, inputTokens, outputTokens, timestamp: Date.now() })\n  }\n\n  getTotalCost(): number {\n    return this.usage.reduce((total, u) => {\n      const price = PRICING[u.model]\n      if (!price) return total\n      return total + u.inputTokens * price.input + u.outputTokens * price.output\n    }, 0)\n  }\n\n  getSummary() {\n    return {\n      totalCost: this.getTotalCost().toFixed(4),\n      totalCalls: this.usage.length,\n      totalInputTokens: this.usage.reduce((s, u) => s + u.inputTokens, 0),\n      totalOutputTokens: this.usage.reduce((s, u) => s + u.outputTokens, 0),\n    }\n  }\n}`,
        description: 'Token usage and cost tracking utility',
      },
    ],
    recommendations: [
      'Set up usage alerts when monthly Claude costs exceed $50',
      'Implement token counting before API calls to estimate costs upfront',
      'Consider upgrading to Supabase Pro ($25/mo) before hitting free tier limits',
      'Add a cost-per-pipeline metric to the dashboard for user transparency',
    ],
    relevantNodeIds: [],
    estimatedHours: 4,
  },

  'project-manager': {
    imageDescription: 'Gantt chart showing 4 sprints over 7 weeks: Foundation (weeks 1-2), Core Pipeline (weeks 3-4), UI + Polish (weeks 5-6), QA + Deploy (week 7). Dependencies shown as arrows between sprint blocks. Risk indicators as colored dots. Dark background with green neon timeline.',
    analysis: `### Project Timeline\n\nBased on the workflow complexity and the 15-agent analysis, here's the recommended sprint plan:\n\n**Sprint 1 (Week 1-2):** Foundation\n- Database schema + migrations\n- API route structure\n- Authentication middleware\n\n**Sprint 2 (Week 3-4):** Core Pipeline\n- Pipeline builder and executor\n- AI stage integration\n- Data transformation logic\n\n**Sprint 3 (Week 5-6):** UI + Polish\n- Dashboard components\n- Real-time pipeline monitoring\n- Error handling and recovery\n\n**Sprint 4 (Week 7):** QA + Deploy\n- Testing suite\n- Security audit fixes\n- Production deployment\n\n### Risk Register\n\n1. **High:** Claude API rate limits may bottleneck pipeline execution\n2. **Medium:** Complex data transformations may need iteration\n3. **Low:** Vercel cold starts on pipeline API routes`,
    codeSnippets: [
      {
        filename: 'src/lib/project-plan.ts',
        language: 'typescript',
        code: `export interface Sprint {\n  id: number\n  name: string\n  weeks: string\n  workOrderIds: string[]\n  status: 'planned' | 'active' | 'complete'\n}\n\nexport interface Risk {\n  id: string\n  severity: 'high' | 'medium' | 'low'\n  description: string\n  mitigation: string\n}\n\nexport const PROJECT_PLAN: Sprint[] = [\n  {\n    id: 1,\n    name: 'Foundation',\n    weeks: 'Week 1-2',\n    workOrderIds: ['database', 'auth', 'backend'],\n    status: 'planned',\n  },\n  {\n    id: 2,\n    name: 'Core Pipeline',\n    weeks: 'Week 3-4',\n    workOrderIds: ['data-pipeline', 'ai-llm', 'integration'],\n    status: 'planned',\n  },\n  {\n    id: 3,\n    name: 'UI + Polish',\n    weeks: 'Week 5-6',\n    workOrderIds: ['frontend', 'ux-design', 'devops'],\n    status: 'planned',\n  },\n  {\n    id: 4,\n    name: 'QA + Deploy',\n    weeks: 'Week 7',\n    workOrderIds: ['testing', 'security', 'deployment'],\n    status: 'planned',\n  },\n]\n\nexport const RISKS: Risk[] = [\n  {\n    id: 'r-1',\n    severity: 'high',\n    description: 'Claude API rate limits may bottleneck pipeline execution',\n    mitigation: 'Implement request queuing and batch processing',\n  },\n  {\n    id: 'r-2',\n    severity: 'medium',\n    description: 'Complex data transformations may require multiple iterations',\n    mitigation: 'Start with simple transforms, iterate based on real data',\n  },\n]`,
        description: 'Sprint plan and risk register data structures',
      },
    ],
    recommendations: [
      'Start with the database and API foundation — everything else depends on it',
      'Prioritize the AI pipeline integration early to validate the core value prop',
      'Plan for a week of buffer before launch for unexpected issues',
      'Set up weekly demos to get stakeholder feedback on each sprint',
    ],
    relevantNodeIds: [],
    estimatedHours: 4,
  },
}

export function getMockResult(agentId: AgentId): AgentResult {
  const mock = MOCK_RESULTS[agentId]
  return {
    agentId,
    status: 'complete',
    ...mock,
  }
}

export function getAllMockResults(): AgentResult[] {
  return (Object.keys(MOCK_RESULTS) as AgentId[]).map(getMockResult)
}
