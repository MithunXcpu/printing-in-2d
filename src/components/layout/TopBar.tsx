'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
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
      <div className="flex items-center gap-2.5">
        {showBack && onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-2 no-underline text-white cursor-pointer transition-opacity duration-200 hover:opacity-80"
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-105"
              style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)' }}
            >
              <ArrowLeft size={14} style={{ color: 'var(--green-300)' }} />
            </div>
            <span
              className="transition-colors duration-200"
              style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', fontWeight: 600, fontSize: '0.92rem' }}
            >
              Printing in 2D
            </span>
          </button>
        ) : (
          <Link href="/build" className="flex items-center gap-2.5 no-underline text-white group">
            <span
              className="transition-colors duration-200"
              style={{
                fontFamily: 'var(--font-fraunces), Fraunces, serif',
                fontWeight: 600,
                fontSize: '0.92rem',
                color: 'var(--green-300)',
              }}
            >
              P2D
            </span>
            <span
              className="transition-colors duration-200 hidden sm:inline"
              style={{
                fontFamily: 'var(--font-outfit), Outfit, sans-serif',
                fontWeight: 400,
                fontSize: '0.82rem',
                color: 'rgba(255,255,255,.45)',
              }}
            >
              Printing in 2D
            </span>
          </Link>
        )}
      </div>

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
        <AuthButtons />
      </div>
    </div>
  )
}
