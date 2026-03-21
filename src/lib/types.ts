export type AvatarKey = 'oracle' | 'spark' | 'forge' | 'flow'

export type InterviewStage =
  | 'current_state_1'
  | 'current_state_2'
  | 'current_state_3'
  | 'current_state_4'
  | 'current_state_5'
  | 'generate_current'
  | 'validate_current'
  | 'future_state_1'
  | 'future_state_2'
  | 'future_state_3'
  | 'future_state_4'
  | 'future_state_5'
  | 'generate_future'
  | 'validate_future'
  | 'compare'
  | 'refine'
  | 'orchestrate'

export type WorkflowNodeType = 'source' | 'processor' | 'decision' | 'output' | 'ai' | 'trigger' | 'api' | 'database' | 'notification' | 'transform' | 'display' | 'storage'

export interface WorkflowNode {
  id: string
  label: string
  type: WorkflowNodeType
  icon: string
  imageUrl?: string
  description?: string
  x: number
  y: number
  isRevealed: boolean
}

export interface WorkflowConnection {
  id: string
  from: string
  to: string
  label?: string
  isRevealed: boolean
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  /** Base64 data URL for an attached screenshot/image */
  imageUrl?: string
  /** Base64 data URL for a generated state image */
  stateImageUrl?: string
  toolCalls?: ToolCall[]
  /** When true, message is in API history but hidden from the chat UI */
  hidden?: boolean
  timestamp: number
}

export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
}

export interface AvatarPersonality {
  key: AvatarKey
  name: string
  emoji: string
  /** URL to a realistic headshot photo for this avatar */
  photoUrl?: string
  trait: string
  tags: string[]
  color: string
  glow: string
  gradient: string
  senderColor: string
  voiceId?: string
  /** Ready Player Me GLB URL (with morphTargets query param) */
  modelUrl?: string
  /** Body type for TalkingHead: 'M' or 'F' */
  modelBody?: string
  tavusReplicaId?: string
  tavusPersonaId?: string
}

export interface WorkOrder {
  id: string
  orderIndex: number
  title: string
  description: string
  implementationPlan: string
  suggestedFiles: string[]
  dependencies: string[]
  complexity: 'low' | 'medium' | 'high'
  status: 'pending' | 'approved'
}

export interface UserProfile {
  name?: string
  role?: string
  industry?: string
  department?: string
  companyContext?: string
  desiredOutcomes: string[]
  painPoints: string[]
  currentTools: string[]
  dataSources: string[]
}

// ── Agent Swarm Types ─────────────────────────────────────────────────────

export type AgentId =
  | 'frontend' | 'backend' | 'database' | 'auth' | 'ai-llm' | 'integration'
  | 'data-pipeline' | 'deployment' | 'testing' | 'security' | 'ux-design'
  | 'documentation' | 'cost-infra' | 'project-manager' | 'devops'

export type AgentStatus = 'idle' | 'queued' | 'analyzing' | 'complete' | 'error'

export type AgentCategory = 'build' | 'ops' | 'strategy'

export interface AgentDefinition {
  id: AgentId
  name: string
  icon: string
  description: string
  category: AgentCategory
  freeTier: boolean
  avatarKey: AvatarKey
  systemPrompt: string
}

export interface AgentCodeSnippet {
  filename: string
  language: string
  code: string
  description: string
}

export interface AgentResult {
  agentId: AgentId
  status: AgentStatus
  analysis: string
  codeSnippets: AgentCodeSnippet[]
  recommendations: string[]
  relevantNodeIds: string[]
  estimatedHours?: number
  imageDescription?: string
  imageUrl?: string
  error?: string
}

export interface SwarmInput {
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  profile: UserProfile
  workOrders: WorkOrder[]
  agentIds: AgentId[]
}

export type SessionPhase = 'selection' | 'discover' | 'design' | 'blueprint' | 'build' | 'validate'

export const PHASE_CONFIG: { key: SessionPhase; label: string; subtitle: string }[] = [
  { key: 'discover', label: 'DISCOVER', subtitle: 'Tell us about you' },
  { key: 'design', label: 'DESIGN', subtitle: 'Build your workflow' },
  { key: 'blueprint', label: 'BLUEPRINT', subtitle: 'Review your plan' },
  { key: 'build', label: 'BUILD', subtitle: 'Generate build plan' },
]
