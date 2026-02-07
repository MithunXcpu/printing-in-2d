import {
  Database,
  Cog,
  Brain,
  GitBranch,
  FileOutput,
  Box,
} from 'lucide-react'
import type { WorkflowNodeType } from './types'

const ICON_MAP: Record<WorkflowNodeType, React.ComponentType<{ size?: number; className?: string }>> = {
  source: Database,
  processor: Cog,
  ai: Brain,
  decision: GitBranch,
  output: FileOutput,
}

export function getNodeIcon(type: WorkflowNodeType, size = 16) {
  const Icon = ICON_MAP[type] || Box
  return <Icon size={size} />
}
