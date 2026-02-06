'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  if (!node.isRevealed) return null

  const showImage = node.imageUrl && !imageError

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
      {/* Icon area — emoji or AI image with crossfade */}
      <div className="relative w-6 h-6 flex items-center justify-center flex-shrink-0">
        <AnimatePresence mode="wait">
          {showImage && imageLoaded ? (
            <motion.img
              key="image"
              src={node.imageUrl}
              alt={node.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-6 h-6 rounded object-cover"
              style={{ filter: 'brightness(1.1) saturate(1.2)' }}
            />
          ) : (
            <motion.span
              key="emoji"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-base"
            >
              {node.icon}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Hidden preloader for the image */}
        {showImage && !imageLoaded && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={node.imageUrl}
            alt=""
            className="absolute inset-0 w-0 h-0 opacity-0"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {/* Shimmer while waiting for image */}
        {!node.imageUrl && !imageError && (
          <motion.div
            className="absolute inset-0 rounded"
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ background: style.color }}
          />
        )}
      </div>

      <span>{node.label}</span>
    </motion.div>
  )
}
