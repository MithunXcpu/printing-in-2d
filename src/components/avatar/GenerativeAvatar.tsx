'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { AvatarPersonality } from '@/lib/types'

interface GenerativeAvatarProps {
  avatar: AvatarPersonality
  onConnected?: () => void
  onError?: (error: string) => void
  onSpeak?: (speak: (text: string) => void) => void
}

/**
 * Generative 3D avatar using TalkingHead.
 * Dynamically imports TalkingHead at runtime to avoid Turbopack
 * choking on the library's internal dynamic import() calls.
 */
export function GenerativeAvatar({ avatar, onConnected, onError, onSpeak }: GenerativeAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onConnectedRef = useRef(onConnected)
  const onErrorRef = useRef(onError)
  const onSpeakRef = useRef(onSpeak)
  onConnectedRef.current = onConnected
  onErrorRef.current = onError
  onSpeakRef.current = onSpeak

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current || !containerRef.current) return
    initRef.current = true

    let timedOut = false

    // Timeout: if TalkingHead doesn't load in 8s, give up gracefully
    const timeout = setTimeout(() => {
      timedOut = true
      setError('Avatar load timeout')
      setIsLoading(false)
      onErrorRef.current?.('Avatar load timeout')
    }, 8000)

    // Dynamically import TalkingHead at runtime — NOT at build time
    ;(async () => {
      try {
        const { TalkingHead } = await import(
          /* webpackIgnore: true */
          '@met4citizen/talkinghead'
        )

        if (timedOut) return // Already timed out, don't proceed

        const head = new TalkingHead(containerRef.current!, {
          ttsEndpoint: '',
          lipsyncModules: ['en'],
          lipsyncLang: 'en',
          cameraView: 'head',
          cameraRotateEnable: false,
          cameraPanEnable: false,
          cameraZoomEnable: false,
          lightAmbientIntensity: 3,
          lightDirectIntensity: 15,
          avatarMood: 'neutral',
          avatarIdleEyeContact: 0.7,
          avatarIdleHeadMove: 0.5,
          avatarSpeakingEyeContact: 0.8,
          avatarSpeakingHeadMove: 0.6,
          modelFPS: 30,
          modelPixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        })

        if (timedOut) return // Check again after constructor

        await head.showAvatar({
          url: 'https://models.readyplayer.me/6460d95f9ae8cb350c14e7d4.glb',
          body: 'F',
          avatarMood: 'neutral',
          lipsyncLang: 'en',
        })

        if (timedOut) return // Check again after model load

        clearTimeout(timeout)
        setIsLoading(false)
        onConnectedRef.current?.()

        // Expose speak function to parent
        const speakFn = (text: string) => {
          if (text.trim()) {
            head.speakText(text, { lipsyncLang: 'en' })
          }
        }
        onSpeakRef.current?.(speakFn)
      } catch (err) {
        if (timedOut) return // Already showing fallback
        clearTimeout(timeout)
        console.error('TalkingHead init failed:', err)
        const msg = (err as Error).message || 'Failed to load 3D avatar'
        setError(msg)
        setIsLoading(false)
        onErrorRef.current?.(msg)
      }
    })()
  }, [])

  return (
    <div
      className="w-full overflow-hidden relative"
      style={{
        height: '220px',
        background: `radial-gradient(ellipse at center, ${avatar.glow} 0%, var(--ink-80) 70%)`,
      }}
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* Vignette overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* Glow border */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderBottom: `2px solid ${avatar.color}40`,
          boxShadow: `inset 0 -20px 40px -20px ${avatar.glow}`,
        }}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <motion.div
              className="w-20 h-20 rounded-full overflow-hidden"
              animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                boxShadow: `0 0 40px ${avatar.glow}, 0 0 0 3px ${avatar.color}44`,
              }}
            >
              {avatar.photoUrl ? (
                <img src={avatar.photoUrl} alt={avatar.name} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-3xl"
                  style={{ background: avatar.gradient }}
                >
                  {avatar.emoji}
                </div>
              )}
            </motion.div>
            <span
              style={{
                fontSize: '0.7rem',
                color: avatar.color,
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                letterSpacing: '0.06em',
                opacity: 0.8,
              }}
            >
              Loading 3D avatar...
            </span>
          </div>
        </div>
      )}

      {/* Fallback: static avatar hero when 3D fails */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div
            className="w-24 h-24 rounded-full overflow-hidden"
            style={{
              boxShadow: `0 0 0 3px ${avatar.color}66, 0 0 40px ${avatar.color}33, 0 4px 24px rgba(0,0,0,.4)`,
            }}
          >
            {avatar.photoUrl ? (
              <img src={avatar.photoUrl} alt={avatar.name} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-4xl"
                style={{ background: avatar.gradient }}
              >
                {avatar.emoji}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-1">
            <h3
              className="text-white"
              style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', fontSize: '1.1rem', fontWeight: 600 }}
            >
              {avatar.name}
            </h3>
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: avatar.color,
                  animation: 'onlinePulse 2s ease-in-out infinite',
                }}
              />
              <span
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--ink-20)',
                  fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                }}
              >
                {avatar.trait.split('.')[0]}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
