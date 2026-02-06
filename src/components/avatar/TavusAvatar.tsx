'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTavus } from '@/hooks/useTavus'
import type { AvatarPersonality } from '@/lib/types'

interface TavusAvatarProps {
  avatar: AvatarPersonality
  onConnected?: () => void
  onError?: (error: string) => void
  onSpeak?: (speak: (text: string) => Promise<void>) => void
}

export function TavusAvatar({ avatar, onConnected, onError, onSpeak }: TavusAvatarProps) {
  const {
    isConnected,
    isLoading,
    error,
    initialize,
    speak,
    conversationUrl,
  } = useTavus({
    replicaId: avatar.tavusReplicaId,
    personaId: avatar.tavusPersonaId,
    avatarName: avatar.name,
  })

  // Use refs for callbacks to avoid re-triggering effects
  const onConnectedRef = useRef(onConnected)
  const onErrorRef = useRef(onError)
  const onSpeakRef = useRef(onSpeak)
  onConnectedRef.current = onConnected
  onErrorRef.current = onError
  onSpeakRef.current = onSpeak

  // Initialize once on mount
  const initRef = useRef(false)
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    initialize()
  }, [initialize])

  // Notify parent when connected
  useEffect(() => {
    if (isConnected) {
      onConnectedRef.current?.()
      onSpeakRef.current?.(speak)
    }
  }, [isConnected, speak])

  // Notify parent of errors
  useEffect(() => {
    if (error) {
      onErrorRef.current?.(error)
    }
  }, [error])

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-3" style={{ height: '280px' }}>
        <motion.div
          className="w-24 h-24 rounded-full overflow-hidden"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.6, 1, 0.6],
          }}
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
          Connecting video...
        </span>
      </div>
    )
  }

  // Error state — show photo fallback with note
  if (error || !isConnected) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center gap-2"
        style={{ height: '200px' }}
      >
        <div
          className="w-20 h-20 rounded-full overflow-hidden"
          style={{
            boxShadow: `0 0 30px ${avatar.glow}, 0 0 0 3px ${avatar.color}33`,
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
        {error && (
          <span
            style={{
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,.35)',
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
            }}
          >
            Video unavailable
          </span>
        )}
      </div>
    )
  }

  // Connected — render Tavus embedded player via iframe
  return (
    <div
      className="w-full overflow-hidden relative"
      style={{
        height: '280px',
        borderRadius: '0',
        background: '#0d1208',
      }}
    >
      {conversationUrl && (
        <iframe
          src={conversationUrl}
          className="w-full h-full border-0"
          allow="autoplay; encrypted-media"
          style={{
            borderRadius: '0',
            background: '#0d1208',
          }}
        />
      )}

      {/* Glow border overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderBottom: `2px solid ${avatar.color}40`,
          boxShadow: `inset 0 -20px 40px -20px ${avatar.glow}`,
        }}
      />
    </div>
  )
}
