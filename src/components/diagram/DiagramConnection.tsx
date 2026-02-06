'use client'

import type { WorkflowNode, WorkflowConnection } from '@/lib/types'

interface DiagramConnectionProps {
  connection: WorkflowConnection
  nodes: WorkflowNode[]
  avatarColor?: string
}

export function DiagramConnection({ connection, nodes, avatarColor = '#2d8014' }: DiagramConnectionProps) {
  const fromNode = nodes.find((n) => n.id === connection.from)
  const toNode = nodes.find((n) => n.id === connection.to)

  if (!fromNode?.isRevealed || !toNode?.isRevealed) return null

  // Calculate SVG path using percentage coordinates
  const x1 = fromNode.x + 5 // offset right of node
  const y1 = fromNode.y
  const x2 = toNode.x - 5 // offset left of node
  const y2 = toNode.y
  const mx = (x1 + x2) / 2

  const path = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`

  return (
    <>
      {/* Glow line */}
      <path
        d={path}
        fill="none"
        stroke={avatarColor}
        strokeWidth="4"
        opacity="0.12"
        style={{ filter: 'blur(3px)' }}
      />
      {/* Main line */}
      <path
        d={path}
        fill="none"
        stroke={avatarColor}
        strokeWidth="2"
        strokeDasharray="6 4"
        opacity="0.4"
        className="transition-opacity duration-600"
      />
    </>
  )
}
