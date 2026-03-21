'use client'

import { useState, useRef, useCallback } from 'react'
import { DiagramNode } from './DiagramNode'
import { DiagramConnection } from './DiagramConnection'
import { useWorkflowStore } from '@/stores/workflow.store'
import { useConversationStore } from '@/stores/conversation.store'
import type { AvatarPersonality } from '@/lib/types'

interface WorkflowDiagramProps {
  avatar: AvatarPersonality
}

const STAGE_PROGRESS: Record<string, number> = {
  current_state_1: 5,
  current_state_2: 10,
  current_state_3: 15,
  current_state_4: 20,
  current_state_5: 25,
  generate_current: 30,
  validate_current: 35,
  future_state_1: 40,
  future_state_2: 45,
  future_state_3: 50,
  future_state_4: 55,
  future_state_5: 60,
  generate_future: 65,
  validate_future: 70,
  compare: 80,
  refine: 90,
  orchestrate: 100,
}

export function WorkflowDiagram({ avatar }: WorkflowDiagramProps) {
  const nodes = useWorkflowStore((s) => s.nodes)
  const connections = useWorkflowStore((s) => s.connections)
  const commentary = useWorkflowStore((s) => s.commentary)
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)
  const selectNode = useWorkflowStore((s) => s.selectNode)
  const deleteNode = useWorkflowStore((s) => s.deleteNode)
  const interviewStage = useConversationStore((s) => s.interviewStage)

  // Zoom & pan state
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })
  const panOrigin = useRef({ x: 0, y: 0 })

  const progress = STAGE_PROGRESS[interviewStage] || 0

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom((z) => Math.min(2, Math.max(0.3, z - e.deltaY * 0.001)))
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only pan on background click (not on nodes)
    if ((e.target as HTMLElement).closest('[data-node]')) return
    isPanning.current = true
    panStart.current = { x: e.clientX, y: e.clientY }
    panOrigin.current = { ...pan }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [pan])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning.current) return
    setPan({
      x: panOrigin.current.x + (e.clientX - panStart.current.x),
      y: panOrigin.current.y + (e.clientY - panStart.current.y),
    })
  }, [])

  const handlePointerUp = useCallback(() => {
    isPanning.current = false
  }, [])

  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node]')) return
    selectNode(null)
  }, [selectNode])

  const resetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

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
          {interviewStage.replace(/_/g, ' ')}
        </div>
      </div>

      {/* Canvas */}
      <div
        className="flex-1 relative overflow-hidden min-h-0"
        style={{ cursor: isPanning.current ? 'grabbing' : 'grab' }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleBackgroundClick}
      >
        {/* Dot grid background (stays fixed) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.07) 1px, transparent 0)',
            backgroundSize: '48px 48px',
          }}
        />

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

        {/* Zoomable/pannable container */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isPanning.current ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          {/* SVG connections */}
          <svg className="absolute inset-0 w-full h-full z-[1]">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill={avatar.color} opacity="0.6" />
              </marker>
            </defs>
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
            <DiagramNode
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onSelect={selectNode}
              onDelete={deleteNode}
            />
          ))}
        </div>

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 z-20 flex gap-1">
          {[
            { label: '+', action: () => setZoom((z) => Math.min(2, z + 0.15)) },
            { label: '-', action: () => setZoom((z) => Math.max(0.3, z - 0.15)) },
            { label: '⟳', action: resetView },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              className="w-7 h-7 flex items-center justify-center rounded-md"
              style={{
                background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.08)',
                color: 'rgba(255,255,255,.5)',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
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
