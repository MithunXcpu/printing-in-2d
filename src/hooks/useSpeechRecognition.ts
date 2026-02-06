'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */

// Browser speech recognition types (not in default TS lib)
interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly [index: number]: { readonly transcript: string }
}
interface SpeechRecognitionEvent {
  readonly results: ArrayLike<SpeechRecognitionResult>
  readonly resultIndex: number
}
interface SpeechRecognitionErrorEvent {
  readonly error: string
}
interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

function getSpeechRecognitionAPI(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null
}

export function useSpeechRecognition(onFinalTranscript?: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt')
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const onResultRef = useRef(onFinalTranscript)
  onResultRef.current = onFinalTranscript

  const isSupported = getSpeechRecognitionAPI() !== null

  // Check mic permission state on mount
  useEffect(() => {
    if (!isSupported) {
      setPermissionState('unsupported')
      return
    }
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((result) => {
          setPermissionState(result.state as 'prompt' | 'granted' | 'denied')
          result.onchange = () => setPermissionState(result.state as 'prompt' | 'granted' | 'denied')
        })
        .catch(() => setPermissionState('prompt'))
    }
  }, [isSupported])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
      setPermissionState('granted')
      return true
    } catch {
      setPermissionState('denied')
      return false
    }
  }, [])

  const startListening = useCallback(async () => {
    const API = getSpeechRecognitionAPI()
    if (!API) return

    if (permissionState !== 'granted') {
      const granted = await requestPermission()
      if (!granted) return
    }

    if (recognitionRef.current) recognitionRef.current.abort()

    const recognition = new API()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
    }

    recognition.onresult = (event) => {
      const results = Array.from(event.results)
      const text = results.map((r) => r[0].transcript).join('')
      setTranscript(text)

      if (results[results.length - 1].isFinal) {
        onResultRef.current?.(text.trim())
        setTranscript('')
        setIsListening(false)
      }
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') setPermissionState('denied')
      if (event.error !== 'aborted') setIsListening(false)
    }

    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
  }, [permissionState, requestPermission])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsListening(false)
    setTranscript('')
  }, [])

  const toggleListening = useCallback(() => {
    if (isListening) stopListening()
    else startListening()
  }, [isListening, startListening, stopListening])

  useEffect(() => {
    return () => { recognitionRef.current?.abort() }
  }, [])

  return { startListening, stopListening, toggleListening, isListening, transcript, isSupported, permissionState, requestPermission }
}
