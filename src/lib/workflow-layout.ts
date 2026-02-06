import type { WorkflowNodeType } from './types'

const COLUMN_POSITIONS: Record<WorkflowNodeType, { xMin: number; xMax: number }> = {
  source: { xMin: 5, xMax: 15 },
  processor: { xMin: 30, xMax: 42 },
  ai: { xMin: 30, xMax: 42 },
  decision: { xMin: 55, xMax: 65 },
  output: { xMin: 78, xMax: 88 },
}

const Y_POSITIONS = [15, 42, 70, 25, 58, 85]

export function calculateNodePosition(
  type: WorkflowNodeType,
  existingCountInColumn: number
): { x: number; y: number } {
  const col = COLUMN_POSITIONS[type]
  const x = (col.xMin + col.xMax) / 2
  const y = Y_POSITIONS[existingCountInColumn % Y_POSITIONS.length]

  return { x, y }
}
