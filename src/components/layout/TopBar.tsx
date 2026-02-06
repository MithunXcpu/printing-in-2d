'use client'

import Link from 'next/link'
import { AuthButtons } from '@/components/auth/AuthButtons'
import { PhaseProgress } from '@/components/layout/PhaseProgress'

interface TopBarProps {
  status?: string
  showBack?: boolean
  onBack?: () => void
  showPhases?: boolean
  avatarColor?: string
}

export function TopBar({
  status = 'Select your co-builder',
  showBack,
  onBack,
  showPhases = false,
  avatarColor,
}: TopBarProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] px-8 py-3.5 flex items-center justify-between"
      style={{
        background: 'rgba(13,18,8,.85)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,.04)',
      }}
    >
      <Link href="/build" className="flex items-center gap-2.5 no-underline text-white">
        <div
          className="w-7 h-7 rounded-[7px] relative flex items-center justify-center"
          style={{ background: 'var(--green-400)' }}
        >
          <span className="block w-[13px] h-[2px] bg-white rounded-sm" style={{ boxShadow: '0 4px 0 #fff, 0 -4px 0 #fff' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', fontWeight: 600, fontSize: '0.92rem' }}>
          Printing in 2D
        </span>
      </Link>

      {/* Center: phase progress or text status */}
      {showPhases ? (
        <PhaseProgress avatarColor={avatarColor} />
      ) : (
        <div
          style={{
            fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
            fontSize: '0.68rem',
            color: 'var(--ink-20)',
            letterSpacing: '0.06em',
          }}
        >
          {status}
        </div>
      )}

      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="px-4 py-1.5 rounded-full text-sm cursor-pointer transition-all hover:text-white"
            style={{
              background: 'rgba(255,255,255,.06)',
              border: '1px solid rgba(255,255,255,.08)',
              color: 'rgba(255,255,255,.5)',
              fontFamily: 'var(--font-outfit), Outfit, sans-serif',
              fontSize: '0.78rem',
            }}
          >
            Start Over
          </button>
        )}
        <AuthButtons />
      </div>
    </div>
  )
}
