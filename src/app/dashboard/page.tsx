'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h1
              className="text-3xl tracking-tight mb-1"
              style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif' }}
            >
              Past Sessions
            </h1>
            <p className="text-sm font-light" style={{ color: 'var(--ink-20)' }}>
              {sessions.length > 0 ? `${sessions.length} session${sessions.length > 1 ? 's' : ''}` : 'No sessions yet'}
            </p>
          </div>
          <button
            onClick={() => router.push('/build')}
            className="px-6 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-all hover:translate-y-[-2px]"
            style={{
              background: 'var(--green-400)',
              color: '#fff',
              boxShadow: '0 4px 20px rgba(61,158,28,.25)',
            }}
          >
            + New Session
          </button>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-6 h-6 border-2 rounded-full animate-spin"
              style={{ borderColor: 'var(--green-400) transparent transparent' }}
            />
          </div>
        ) : sessions.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-24"
          >
            {/* Pulsing orb */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div
                className="absolute inset-0 rounded-full blur-2xl"
                style={{
                  background: 'var(--green-400)',
                  opacity: 0.1,
                  animation: 'glowPulse 3s ease-in-out infinite',
                }}
              />
              <div
                className="relative w-24 h-24 rounded-full flex items-center justify-center text-4xl glass"
              >
                ⚡
              </div>
            </div>
            <p className="text-lg mb-2 font-light" style={{ color: 'var(--ink-20)' }}>
              No sessions yet
            </p>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,.25)' }}>
              Start a new session to build your first micro tool with an AI co-builder
            </p>
            <button
              onClick={() => router.push('/build')}
              className="px-8 py-3 rounded-full text-sm font-semibold cursor-pointer transition-all hover:translate-y-[-2px]"
              style={{
                background: 'var(--green-400)',
                color: '#fff',
                boxShadow: '0 4px 24px rgba(61,158,28,.3)',
              }}
            >
              Start Building →
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, i) => {
              const avatar = AVATAR_PERSONALITIES[session.avatar_key]
              return (
                <motion.button
                  key={session.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  onClick={() => resumeSession(session)}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl text-left cursor-pointer transition-all duration-300 hover:translate-x-2 glass glass-hover group"
                  style={{
                    borderLeft: avatar ? `3px solid ${avatar.color}40` : undefined,
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-full flex-shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-105"
                    style={{
                      background: avatar?.gradient || 'rgba(255,255,255,.1)',
                      boxShadow: avatar ? `0 0 20px ${avatar.glow}` : 'none',
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
                      background: session.phase === 'complete' ? 'rgba(61,158,28,.12)' : 'rgba(255,255,255,.04)',
                      color: session.phase === 'complete' ? 'var(--green-300)' : 'var(--ink-20)',
                      border: '1px solid rgba(255,255,255,.06)',
                      fontFamily: 'var(--font-jetbrains-mono)',
                    }}
                  >
                    {phaseLabels[session.phase] || session.phase}
                  </div>

                  {/* Resume arrow — hover reveal */}
                  <span
                    className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ color: avatar?.color || 'var(--green-300)' }}
                  >
                    →
                  </span>
                </motion.button>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
