'use client'

import dynamic from 'next/dynamic'

const AvatarCanvasInner = dynamic(() => import('./AvatarCanvasInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="w-16 h-16 rounded-full animate-pulse"
        style={{ background: 'rgba(255,255,255,.05)' }}
      />
    </div>
  ),
})

interface AvatarCanvasProps {
  avatarUrl?: string
  onSpeakingStart?: () => void
  onSpeakingEnd?: () => void
  onLoaded?: () => void
  onError?: (error: string) => void
}

export function AvatarCanvas(props: AvatarCanvasProps) {
  return <AvatarCanvasInner {...props} />
}
