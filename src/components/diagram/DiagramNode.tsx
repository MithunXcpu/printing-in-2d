'use client'

import { motion } from 'framer-motion'
import { getNodeIcon } from '@/lib/node-icons'
import type { WorkflowNode } from '@/lib/types'

const NODE_STYLES: Record<string, { background: string; color: string; border: string }> = {
  source: { background: 'linear-gradient(135deg,#0c4a6e,#0369a1)', color: '#bae6fd', border: 'rgba(125,211,252,.2)' },
  processor: { background: 'linear-gradient(135deg,#14532d,#166534)', color: '#bbf7d0', border: 'rgba(134,239,172,.2)' },
  decision: { background: 'linear-gradient(135deg,#78350f,#92400e)', color: '#fde68a', border: 'rgba(252,211,77,.2)' },
  output: { background: 'linear-gradient(135deg,#831843,#9d174d)', color: '#fbcfe8', border: 'rgba(249,168,212,.2)' },
  ai: { background: 'linear-gradient(135deg,#0d1208,#1e2518)', color: '#8fcf74', border: '#3a4233' },
}

interface DiagramNodeProps {
  node: WorkflowNode
}

export function DiagramNode({ node }: DiagramNodeProps) {
  const style = NODE_STYLES[node.type] || NODE_STYLES.processor

  if (!node.isRevealed) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="absolute z-[5] flex items-center gap-2 whitespace-nowrap cursor-default"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        transform: 'translate(-50%, -50%)',
        padding: '10px 18px',
        borderRadius: '12px',
        fontSize: '0.78rem',
        fontWeight: 500,
        background: style.background,
        color: style.color,
        border: `1px solid ${style.border}`,
        boxShadow: '0 4px 16px rgba(0,0,0,.15)',
      }}
    >
      {/* Lucide icon */}
      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0" style={{ opacity: 0.85 }}>
        {getNodeIcon(node.type, 16)}
      </div>

      <span>{node.label}</span>
    </motion.div>
  )
}
