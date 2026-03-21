'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { getNodeIcon } from '@/lib/node-icons'
import type { WorkflowNode, WorkflowNodeType } from '@/lib/types'

const NODE_STYLES: Record<string, { background: string; color: string; border: string }> = {
  // Original 5
  source: { background: 'linear-gradient(135deg,#0c4a6e,#0369a1)', color: '#bae6fd', border: 'rgba(125,211,252,.2)' },
  processor: { background: 'linear-gradient(135deg,#14532d,#166534)', color: '#bbf7d0', border: 'rgba(134,239,172,.2)' },
  decision: { background: 'linear-gradient(135deg,#78350f,#92400e)', color: '#fde68a', border: 'rgba(252,211,77,.2)' },
  output: { background: 'linear-gradient(135deg,#831843,#9d174d)', color: '#fbcfe8', border: 'rgba(249,168,212,.2)' },
  ai: { background: 'linear-gradient(135deg,#312e81,#4338ca)', color: '#c7d2fe', border: 'rgba(165,180,252,.2)' },
  // New 7
  trigger: { background: 'linear-gradient(135deg,#4c1d95,#7c3aed)', color: '#e9d5ff', border: 'rgba(196,181,253,.2)' },
  api: { background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: '#bfdbfe', border: 'rgba(147,197,253,.2)' },
  database: { background: 'linear-gradient(135deg,#134e4a,#0d9488)', color: '#ccfbf1', border: 'rgba(153,246,228,.2)' },
  notification: { background: 'linear-gradient(135deg,#78350f,#d97706)', color: '#fef3c7', border: 'rgba(253,230,138,.2)' },
  transform: { background: 'linear-gradient(135deg,#064e3b,#059669)', color: '#d1fae5', border: 'rgba(167,243,208,.2)' },
  display: { background: 'linear-gradient(135deg,#164e63,#0891b2)', color: '#cffafe', border: 'rgba(165,243,252,.2)' },
  storage: { background: 'linear-gradient(135deg,#1e293b,#475569)', color: '#e2e8f0', border: 'rgba(203,213,225,.2)' },
}

interface DiagramNodeProps {
  node: WorkflowNode
  isSelected?: boolean
  onSelect?: (nodeId: string) => void
  onDelete?: (nodeId: string) => void
}

export function DiagramNode({ node, isSelected, onSelect, onDelete }: DiagramNodeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const style = NODE_STYLES[node.type] || NODE_STYLES.processor

  if (!node.isRevealed) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      data-node
      className="absolute z-[5] flex items-center gap-2 whitespace-nowrap select-none"
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
        border: `1.5px solid ${isSelected ? 'rgba(255,255,255,.6)' : style.border}`,
        boxShadow: isSelected
          ? '0 0 0 2px rgba(255,255,255,.15), 0 4px 20px rgba(0,0,0,.25)'
          : '0 4px 16px rgba(0,0,0,.15)',
        cursor: 'pointer',
      }}
      onClick={(e) => { e.stopPropagation(); onSelect?.(node.id) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete button when selected */}
      <AnimatePresence>
        {isSelected && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={(e) => { e.stopPropagation(); onDelete?.(node.id) }}
            className="absolute flex items-center justify-center rounded-full"
            style={{
              top: -8, right: -8, width: 20, height: 20,
              background: 'rgba(239,68,68,.9)', color: '#fff',
            }}
          >
            <X size={12} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Icon */}
      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0" style={{ opacity: 0.85 }}>
        {getNodeIcon(node.type as WorkflowNodeType, 16, node.icon)}
      </div>

      <span>{node.label}</span>

      {/* Description tooltip on hover */}
      <AnimatePresence>
        {isHovered && node.description && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[10] pointer-events-none"
            style={{
              top: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,.85)',
              backdropFilter: 'blur(8px)',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,.8)',
              whiteSpace: 'normal',
              maxWidth: '220px',
              textAlign: 'center',
              lineHeight: 1.4,
              border: '1px solid rgba(255,255,255,.08)',
            }}
          >
            {node.description}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
