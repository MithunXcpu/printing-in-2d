'use client'

import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { useSessionStore } from '@/stores/session.store'
import { useWorkflowStore } from '@/stores/workflow.store'
import { useConversationStore } from '@/stores/conversation.store'
import { AVATAR_PERSONALITIES } from '@/lib/avatar-config'
import { DiagramNode } from '@/components/diagram/DiagramNode'
import { DiagramConnection } from '@/components/diagram/DiagramConnection'

export default function ReviewPage() {
  const router = useRouter()
  const avatarKey = useSessionStore((s) => s.avatarKey)
  const sessionId = useSessionStore((s) => s.sessionId)
  const nodes = useWorkflowStore((s) => s.nodes)
  const connections = useWorkflowStore((s) => s.connections)
  const messages = useConversationStore((s) => s.messages)

  const avatar = avatarKey ? AVATAR_PERSONALITIES[avatarKey] : null

  if (!avatar) {
    router.push('/build')
    return null
  }

  const revealedNodes = nodes.filter((n) => n.isRevealed)
  const revealedConnections = connections.filter((c) => {
    const from = nodes.find((n) => n.id === c.from)
    const to = nodes.find((n) => n.id === c.to)
    return from?.isRevealed && to?.isRevealed
  })

  return (
    <>
      <TopBar
        status="Review your workflow"
        showBack
        onBack={() => router.push(`/build/session/${sessionId}`)}
      />
      <main className="pt-14 min-h-screen flex flex-col">
        {/* Top section */}
        <div className="text-center py-12 px-8 relative overflow-hidden">
          <div
            className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${avatar.glow}, transparent 70%)`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4 relative"
            style={{
              border: '1px solid rgba(255,255,255,.08)',
              background: 'rgba(255,255,255,.04)',
            }}
          >
            <div
              className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: avatar.color }}
            >
              &#x2713;
            </div>
            Workflow mapped
          </div>
          <h2
            className="mb-2.5 relative"
            style={{
              fontFamily: 'var(--font-fraunces), Fraunces, serif',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              letterSpacing: '-0.02em',
            }}
          >
            Your workflow is <em className="italic font-light" style={{ color: avatar.senderColor }}>ready.</em>
          </h2>
          <p
            className="font-light max-w-[500px] mx-auto leading-[1.6] relative"
            style={{ fontSize: '0.95rem', color: 'var(--ink-20)' }}
          >
            {revealedNodes.length} nodes mapped. {revealedConnections.length} connections drawn. {messages.filter((m) => m.role === 'user').length} conversation rounds.
          </p>
        </div>

        {/* Diagram + Sidebar */}
        <div
          className="flex-1 grid gap-0 overflow-hidden"
          style={{
            gridTemplateColumns: '1fr 340px',
            borderTop: '1px solid rgba(255,255,255,.04)',
          }}
        >
          {/* Full diagram */}
          <div className="relative" style={{ borderRight: '1px solid rgba(255,255,255,.04)' }}>
            <svg className="absolute inset-0 w-full h-full z-[1]" viewBox="0 0 100 100" preserveAspectRatio="none">
              {connections.map((conn) => (
                <DiagramConnection key={conn.id} connection={conn} nodes={nodes} avatarColor={avatar.color} />
              ))}
            </svg>
            {nodes.map((node) => (
              <DiagramNode key={node.id} node={node} />
            ))}
          </div>

          {/* Sidebar */}
          <div
            className="overflow-y-auto flex flex-col gap-5 px-6 py-7"
            style={{
              background: 'var(--ink-80)',
              borderTop: '1px solid rgba(255,255,255,.04)',
            }}
          >
            {/* Stats */}
            <div>
              <div
                className="mb-2"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                  fontSize: '0.64rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--ink-20)',
                }}
              >
                Summary
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { icon: '🔗', val: revealedNodes.length, label: 'Nodes' },
                  { icon: '↔️', val: revealedConnections.length, label: 'Connections' },
                  { icon: '💬', val: messages.filter((m) => m.role === 'user').length, label: 'Rounds' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,.03)',
                      border: '1px solid rgba(255,255,255,.04)',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ background: avatar.glow }}
                    >
                      {s.icon}
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{s.val}</div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--ink-20)',
                          fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                        }}
                      >
                        {s.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Node list */}
            <div>
              <div
                className="mb-2"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                  fontSize: '0.64rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--ink-20)',
                }}
              >
                Nodes
              </div>
              <div className="flex flex-col gap-1.5">
                {revealedNodes.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255,255,255,.02)',
                      border: '1px solid rgba(255,255,255,.03)',
                    }}
                  >
                    <span>{n.icon}</span>
                    <span>{n.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto flex flex-col gap-2.5">
              <button
                onClick={() => router.push(`/build/session/${sessionId}/workorders`)}
                className="w-full py-3.5 px-6 rounded-full font-semibold text-white transition-all hover:translate-y-[-2px] hover:brightness-110 flex items-center justify-center gap-2"
                style={{
                  background: avatar.color,
                  fontSize: '0.92rem',
                  fontFamily: 'var(--font-outfit), Outfit, sans-serif',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1v10M4 7l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Generate Work Orders
              </button>
              <button
                onClick={() => router.push(`/build/session/${sessionId}`)}
                className="w-full py-3 px-6 rounded-full text-center transition-all"
                style={{
                  background: 'rgba(255,255,255,.05)',
                  border: '1px solid rgba(255,255,255,.08)',
                  color: 'rgba(255,255,255,.6)',
                  fontSize: '0.86rem',
                  fontFamily: 'var(--font-outfit), Outfit, sans-serif',
                }}
              >
                Continue conversation
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
