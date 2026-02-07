'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'framer-motion'
import { TopBar } from '@/components/layout/TopBar'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { WorkflowDiagram } from '@/components/diagram/WorkflowDiagram'
import { StateImageViewer } from '@/components/state/StateImageViewer'
import { InterruptButton } from '@/components/ui/InterruptButton'
import { useChat } from '@/hooks/useChat'
// useSpeechSynthesis removed — Tavus handles all voice
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useScreenCapture } from '@/hooks/useScreenCapture'
import { CallControls } from '@/components/chat/CallControls'
import { useSessionStore } from '@/stores/session.store'
import { useConversationStore } from '@/stores/conversation.store'
import { useWorkflowStore } from '@/stores/workflow.store'
import { useInterviewStore } from '@/stores/interview.store'
import { AVATAR_PERSONALITIES } from '@/lib/avatar-config'

type ViewMode = 'chat' | 'current_image' | 'future_image' | 'compare' | 'refine' | 'orchestrate'

// Dynamic import TavusAvatar -- only loads when needed, no SSR
const TavusAvatar = dynamic(
  () => import('@/components/avatar/TavusAvatar').then((m) => ({ default: m.TavusAvatar })),
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
  const profile = useInterviewStore((s) => s.profile)
  const hasGreeted = useRef(false)

  const avatar = avatarKey ? AVATAR_PERSONALITIES[avatarKey] : null

  // State images and view mode
  const [currentStateImage, setCurrentStateImage] = useState<string | null>(null)
  const [futureStateImage, setFutureStateImage] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('chat')

  // Keep profile in a ref for the tool action handler
  const profileRef = useRef(profile)
  profileRef.current = profile

  // Tavus state
  const [tavusConnected, setTavusConnected] = useState(false)
  const [tavusFailed, setTavusFailed] = useState(false)
  const tavusSpeakRef = useRef<((text: string) => Promise<void>) | null>(null)

  // No browser TTS — Tavus handles all speech

  // Speech recognition (mic input) -- sends transcript as a chat message
  const sendMessageRef = useRef<((msg: string) => void) | null>(null)
  const { isListening, transcript: interimTranscript, permissionState: micPermission, toggleListening } =
    useSpeechRecognition((finalText) => {
      sendMessageRef.current?.(finalText)
    })

  // Screen capture (screenshots + recording)
  const { takeScreenshot, startRecording, stopRecording, isCapturing, isRecording, stopCapture } = useScreenCapture()

  // Speech routing: Tavus only — video avatar handles both video + audio
  const onAssistantResponse = useCallback(
    (text: string) => {
      if (tavusConnected && tavusSpeakRef.current) {
        tavusSpeakRef.current(text)
      }
      // If Tavus isn't connected, text still shows in chat — no fallback voice
    },
    [tavusConnected]
  )

  // Tool action handler -- responds to tool calls from useChat
  const handleToolAction = useCallback(
    (action: { type: string; payload: Record<string, unknown> }) => {
      switch (action.type) {
        case 'generate_state_image': {
          const { type, summary, steps, tools, pain_points } = action.payload
          fetch('/api/generate-state-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type,
              summary,
              steps,
              tools,
              painPoints: pain_points,
              profile: profileRef.current,
            }),
          })
            .then((r) => r.json())
            .then(({ imageUrl }) => {
              if (type === 'current') setCurrentStateImage(imageUrl)
              else setFutureStateImage(imageUrl)
            })
            .catch((err) => console.error('State image generation failed:', err))
          break
        }
        case 'request_validation': {
          const { type } = action.payload
          if (type === 'current') setViewMode('current_image')
          else if (type === 'future') setViewMode('future_image')
          else if (type === 'compare') setViewMode('compare')
          break
        }
        case 'update_interview_stage': {
          const { stage } = action.payload
          // Auto-switch viewMode based on interview stage transitions
          if (stage === 'validate_current') setViewMode('current_image')
          else if (stage === 'validate_future') setViewMode('future_image')
          else if (stage === 'compare') setViewMode('compare')
          else if (stage === 'refine') setViewMode('refine')
          else if (stage === 'orchestrate') setViewMode('orchestrate')
          break
        }
      }
    },
    []
  )

  const { sendMessage, sendGreeting } = useChat(avatarKey || 'oracle', {
    onAssistantResponse,
    onToolAction: handleToolAction,
  })

  // Keep sendMessage ref in sync for speech recognition callback
  sendMessageRef.current = sendMessage

  // Screenshot handler -- takes screenshot and sends as multimodal message to Claude
  const handleScreenshot = useCallback(async () => {
    const dataUrl = await takeScreenshot()
    if (dataUrl) {
      sendMessage('Here\'s a screenshot of what I\'m looking at -- can you help me with this?', dataUrl)
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

  // Validation callback for StateImageViewer
  const handleValidation = useCallback(
    (type: 'current' | 'future', approved: boolean) => {
      if (approved) {
        // Send approval message to the chat
        sendMessage(`I approve the ${type} state diagram. It looks good.`)
      } else {
        // Switch back to chat so user can describe changes
        setViewMode('chat')
        sendMessage(`I want to make changes to the ${type} state diagram.`)
      }
    },
    [sendMessage]
  )

  // Interrupt handler for refine/orchestrate modes
  const handleInterrupt = useCallback(() => {
    setViewMode('chat')
    sendMessage('I want to interrupt and make a correction.')
  }, [sendMessage])

  // Tavus callbacks
  const handleTavusConnected = useCallback(() => {
    setTavusConnected(true)
  }, [])

  const handleTavusError = useCallback(() => {
    setTavusConnected(false)
    setTavusFailed(true)
    tavusSpeakRef.current = null
  }, [])

  const handleTavusSpeak = useCallback((speakFn: (text: string) => Promise<void>) => {
    tavusSpeakRef.current = speakFn
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

  // Send greeting exactly once -- separate effect with no changing deps
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

  // Tavus video avatar — no fallback to 3D or Mac voice
  const avatarSlotElement = (
    <TavusAvatar
      avatar={avatar}
      onConnected={handleTavusConnected}
      onError={handleTavusError}
      onSpeak={handleTavusSpeak}
    />
  )

  // Determine what to render in the right panel
  const renderRightPanel = () => {
    switch (viewMode) {
      case 'current_image':
      case 'future_image':
        return (
          <StateImageViewer
            currentStateImage={currentStateImage}
            futureStateImage={futureStateImage}
            viewMode={viewMode}
            onValidate={handleValidation}
            avatarColor={avatar.color}
          />
        )
      case 'compare':
        return (
          <StateImageViewer
            currentStateImage={currentStateImage}
            futureStateImage={futureStateImage}
            viewMode="compare"
            onValidate={handleValidation}
            avatarColor={avatar.color}
          />
        )
      case 'refine':
        return (
          <>
            <StateImageViewer
              currentStateImage={null}
              futureStateImage={futureStateImage}
              viewMode="future_image"
              onValidate={handleValidation}
              avatarColor={avatar.color}
            />
          </>
        )
      case 'orchestrate':
        return <WorkflowDiagram avatar={avatar} />
      case 'chat':
      default:
        return <WorkflowDiagram avatar={avatar} />
    }
  }

  const showInterruptButton = viewMode === 'refine' || viewMode === 'orchestrate'

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
          gridTemplateColumns: '1fr 1px 1fr',
        }}
      >
        <ChatPanel
          avatar={avatar}
          onSendMessage={sendMessage}
          avatarSlot={avatarSlotElement}
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
        {/* Glass divider */}
        <div
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,.06) 20%, rgba(255,255,255,.06) 80%, transparent)',
          }}
        />
        <div className="relative overflow-hidden">
          {renderRightPanel()}

          {/* Interrupt button -- visible during refine and orchestrate modes */}
          <AnimatePresence>
            {showInterruptButton && (
              <InterruptButton onClick={handleInterrupt} color={avatar.color} />
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  )
}
