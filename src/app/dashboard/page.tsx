'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { AVATAR_PERSONALITIES } from '@/lib/avatar-config'
import { useSessionStore } from '@/stores/session.store'

interface SessionSummary {
  id: string
  avatar_key: string
  phase: string
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const setSession = useSessionStore((s) => s.setSession)

  useEffect(() => {
    async function load() {
      try {
        // Get userId from Clerk (if available)
        const clerkMod = await import('@clerk/nextjs').catch(() => null)
        // For now, just try to load sessions — the API will figure out the user
        const response = await fetch('/api/sessions?userId=current')
        if (response.ok) {
          const data = await response.json()
          setSessions(data.sessions || [])
        }
      } catch {
        // No sessions available
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const resumeSession = (session: SessionSummary) => {
    setSession(session.id, session.avatar_key as 'oracle' | 'spark' | 'forge' | 'flow')
    router.push(`/build/session/${session.id}`)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const phaseLabels: Record<string, string> = {
    discover: 'Onboarding',
    design: 'Designing',
    blueprint: 'Blueprint',
    build: 'Build Plan',
    validate: 'Validating',
    interview: 'In Progress',
    review: 'Reviewing',
    workorders: 'Work Orders',
    complete: 'Complete',
  }

  return (
    <>
      <TopBar status="Your Sessions" />
      <main className="pt-20 min-h-screen px-8 pb-16 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-3xl tracking-tight"
            style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif' }}
          >
            Past Sessions
          </h1>
          <button
            onClick={() => router.push('/build')}
            className="px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-all hover:translate-y-[-1px]"
            style={{
              background: 'var(--green-400)',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(45,128,20,.25)',
            }}
          >
            + New Session
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-6 h-6 border-2 rounded-full animate-spin"
              style={{ borderColor: 'var(--green-400) transparent transparent' }}
            />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg mb-2" style={{ color: 'var(--ink-20)' }}>
              No sessions yet
            </p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,.3)' }}>
              Start a new session to begin building with your AI co-builder
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const avatar = AVATAR_PERSONALITIES[session.avatar_key]
              return (
                <button
                  key={session.id}
                  onClick={() => resumeSession(session)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-left cursor-pointer transition-all hover:translate-x-1"
                  style={{
                    background: 'rgba(255,255,255,.03)',
                    border: '1px solid rgba(255,255,255,.06)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden"
                    style={{
                      background: avatar?.gradient || 'rgba(255,255,255,.1)',
                      boxShadow: avatar ? `0 0 16px ${avatar.glow}` : 'none',
                    }}
                  >
                    {avatar?.photoUrl ? (
                      <img src={avatar.photoUrl} alt={avatar.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">
                        {avatar?.emoji || '?'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">
                      Session with {avatar?.name || session.avatar_key}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: 'var(--ink-20)', fontFamily: 'var(--font-jetbrains-mono)' }}
                    >
                      {formatDate(session.created_at)}
                    </div>
                  </div>

                  <div
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: session.phase === 'complete' ? 'rgba(45,128,20,.15)' : 'rgba(255,255,255,.05)',
                      color: session.phase === 'complete' ? 'var(--green-300)' : 'var(--ink-20)',
                      border: '1px solid rgba(255,255,255,.06)',
                      fontFamily: 'var(--font-jetbrains-mono)',
                    }}
                  >
                    {phaseLabels[session.phase] || session.phase}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
