declare module '@met4citizen/talkinghead' {
  export class TalkingHead {
    constructor(container: HTMLElement, options?: Record<string, unknown>)
    showAvatar(avatar: Record<string, unknown>, onprogress?: unknown): Promise<void>
    speakText(text: string, opt?: Record<string, unknown>, onsubtitles?: unknown): void
    stopSpeaking(): void
    setMood(mood: string): void
    setView(view: string, opt?: Record<string, unknown>): void
    lookAtCamera(time: number): void
    start(): void
    stop(): void
    isSpeaking: boolean
    [key: string]: unknown
  }
}
