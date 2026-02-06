'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

type TalkingHeadInstance = {
  showAvatar: (avatar: Record<string, unknown>, onprogress?: unknown) => Promise<void>
  speakText: (text: string, opt?: Record<string, unknown>, onsubtitles?: unknown) => void
  stopSpeaking: () => void
  setMood: (mood: string) => void
  setView: (view: string, opt?: Record<string, unknown>) => void
  lookAtCamera: (time: number) => void
  start: () => void
  stop: () => void
  isSpeaking: boolean
  [key: string]: unknown
}

const DEFAULT_AVATAR_URL = 'https://models.readyplayer.me/6460d95f9ae8cb350c14e7d4.glb?morphTargets=ARKit,Oculus+Visemes'

interface UseAvatarOptions {
  avatarUrl?: string
  avatarBody?: string
  onSpeakingStart?: () => void
  onSpeakingEnd?: () => void
}

export function useAvatar(options: UseAvatarOptions = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const headRef = useRef<TalkingHeadInstance | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const speakingCheckRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const initialize = useCallback(async () => {
    if (!containerRef.current || headRef.current) return

    setIsLoading(true)
    setError(null)

    try {
      const { TalkingHead } = await import('@met4citizen/talkinghead')

      const head = new TalkingHead(containerRef.current, {
        ttsEndpoint: '',
        lipsyncModules: ['en'],
        lipsyncLang: 'en',
        cameraView: 'head',
        cameraRotateEnable: false,
        cameraPanEnable: false,
        cameraZoomEnable: false,
        lightAmbientIntensity: 3,
        lightDirectIntensity: 15,
        avatarMood: 'neutral',
        avatarIdleEyeContact: 0.7,
        avatarIdleHeadMove: 0.5,
        avatarSpeakingEyeContact: 0.8,
        avatarSpeakingHeadMove: 0.6,
        modelFPS: 30,
        modelPixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      }) as TalkingHeadInstance

      headRef.current = head

      await head.showAvatar({
        url: options.avatarUrl || DEFAULT_AVATAR_URL,
        body: options.avatarBody || 'F',
        avatarMood: 'neutral',
        lipsyncLang: 'en',
      })

      speakingCheckRef.current = setInterval(() => {
        if (headRef.current) {
          const speaking = headRef.current.isSpeaking
          setIsSpeaking((prev) => {
            if (prev !== speaking) {
              if (speaking) options.onSpeakingStart?.()
              else options.onSpeakingEnd?.()
            }
            return speaking
          })
        }
      }, 100)

      setIsLoaded(true)
    } catch (err) {
      console.error('TalkingHead init failed:', err)
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [options.avatarUrl, options.avatarBody, options.onSpeakingStart, options.onSpeakingEnd])

  const speak = useCallback((text: string) => {
    if (!headRef.current || !text.trim()) return
    headRef.current.speakText(text, { lipsyncLang: 'en', avatarMute: true })
  }, [])

  const stopSpeaking = useCallback(() => {
    headRef.current?.stopSpeaking()
  }, [])

  const setMood = useCallback((mood: string) => {
    headRef.current?.setMood(mood)
  }, [])

  const setView = useCallback((view: string) => {
    headRef.current?.setView(view)
  }, [])

  useEffect(() => {
    return () => {
      if (speakingCheckRef.current) clearInterval(speakingCheckRef.current)
      if (headRef.current) {
        headRef.current.stop?.()
        headRef.current = null
      }
    }
  }, [])

  return {
    containerRef,
    isLoaded,
    isLoading,
    error,
    isSpeaking,
    speak,
    stopSpeaking,
    setMood,
    setView,
    initialize,
  }
}
