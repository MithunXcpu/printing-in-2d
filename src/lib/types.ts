export type AvatarKey = 'oracle' | 'spark' | 'forge' | 'flow'

export type InterviewStage =
  | 'outcome'
  | 'data_sources'
  | 'processing'
  | 'outputs'
  | 'review'
  | 'complete'

export type WorkflowNodeType = 'source' | 'processor' | 'decision' | 'output' | 'ai'

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
  toolCalls?: ToolCall[]
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
  role?: string
  department?: string
  companyContext?: string
  desiredOutcomes: string[]
  painPoints: string[]
  currentTools: string[]
  dataSources: string[]
}
