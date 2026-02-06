import type { WorkflowNodeType } from './types'

// Column centers for each node type — left-to-right flow
// Shifted inward slightly to prevent nodes from getting clipped at container edges
const COLUMN_X: Record<WorkflowNodeType, number> = {
  source: 14,
  processor: 36,
  ai: 50,
  decision: 64,
  output: 82,
}

// Vertical distribution
const Y_START = 22
const Y_SPACING = 20

export function calculateNodePosition(
  type: WorkflowNodeType,
  existingCountInColumn: number
): { x: number; y: number } {
  const x = COLUMN_X[type]

  // Distribute vertically with consistent spacing
  const y = Y_START + existingCountInColumn * Y_SPACING

  // Clamp to keep nodes within 15-85% range
  const clampedY = Math.min(Math.max(y, 15), 85)

  return { x, y: clampedY }
}
