'use client'

import { useCallback, useRef } from 'react'
import { useConversationStore } from '@/stores/conversation.store'
import { useWorkflowStore } from '@/stores/workflow.store'
import { useInterviewStore } from '@/stores/interview.store'

/**
 * Hook that provides functions to persist session data to Supabase.
 * Fires after each significant state change (message added, node added, etc.)
 *
 * All calls are fire-and-forget — failures don't block the UI.
 */
export function useSessionPersistence(sessionId: string | null) {
  const pendingRef = useRef(false)

  const saveMessage = useCallback(
    async (role: string, content: string, imageUrl?: string) => {
      if (!sessionId) return
      try {
        await fetch(`/api/sessions/${sessionId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, content, imageUrl }),
        })
      } catch {
        // Fire-and-forget
      }
    },
    [sessionId]
  )

  const saveWorkflowSnapshot = useCallback(async () => {
    if (!sessionId || pendingRef.current) return
    pendingRef.current = true

    try {
      const nodes = useWorkflowStore.getState().nodes
      const connections = useWorkflowStore.getState().connections

      await fetch(`/api/sessions/${sessionId}/workflow`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, connections }),
      })
    } catch {
      // Fire-and-forget
    } finally {
      pendingRef.current = false
    }
  }, [sessionId])

  const saveProfile = useCallback(async () => {
    if (!sessionId) return
    try {
      const profile = useInterviewStore.getState().profile
      await fetch(`/api/sessions/${sessionId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
    } catch {
      // Fire-and-forget
    }
  }, [sessionId])

  const updatePhase = useCallback(
    async (phase: string) => {
      if (!sessionId) return
      try {
        await fetch(`/api/sessions/${sessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phase }),
        })
      } catch {
        // Fire-and-forget
      }
    },
    [sessionId]
  )

  /**
   * Load session data from Supabase and hydrate all Zustand stores
   */
  const loadSession = useCallback(async () => {
    if (!sessionId) return false

    try {
      const response = await fetch(`/api/sessions/${sessionId}`)
      if (!response.ok) return false

      const data = await response.json()

      // Hydrate conversation store
      if (data.messages?.length > 0) {
        const addMessage = useConversationStore.getState().addMessage
        const clearMessages = useConversationStore.getState().clearMessages
        clearMessages()
        for (const msg of data.messages) {
          addMessage({
            role: msg.role,
            content: msg.content,
            imageUrl: msg.image_url,
          })
        }
      }

      // Hydrate workflow store
      if (data.nodes?.length > 0 || data.connections?.length > 0) {
        const workflowStore = useWorkflowStore.getState()
        workflowStore.reset()
        for (const node of (data.nodes || [])) {
          workflowStore.addNode({
            id: node.id,
            label: node.label,
            type: node.type,
            icon: node.icon || '📦',
            description: node.description,
            imageUrl: node.image_url,
          })
          workflowStore.revealNode(node.id)
        }
        for (const conn of (data.connections || [])) {
          workflowStore.addConnection({
            from: conn.from_node,
            to: conn.to_node,
            label: conn.label,
          })
        }
      }

      // Hydrate interview store
      if (data.profile) {
        useInterviewStore.getState().updateProfile({
          role: data.profile.role,
          department: data.profile.department,
          companyContext: data.profile.company_context,
          desiredOutcomes: data.profile.desired_outcomes,
          painPoints: data.profile.pain_points,
          currentTools: data.profile.current_tools,
        })
      }

      return true
    } catch {
      return false
    }
  }, [sessionId])

  return {
    saveMessage,
    saveWorkflowSnapshot,
    saveProfile,
    updatePhase,
    loadSession,
  }
}
