import type { WorkflowNode, WorkflowConnection, WorkflowNodeType } from './types'

// Fallback column positions for initial node placement (before connections exist)
const COLUMN_X: Record<WorkflowNodeType, number> = {
  source: 12,
  trigger: 12,
  api: 35,
  database: 35,
  processor: 35,
  transform: 50,
  ai: 50,
  decision: 65,
  notification: 80,
  display: 80,
  output: 88,
  storage: 88,
}

const Y_START = 22
const Y_SPACING = 20

/** Simple column-based placement for a new node (used before connections exist). */
export function calculateNodePosition(
  type: WorkflowNodeType,
  existingCountInColumn: number
): { x: number; y: number } {
  const x = COLUMN_X[type] ?? 50
  const y = Math.min(Math.max(Y_START + existingCountInColumn * Y_SPACING, 12), 88)
  return { x, y }
}

/**
 * Smart graph layout: positions nodes based on connection topology.
 * Uses BFS from root nodes to assign depth levels (left-to-right),
 * then spaces siblings vertically within each level.
 * Handles parallel branches and disconnected subgraphs.
 */
export function calculateSmartLayout(
  nodes: WorkflowNode[],
  connections: WorkflowConnection[]
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()

  if (nodes.length === 0) return positions

  // If no connections, fall back to column-based layout
  if (connections.length === 0) {
    const typeCounts: Record<string, number> = {}
    for (const node of nodes) {
      const count = typeCounts[node.type] || 0
      typeCounts[node.type] = count + 1
      positions.set(node.id, calculateNodePosition(node.type, count))
    }
    return positions
  }

  // Build adjacency lists
  const children = new Map<string, string[]>()  // node -> downstream nodes
  const parents = new Map<string, string[]>()    // node -> upstream nodes
  const nodeIds = new Set(nodes.map(n => n.id))

  for (const conn of connections) {
    if (!nodeIds.has(conn.from) || !nodeIds.has(conn.to)) continue
    if (!children.has(conn.from)) children.set(conn.from, [])
    children.get(conn.from)!.push(conn.to)
    if (!parents.has(conn.to)) parents.set(conn.to, [])
    parents.get(conn.to)!.push(conn.from)
  }

  // Find root nodes (no incoming connections)
  const roots: string[] = []
  for (const node of nodes) {
    const p = parents.get(node.id)
    if (!p || p.length === 0) {
      roots.push(node.id)
    }
  }

  // If no roots found (cycle), pick the first node
  if (roots.length === 0) roots.push(nodes[0].id)

  // BFS to assign levels (depth from root)
  const levels = new Map<string, number>()
  const queue: string[] = [...roots]
  for (const r of roots) levels.set(r, 0)

  while (queue.length > 0) {
    const current = queue.shift()!
    const currentLevel = levels.get(current)!
    const kids = children.get(current) || []
    for (const child of kids) {
      const existingLevel = levels.get(child)
      // Always take the deeper level (longest path)
      if (existingLevel === undefined || currentLevel + 1 > existingLevel) {
        levels.set(child, currentLevel + 1)
        queue.push(child)
      }
    }
  }

  // Assign disconnected nodes
  for (const node of nodes) {
    if (!levels.has(node.id)) {
      levels.set(node.id, 0)
    }
  }

  // Group nodes by level
  const levelGroups = new Map<number, string[]>()
  let maxLevel = 0
  for (const [nodeId, level] of levels) {
    if (!levelGroups.has(level)) levelGroups.set(level, [])
    levelGroups.get(level)!.push(nodeId)
    if (level > maxLevel) maxLevel = level
  }

  // Position: levels spread left-to-right, siblings spread top-to-bottom
  const xPadding = 10  // % from edges
  const yPadding = 15
  const xRange = 100 - 2 * xPadding
  const yRange = 100 - 2 * yPadding

  for (const [level, group] of levelGroups) {
    // X position based on depth
    const x = maxLevel === 0
      ? 50
      : xPadding + (level / maxLevel) * xRange

    // Y positions: evenly distribute siblings
    const count = group.length
    for (let i = 0; i < count; i++) {
      const y = count === 1
        ? 50
        : yPadding + (i / (count - 1)) * yRange

      positions.set(group[i], { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 })
    }
  }

  return positions
}
