'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import type { WorkflowNode, WorkflowConnection } from '@/lib/types'

interface DiagramConnectionProps {
  connection: WorkflowConnection
  nodes: WorkflowNode[]
  avatarColor?: string
}

export function DiagramConnection({ connection, nodes, avatarColor = '#2d8014' }: DiagramConnectionProps) {
  const fromNode = nodes.find((n) => n.id === connection.from)
  const toNode = nodes.find((n) => n.id === connection.to)
  const gRef = useRef<SVGGElement>(null)
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null)

  const measure = useCallback(() => {
    const svg = gRef.current?.closest('svg')
    if (svg) {
      const { width, height } = svg.getBoundingClientRect()
      if (width > 10 && height > 10) {
        setDims({ w: width, h: height })
      }
    }
  }, [])

  // Measure whenever the component mounts/updates and on resize
  useEffect(() => {
    measure()
    // Also measure after a small delay in case layout isn't ready
    const t1 = setTimeout(measure, 100)
    const t2 = setTimeout(measure, 500)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener('resize', measure)
    }
  }, [measure, connection.isRevealed])

  // Don't render content if nodes aren't ready
  if (!fromNode?.isRevealed || !toNode?.isRevealed) return <g ref={gRef} />
  if (!connection.isRevealed) return <g ref={gRef} />

  // Need valid dimensions to draw
  if (!dims) return <g ref={gRef} />

  // Convert percentage positions to pixels
  const x1 = (fromNode.x / 100) * dims.w + 50
  const y1 = (fromNode.y / 100) * dims.h
  const x2 = (toNode.x / 100) * dims.w - 50
  const y2 = (toNode.y / 100) * dims.h
  const mx = (x1 + x2) / 2

  const path = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`

  return (
    <g ref={gRef}>
      {/* Glow line */}
      <path
        d={path}
        fill="none"
        stroke={avatarColor}
        strokeWidth="4"
        opacity="0.15"
        style={{ filter: 'blur(3px)' }}
      />
      {/* Main dashed line */}
      <path
        d={path}
        fill="none"
        stroke={avatarColor}
        strokeWidth="1.5"
        strokeDasharray="8 5"
        opacity="0.5"
        style={{
          strokeDashoffset: 100,
          animation: 'dashDraw 1s ease forwards',
        }}
      />
      {/* Arrowhead dot at endpoint */}
      <circle
        cx={x2}
        cy={y2}
        r="3"
        fill={avatarColor}
        opacity="0.6"
      />
      {/* Connection label */}
      {connection.label && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 8}
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize="9"
          fontFamily="var(--font-jetbrains-mono), JetBrains Mono, monospace"
        >
          {connection.label}
        </text>
      )}
    </g>
  )
}
