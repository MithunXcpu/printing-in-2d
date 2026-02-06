'use client'

import { motion } from 'framer-motion'
import type { AvatarPersonality } from '@/lib/types'

interface AvatarCardProps {
  avatar: AvatarPersonality
  index: number
  onClick: () => void
}

export function AvatarCard({ avatar, index, onClick }: AvatarCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="group relative overflow-hidden text-center cursor-pointer transition-all duration-[450ms] hover:translate-y-[-4px]"
      style={{
        background: 'rgba(255,255,255,.03)',
        border: '1.5px solid rgba(255,255,255,.06)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px 24px',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'rgba(255,255,255,.12)'
        el.style.background = 'rgba(255,255,255,.05)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'rgba(255,255,255,.06)'
        el.style.background = 'rgba(255,255,255,.03)'
      }}
    >
      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[450ms] pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${avatar.glow}, transparent 70%)`,
        }}
      />

      {/* Orb / Photo */}
      <div
        className="w-[88px] h-[88px] rounded-full mx-auto mb-[18px] flex items-center justify-center text-[2.4rem] relative transition-transform duration-[450ms] group-hover:scale-[1.06] overflow-hidden"
        style={{
          background: avatar.photoUrl ? 'transparent' : avatar.gradient,
          border: avatar.photoUrl ? `3px solid ${avatar.color}55` : '2px solid rgba(255,255,255,.06)',
          boxShadow: `0 8px 32px ${avatar.glow}`,
        }}
      >
        {avatar.photoUrl ? (
          <img
            src={avatar.photoUrl}
            alt={avatar.name}
            className="w-full h-full object-cover"
          />
        ) : (
          avatar.emoji
        )}
        <span
          className="absolute inset-[-6px] rounded-full pointer-events-none"
          style={{
            border: '1px dashed rgba(255,255,255,.06)',
            animation: 'orbSpin 20s linear infinite',
          }}
        />
      </div>

      {/* Name */}
      <div
        className="mb-1 text-white"
        style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', fontSize: '1.2rem', fontWeight: 600 }}
      >
        {avatar.name}
      </div>

      {/* Trait */}
      <div
        className="mb-3.5 font-light leading-[1.5] min-h-[48px]"
        style={{ fontSize: '0.8rem', color: 'var(--ink-20)' }}
      >
        {avatar.trait}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap justify-center gap-[5px]">
        {avatar.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-[3px] rounded-full font-medium"
            style={{
              fontSize: '0.64rem',
              background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(255,255,255,.06)',
              color: 'rgba(255,255,255,.4)',
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Select button (appears on hover) */}
      <button
        className="mt-[18px] px-6 py-2.5 rounded-full font-medium transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
        style={{
          border: `1.5px solid ${avatar.color}`,
          background: 'transparent',
          color: avatar.color,
          fontFamily: 'var(--font-outfit), Outfit, sans-serif',
          fontSize: '0.82rem',
        }}
        onMouseEnter={(e) => {
          const btn = e.currentTarget
          btn.style.background = avatar.color
          btn.style.color = '#fff'
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget
          btn.style.background = 'transparent'
          btn.style.color = avatar.color
        }}
      >
        Select {avatar.name}
      </button>
    </motion.div>
  )
}
