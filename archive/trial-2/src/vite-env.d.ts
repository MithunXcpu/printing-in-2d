/// <reference types="vite/client" />

interface Window {
  api: import('../electron/preload').API
}

declare module 'kokoro-js' {
  export class KokoroTTS {
    static from_pretrained(
      model: string,
      options?: { dtype?: string; device?: string }
    ): Promise<KokoroTTS>
    generate(
      text: string,
      options: { voice: string; speed: number }
    ): Promise<{ toBlob(): Blob }>
  }
}

declare module '@met4citizen/talkinghead' {
  export class TalkingHead {
    constructor(container: HTMLElement, options?: Record<string, unknown>)
    showAvatar(avatar: Record<string, unknown>, onprogress?: unknown): Promise<void>
    speakText(text: string, opt?: Record<string, unknown>, onsubtitles?: unknown): void
    speakAudio(audio: Record<string, unknown>, opt?: Record<string, unknown>): void
    speakBreak(ms: number): void
    stopSpeaking(): void
    setMood(mood: string): void
    setView(view: string, opt?: Record<string, unknown>): void
    lookAtCamera(time: number): void
    lookAt(x: number | null, y: number | null, time: number): void
    start(): void
    stop(): void
    isSpeaking: boolean
    isListening: boolean
    [key: string]: unknown
  }
}
