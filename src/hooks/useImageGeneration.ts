'use client'

import { useCallback } from 'react'
import { useWorkflowStore } from '@/stores/workflow.store'
import type { WorkflowNodeType } from '@/lib/types'

export function useImageGeneration() {
  const updateNodeImage = useWorkflowStore((s) => s.updateNodeImage)

  const generateNodeImage = useCallback(
    async (nodeId: string, label: string, description: string | undefined, type: WorkflowNodeType) => {
      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label, description, type }),
        })

        if (!response.ok) return

        const { imageUrl } = await response.json()
        if (imageUrl) {
          updateNodeImage(nodeId, imageUrl)
        }
      } catch (error) {
        console.warn('Image generation failed for node:', nodeId, error)
        // Silently fail — emoji stays visible
      }
    },
    [updateNodeImage]
  )

  return { generateNodeImage }
}
