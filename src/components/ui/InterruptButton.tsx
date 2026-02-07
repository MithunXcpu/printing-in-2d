'use client'

import { motion } from 'framer-motion'

interface InterruptButtonProps {
  onClick: () => void
  color: string
}

export function InterruptButton({ onClick, color }: InterruptButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      onClick={onClick}
      className="fixed bottom-8 right-8 z-50 px-5 py-3 rounded-full text-white font-medium transition-all hover:scale-105"
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        boxShadow: `0 4px 24px ${color}40`,
        fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
        fontSize: '0.8rem',
        letterSpacing: '0.02em',
      }}
    >
      Interrupt & Correct
    </motion.button>
  )
}
