'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseTavusProfile {
  name?: string
  role?: string
  industry?: string
  painPoints?: string[]
}

interface UseTavusOptions {
  replicaId?: string
  personaId?: string
  avatarName?: string
  participantName?: string
  profile?: UseTavusProfile
}

export function useTavus(options?: UseTavusOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversationUrl, setConversationUrl] = useState<string | null>(null)

  // Use refs to avoid stale closures in initialize callback
  const isConnectedRef = useRef(false)
  const isLoadingRef = useRef(false)
  const conversationIdRef = useRef<string | null>(null)

  // Keep refs in sync
  useEffect(() => { isConnectedRef.current = isConnected }, [isConnected])
  useEffect(() => { isLoadingRef.current = isLoading }, [isLoading])
  useEffect(() => { conversationIdRef.current = conversationId }, [conversationId])

  /**
   * Create a Tavus conversation session
   */
  const initialize = useCallback(async () => {
    // Guard with refs to avoid stale closure issues
    if (isConnectedRef.current || isLoadingRef.current) return

    isLoadingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/tavus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replicaId: options?.replicaId,
          personaId: options?.personaId,
          conversationName: `Session with ${options?.avatarName || 'Avatar'}`,
          avatarName: options?.avatarName,
          participantName: options?.participantName,
          profile: options?.profile,
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        console.error('[useTavus] API response error:', {
          status: response.status,
          statusText: response.statusText,
          body: text,
          url: response.url,
        })
        let message = 'Tavus not available'
        try {
          const parsed = JSON.parse(text)
          if (parsed.error) message = parsed.error
        } catch {
          if (text) message = text
        }
        throw new Error(message)
      }

      const data = await response.json()
      setConversationId(data.conversationId)
      setConversationUrl(data.conversationUrl)
      conversationIdRef.current = data.conversationId
      isConnectedRef.current = true
      setIsConnected(true)
    } catch (err) {
      console.error('[useTavus] Initialization failed:', err)
      console.error('[useTavus] Error details:', {
        message: (err as Error).message,
        name: (err as Error).name,
        stack: (err as Error).stack,
      })
      setError((err as Error).message)
    } finally {
      isLoadingRef.current = false
      setIsLoading(false)
    }
  }, [options?.replicaId, options?.personaId, options?.avatarName, options?.participantName, options?.profile])

  /**
   * Retry after a failed connection — resets error state and re-initializes
   */
  const retry = useCallback(async () => {
    // Reset guards so initialize() can run again
    isConnectedRef.current = false
    isLoadingRef.current = false
    conversationIdRef.current = null
    setIsConnected(false)
    setConversationId(null)
    setConversationUrl(null)
    setError(null)

    // Re-run initialization
    await initialize()
  }, [initialize])

  /**
   * Send text for the avatar to speak — routed through our API to keep API key server-side
   */
  const speak = useCallback(
    async (text: string) => {
      const convId = conversationIdRef.current
      if (!convId) return

      try {
        await fetch('/api/tavus/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: convId,
            message: text,
          }),
        })
      } catch (err) {
        console.warn('Tavus speak failed:', err)
      }
    },
    [] // No state deps needed — uses refs
  )

  /**
   * Disconnect and cleanup
   */
  const disconnect = useCallback(async () => {
    const convId = conversationIdRef.current
    if (convId) {
      try {
        await fetch('/api/tavus', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: convId }),
        })
      } catch {
        // Best effort cleanup
      }
    }

    isConnectedRef.current = false
    conversationIdRef.current = null
    setIsConnected(false)
    setConversationId(null)
    setConversationUrl(null)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const convId = conversationIdRef.current
      if (convId) {
        fetch('/api/tavus', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: convId }),
        }).catch(() => {})
      }
    }
  }, [])

  return {
    isConnected,
    isLoading,
    error,
    conversationId,
    conversationUrl,
    initialize,
    retry,
    speak,
    disconnect,
    setTavusError: setError,
  }
}
