'use client'

import { motion } from 'framer-motion'
import { AgentCard } from './AgentCard'
import { AgentDetail } from './AgentDetail'
import { AGENT_DEFINITIONS, AGENT_CATEGORIES } from '@/lib/agent-definitions'
import { AVATAR_PERSONALITIES } from '@/lib/avatar-config'
import type { AgentId, AgentResult } from '@/lib/types'

const CATEGORY_LABELS: Record<string, string> = {
  build: 'BUILD',
  ops: 'OPS',
  strategy: 'STRATEGY',
}

interface SwarmGridProps {
  results: Record<string, AgentResult>
  expandedAgentId: AgentId | null
  onToggleExpand: (agentId: AgentId) => void
  onRerunAgent: (agentId: AgentId) => void
  rerunningAgentId: AgentId | null
  isProTier: boolean
  accentColor: string
  onGenerateImage?: (agentId: AgentId, description: string) => void
}

export function SwarmGrid({
  results,
  expandedAgentId,
  onToggleExpand,
  onRerunAgent,
  rerunningAgentId,
  isProTier,
  accentColor,
  onGenerateImage,
}: SwarmGridProps) {
  let globalDelay = 0

  return (
    <div className="flex flex-col gap-8">
      {AGENT_CATEGORIES.map((category) => {
        const agents = AGENT_DEFINITIONS.filter((a) => a.category === category)

        return (
          <div key={category}>
            {/* Category header */}
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: globalDelay * 0.05 }}
              className="mb-4"
            >
              <span
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                  fontSize: '0.65rem',
                  color: accentColor,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                {CATEGORY_LABELS[category]}
              </span>
            </motion.div>

            {/* Agent cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {agents.map((agent) => {
                const result = results[agent.id]
                const isLocked = !isProTier && !agent.freeTier
                const delay = (globalDelay++) * 0.06
                // Use the agent's avatar personality color
                const agentAvatar = AVATAR_PERSONALITIES[agent.avatarKey]
                const agentColor = agentAvatar?.color ?? accentColor

                return (
                  <div key={agent.id} className="contents">
                    <AgentCard
                      agentId={agent.id}
                      name={agent.name}
                      icon={agent.icon}
                      status={result?.status ?? 'idle'}
                      freeTier={agent.freeTier}
                      isLocked={isLocked}
                      snippetCount={result?.codeSnippets?.length ?? 0}
                      estimatedHours={result?.estimatedHours}
                      isExpanded={expandedAgentId === agent.id}
                      onClick={() => !isLocked && onToggleExpand(agent.id)}
                      accentColor={agentColor}
                      avatarName={agentAvatar?.name}
                      avatarEmoji={agentAvatar?.emoji}
                      delay={delay}
                    />
                  </div>
                )
              })}

              {/* Expanded detail panel — spans full grid row */}
              {expandedAgentId &&
                agents.some((a) => a.id === expandedAgentId) &&
                results[expandedAgentId]?.status === 'complete' && (() => {
                  const expandedAgent = AGENT_DEFINITIONS.find((a) => a.id === expandedAgentId)!
                  const expandedAvatar = AVATAR_PERSONALITIES[expandedAgent.avatarKey]
                  const expandedColor = expandedAvatar?.color ?? accentColor

                  return (
                    <AgentDetail
                      result={results[expandedAgentId]}
                      accentColor={expandedColor}
                      avatarName={expandedAvatar?.name}
                      avatarEmoji={expandedAvatar?.emoji}
                      avatarTrait={expandedAvatar?.trait}
                      onRerun={() => onRerunAgent(expandedAgentId)}
                      isRerunning={rerunningAgentId === expandedAgentId}
                      onGenerateImage={onGenerateImage ? () => {
                        const desc = results[expandedAgentId]?.imageDescription
                        if (desc) onGenerateImage(expandedAgentId, desc)
                      } : undefined}
                    />
                  )
                })()}
            </div>
          </div>
        )
      })}
    </div>
  )
}
