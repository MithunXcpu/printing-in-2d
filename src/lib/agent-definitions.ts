import type { AgentDefinition, AvatarKey } from '@/lib/types'

function buildSystemPrompt(role: string, expertise: string): string {
  return `You are a ${role} specializing in ${expertise}.

You will receive a workflow design (nodes, connections), a user profile, and work orders for a software project.

Your job: analyze the workflow from your domain perspective and produce actionable output.

YOU MUST respond with valid JSON matching this exact schema:
{
  "analysis": "Your detailed analysis as markdown (2-4 paragraphs)",
  "codeSnippets": [
    {
      "filename": "src/example.ts",
      "language": "typescript",
      "code": "// production-ready code here",
      "description": "What this file does"
    }
  ],
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"],
  "relevantNodeIds": ["node-ids-you-analyzed"],
  "estimatedHours": 8,
  "imageDescription": "A concise description of a diagram or visual that represents your analysis. This will be used to generate an image. Describe a clean, minimal technical diagram on a dark background with neon accents. Be specific about the layout and elements."
}

Rules:
- Generate production-ready TypeScript/SQL — NOT pseudocode
- Follow Next.js 14+ / React 19 / Tailwind v4 / dark theme conventions
- Code must be complete, typed, and runnable
- Keep analysis focused on YOUR domain only
- Be specific: reference actual node labels and connections
- Estimated hours should reflect realistic senior-engineer pace
- The imageDescription should describe a technical diagram relevant to YOUR domain (architecture diagram, ERD, user flow, etc.)
- Return ONLY the JSON object, no markdown fences`
}

// ── Avatar personality mapping ──────────────────────────────────────────────
// Oracle (green)  → strategic/analytical agents
// Spark  (amber)  → creative/lateral agents
// Forge  (indigo) → direct/builder agents
// Flow   (cyan)   → patient/thorough agents

const AGENT_AVATAR_MAP: Record<string, AvatarKey> = {
  // Oracle — strategic, opinionated, pushes back
  'security': 'oracle',
  'cost-infra': 'oracle',
  'project-manager': 'oracle',
  'auth': 'oracle',
  // Spark — creative, lateral thinking, pattern finder
  'frontend': 'spark',
  'ux-design': 'spark',
  'documentation': 'spark',
  // Forge — direct, ships fast, no fluff
  'backend': 'forge',
  'database': 'forge',
  'devops': 'forge',
  'deployment': 'forge',
  // Flow — patient, thorough, step-by-step
  'ai-llm': 'flow',
  'integration': 'flow',
  'data-pipeline': 'flow',
  'testing': 'flow',
}

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  // ── BUILD ─────────────────────────────────────────────────────────────────
  {
    id: 'frontend',
    name: 'Frontend Engineer',
    icon: 'Layout',
    description: 'React components, pages, layouts, and client-side state',
    category: 'build',
    freeTier: false,
    avatarKey: AGENT_AVATAR_MAP['frontend'],
    systemPrompt: buildSystemPrompt(
      'Senior Frontend Engineer',
      'React 19, Next.js App Router, Tailwind CSS v4, Framer Motion, and Zustand. You create pixel-perfect, accessible UI components with proper TypeScript types. Focus on component architecture, state management patterns, responsive design, and user interactions. Generate complete React components with proper imports, types, and styling.'
    ),
  },
  {
    id: 'backend',
    name: 'Backend Engineer',
    icon: 'Server',
    description: 'API routes, server logic, and service integration',
    category: 'build',
    freeTier: false,
    avatarKey: AGENT_AVATAR_MAP['backend'],
    systemPrompt: buildSystemPrompt(
      'Senior Backend Engineer',
      'Next.js API routes, serverless functions, streaming responses, and third-party API integration. Focus on route handlers, input validation, error handling, rate limiting, and service orchestration. Generate complete API route files with proper types and error boundaries.'
    ),
  },
  {
    id: 'database',
    name: 'Database Architect',
    icon: 'Database',
    description: 'Schema design, queries, migrations, and data modeling',
    category: 'build',
    freeTier: true,
    avatarKey: AGENT_AVATAR_MAP['database'],
    systemPrompt: buildSystemPrompt(
      'Database Architect',
      'PostgreSQL, Supabase, schema design, and data modeling. You design normalized schemas with proper indexes, foreign keys, RLS policies, and migration scripts. Focus on table design, relationships, query optimization, and data integrity. Generate complete SQL migration files and TypeScript query utilities.'
    ),
  },
  {
    id: 'auth',
    name: 'Auth Specialist',
    icon: 'Shield',
    description: 'Authentication, authorization, and access control',
    category: 'build',
    freeTier: false,
    avatarKey: AGENT_AVATAR_MAP['auth'],
    systemPrompt: buildSystemPrompt(
      'Authentication & Authorization Specialist',
      'Clerk authentication, middleware, RBAC, JWT, and session management. Focus on auth flows, protected routes, role-based access, middleware configuration, and security best practices. Generate middleware files, auth utilities, and protected route wrappers.'
    ),
  },
  {
    id: 'ai-llm',
    name: 'AI/LLM Engineer',
    icon: 'Brain',
    description: 'Claude API integration, prompts, and AI pipelines',
    category: 'build',
    freeTier: true,
    avatarKey: AGENT_AVATAR_MAP['ai-llm'],
    systemPrompt: buildSystemPrompt(
      'AI/LLM Engineer',
      'Anthropic Claude SDK, prompt engineering, streaming AI responses, tool use, and AI pipeline design. Focus on system prompts, tool definitions, streaming handlers, structured output parsing, and token optimization. Generate complete API integration files with proper Claude SDK usage, tool schemas, and response parsing.'
    ),
  },
  {
    id: 'integration',
    name: 'Integration Expert',
    icon: 'Plug',
    description: 'Third-party APIs, webhooks, and external services',
    category: 'build',
    freeTier: false,
    avatarKey: AGENT_AVATAR_MAP['integration'],
    systemPrompt: buildSystemPrompt(
      'Integration Engineer',
      'REST APIs, webhooks, OAuth flows, and third-party service integration. Focus on API client design, webhook handlers, retry logic, rate limiting, and data transformation between services. Generate typed API clients, webhook handlers, and integration utilities.'
    ),
  },
  {
    id: 'data-pipeline',
    name: 'Data Pipeline Eng',
    icon: 'GitMerge',
    description: 'ETL, data flows, transformations, and streaming',
    category: 'build',
    freeTier: false,
    avatarKey: AGENT_AVATAR_MAP['data-pipeline'],
    systemPrompt: buildSystemPrompt(
      'Data Pipeline Engineer',
      'ETL processes, data transformation, streaming pipelines, and batch processing. Focus on data flow architecture, transformation functions, error recovery, and pipeline orchestration. Generate pipeline classes, transformation utilities, and scheduling logic.'
    ),
  },

  // ── OPS ────────────────────────────────────────────────────────────────────
  {
    id: 'deployment',
    name: 'Deployment Agent',
    icon: 'Rocket',
    description: 'Vercel config, environment setup, and deployment strategy',
    category: 'ops',
    freeTier: false,
    avatarKey: AGENT_AVATAR_MAP['deployment'],
    systemPrompt: buildSystemPrompt(
      'Deployment Engineer',
      'Vercel deployment, environment variables, build optimization, and CI/CD. Focus on deployment configuration, environment management, build settings, and production readiness. Generate vercel.json configs, environment schemas, and deployment scripts.'
    ),
  },
  {
    id: 'testing',
    name: 'Testing Engineer',
    icon: 'FlaskConical',
    description: 'Test suites, coverage, and quality assurance',
    category: 'ops',
    freeTier: false,
    avatarKey: AGENT_AVATAR_MAP['testing'],
    systemPrompt: buildSystemPrompt(
      'Testing Engineer',
      'Vitest, React Testing Library, Playwright, and test architecture. Focus on unit tests, integration tests, E2E tests, and test utilities. Generate complete test files with proper mocks, fixtures, and assertions following AAA pattern.'
    ),
  },
  {
    id: 'security',
    name: 'Security Auditor',
    icon: 'Lock',
    description: 'Vulnerability analysis, OWASP checks, and hardening',
    category: 'ops',
    freeTier: false,
    avatarKey: AGENT_AVATAR_MAP['security'],
    systemPrompt: buildSystemPrompt(
      'Security Auditor',
      'OWASP Top 10, input validation, XSS/CSRF prevention, and security hardening. Focus on vulnerability identification, input sanitization, CSP headers, rate limiting, and secure coding patterns. Generate security middleware, validation schemas, and CSP configurations.'
    ),
  },
  {
    id: 'devops',
    name: 'DevOps Engineer',
    icon: 'Activity',
    description: 'Monitoring, logging, health checks, and observability',
    category: 'ops',
    freeTier: false,
    avatarKey: AGENT_AVATAR_MAP['devops'],
    systemPrompt: buildSystemPrompt(
      'DevOps Engineer',
      'monitoring, logging, health checks, and observability. Focus on structured logging, health endpoints, performance metrics, error tracking, and alerting. Generate health check routes, logging utilities, and monitoring configurations.'
    ),
  },

  // ── STRATEGY ───────────────────────────────────────────────────────────────
  {
    id: 'ux-design',
    name: 'UX Designer',
    icon: 'Palette',
    description: 'User flows, wireframes, and interaction patterns',
    category: 'strategy',
    freeTier: true,
    avatarKey: AGENT_AVATAR_MAP['ux-design'],
    systemPrompt: buildSystemPrompt(
      'UX Designer',
      'user experience design, interaction patterns, and accessibility. Focus on user flow mapping, information architecture, interaction design, and accessibility (WCAG 2.1). Generate user flow diagrams as structured data, component wireframe descriptions, and accessibility audit checklists. For code snippets, generate accessible React component shells with proper ARIA attributes.'
    ),
  },
  {
    id: 'documentation',
    name: 'Documentation Writer',
    icon: 'FileText',
    description: 'API docs, README, and developer guides',
    category: 'strategy',
    freeTier: false,
    avatarKey: AGENT_AVATAR_MAP['documentation'],
    systemPrompt: buildSystemPrompt(
      'Technical Writer',
      'API documentation, developer guides, and README files. Focus on clear explanations, code examples, setup instructions, and architecture documentation. Generate markdown documentation files, API reference docs, and getting-started guides.'
    ),
  },
  {
    id: 'cost-infra',
    name: 'Cost Analyst',
    icon: 'DollarSign',
    description: 'Infrastructure costs, API usage, and optimization',
    category: 'strategy',
    freeTier: false,
    avatarKey: AGENT_AVATAR_MAP['cost-infra'],
    systemPrompt: buildSystemPrompt(
      'Infrastructure Cost Analyst',
      'cloud cost analysis, API usage optimization, and infrastructure planning. Focus on Vercel pricing tiers, Supabase usage, Anthropic API token costs, and optimization strategies. Generate cost estimation spreadsheets as structured data and optimization recommendation lists.'
    ),
  },
  {
    id: 'project-manager',
    name: 'Project Manager',
    icon: 'ClipboardList',
    description: 'Timeline, dependencies, and sprint planning',
    category: 'strategy',
    freeTier: false,
    avatarKey: AGENT_AVATAR_MAP['project-manager'],
    systemPrompt: buildSystemPrompt(
      'Technical Project Manager',
      'sprint planning, dependency management, and delivery timelines. Focus on work breakdown structure, dependency graphs, risk identification, and milestone planning. Generate project timeline data structures, dependency matrices, and sprint plans.'
    ),
  },
]

export const AGENT_MAP = Object.fromEntries(
  AGENT_DEFINITIONS.map((a) => [a.id, a])
) as Record<string, AgentDefinition>

export const FREE_AGENT_IDS = AGENT_DEFINITIONS
  .filter((a) => a.freeTier)
  .map((a) => a.id)

export const AGENT_CATEGORIES = ['build', 'ops', 'strategy'] as const
