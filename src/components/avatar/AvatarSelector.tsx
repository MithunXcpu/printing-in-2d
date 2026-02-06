'use client'

import { motion } from 'framer-motion'
import { AvatarCard } from './AvatarCard'
import { AVATAR_PERSONALITIES } from '@/lib/avatar-config'
import type { AvatarKey } from '@/lib/types'

interface AvatarSelectorProps {
  onSelect: (key: AvatarKey) => void
}

export function AvatarSelector({ onSelect }: AvatarSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-14 px-10 py-12">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
          style={{
            fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
            fontSize: '0.68rem',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--green-400)',
          }}
        >
          Step 1 of 5 — Choose your guide
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-3"
          style={{
            fontFamily: 'var(--font-fraunces), Fraunces, serif',
            fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
            letterSpacing: '-0.03em',
          }}
        >
          Who should{' '}
          <em className="italic font-light text-gradient">
            build with you?
          </em>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-light mx-auto leading-relaxed max-w-[500px]"
          style={{ fontSize: '1.05rem', color: 'var(--ink-20)' }}
        >
          Each avatar has a different approach to understanding your problem and designing your micro tool.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-[960px] w-full">
        {Object.values(AVATAR_PERSONALITIES).map((avatar, index) => (
          <AvatarCard
            key={avatar.key}
            avatar={avatar}
            index={index}
            onClick={() => onSelect(avatar.key)}
          />
        ))}
      </div>
    </div>
  )
}
