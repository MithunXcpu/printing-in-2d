import Anthropic from '@anthropic-ai/sdk'
import { isMockMode } from '@/lib/mock-mode'
import { getMockResult } from '@/lib/mock-swarm'
import { AGENT_MAP, FREE_AGENT_IDS } from '@/lib/agent-definitions'
import type { SwarmInput, AgentId, AgentResult, WorkflowNode, WorkflowConnection, WorkOrder, UserProfile } from '@/lib/types'

function buildAgentUserPrompt(
  nodes: WorkflowNode[],
  connections: WorkflowConnection[],
  profile: UserProfile,
  workOrders: WorkOrder[]
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
      return `- "${from?.label ?? c.from}" → "${to?.label ?? c.to}"${c.label ? ` (${c.label})` : ''}`
    })
    .join('\n')

  const workOrdersSummary = workOrders
    .map((wo) => `- WO-${wo.orderIndex + 1}: ${wo.title} (${wo.complexity}) — ${wo.description}`)
    .join('\n')

  const profileSummary = [
    profile.role && `Role: ${profile.role}`,
    profile.industry && `Industry: ${profile.industry}`,
    profile.department && `Department: ${profile.department}`,
    profile.painPoints.length > 0 && `Pain points: ${profile.painPoints.join(', ')}`,
    profile.desiredOutcomes.length > 0 && `Desired outcomes: ${profile.desiredOutcomes.join(', ')}`,
    profile.currentTools.length > 0 && `Current tools: ${profile.currentTools.join(', ')}`,
    profile.dataSources.length > 0 && `Data sources: ${profile.dataSources.join(', ')}`,
  ]
    .filter(Boolean)
    .join('\n')

  return `Analyze this workflow and provide your specialized assessment.

## User Profile
${profileSummary || 'No profile data available'}

## Workflow Nodes
${nodesSummary || 'No nodes defined'}

## Connections
${connectionsSummary || 'No connections defined'}

## Work Orders
${workOrdersSummary || 'No work orders defined'}

Respond with ONLY valid JSON matching the required schema.`
}

function createMockSwarmStream(agentIds: AgentId[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      const emit = (obj: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'))
      }

      let completed = 0
      let failed = 0

      for (const agentId of agentIds) {
        emit({ type: 'agent_start', agentId })
        // Stagger delay for visual effect
        await new Promise((r) => setTimeout(r, 200 + Math.random() * 300))

        try {
          const result = getMockResult(agentId)

          // Stream analysis in chunks for realism
          const words = result.analysis.split(' ')
          for (let i = 0; i < words.length; i += 5) {
            const chunk = words.slice(i, i + 5).join(' ') + ' '
            emit({ type: 'agent_delta', agentId, chunk })
            await new Promise((r) => setTimeout(r, 30))
          }

          emit({ type: 'agent_complete', agentId, result })
          completed++
        } catch {
          emit({ type: 'agent_error', agentId, error: 'Mock error' })
          failed++
        }
      }

      emit({
        type: 'swarm_complete',
        summary: { total: agentIds.length, completed, failed },
      })

      controller.close()
    },
  })
}

async function runAgent(
  anthropic: Anthropic,
  agentId: AgentId,
  userPrompt: string
): Promise<AgentResult> {
  const definition = AGENT_MAP[agentId]
  if (!definition) {
    return {
      agentId,
      status: 'error',
      analysis: '',
      codeSnippets: [],
      recommendations: [],
      relevantNodeIds: [],
      error: `Unknown agent: ${agentId}`,
    }
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: definition.systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    const rawText = textBlock && textBlock.type === 'text' ? textBlock.text : ''

    // Parse JSON from response (handle potential markdown fences)
    let parsed: Record<string, unknown>
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    } catch {
      parsed = { analysis: rawText }
    }

    return {
      agentId,
      status: 'complete',
      analysis: (parsed.analysis as string) || rawText,
      codeSnippets: Array.isArray(parsed.codeSnippets) ? parsed.codeSnippets : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      relevantNodeIds: Array.isArray(parsed.relevantNodeIds) ? parsed.relevantNodeIds : [],
      estimatedHours: typeof parsed.estimatedHours === 'number' ? parsed.estimatedHours : undefined,
      imageDescription: typeof parsed.imageDescription === 'string' ? parsed.imageDescription : undefined,
    }
  } catch (error) {
    return {
      agentId,
      status: 'error',
      analysis: '',
      codeSnippets: [],
      recommendations: [],
      relevantNodeIds: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function POST(request: Request) {
  const { nodes, connections, profile, workOrders, agentIds } =
    (await request.json()) as SwarmInput

  // Filter to only allowed agents (free tier check would go here)
  const validAgentIds = agentIds.filter((id) => AGENT_MAP[id])

  // Mock mode
  if (isMockMode()) {
    const readable = createMockSwarmStream(validAgentIds)
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }

  // Live mode — run agents in parallel batches of 3
  const anthropic = new Anthropic()
  const userPrompt = buildAgentUserPrompt(nodes, connections, profile ?? {
    desiredOutcomes: [],
    painPoints: [],
    currentTools: [],
    dataSources: [],
  }, workOrders)
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      const emit = (obj: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'))
      }

      const BATCH_SIZE = 3
      let completed = 0
      let failed = 0

      for (let i = 0; i < validAgentIds.length; i += BATCH_SIZE) {
        const batch = validAgentIds.slice(i, i + BATCH_SIZE)

        // Emit start events for this batch
        for (const agentId of batch) {
          emit({ type: 'agent_start', agentId })
        }

        // Run batch in parallel
        const results = await Promise.all(
          batch.map((agentId) => runAgent(anthropic, agentId, userPrompt))
        )

        // Emit results
        for (const result of results) {
          if (result.status === 'error') {
            emit({ type: 'agent_error', agentId: result.agentId, error: result.error })
            failed++
          } else {
            emit({ type: 'agent_complete', agentId: result.agentId, result })
            completed++
          }
        }
      }

      emit({
        type: 'swarm_complete',
        summary: { total: validAgentIds.length, completed, failed },
      })

      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
