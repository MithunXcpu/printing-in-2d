import Anthropic from '@anthropic-ai/sdk'
import { isMockMode } from '@/lib/mock-mode'
import { getMockResult } from '@/lib/mock-swarm'
import { AGENT_MAP } from '@/lib/agent-definitions'
import type { AgentId, AgentResult, WorkflowNode, WorkflowConnection, WorkOrder, UserProfile } from '@/lib/types'

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
    profile.painPoints.length > 0 && `Pain points: ${profile.painPoints.join(', ')}`,
    profile.desiredOutcomes.length > 0 && `Desired outcomes: ${profile.desiredOutcomes.join(', ')}`,
    profile.currentTools.length > 0 && `Current tools: ${profile.currentTools.join(', ')}`,
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId: rawAgentId } = await params
  const agentId = rawAgentId as AgentId
  const { nodes, connections, profile, workOrders } = await request.json()

  const definition = AGENT_MAP[agentId]
  if (!definition) {
    return Response.json({ error: `Unknown agent: ${agentId}` }, { status: 404 })
  }

  // Mock mode
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 1000))
    const result = getMockResult(agentId)
    return Response.json(result)
  }

  // Live mode
  const anthropic = new Anthropic()
  const userPrompt = buildAgentUserPrompt(
    nodes ?? [],
    connections ?? [],
    profile ?? { desiredOutcomes: [], painPoints: [], currentTools: [], dataSources: [] },
    workOrders ?? []
  )

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: definition.systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    const rawText = textBlock && textBlock.type === 'text' ? textBlock.text : ''

    let parsed: Record<string, unknown>
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    } catch {
      parsed = { analysis: rawText }
    }

    const result: AgentResult = {
      agentId,
      status: 'complete',
      analysis: (parsed.analysis as string) || rawText,
      codeSnippets: Array.isArray(parsed.codeSnippets) ? parsed.codeSnippets : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      relevantNodeIds: Array.isArray(parsed.relevantNodeIds) ? parsed.relevantNodeIds : [],
      estimatedHours: typeof parsed.estimatedHours === 'number' ? parsed.estimatedHours : undefined,
      imageDescription: typeof parsed.imageDescription === 'string' ? parsed.imageDescription : undefined,
    }

    return Response.json(result)
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return Response.json(
      { agentId, status: 'error', error: errMsg },
      { status: 500 }
    )
  }
}
