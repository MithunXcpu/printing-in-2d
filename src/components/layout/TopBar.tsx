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
        background: 'rgba(10,15,6,.88)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderBottom: `1px solid ${avatarColor ? avatarColor + '15' : 'rgba(255,255,255,.04)'}`,
      }}
    >
      <Link href="/build" className="flex items-center gap-2.5 no-underline text-white group">
        <div
          className="w-7 h-7 rounded-[7px] relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
          style={{ background: 'var(--green-400)' }}
        >
          <span className="block w-[13px] h-[2px] bg-white rounded-sm" style={{ boxShadow: '0 4px 0 #fff, 0 -4px 0 #fff' }} />
          {/* Online dot */}
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
            style={{
              background: 'var(--green-300)',
              border: '1.5px solid var(--ink)',
              animation: 'onlinePulse 3s ease-in-out infinite',
            }}
          />
        </div>
        <span
          className="transition-colors duration-200"
          style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', fontWeight: 600, fontSize: '0.92rem' }}
        >
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
            className="px-4 py-1.5 rounded-full text-sm cursor-pointer transition-all duration-200 hover:text-white hover:border-white/20 glass"
            style={{
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
