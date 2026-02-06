import Anthropic from '@anthropic-ai/sdk'
import { isMockMode } from '@/lib/mock-mode'
import type { WorkflowNode, WorkflowConnection, WorkOrder } from '@/lib/types'

interface GenerateCodeRequest {
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  workOrders: WorkOrder[]
  workOrderId: string
}

const SYSTEM_PROMPT = `You are an expert TypeScript engineer. You generate clean, production-ready TypeScript code based on workflow designs.

Rules:
- Generate ONLY TypeScript code. No markdown, no explanations, no code fences.
- Use modern TypeScript (ES2022+, strict mode).
- Use clear naming conventions, proper typing, and JSDoc comments for public APIs.
- Include error handling with typed errors.
- Use async/await for asynchronous operations.
- Export all public interfaces and classes.
- Keep the code modular and testable.
- Add inline comments only where the logic is non-obvious.
- Do NOT import from external packages unless absolutely necessary. If you do, note the import.
- Generate the complete, runnable file content.`

function buildWorkOrderPrompt(
  workOrder: WorkOrder,
  allWorkOrders: WorkOrder[],
  nodes: WorkflowNode[],
  connections: WorkflowConnection[]
): string {
  const nodesSummary = nodes
    .filter((n) => n.isRevealed)
    .map((n) => `- [${n.type}] "${n.label}"${n.description ? `: ${n.description}` : ''}`)
    .join('\n')

  const connectionsSummary = connections
    .filter((c) => c.isRevealed)
    .map((c) => {
      const from = nodes.find((n) => n.id === c.from)
      const to = nodes.find((n) => n.id === c.to)
      return `- "${from?.label}" -> "${to?.label}"${c.label ? ` (${c.label})` : ''}`
    })
    .join('\n')

  const depOrders = workOrder.dependencies
    .map((depId) => allWorkOrders.find((wo) => wo.id === depId))
    .filter(Boolean)
    .map((wo) => `- WO-${wo!.orderIndex + 1}: ${wo!.title}`)
    .join('\n')

  return `Generate the TypeScript implementation for this work order.

## Workflow Context

Nodes in the workflow:
${nodesSummary}

Connections:
${connectionsSummary}

## Work Order: WO-${workOrder.orderIndex + 1} — ${workOrder.title}

Description: ${workOrder.description}

Implementation plan:
${workOrder.implementationPlan}

Target files: ${workOrder.suggestedFiles.join(', ')}
Complexity: ${workOrder.complexity}
${depOrders ? `\nDepends on:\n${depOrders}` : ''}

Generate a single, cohesive TypeScript file that implements this work order. The file should be complete and ready to use. Combine all suggested files into one well-organized module.`
}

function createMockCodeStream(workOrder: WorkOrder): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()

  const mockCode = `// =============================================================================
// WO-${workOrder.orderIndex + 1}: ${workOrder.title}
// =============================================================================

/**
 * ${workOrder.description}
 *
 * Generated implementation for: ${workOrder.suggestedFiles.join(', ')}
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface ${toPascalCase(workOrder.title)}Config {
  /** Enable debug logging */
  debug?: boolean
  /** Maximum retry attempts */
  maxRetries?: number
  /** Timeout in milliseconds */
  timeoutMs?: number
}

export interface ${toPascalCase(workOrder.title)}Result {
  success: boolean
  data: unknown
  metadata: {
    duration: number
    timestamp: string
  }
}

// ── Errors ─────────────────────────────────────────────────────────────────

export class ${toPascalCase(workOrder.title)}Error extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = '${toPascalCase(workOrder.title)}Error'
  }
}

// ── Implementation ─────────────────────────────────────────────────────────

export class ${toPascalCase(workOrder.title)} {
  private readonly config: Required<${toPascalCase(workOrder.title)}Config>

  constructor(config: ${toPascalCase(workOrder.title)}Config = {}) {
    this.config = {
      debug: config.debug ?? false,
      maxRetries: config.maxRetries ?? 3,
      timeoutMs: config.timeoutMs ?? 30_000,
    }
  }

  /**
   * Execute the ${workOrder.title.toLowerCase()} operation.
   */
  async execute(input: unknown): Promise<${toPascalCase(workOrder.title)}Result> {
    const startTime = performance.now()

    try {
      if (this.config.debug) {
        console.log(\`[${toPascalCase(workOrder.title)}] Starting execution...\`)
      }

      const data = await this.processWithRetry(input)

      return {
        success: true,
        data,
        metadata: {
          duration: performance.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      throw new ${toPascalCase(workOrder.title)}Error(
        \`Execution failed: \${error instanceof Error ? error.message : 'Unknown error'}\`,
        'EXECUTION_FAILED',
        error instanceof Error ? error : undefined
      )
    }
  }

  private async processWithRetry(input: unknown, attempt = 1): Promise<unknown> {
    try {
      return await this.process(input)
    } catch (error) {
      if (attempt >= this.config.maxRetries) throw error
      const delay = Math.min(1000 * 2 ** attempt, 10_000)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return this.processWithRetry(input, attempt + 1)
    }
  }

  private async process(input: unknown): Promise<unknown> {
    // TODO: Implement actual processing logic
    // This is the core implementation for: ${workOrder.description}
    return input
  }
}

// ── Factory ────────────────────────────────────────────────────────────────

export function create${toPascalCase(workOrder.title)}(
  config?: ${toPascalCase(workOrder.title)}Config
): ${toPascalCase(workOrder.title)} {
  return new ${toPascalCase(workOrder.title)}(config)
}
`

  return new ReadableStream({
    async start(controller) {
      // Stream in chunks to simulate real generation
      const chunkSize = 12
      for (let i = 0; i < mockCode.length; i += chunkSize) {
        const chunk = mockCode.slice(i, i + chunkSize)
        controller.enqueue(encoder.encode(chunk))
        await new Promise((r) => setTimeout(r, 8 + Math.random() * 15))
      }
      controller.close()
    },
  })
}

function toPascalCase(str: string): string {
  return str
    .split(/[\s\-_&]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

export async function POST(request: Request) {
  const { nodes, connections, workOrders, workOrderId } =
    (await request.json()) as GenerateCodeRequest

  const workOrder = workOrders.find((wo) => wo.id === workOrderId)
  if (!workOrder) {
    return new Response(JSON.stringify({ error: 'Work order not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ── Mock mode: stream mock code ──
  if (isMockMode()) {
    const readable = createMockCodeStream(workOrder)
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }

  // ── Live mode: stream from Claude ──
  const anthropic = new Anthropic()
  const userPrompt = buildWorkOrderPrompt(workOrder, workOrders, nodes, connections)

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error'
        controller.enqueue(encoder.encode(`\n// ERROR: ${errMsg}`))
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
