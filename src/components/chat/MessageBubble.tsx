'use client'

import Image from 'next/image'
import type { Message } from '@/lib/types'

interface MessageBubbleProps {
  message: Message
  avatarColor?: string
}

export function MessageBubble({ message, avatarColor }: MessageBubbleProps) {
  if (message.role === 'system') {
    return (
      <div
        className="self-center text-center px-4 py-2 rounded-full"
        style={{
          background: 'rgba(255,255,255,.03)',
          border: '1px dashed rgba(255,255,255,.06)',
          color: 'var(--ink-20)',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
          animation: 'msgIn 0.4s ease forwards',
          opacity: 0,
          transform: 'translateY(10px)',
        }}
      >
        {message.content}
      </div>
    )
  }

  const isUser = message.role === 'user'

  return (
    <div
      className={`max-w-[88%] rounded-2xl px-4 py-3 ${isUser ? 'self-end' : 'self-start'}`}
      style={{
        background: isUser
          ? avatarColor || 'var(--green-500)'
          : 'rgba(255,255,255,.05)',
        border: isUser ? 'none' : '1px solid rgba(255,255,255,.06)',
        borderBottomLeftRadius: isUser ? '16px' : '4px',
        borderBottomRightRadius: isUser ? '4px' : '16px',
        color: isUser ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.85)',
        fontSize: '0.86rem',
        lineHeight: '1.55',
        animation: 'msgIn 0.4s ease forwards',
        opacity: 0,
        transform: 'translateY(10px)',
      }}
    >
      {!isUser && (
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 600,
            marginBottom: '4px',
            fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
            letterSpacing: '0.04em',
            color: avatarColor || 'var(--green-300)',
          }}
        >
          AI
        </div>
      )}
      {message.imageUrl && (
        <Image
          src={message.imageUrl}
          alt="Screenshot"
          width={400}
          height={200}
          unoptimized
          className="rounded-lg mb-2 max-w-full"
          style={{
            maxHeight: '200px',
            width: 'auto',
            objectFit: 'contain',
            border: '1px solid rgba(255,255,255,.1)',
          }}
        />
      )}
      {message.content}
    </div>
  )
}
