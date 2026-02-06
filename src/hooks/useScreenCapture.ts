'use client'

import { useState, useCallback, useRef } from 'react'

interface ScreenCaptureResult {
  /** Take a single screenshot, returns base64 data URL */
  takeScreenshot: () => Promise<string | null>
  /** Start screen recording */
  startRecording: () => Promise<void>
  /** Stop recording, returns blob URL of the video */
  stopRecording: () => Promise<string | null>
  /** Whether we're currently sharing/capturing screen */
  isCapturing: boolean
  /** Whether we're currently recording */
  isRecording: boolean
  /** Stop screen share entirely */
  stopCapture: () => void
}

export function useScreenCapture(): ScreenCaptureResult {
  const [isCapturing, setIsCapturing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  /** Ensure we have a screen share stream */
  const ensureStream = useCallback(async (): Promise<MediaStream | null> => {
    if (streamRef.current && streamRef.current.active) return streamRef.current

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: false,
      })

      // Listen for user stopping share via browser UI
      stream.getVideoTracks()[0].onended = () => {
        streamRef.current = null
        setIsCapturing(false)
        setIsRecording(false)
      }

      streamRef.current = stream
      setIsCapturing(true)
      return stream
    } catch {
      setIsCapturing(false)
      return null
    }
  }, [])

  /** Take a screenshot of the shared screen */
  const takeScreenshot = useCallback(async (): Promise<string | null> => {
    const stream = await ensureStream()
    if (!stream) return null

    const track = stream.getVideoTracks()[0]
    const settings = track.getSettings()
    const w = settings.width || 1920
    const h = settings.height || 1080

    // Use ImageCapture API if available, otherwise use canvas
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const video = document.createElement('video')
    video.srcObject = stream
    video.muted = true

    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => { video.play(); resolve() }
    })
    // Wait a frame for the video to render
    await new Promise((r) => requestAnimationFrame(r))

    ctx.drawImage(video, 0, 0, w, h)
    video.pause()
    video.srcObject = null

    return canvas.toDataURL('image/jpeg', 0.85)
  }, [ensureStream])

  /** Start recording the screen */
  const startRecording = useCallback(async () => {
    const stream = await ensureStream()
    if (!stream) return

    chunksRef.current = []
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' })

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.start(1000) // Collect data every second
    recorderRef.current = recorder
    setIsRecording(true)
  }, [ensureStream])

  /** Stop recording, return blob URL */
  const stopRecording = useCallback(async (): Promise<string | null> => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') return null

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setIsRecording(false)
        recorderRef.current = null
        resolve(url)
      }
      recorder.stop()
    })
  }, [])

  /** Stop screen share entirely */
  const stopCapture = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setIsCapturing(false)
    setIsRecording(false)
  }, [])

  return { takeScreenshot, startRecording, stopRecording, isCapturing, isRecording, stopCapture }
}
