import { create } from 'zustand'
import type { AgentId, AgentResult, AgentStatus } from '@/lib/types'

interface SwarmState {
  results: Record<string, AgentResult>
  expandedAgentId: AgentId | null
  isRunning: boolean
  completedCount: number

  initSwarm: (agentIds: AgentId[]) => void
  setAgentStatus: (agentId: AgentId, status: AgentStatus) => void
  setAgentResult: (agentId: AgentId, result: AgentResult) => void
  appendAnalysis: (agentId: AgentId, chunk: string) => void
  setExpanded: (agentId: AgentId | null) => void
  setRunning: (running: boolean) => void
  reset: () => void
}

export const useSwarmStore = create<SwarmState>((set) => ({
  results: {},
  expandedAgentId: null,
  isRunning: false,
  completedCount: 0,

  initSwarm: (agentIds) =>
    set({
      results: Object.fromEntries(
        agentIds.map((id) => [
          id,
          {
            agentId: id,
            status: 'queued' as const,
            analysis: '',
            codeSnippets: [],
            recommendations: [],
            relevantNodeIds: [],
          },
        ])
      ),
      completedCount: 0,
      isRunning: true,
    }),

  setAgentStatus: (agentId, status) =>
    set((state) => {
      const existing = state.results[agentId]
      if (!existing) return state
      return {
        results: {
          ...state.results,
          [agentId]: { ...existing, status },
        },
      }
    }),

  setAgentResult: (agentId, result) =>
    set((state) => ({
      results: { ...state.results, [agentId]: result },
      completedCount:
        result.status === 'complete' || result.status === 'error'
          ? state.completedCount + 1
          : state.completedCount,
    })),

  appendAnalysis: (agentId, chunk) =>
    set((state) => {
      const existing = state.results[agentId]
      if (!existing) return state
      return {
        results: {
          ...state.results,
          [agentId]: { ...existing, analysis: existing.analysis + chunk },
        },
      }
    }),

  setExpanded: (expandedAgentId) => set({ expandedAgentId }),
  setRunning: (isRunning) => set({ isRunning }),
  reset: () => set({ results: {}, expandedAgentId: null, isRunning: false, completedCount: 0 }),
}))
