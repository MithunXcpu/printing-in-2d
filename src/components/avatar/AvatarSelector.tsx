'use client'

import { AvatarCard } from './AvatarCard'
import { AVATAR_PERSONALITIES } from '@/lib/avatar-config'
import type { AvatarKey } from '@/lib/types'

interface AvatarSelectorProps {
  onSelect: (key: AvatarKey) => void
}

export function AvatarSelector({ onSelect }: AvatarSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-12 px-10 py-10">
      <div className="text-center">
        <div
          className="mb-4"
          style={{
            fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
            fontSize: '0.68rem',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--green-400)',
          }}
        >
          01 — Choose your guide
        </div>
        <h1
          className="mb-3"
          style={{
            fontFamily: 'var(--font-fraunces), Fraunces, serif',
            fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
            letterSpacing: '-0.03em',
          }}
        >
          Pick a mind.
          <br />
          <em className="italic font-light" style={{ color: 'var(--green-300)' }}>
            Start building.
          </em>
        </h1>
        <p
          className="font-light mx-auto leading-[1.6] max-w-[440px]"
          style={{ fontSize: '1.05rem', color: 'var(--ink-20)' }}
        >
          Each avatar brings a different personality to your workflow. Same power, different approach.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-[920px] w-full">
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
