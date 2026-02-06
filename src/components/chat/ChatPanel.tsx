'use client'

import { useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { useConversationStore } from '@/stores/conversation.store'
import type { AvatarPersonality } from '@/lib/types'
import type { ReactNode } from 'react'

interface ChatPanelProps {
  avatar: AvatarPersonality
  onSendMessage: (message: string) => void
  disabled?: boolean
  /** Optional slot for Tavus video avatar — renders above the header */
  avatarSlot?: ReactNode
  /** Optional slot for call controls (mic, screenshot, record) — renders above the input */
  callControlsSlot?: ReactNode
}

export function ChatPanel({ avatar, onSendMessage, disabled, avatarSlot, callControlsSlot }: ChatPanelProps) {
  const messages = useConversationStore((s) => s.messages)
  const isStreaming = useConversationStore((s) => s.isStreaming)
  const currentStreamingText = useConversationStore((s) => s.currentStreamingText)
  const suggestions = useConversationStore((s) => s.suggestions)
  const setSuggestions = useConversationStore((s) => s.setSuggestions)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentStreamingText, suggestions])

  const handleSuggestionClick = (text: string) => {
    setSuggestions([])
    onSendMessage(text)
  }

  return (
    <div
      className="flex flex-col overflow-hidden h-full"
      style={{
        background: 'var(--ink-80)',
        borderRight: '1px solid rgba(255,255,255,.04)',
      }}
    >
      {/* Tavus video avatar slot — renders above header when present */}
      {avatarSlot}

      {/* Avatar hero + header */}
      {!avatarSlot && avatar.photoUrl ? (
        <div
          className="flex flex-col items-center py-6 px-6"
          style={{
            borderBottom: '1px solid rgba(255,255,255,.04)',
            background: `radial-gradient(ellipse at 50% 80%, ${avatar.glow}, transparent 70%)`,
          }}
        >
          <div
            className="w-20 h-20 rounded-full overflow-hidden mb-3"
            style={{
              boxShadow: `0 0 0 3px ${avatar.color}66, 0 0 24px ${avatar.color}33, 0 4px 20px rgba(0,0,0,.4)`,
            }}
          >
            <img
              src={avatar.photoUrl}
              alt={avatar.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3
            className="text-white mb-0.5"
            style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', fontSize: '1.1rem', fontWeight: 600 }}
          >
            {avatar.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: avatar.color,
                animation: 'onlinePulse 2s ease-in-out infinite',
                '--avatar-color': avatar.color,
              } as React.CSSProperties}
            />
            <span
              style={{
                fontSize: '0.68rem',
                color: 'var(--ink-20)',
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              }}
            >
              {avatar.trait.split('.')[0]}
            </span>
          </div>
        </div>
      ) : !avatarSlot ? (
        <div
          className="px-6 py-5 flex items-center gap-3.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: avatar.gradient }}
          >
            {avatar.emoji}
          </div>
          <div className="flex-1">
            <h3
              className="text-white"
              style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', fontSize: '1rem', fontWeight: 600 }}
            >
              {avatar.name}
            </h3>
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--ink-20)',
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              }}
            >
              {avatar.trait.split('.')[0]}
            </span>
          </div>
          <div
            className="w-2 h-2 rounded-full ml-auto"
            style={{
              background: avatar.color,
              animation: 'onlinePulse 2s ease-in-out infinite',
              '--avatar-color': avatar.color,
            } as React.CSSProperties}
          />
        </div>
      ) : null}

      {/* Gradient separator between header and messages */}
      <div
        style={{
          height: '2px',
          background: `linear-gradient(to right, ${avatar.senderColor}, transparent)`,
          flexShrink: 0,
        }}
      />

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} avatarColor={avatar.senderColor} />
        ))}

        {isStreaming && currentStreamingText && (
          <div
            className="max-w-[88%] rounded-2xl px-4 py-3 self-start"
            style={{
              background: 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.06)',
              borderBottomLeftRadius: '4px',
              color: 'rgba(255,255,255,.85)',
              fontSize: '0.86rem',
              lineHeight: '1.55',
            }}
          >
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                marginBottom: '4px',
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                letterSpacing: '0.04em',
                color: avatar.senderColor,
              }}
            >
              {avatar.name}
            </div>
            {currentStreamingText}
          </div>
        )}

        {isStreaming && !currentStreamingText && (
          <TypingIndicator color={avatar.color} />
        )}

        {/* Suggestion buttons */}
        {!isStreaming && suggestions.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-left rounded-xl px-4 py-3 transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.08)',
                  color: 'rgba(255,255,255,.75)',
                  fontSize: '0.82rem',
                  lineHeight: '1.45',
                  fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,.08)'
                  e.currentTarget.style.borderColor = avatar.color
                  e.currentTarget.style.color = 'rgba(255,255,255,.95)'
                  e.currentTarget.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,.04)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'
                  e.currentTarget.style.color = 'rgba(255,255,255,.75)'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '18px',
                    color: avatar.color,
                    fontWeight: 700,
                    marginRight: '6px',
                  }}
                >
                  {idx + 1}.
                </span>
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Call controls (mic, screenshot, record) */}
      {callControlsSlot}

      {/* Input */}
      <ChatInput
        onSend={onSendMessage}
        disabled={disabled || isStreaming}
        avatarColor={avatar.color}
      />
    </div>
  )
}
