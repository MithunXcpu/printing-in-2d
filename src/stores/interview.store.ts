import { create } from 'zustand'
import type { InterviewStage, UserProfile } from '@/lib/types'

interface InterviewState {
  stage: InterviewStage
  profile: UserProfile
  onboardingComplete: boolean

  updateProfile: (updates: Partial<UserProfile>) => void
  setStage: (stage: InterviewStage) => void
  setOnboardingComplete: (complete: boolean) => void
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
  onboardingComplete: false,

  updateProfile: (updates) =>
    set((state) => ({
      profile: { ...state.profile, ...updates },
    })),

  setStage: (stage) => set({ stage }),
  setOnboardingComplete: (onboardingComplete) => set({ onboardingComplete }),

  reset: () => set({ stage: 'outcome', profile: { ...initialProfile }, onboardingComplete: false }),
}))
