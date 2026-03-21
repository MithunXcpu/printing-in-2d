'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TopBar } from '@/components/layout/TopBar'
import { SwarmGrid } from '@/components/swarm/SwarmGrid'
import { useSessionStore } from '@/stores/session.store'
import { useWorkflowStore } from '@/stores/workflow.store'
import { useWorkOrderStore } from '@/stores/workorder.store'
import { useInterviewStore } from '@/stores/interview.store'
import { useSwarmStore } from '@/stores/swarm.store'
import { AVATAR_PERSONALITIES } from '@/lib/avatar-config'
import { AGENT_DEFINITIONS, FREE_AGENT_IDS } from '@/lib/agent-definitions'
import type { AgentId, AgentResult } from '@/lib/types'

export default function SwarmPage() {
  const router = useRouter()
  const avatarKey = useSessionStore((s) => s.avatarKey)
  const sessionId = useSessionStore((s) => s.sessionId)
  const setPhase = useSessionStore((s) => s.setPhase)
  const nodes = useWorkflowStore((s) => s.nodes)
  const connections = useWorkflowStore((s) => s.connections)
  const workOrders = useWorkOrderStore((s) => s.workOrders)
  const profile = useInterviewStore((s) => s.profile)

  const results = useSwarmStore((s) => s.results)
  const expandedAgentId = useSwarmStore((s) => s.expandedAgentId)
  const isRunning = useSwarmStore((s) => s.isRunning)
  const completedCount = useSwarmStore((s) => s.completedCount)
  const initSwarm = useSwarmStore((s) => s.initSwarm)
  const setAgentStatus = useSwarmStore((s) => s.setAgentStatus)
  const setAgentResult = useSwarmStore((s) => s.setAgentResult)
  const setExpanded = useSwarmStore((s) => s.setExpanded)
  const setRunning = useSwarmStore((s) => s.setRunning)

  const [rerunningAgentId, setRerunningAgentId] = useState<AgentId | null>(null)
  const hasStartedRef = useRef(false)

  const avatar = avatarKey ? AVATAR_PERSONALITIES[avatarKey] : null

  // TODO: Check subscription status from Supabase/Clerk
  // For now, default to Pro tier to show all 15 agents
  const isProTier = true

  const agentIds = isProTier
    ? AGENT_DEFINITIONS.map((a) => a.id)
    : FREE_AGENT_IDS

  const totalAgents = agentIds.length

  const runSwarm = useCallback(async () => {
    initSwarm(agentIds)

    try {
      const response = await fetch('/api/swarm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes,
          connections,
          profile,
          workOrders,
          agentIds,
        }),
      })

      if (!response.ok) {
        setRunning(false)
        return
      }

      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const event = JSON.parse(line)

            switch (event.type) {
              case 'agent_start':
                setAgentStatus(event.agentId, 'analyzing')
                break
              case 'agent_delta':
                // Streaming analysis text
                break
              case 'agent_complete':
                setAgentResult(event.agentId, {
                  ...event.result,
                  status: 'complete',
                })
                break
              case 'agent_error':
                setAgentResult(event.agentId, {
                  agentId: event.agentId,
                  status: 'error',
                  analysis: '',
                  codeSnippets: [],
                  recommendations: [],
                  relevantNodeIds: [],
                  error: event.error,
                })
                break
              case 'swarm_complete':
                setRunning(false)
                break
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }

      setRunning(false)
    } catch (error) {
      console.error('Swarm error:', error)
      setRunning(false)
    }
  }, [nodes, connections, profile, workOrders, agentIds, initSwarm, setAgentStatus, setAgentResult, setRunning])

  useEffect(() => {
    setPhase('build')
    if (!avatar) {
      router.push('/build')
      return
    }

    // Auto-run swarm on mount
    if (!hasStartedRef.current) {
      hasStartedRef.current = true
      runSwarm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleToggleExpand = (agentId: AgentId) => {
    setExpanded(expandedAgentId === agentId ? null : agentId)
  }

  const handleGenerateImage = useCallback(async (agentId: AgentId, description: string) => {
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: description,
          description: `Technical diagram for ${agentId} analysis`,
          type: 'display' as const,
        }),
      })

      if (!response.ok) return

      const { imageUrl } = await response.json()
      if (imageUrl) {
        const existing = results[agentId]
        if (existing) {
          setAgentResult(agentId, { ...existing, imageUrl })
        }
      }
    } catch (error) {
      console.error('Image generation failed:', error)
    }
  }, [results, setAgentResult])

  const handleRerunAgent = async (agentId: AgentId) => {
    setRerunningAgentId(agentId)
    setAgentStatus(agentId, 'analyzing')

    try {
      const response = await fetch(`/api/swarm/${agentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, connections, profile, workOrders }),
      })

      if (!response.ok) throw new Error('Re-run failed')

      const result: AgentResult = await response.json()
      setAgentResult(agentId, { ...result, status: 'complete' })
    } catch (error) {
      setAgentResult(agentId, {
        agentId,
        status: 'error',
        analysis: '',
        codeSnippets: [],
        recommendations: [],
        relevantNodeIds: [],
        error: error instanceof Error ? error.message : 'Re-run failed',
      })
    } finally {
      setRerunningAgentId(null)
    }
  }

  if (!avatar) return null

  const progressPercent = totalAgents > 0 ? (completedCount / totalAgents) * 100 : 0

  // Calculate total estimated hours and files
  const totalHours = Object.values(results)
    .filter((r) => r.status === 'complete' && r.estimatedHours)
    .reduce((sum, r) => sum + (r.estimatedHours ?? 0), 0)
  const totalFiles = Object.values(results)
    .filter((r) => r.status === 'complete')
    .reduce((sum, r) => sum + r.codeSnippets.length, 0)

  return (
    <>
      <TopBar
        status="Agent Swarm"
        showBack
        onBack={() => router.push(`/build/session/${sessionId}/workorders`)}
        showPhases
        avatarColor={avatar.color}
      />
      <main className="pt-14 min-h-screen px-8 py-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="mb-3"
              style={{
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                fontSize: '0.68rem',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: avatar.color,
              }}
            >
              Agent Swarm
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-fraunces), Fraunces, serif',
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                letterSpacing: '-0.02em',
                marginBottom: '8px',
              }}
            >
              {!isRunning && completedCount === totalAgents ? (
                <>
                  Analysis{' '}
                  <em className="italic font-light" style={{ color: avatar.senderColor }}>
                    complete.
                  </em>
                </>
              ) : (
                <>
                  {completedCount > 0 ? 'Analyzing' : 'Deploying'}{' '}
                  <em className="italic font-light" style={{ color: avatar.senderColor }}>
                    agents.
                  </em>
                </>
              )}
            </h1>
            <p className="font-light" style={{ color: 'var(--ink-20)', fontSize: '0.95rem' }}>
              {!isRunning && completedCount === totalAgents
                ? `${totalAgents} specialists analyzed your workflow. ${totalFiles} files generated, ~${totalHours}h estimated.`
                : `${totalAgents} specialized agents are analyzing your workflow from every angle.`}
            </p>
          </motion.div>
        </div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-between mb-2">
            <span
              style={{
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                fontSize: '0.68rem',
                color: 'rgba(255,255,255,.4)',
              }}
            >
              {isRunning ? 'Swarm progress' : 'Complete'}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                fontSize: '0.68rem',
                color: avatar.senderColor,
              }}
            >
              {completedCount}/{totalAgents} agents
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,.06)' }}
          >
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                background: avatar.color,
                boxShadow: `0 0 12px ${avatar.glow}`,
              }}
            />
          </div>
        </motion.div>

        {/* Swarm Grid */}
        <SwarmGrid
          results={results}
          expandedAgentId={expandedAgentId}
          onToggleExpand={handleToggleExpand}
          onRerunAgent={handleRerunAgent}
          rerunningAgentId={rerunningAgentId}
          isProTier={isProTier}
          accentColor={avatar.color}
          onGenerateImage={handleGenerateImage}
        />

        {/* Bottom summary (after complete) */}
        {!isRunning && completedCount === totalAgents && completedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-10 mb-10"
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full"
                style={{
                  background: avatar.color + '20',
                  color: avatar.senderColor,
                  boxShadow: `0 0 40px ${avatar.glow}`,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="font-bold">Swarm analysis complete</span>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                  fontSize: '0.68rem',
                  color: 'rgba(255,255,255,.3)',
                }}
              >
                {totalAgents} agents &middot; {totalFiles} files generated &middot; ~{totalHours}h estimated &middot; Powered by Claude AI
              </p>
            </div>
          </motion.div>
        )}
      </main>
    </>
  )
}
