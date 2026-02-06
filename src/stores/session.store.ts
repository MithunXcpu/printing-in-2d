import { create } from 'zustand'
import type { AvatarKey, SessionPhase } from '@/lib/types'

interface SessionState {
  sessionId: string | null
  avatarKey: AvatarKey | null
  phase: SessionPhase
  isLoading: boolean

  setSession: (sessionId: string, avatarKey: AvatarKey) => void
  setPhase: (phase: SessionPhase) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  avatarKey: null,
  phase: 'selection',
  isLoading: false,

  setSession: (sessionId, avatarKey) => set({ sessionId, avatarKey, phase: 'discover' }),
  setPhase: (phase) => set({ phase }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ sessionId: null, avatarKey: null, phase: 'selection', isLoading: false }),
}))
