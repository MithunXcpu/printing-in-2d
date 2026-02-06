'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { WorkflowDiagram } from '@/components/diagram/WorkflowDiagram'
import { useChat } from '@/hooks/useChat'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useScreenCapture } from '@/hooks/useScreenCapture'
import { useImageGeneration } from '@/hooks/useImageGeneration'
import { CallControls } from '@/components/chat/CallControls'
import { useSessionStore } from '@/stores/session.store'
import { useConversationStore } from '@/stores/conversation.store'
import { useWorkflowStore } from '@/stores/workflow.store'
import { AVATAR_PERSONALITIES } from '@/lib/avatar-config'

// Dynamic import TavusAvatar — only loads when needed, no SSR
const TavusAvatar = dynamic(
  () => import('@/components/avatar/TavusAvatar').then((m) => ({ default: m.TavusAvatar })),
  { ssr: false }
)

// Dynamic import GenerativeAvatar (3D TalkingHead) — fallback when Tavus is unavailable
const GenerativeAvatar = dynamic(
  () => import('@/components/avatar/GenerativeAvatar').then((m) => ({ default: m.GenerativeAvatar })),
  { ssr: false }
)

export default function SessionPage() {
  const router = useRouter()
  const avatarKey = useSessionStore((s) => s.avatarKey)
  const sessionId = useSessionStore((s) => s.sessionId)
  const setPhase = useSessionStore((s) => s.setPhase)
  const interviewStage = useConversationStore((s) => s.interviewStage)
  const clearMessages = useConversationStore((s) => s.clearMessages)
  const resetWorkflow = useWorkflowStore((s) => s.reset)
  const hasGreeted = useRef(false)

  const avatar = avatarKey ? AVATAR_PERSONALITIES[avatarKey] : null

  // Tavus state
  const [tavusConnected, setTavusConnected] = useState(false)
  const tavusSpeakRef = useRef<((text: string) => Promise<void>) | null>(null)

  // Generative 3D avatar state
  const [generativeConnected, setGenerativeConnected] = useState(false)
  const generativeSpeakRef = useRef<((text: string) => void) | null>(null)

  // ElevenLabs / browser TTS — disabled when Tavus handles audio
  const { speak: speakTTS } = useSpeechSynthesis({ disabled: tavusConnected })
  const { generateNodeImage } = useImageGeneration()

  // Speech recognition (mic input) — sends transcript as a chat message
  const sendMessageRef = useRef<((msg: string) => void) | null>(null)
  const { isListening, transcript: interimTranscript, permissionState: micPermission, toggleListening } =
    useSpeechRecognition((finalText) => {
      sendMessageRef.current?.(finalText)
    })

  // Screen capture (screenshots + recording)
  const { takeScreenshot, startRecording, stopRecording, isCapturing, isRecording, stopCapture } = useScreenCapture()

  // Speech routing: Tavus → Generative 3D → ElevenLabs → Browser TTS
  const onAssistantResponse = useCallback(
    (text: string) => {
      if (tavusConnected && tavusSpeakRef.current) {
        // Tavus handles both video + audio
        tavusSpeakRef.current(text)
      } else if (generativeConnected && generativeSpeakRef.current) {
        // 3D avatar handles lip-sync from text — also play audio via TTS
        generativeSpeakRef.current(text)
        speakTTS(text, avatar?.voiceId)
      } else {
        // ElevenLabs (or browser TTS fallback)
        speakTTS(text, avatar?.voiceId)
      }
    },
    [tavusConnected, generativeConnected, speakTTS, avatar?.voiceId]
  )

  const { sendMessage, sendGreeting } = useChat(avatarKey || 'oracle', {
    onAssistantResponse,
    generateNodeImage,
  })

  // Keep sendMessage ref in sync for speech recognition callback
  sendMessageRef.current = sendMessage

  // Screenshot handler — takes screenshot and sends as multimodal message to Claude
  const handleScreenshot = useCallback(async () => {
    const dataUrl = await takeScreenshot()
    if (dataUrl) {
      sendMessage('Here\'s a screenshot of what I\'m looking at — can you help me with this?', dataUrl)
    }
  }, [takeScreenshot, sendMessage])

  // Recording toggle
  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      const videoUrl = await stopRecording()
      if (videoUrl) {
        sendMessage('[Screen recording saved]')
      }
    } else {
      await startRecording()
    }
  }, [isRecording, startRecording, stopRecording, sendMessage])

  // Tavus callbacks
  const handleTavusConnected = useCallback(() => {
    setTavusConnected(true)
  }, [])

  const handleTavusError = useCallback(() => {
    setTavusConnected(false)
    tavusSpeakRef.current = null
  }, [])

  const handleTavusSpeak = useCallback((speakFn: (text: string) => Promise<void>) => {
    tavusSpeakRef.current = speakFn
  }, [])

  // Generative 3D avatar callbacks
  const handleGenerativeConnected = useCallback(() => {
    setGenerativeConnected(true)
  }, [])

  const handleGenerativeError = useCallback(() => {
    setGenerativeConnected(false)
    generativeSpeakRef.current = null
  }, [])

  const handleGenerativeSpeak = useCallback((speakFn: (text: string) => void) => {
    generativeSpeakRef.current = speakFn
  }, [])

  // Store sendGreeting in a ref to avoid dependency issues
  const sendGreetingRef = useRef(sendGreeting)
  sendGreetingRef.current = sendGreeting

  useEffect(() => {
    if (!avatarKey) {
      router.push('/build')
      return
    }

    // Set phase to design (chat mode)
    setPhase('design')

    // Set avatar CSS color
    document.documentElement.style.setProperty('--avatar-color', avatar?.color || '#2d8014')
    document.documentElement.style.setProperty('--avatar-glow', avatar?.glow || 'rgba(45,128,20,.15)')
  }, [avatarKey, avatar, router, setPhase])

  // Send greeting exactly once — separate effect with no changing deps
  useEffect(() => {
    if (!avatarKey) return
    if (hasGreeted.current) return
    hasGreeted.current = true
    // Clear any stale state from previous session
    clearMessages()
    resetWorkflow()
    sendGreetingRef.current()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarKey])

  if (!avatar) return null

  const showReviewButton = interviewStage === 'review'
  // Only show Tavus when explicitly enabled via env var (requires valid Tavus API key)
  const showTavus = false // Tavus disabled — using GenerativeAvatar instead

  return (
    <>
      <TopBar
        status={`Building with ${avatar.name}`}
        showBack
        onBack={() => router.push('/build')}
        showPhases
        avatarColor={avatar.color}
      />
      <main
        className="pt-14 h-screen grid"
        style={{
          gridTemplateColumns: '380px 1fr',
        }}
      >
        <ChatPanel
          avatar={avatar}
          onSendMessage={sendMessage}
          avatarSlot={
            showTavus ? (
              <TavusAvatar
                avatar={avatar}
                onConnected={handleTavusConnected}
                onError={handleTavusError}
                onSpeak={handleTavusSpeak}
              />
            ) : (
              <GenerativeAvatar
                avatar={avatar}
                onConnected={handleGenerativeConnected}
                onError={handleGenerativeError}
                onSpeak={handleGenerativeSpeak}
              />
            )
          }
          callControlsSlot={
            <CallControls
              isListening={isListening}
              micPermission={micPermission}
              onToggleMic={toggleListening}
              interimTranscript={interimTranscript}
              isCapturing={isCapturing}
              isRecording={isRecording}
              onScreenshot={handleScreenshot}
              onToggleRecording={handleToggleRecording}
              onStopCapture={stopCapture}
              color={avatar.color}
            />
          }
        />
        <div className="relative">
          <WorkflowDiagram avatar={avatar} />

          {/* Review Workflow button — appears when interview reaches review stage */}
          {showReviewButton && (
            <div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
              style={{ animation: 'fadeUp .5s ease-out' }}
            >
              <button
                onClick={() => router.push(`/build/session/${sessionId}/review`)}
                className="px-6 py-3 rounded-full text-white font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${avatar.color}, ${avatar.color}cc)`,
                  boxShadow: `0 4px 24px ${avatar.glow}`,
                  fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                  fontSize: '0.85rem',
                  letterSpacing: '0.02em',
                }}
              >
                ✓ Review Workflow
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
