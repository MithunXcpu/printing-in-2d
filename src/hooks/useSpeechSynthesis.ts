'use client'

import { useState, useCallback, useRef } from 'react'

interface UseSpeechSynthesisOptions {
  /** If true, skip TTS entirely (e.g. when Tavus handles audio) */
  disabled?: boolean
}

export function useSpeechSynthesis(options?: UseSpeechSynthesisOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  /** Stop any current speech (ElevenLabs or browser TTS) and cancel pending fetches */
  const stop = useCallback(() => {
    // Abort any in-flight ElevenLabs fetch
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    // Stop ElevenLabs audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    // Stop browser TTS
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }, [])

  /** Browser TTS fallback */
  const speakBrowserTTS = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 0.8

      // Try to find a good voice
      const voices = window.speechSynthesis.getVoices()
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Natural'))
      )
      if (preferred) utterance.voice = preferred

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    []
  )

  /** Speak text — tries ElevenLabs first, falls back to browser TTS.
   *  Stops any previously playing/loading speech first. */
  const speak = useCallback(
    async (text: string, voiceId?: string) => {
      if (options?.disabled) return
      if (!text.trim()) return

      // Stop any current speech AND abort pending fetches
      stop()

      // Strip HTML tags
      const cleanText = text.replace(/<[^>]*>/g, '')

      // Create abort controller for this specific request
      const controller = new AbortController()
      abortRef.current = controller

      // Try ElevenLabs first
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanText, voiceId }),
          signal: controller.signal,
        })

        // Check if we were aborted while waiting for the fetch
        if (controller.signal.aborted) return

        if (response.ok && response.body) {
          const blob = await response.blob()

          // Check again after blob download
          if (controller.signal.aborted) return

          const url = URL.createObjectURL(blob)
          const audio = new Audio(url)
          audioRef.current = audio

          audio.onplay = () => setIsSpeaking(true)
          audio.onended = () => {
            setIsSpeaking(false)
            URL.revokeObjectURL(url)
            if (audioRef.current === audio) audioRef.current = null
          }
          audio.onerror = () => {
            setIsSpeaking(false)
            URL.revokeObjectURL(url)
            if (audioRef.current === audio) audioRef.current = null
          }

          await audio.play()
          return
        }
      } catch (err) {
        // If aborted, just silently return
        if ((err as Error).name === 'AbortError') return
        // ElevenLabs failed — fall through to browser TTS
      }

      // Fallback: browser Web Speech API (only if not aborted)
      if (!controller.signal.aborted) {
        speakBrowserTTS(cleanText)
      }
    },
    [options?.disabled, stop, speakBrowserTTS]
  )

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  return { speak, stop, isSpeaking, isSupported }
}
