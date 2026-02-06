import { create } from 'zustand'
import type { Message, InterviewStage } from '@/lib/types'

interface ConversationState {
  messages: Message[]
  isStreaming: boolean
  currentStreamingText: string
  interviewStage: InterviewStage
  suggestions: string[]

  addMessage: (msg: Omit<Message, 'id' | 'timestamp'> & { imageUrl?: string }) => void
  updateLastAssistantMessage: (content: string) => void
  setStreaming: (streaming: boolean) => void
  setCurrentStreamingText: (text: string) => void
  setInterviewStage: (stage: InterviewStage) => void
  setSuggestions: (suggestions: string[]) => void
  clearMessages: () => void
}

let messageCounter = 0

export const useConversationStore = create<ConversationState>((set) => ({
  messages: [],
  isStreaming: false,
  currentStreamingText: '',
  interviewStage: 'outcome',
  suggestions: [],

  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...msg,
          id: `msg-${++messageCounter}`,
          timestamp: Date.now(),
        },
      ],
    })),

  updateLastAssistantMessage: (content) =>
    set((state) => {
      const messages = [...state.messages]
      const lastIdx = messages.findLastIndex((m) => m.role === 'assistant')
      if (lastIdx !== -1) {
        messages[lastIdx] = { ...messages[lastIdx], content }
      }
      return { messages }
    }),

  setStreaming: (isStreaming) => set({ isStreaming }),
  setCurrentStreamingText: (currentStreamingText) => set({ currentStreamingText }),
  setInterviewStage: (interviewStage) => set({ interviewStage }),
  setSuggestions: (suggestions) => set({ suggestions }),
  clearMessages: () => set({ messages: [], currentStreamingText: '', suggestions: [] }),
}))
