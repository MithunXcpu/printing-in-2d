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
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="group relative overflow-hidden text-center cursor-pointer transition-all duration-500 hover:translate-y-[-6px] glass"
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: '36px 24px',
      }}
      whileHover={{
        borderColor: 'rgba(255,255,255,.14)',
      }}
    >
      {/* Glow effect on hover — uses avatar's color */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 20%, ${avatar.glow}, transparent 60%)`,
        }}
      />

      {/* Live AI badge */}
      <div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
            fontSize: '0.58rem',
            color: 'var(--green-300)',
            fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Live AI
        </span>
      </div>

      {/* Avatar Orb */}
      <div
        className="w-[112px] h-[112px] rounded-full mx-auto mb-5 flex items-center justify-center text-[2.8rem] relative transition-transform duration-500 group-hover:scale-105 overflow-hidden"
        style={{
          background: avatar.photoUrl ? 'transparent' : avatar.gradient,
          border: avatar.photoUrl ? `3px solid ${avatar.color}44` : '2px solid rgba(255,255,255,.06)',
          boxShadow: `0 12px 40px ${avatar.glow}`,
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
        {/* Spinning dashed ring */}
        <span
          className="absolute inset-[-8px] rounded-full pointer-events-none"
          style={{
            border: '1px dashed rgba(255,255,255,.05)',
            animation: 'orbSpin 24s linear infinite',
          }}
        />
      </div>

      {/* Name */}
      <div
        className="mb-1.5 text-white relative z-10"
        style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', fontSize: '1.25rem', fontWeight: 600 }}
      >
        {avatar.name}
      </div>

      {/* Trait */}
      <div
        className="mb-4 font-light leading-relaxed min-h-[48px] relative z-10"
        style={{ fontSize: '0.82rem', color: 'var(--ink-20)' }}
      >
        {avatar.trait}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap justify-center gap-1.5 relative z-10">
        {avatar.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-full font-medium"
            style={{
              fontSize: '0.62rem',
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

      {/* Select button (hover reveal) */}
      <motion.button
        className="mt-5 px-7 py-2.5 rounded-full font-medium transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 relative z-10"
        style={{
          background: avatar.color,
          color: '#fff',
          fontFamily: 'var(--font-outfit), Outfit, sans-serif',
          fontSize: '0.84rem',
          boxShadow: `0 4px 20px ${avatar.glow}`,
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
      >
        Select {avatar.name}
      </motion.button>
    </motion.div>
  )
}
