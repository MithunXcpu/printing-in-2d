import { create } from 'zustand'
import type { AvatarKey } from '@/lib/types'

interface SessionState {
  sessionId: string | null
  avatarKey: AvatarKey | null
  phase: 'selection' | 'interview' | 'review' | 'workorders'
  isLoading: boolean

  setSession: (sessionId: string, avatarKey: AvatarKey) => void
  setPhase: (phase: SessionState['phase']) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  avatarKey: null,
  phase: 'selection',
  isLoading: false,

  setSession: (sessionId, avatarKey) => set({ sessionId, avatarKey, phase: 'interview' }),
  setPhase: (phase) => set({ phase }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ sessionId: null, avatarKey: null, phase: 'selection', isLoading: false }),
}))
