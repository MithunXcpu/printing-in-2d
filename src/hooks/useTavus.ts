'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseTavusOptions {
  replicaId?: string
  personaId?: string
  avatarName?: string
}

export function useTavus(options?: UseTavusOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)

  /**
   * Create a Tavus conversation session and connect via WebRTC
   */
  const initialize = useCallback(async () => {
    if (isConnected || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      // 1. Create session via our API
      const response = await fetch('/api/tavus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replicaId: options?.replicaId,
          personaId: options?.personaId,
          conversationName: `Session with ${options?.avatarName || 'Avatar'}`,
        }),
      })

      if (!response.ok) {
        throw new Error('Tavus not available')
      }

      const { conversationId: convId, conversationUrl } = await response.json()
      setConversationId(convId)

      // 2. Connect to Tavus via WebRTC using the conversation URL
      // The conversation URL is typically an iframe or a WebRTC signaling endpoint
      // For now, we embed it via iframe approach (simplest Tavus integration)
      // If the Tavus JS SDK becomes available, we'd use it for direct WebRTC

      // Store the conversation URL for the component to render as an iframe
      if (videoRef.current) {
        // Using the Tavus embedded player
        videoRef.current.dataset.conversationUrl = conversationUrl
      }

      setIsConnected(true)
    } catch (err) {
      console.error('Tavus initialization failed:', err)
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, isLoading, options?.replicaId, options?.personaId, options?.avatarName])

  /**
   * Send text for the avatar to speak
   * In Tavus CVI, messages are sent via the conversation's data channel or REST API
   */
  const speak = useCallback(
    async (text: string) => {
      if (!isConnected || !conversationId) return

      try {
        // Send message to Tavus conversation via REST
        // The avatar will speak this text with lip-sync
        await fetch(`https://tavusapi.com/v2/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: text,
            type: 'assistant',
          }),
        })
      } catch (err) {
        console.warn('Tavus speak failed:', err)
      }
    },
    [isConnected, conversationId]
  )

  /**
   * Disconnect and cleanup
   */
  const disconnect = useCallback(async () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    if (dataChannelRef.current) {
      dataChannelRef.current.close()
      dataChannelRef.current = null
    }

    // End the conversation on Tavus side
    if (conversationId) {
      try {
        await fetch('/api/tavus', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId }),
        })
      } catch {
        // Best effort cleanup
      }
    }

    setIsConnected(false)
    setConversationId(null)
  }, [conversationId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (conversationId) {
        // Fire-and-forget cleanup
        fetch('/api/tavus', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId }),
        }).catch(() => {})
      }
    }
  }, [conversationId])

  return {
    videoRef,
    isConnected,
    isLoading,
    error,
    conversationId,
    initialize,
    speak,
    disconnect,
  }
}
