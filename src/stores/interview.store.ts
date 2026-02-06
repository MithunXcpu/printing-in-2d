import { create } from 'zustand'
import type { InterviewStage, UserProfile } from '@/lib/types'

interface InterviewState {
  stage: InterviewStage
  profile: UserProfile

  updateProfile: (updates: Partial<UserProfile>) => void
  setStage: (stage: InterviewStage) => void
  reset: () => void
}

const initialProfile: UserProfile = {
  desiredOutcomes: [],
  painPoints: [],
  currentTools: [],
  dataSources: [],
}

export const useInterviewStore = create<InterviewState>((set) => ({
  stage: 'outcome',
  profile: { ...initialProfile },

  updateProfile: (updates) =>
    set((state) => ({
      profile: { ...state.profile, ...updates },
    })),

  setStage: (stage) => set({ stage }),

  reset: () => set({ stage: 'outcome', profile: { ...initialProfile } }),
}))
