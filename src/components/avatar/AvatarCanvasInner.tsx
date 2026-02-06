'use client'

import { useEffect } from 'react'
import { useAvatar } from '@/hooks/useAvatar'

interface AvatarCanvasInnerProps {
  avatarUrl?: string
  onSpeakingStart?: () => void
  onSpeakingEnd?: () => void
  onLoaded?: () => void
  onError?: (error: string) => void
}

export default function AvatarCanvasInner({
  avatarUrl,
  onSpeakingStart,
  onSpeakingEnd,
  onLoaded,
  onError,
}: AvatarCanvasInnerProps) {
  const { containerRef, isLoaded, isLoading, error, initialize } = useAvatar({
    avatarUrl,
    onSpeakingStart,
    onSpeakingEnd,
  })

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (isLoaded) onLoaded?.()
  }, [isLoaded, onLoaded])

  useEffect(() => {
    if (error) onError?.(error)
  }, [error, onError])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 rounded-full animate-pulse"
              style={{ background: 'rgba(255,255,255,.05)' }}
            />
            <span
              className="text-xs"
              style={{
                color: 'var(--ink-20)',
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              }}
            >
              Loading avatar...
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-2 opacity-50">
              <div
                className="w-16 h-16 mx-auto rounded-full"
                style={{
                  background: 'linear-gradient(135deg, var(--ink-80), var(--ink-60))',
                  animation: 'onlinePulse 3s ease-in-out infinite',
                }}
              />
            </div>
            <span className="text-xs" style={{ color: 'var(--ink-40)' }}>
              3D avatar unavailable
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
