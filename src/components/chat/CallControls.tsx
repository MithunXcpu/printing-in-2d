'use client'

interface CallControlsProps {
  /** Mic state */
  isListening: boolean
  micPermission: 'prompt' | 'granted' | 'denied' | 'unsupported'
  onToggleMic: () => void
  interimTranscript: string

  /** Screen capture */
  isCapturing: boolean
  isRecording: boolean
  onScreenshot: () => void
  onToggleRecording: () => void
  onStopCapture: () => void

  /** Avatar color for accents */
  color: string
}

export function CallControls({
  isListening,
  micPermission,
  onToggleMic,
  interimTranscript,
  isCapturing,
  isRecording,
  onScreenshot,
  onToggleRecording,
  onStopCapture,
  color,
}: CallControlsProps) {
  return (
    <div>
      {/* Interim transcript display */}
      {interimTranscript && (
        <div
          className="px-6 py-2"
          style={{
            background: 'rgba(255,255,255,.03)',
            borderBottom: '1px solid rgba(255,255,255,.04)',
          }}
        >
          <div
            className="flex items-center gap-2"
            style={{
              fontSize: '0.78rem',
              color: 'rgba(255,255,255,.5)',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: '#ef4444', animation: 'onlinePulse 1s ease-in-out infinite', '--avatar-color': '#ef4444' } as React.CSSProperties}
            />
            {interimTranscript}
          </div>
        </div>
      )}

      {/* Control bar */}
      <div
        className="flex items-center justify-center gap-3 px-6 py-3"
        style={{
          borderTop: '1px solid rgba(255,255,255,.04)',
          background: 'rgba(0,0,0,.15)',
        }}
      >
        {/* Mic button */}
        <button
          onClick={onToggleMic}
          className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
          style={{
            background: isListening ? color : 'rgba(255,255,255,.06)',
            border: `1.5px solid ${isListening ? color : 'rgba(255,255,255,.1)'}`,
            color: isListening ? '#fff' : 'rgba(255,255,255,.6)',
          }}
          title={micPermission === 'denied' ? 'Microphone blocked — check browser settings' : isListening ? 'Stop listening' : 'Start speaking'}
        >
          {micPermission === 'denied' ? (
            // Mic blocked icon
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17" />
              <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            // Mic icon
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="1" width="6" height="13" rx="3" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
          {/* Pulse ring when listening */}
          {isListening && (
            <span
              className="absolute inset-0 rounded-full"
              style={{
                border: `2px solid ${color}`,
                animation: 'onlinePulse 1.5s ease-in-out infinite',
                '--avatar-color': color,
              } as React.CSSProperties}
            />
          )}
        </button>

        {/* Screenshot button */}
        <button
          onClick={onScreenshot}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,.06)',
            border: '1.5px solid rgba(255,255,255,.1)',
            color: 'rgba(255,255,255,.6)',
          }}
          title="Take screenshot (asks to share screen)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
          </svg>
        </button>

        {/* Screen record button */}
        <button
          onClick={onToggleRecording}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
          style={{
            background: isRecording ? '#ef4444' : 'rgba(255,255,255,.06)',
            border: `1.5px solid ${isRecording ? '#ef4444' : 'rgba(255,255,255,.1)'}`,
            color: isRecording ? '#fff' : 'rgba(255,255,255,.6)',
          }}
          title={isRecording ? 'Stop recording' : 'Record screen'}
        >
          {isRecording ? (
            // Stop icon
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            // Record icon
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          )}
        </button>

        {/* Stop sharing button (only when capturing) */}
        {isCapturing && (
          <button
            onClick={onStopCapture}
            className="flex items-center gap-1.5 px-3 h-10 rounded-full transition-all duration-200"
            style={{
              background: 'rgba(239,68,68,.15)',
              border: '1.5px solid rgba(239,68,68,.3)',
              color: '#ef4444',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}
            title="Stop sharing screen"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
            Stop
          </button>
        )}
      </div>
    </div>
  )
}
