'use client'

import { motion } from 'framer-motion'
import { Brain, Zap, Hammer, Waves } from 'lucide-react'
import type { AvatarPersonality } from '@/lib/types'

const AVATAR_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string; color?: string }>> = {
  oracle: Brain,
  spark: Zap,
  forge: Hammer,
  flow: Waves,
}

interface AvatarCardProps {
  avatar: AvatarPersonality
  index: number
  onClick: () => void
}

export function AvatarCard({ avatar, index, onClick }: AvatarCardProps) {
  const Icon = AVATAR_ICONS[avatar.key] || Brain

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:translate-y-[-6px] glass"
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: '0',
      }}
      whileHover={{
        borderColor: 'rgba(255,255,255,.14)',
      }}
    >
      {/* Top accent stripe — avatar color */}
      <div
        className="h-[3px] w-full transition-all duration-500 group-hover:h-[4px]"
        style={{ background: avatar.gradient }}
      />

      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${avatar.glow}, transparent 60%)`,
        }}
      />

      <div className="px-6 pt-7 pb-6">
        {/* Icon + Name row */}
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
            style={{
              background: `${avatar.color}18`,
              border: `1px solid ${avatar.color}30`,
            }}
          >
            <Icon size={20} color={avatar.color} />
          </div>
          <div>
            <div
              className="text-white"
              style={{
                fontFamily: 'var(--font-fraunces), Fraunces, serif',
                fontSize: '1.35rem',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {avatar.name}
            </div>
          </div>
        </div>

        {/* Trait */}
        <div
          className="mb-5 font-light leading-relaxed min-h-[44px] relative z-10"
          style={{ fontSize: '0.84rem', color: 'var(--ink-20)' }}
        >
          {avatar.trait}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 relative z-10 mb-5">
          {avatar.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full font-medium"
              style={{
                fontSize: '0.6rem',
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.06)',
                color: 'rgba(255,255,255,.4)',
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                letterSpacing: '0.04em',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Select button — always visible, subtle, amplifies on hover */}
        <motion.button
          className="w-full py-2.5 rounded-xl font-medium transition-all duration-300 relative z-10"
          style={{
            background: `${avatar.color}12`,
            color: avatar.color,
            fontFamily: 'var(--font-outfit), Outfit, sans-serif',
            fontSize: '0.82rem',
            border: `1px solid ${avatar.color}25`,
          }}
          whileHover={{
            scale: 1.02,
            backgroundColor: `${avatar.color}22`,
          }}
          whileTap={{ scale: 0.98 }}
        >
          Build with {avatar.name}
        </motion.button>
      </div>

      {/* Live AI badge */}
      <div
        className="absolute top-5 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'rgba(61, 158, 28, 0.12)',
          border: '1px solid rgba(61, 158, 28, 0.2)',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: 'var(--green-300)', animation: 'onlinePulse 2s ease-in-out infinite' }}
        />
        <span
          style={{
            fontSize: '0.56rem',
            color: 'var(--green-300)',
            fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Live AI
        </span>
      </div>
    </motion.div>
  )
}
