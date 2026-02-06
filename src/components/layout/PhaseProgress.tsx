'use client'

import { PHASE_CONFIG, type SessionPhase } from '@/lib/types'
import { useSessionStore } from '@/stores/session.store'

interface PhaseProgressProps {
  avatarColor?: string
}

export function PhaseProgress({ avatarColor = 'var(--green-400)' }: PhaseProgressProps) {
  const currentPhase = useSessionStore((s) => s.phase)

  // Don't show in selection phase
  if (currentPhase === 'selection') return null

  const currentIndex = PHASE_CONFIG.findIndex((p) => p.key === currentPhase)

  return (
    <div className="flex items-center gap-1">
      {PHASE_CONFIG.map((phase, i) => {
        const isComplete = i < currentIndex
        const isCurrent = i === currentIndex
        const isFuture = i > currentIndex

        return (
          <div key={phase.key} className="flex items-center gap-1">
            {/* Phase pill */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-300"
              style={{
                background: isCurrent
                  ? `${avatarColor}20`
                  : isComplete
                    ? 'rgba(255,255,255,.06)'
                    : 'transparent',
                border: isCurrent
                  ? `1px solid ${avatarColor}40`
                  : '1px solid transparent',
              }}
            >
              {/* Status indicator */}
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                style={{
                  background: isComplete
                    ? avatarColor
                    : isCurrent
                      ? avatarColor
                      : 'rgba(255,255,255,.08)',
                  color: isComplete || isCurrent ? '#fff' : 'rgba(255,255,255,.25)',
                }}
              >
                {isComplete ? '\u2713' : i + 1}
              </div>

              {/* Label — only show for current + completed */}
              {(isCurrent || isComplete) && (
                <span
                  className="text-[10px] font-semibold tracking-wider"
                  style={{
                    color: isCurrent ? avatarColor : 'rgba(255,255,255,.35)',
                    fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                  }}
                >
                  {phase.label}
                </span>
              )}
            </div>

            {/* Connector line */}
            {i < PHASE_CONFIG.length - 1 && (
              <div
                className="w-4 h-[1px] transition-all duration-300"
                style={{
                  background: isComplete
                    ? avatarColor + '60'
                    : 'rgba(255,255,255,.08)',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
