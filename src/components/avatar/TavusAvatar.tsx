'use client'

import { useEffect } from 'react'
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
    conversationId,
  } = useTavus({
    replicaId: avatar.tavusReplicaId,
    personaId: avatar.tavusPersonaId,
    avatarName: avatar.name,
  })

  // Initialize on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Notify parent when connected
  useEffect(() => {
    if (isConnected) {
      onConnected?.()
      onSpeak?.(speak)
    }
  }, [isConnected, onConnected, onSpeak, speak])

  // Notify parent of errors
  useEffect(() => {
    if (error) {
      onError?.(error)
    }
  }, [error, onError])

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height: '200px' }}>
        <motion.div
          className="w-24 h-24 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            background: avatar.gradient,
            boxShadow: `0 0 40px ${avatar.glow}`,
          }}
        />
      </div>
    )
  }

  // Error state — show emoji fallback
  if (error || !isConnected) {
    return (
      <div
        className="w-full flex items-center justify-center"
        style={{ height: '200px' }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
          style={{
            background: avatar.gradient,
            boxShadow: `0 0 30px ${avatar.glow}`,
          }}
        >
          {avatar.emoji}
        </div>
      </div>
    )
  }

  // Connected — render Tavus embedded player
  // Tavus CVI provides a conversation URL that can be rendered in an iframe
  return (
    <div
      className="w-full overflow-hidden relative"
      style={{
        height: '200px',
        borderRadius: '0',
      }}
    >
      {conversationId && (
        <iframe
          src={`https://tavus.daily.co/${conversationId}`}
          className="w-full h-full border-0"
          allow="camera; microphone; autoplay"
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
