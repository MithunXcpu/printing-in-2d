'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import {
  Layout, Server, Database, Shield, Brain, Plug, GitMerge,
  Rocket, FlaskConical, Lock, Activity, Palette, FileText,
  DollarSign, ClipboardList,
} from 'lucide-react'
import type { AgentStatus, AgentId } from '@/lib/types'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Layout, Server, Database, Shield, Brain, Plug, GitMerge,
  Rocket, FlaskConical, Lock, Activity, Palette, FileText,
  DollarSign, ClipboardList,
}

const STATUS_CONFIG: Record<AgentStatus, { color: string; label: string; pulse: boolean }> = {
  idle: { color: '#6b7280', label: 'Idle', pulse: false },
  queued: { color: '#eab308', label: 'Queued', pulse: true },
  analyzing: { color: '#22c55e', label: 'Analyzing', pulse: true },
  complete: { color: '#3d9e1c', label: 'Complete', pulse: false },
  error: { color: '#ef4444', label: 'Error', pulse: false },
}

interface AgentCardProps {
  agentId: AgentId
  name: string
  icon: string
  status: AgentStatus
  freeTier: boolean
  isLocked: boolean
  snippetCount: number
  estimatedHours?: number
  isExpanded: boolean
  onClick: () => void
  accentColor: string
  avatarName?: string
  avatarEmoji?: string
  delay: number
}

export const AgentCard = memo(function AgentCard({
  name,
  icon,
  status,
  freeTier,
  isLocked,
  snippetCount,
  estimatedHours,
  isExpanded,
  onClick,
  accentColor,
  avatarName,
  avatarEmoji,
  delay,
}: AgentCardProps) {
  const IconComponent = ICON_MAP[icon] ?? Brain
  const statusConfig = STATUS_CONFIG[status]

  if (isLocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: 'rgba(255,255,255,.02)',
          border: '1px solid rgba(255,255,255,.04)',
        }}
      >
        <div className="flex items-center gap-3 mb-2 opacity-40">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,.04)' }}
          >
            <IconComponent size={18} />
          </div>
          <span className="font-medium text-sm">{name}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          <Lock size={12} style={{ color: 'var(--ink-20)' }} />
          <span
            style={{
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              fontSize: '0.6rem',
              color: 'var(--ink-20)',
              letterSpacing: '0.04em',
            }}
          >
            Upgrade to Pro
          </span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onClick={onClick}
      className="rounded-2xl p-5 cursor-pointer transition-all hover:brightness-110 relative overflow-hidden"
      style={{
        background: isExpanded
          ? `linear-gradient(135deg, ${accentColor}12, ${accentColor}04)`
          : 'rgba(255,255,255,.03)',
        border: isExpanded
          ? `1.5px solid ${accentColor}50`
          : status === 'complete'
            ? `1px solid ${accentColor}30`
            : '1px solid rgba(255,255,255,.06)',
      }}
    >
      {/* Status indicator + avatar badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: status === 'complete'
                ? accentColor + '20'
                : status === 'analyzing'
                  ? accentColor + '15'
                  : 'rgba(255,255,255,.04)',
              color: status === 'complete' || status === 'analyzing'
                ? accentColor
                : 'rgba(255,255,255,.5)',
            }}
          >
            <IconComponent size={18} />
          </div>
          <div>
            <span className="font-medium text-sm block">{name}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {/* Avatar personality badge */}
              {avatarName && (
                <span
                  style={{
                    fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                    fontSize: '0.55rem',
                    color: accentColor,
                    letterSpacing: '0.04em',
                  }}
                >
                  {avatarEmoji} {avatarName}
                </span>
              )}
              {freeTier && (
                <>
                  <span style={{ color: 'rgba(255,255,255,.15)', fontSize: '0.5rem' }}>·</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                      fontSize: '0.55rem',
                      color: accentColor,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Free
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={statusConfig.pulse ? 'animate-pulse' : ''}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: statusConfig.color,
              display: 'inline-block',
            }}
          />
        </div>
      </div>

      {/* Complete state badges */}
      {status === 'complete' && (
        <div className="flex items-center gap-2 mt-2">
          {snippetCount > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{
                background: accentColor + '15',
                color: accentColor,
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                fontSize: '0.6rem',
              }}
            >
              {snippetCount} {snippetCount === 1 ? 'file' : 'files'}
            </span>
          )}
          {estimatedHours && (
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{
                background: 'rgba(255,255,255,.04)',
                color: 'var(--ink-20)',
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                fontSize: '0.6rem',
              }}
            >
              ~{estimatedHours}h
            </span>
          )}
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <p
          className="mt-2 text-xs"
          style={{ color: '#ef4444', fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace', fontSize: '0.6rem' }}
        >
          Failed — click to retry
        </p>
      )}

      {/* Analyzing spinner */}
      {status === 'analyzing' && (
        <div className="mt-2 flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ background: accentColor + '40' }}
          />
          <span
            style={{
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              fontSize: '0.6rem',
              color: accentColor,
            }}
          >
            Analyzing...
          </span>
        </div>
      )}
    </motion.div>
  )
})
