'use client'

import { DiagramNode } from './DiagramNode'
import { DiagramConnection } from './DiagramConnection'
import { useWorkflowStore } from '@/stores/workflow.store'
import { useConversationStore } from '@/stores/conversation.store'
import type { AvatarPersonality } from '@/lib/types'

interface WorkflowDiagramProps {
  avatar: AvatarPersonality
}

const STAGE_PROGRESS: Record<string, number> = {
  outcome: 10,
  data_sources: 35,
  processing: 60,
  outputs: 85,
  review: 100,
  complete: 100,
}

export function WorkflowDiagram({ avatar }: WorkflowDiagramProps) {
  const nodes = useWorkflowStore((s) => s.nodes)
  const connections = useWorkflowStore((s) => s.connections)
  const commentary = useWorkflowStore((s) => s.commentary)
  const interviewStage = useConversationStore((s) => s.interviewStage)

  const progress = STAGE_PROGRESS[interviewStage] || 0

  return (
    <div className="relative flex flex-col overflow-hidden h-full" style={{ background: 'var(--ink)' }}>
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-30">
        <div
          className="h-full rounded-r-sm transition-[width] duration-600"
          style={{ width: `${progress}%`, background: avatar.color }}
        />
      </div>

      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-fraunces), Fraunces, serif',
            fontSize: '0.95rem',
            fontWeight: 400,
            color: 'rgba(255,255,255,.5)',
          }}
        >
          <strong className="text-white font-semibold">Workflow</strong> — building live
        </h3>
        <div
          className="px-2.5 py-1 rounded-md"
          style={{
            fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
            fontSize: '0.66rem',
            color: 'var(--ink-20)',
            background: 'rgba(255,255,255,.03)',
          }}
        >
          untitled.p2d
        </div>
      </div>

      {/* Canvas */}
      <div
        className="flex-1 relative overflow-hidden min-h-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.07) 1px, transparent 0)',
          backgroundSize: '48px 48px',
        }}
      >
        {/* Background glow */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            filter: 'blur(100px)',
            opacity: 0.12,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: avatar.color,
            transition: 'background 0.8s',
          }}
        />

        {/* SVG connections */}
        <svg className="absolute inset-0 w-full h-full z-[1]">
          {connections.map((conn) => (
            <DiagramConnection
              key={conn.id}
              connection={conn}
              nodes={nodes}
              avatarColor={avatar.color}
            />
          ))}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <DiagramNode key={node.id} node={node} />
        ))}

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center" style={{ color: 'var(--ink-40)' }}>
              <div className="text-4xl mb-3 opacity-30">
                {avatar.emoji}
              </div>
              <p style={{ fontSize: '0.85rem', fontWeight: 300 }}>
                Start talking — your workflow will build here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Commentary overlay */}
      {commentary?.visible && (
        <div
          className="absolute bottom-5 left-5 right-5 z-20 flex items-center gap-3 px-[18px] py-3 rounded-[14px]"
          style={{
            background: 'rgba(0,0,0,.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,.06)',
            animation: 'msgIn 0.4s ease forwards',
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: avatar.gradient }}
          >
            {avatar.emoji}
          </div>
          <div
            style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,.7)', lineHeight: '1.4' }}
            dangerouslySetInnerHTML={{ __html: commentary.text }}
          />
        </div>
      )}
    </div>
  )
}
