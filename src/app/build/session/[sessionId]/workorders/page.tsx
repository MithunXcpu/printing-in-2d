'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { useSessionStore } from '@/stores/session.store'
import { useWorkflowStore } from '@/stores/workflow.store'
import { useWorkOrderStore } from '@/stores/workorder.store'
import { AVATAR_PERSONALITIES } from '@/lib/avatar-config'
import type { WorkOrder } from '@/lib/types'

// ── Syntax highlighter (lightweight, no deps) ──────────────────────────────

const TS_KEYWORDS = new Set([
  'import', 'from', 'export', 'default', 'const', 'let', 'var', 'function',
  'class', 'interface', 'type', 'enum', 'extends', 'implements', 'return',
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
  'try', 'catch', 'throw', 'finally', 'new', 'this', 'super', 'async',
  'await', 'yield', 'typeof', 'instanceof', 'in', 'of', 'as', 'is',
  'readonly', 'private', 'protected', 'public', 'static', 'abstract',
  'constructor', 'get', 'set', 'true', 'false', 'null', 'undefined', 'void',
])

function highlightCode(code: string, accentColor: string): React.ReactNode[] {
  const lines = code.split('\n')
  return lines.map((line, lineIdx) => {
    const tokens: React.ReactNode[] = []
    let remaining = line

    // Track position for unique keys
    let pos = 0
    while (remaining.length > 0) {
      // Comment (// ...)
      const commentMatch = remaining.match(/^(\/\/.*)/)
      if (commentMatch) {
        tokens.push(
          <span key={`${lineIdx}-${pos}`} style={{ color: 'rgba(255,255,255,.28)' }}>
            {commentMatch[1]}
          </span>
        )
        remaining = remaining.slice(commentMatch[1].length)
        pos += commentMatch[1].length
        continue
      }

      // String (single or double quoted or template literal)
      const strMatch = remaining.match(/^(`[^`]*`|'[^']*'|"[^"]*")/)
      if (strMatch) {
        tokens.push(
          <span key={`${lineIdx}-${pos}`} style={{ color: '#a8d8a8' }}>
            {strMatch[1]}
          </span>
        )
        remaining = remaining.slice(strMatch[1].length)
        pos += strMatch[1].length
        continue
      }

      // JSDoc tag
      const jsdocMatch = remaining.match(/^(@\w+)/)
      if (jsdocMatch) {
        tokens.push(
          <span key={`${lineIdx}-${pos}`} style={{ color: accentColor, opacity: 0.85 }}>
            {jsdocMatch[1]}
          </span>
        )
        remaining = remaining.slice(jsdocMatch[1].length)
        pos += jsdocMatch[1].length
        continue
      }

      // Number
      const numMatch = remaining.match(/^(\b\d[\d_]*\.?\d*\b)/)
      if (numMatch) {
        tokens.push(
          <span key={`${lineIdx}-${pos}`} style={{ color: '#d4a8ff' }}>
            {numMatch[1]}
          </span>
        )
        remaining = remaining.slice(numMatch[1].length)
        pos += numMatch[1].length
        continue
      }

      // Keyword or identifier
      const wordMatch = remaining.match(/^(\w+)/)
      if (wordMatch) {
        const word = wordMatch[1]
        if (TS_KEYWORDS.has(word)) {
          tokens.push(
            <span key={`${lineIdx}-${pos}`} style={{ color: accentColor, fontWeight: 600 }}>
              {word}
            </span>
          )
        } else if (word.charAt(0) === word.charAt(0).toUpperCase() && word.charAt(0) !== word.charAt(0).toLowerCase()) {
          // Type/class name (PascalCase)
          tokens.push(
            <span key={`${lineIdx}-${pos}`} style={{ color: '#f0c674' }}>
              {word}
            </span>
          )
        } else {
          tokens.push(<span key={`${lineIdx}-${pos}`}>{word}</span>)
        }
        remaining = remaining.slice(word.length)
        pos += word.length
        continue
      }

      // Operator / punctuation / whitespace
      tokens.push(<span key={`${lineIdx}-${pos}`}>{remaining.charAt(0)}</span>)
      remaining = remaining.slice(1)
      pos++
    }

    return (
      <div key={lineIdx} className="flex">
        <span
          className="select-none shrink-0 text-right pr-4"
          style={{
            color: 'rgba(255,255,255,.15)',
            width: '3.5rem',
            fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
            fontSize: '0.72rem',
          }}
        >
          {lineIdx + 1}
        </span>
        <span className="flex-1">{tokens}</span>
      </div>
    )
  })
}

// ── CodeBlock component ─────────────────────────────────────────────────────

function CodeBlock({
  code,
  isStreaming,
  accentColor,
}: {
  code: string
  isStreaming: boolean
  accentColor: string
}) {
  const [copied, setCopied] = useState(false)
  const codeEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isStreaming && codeEndRef.current) {
      codeEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [code, isStreaming])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden mt-3"
      style={{
        background: 'rgba(0,0,0,.35)',
        border: '1px solid rgba(255,255,255,.06)',
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          background: 'rgba(255,255,255,.03)',
          borderBottom: '1px solid rgba(255,255,255,.06)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,.1)' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,.1)' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,.1)' }} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,.3)',
              marginLeft: '0.5rem',
            }}
          >
            TypeScript
          </span>
          {isStreaming && (
            <span
              className="ml-2 flex items-center gap-1.5"
              style={{
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                fontSize: '0.6rem',
                color: accentColor,
              }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: accentColor }}
              />
              streaming
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md transition-all hover:brightness-110"
          style={{
            background: copied ? accentColor + '30' : 'rgba(255,255,255,.06)',
            color: copied ? accentColor : 'rgba(255,255,255,.5)',
            fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
            fontSize: '0.65rem',
            border: `1px solid ${copied ? accentColor + '40' : 'rgba(255,255,255,.08)'}`,
          }}
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div
        className="overflow-x-auto overflow-y-auto p-4"
        style={{
          maxHeight: '500px',
          fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
          fontSize: '0.75rem',
          lineHeight: '1.65',
          color: 'rgba(255,255,255,.85)',
        }}
      >
        {highlightCode(code, accentColor)}
        {isStreaming && (
          <span
            className="inline-block w-2 h-4 animate-pulse ml-0.5"
            style={{ background: accentColor, borderRadius: '1px' }}
          />
        )}
        <div ref={codeEndRef} />
      </div>
    </div>
  )
}

// ── Work Order Card ─────────────────────────────────────────────────────────

function WorkOrderCard({
  wo,
  avatar,
  complexityColors,
  generatedCode,
  isCodeStreaming,
  isExpanded,
  onToggleExpand,
  onGenerateCode,
  isCodeGenerating,
  codeGenerationComplete,
}: {
  wo: WorkOrder
  avatar: { color: string; senderColor: string; glow: string }
  complexityColors: Record<string, string>
  generatedCode: string | null
  isCodeStreaming: boolean
  isExpanded: boolean
  onToggleExpand: () => void
  onGenerateCode: () => void
  isCodeGenerating: boolean
  codeGenerationComplete: boolean
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,.03)',
        border: `1.5px solid ${
          codeGenerationComplete
            ? avatar.color + '60'
            : wo.status === 'approved'
              ? avatar.color + '40'
              : 'rgba(255,255,255,.06)'
        }`,
      }}
    >
      <div className="px-6 py-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-300"
              style={{
                background: codeGenerationComplete
                  ? avatar.color
                  : wo.status === 'approved'
                    ? avatar.color
                    : 'rgba(255,255,255,.06)',
                color: codeGenerationComplete || wo.status === 'approved' ? '#fff' : 'var(--ink-20)',
                boxShadow: codeGenerationComplete ? `0 0 12px ${avatar.glow}` : 'none',
              }}
            >
              {codeGenerationComplete ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : wo.status === 'approved' ? (
                '\u2713'
              ) : (
                wo.orderIndex + 1
              )}
            </div>
            <div>
              <h3 className="font-semibold text-base">{wo.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: complexityColors[wo.complexity] + '20',
                    color: complexityColors[wo.complexity],
                  }}
                >
                  {wo.complexity}
                </span>
                {wo.dependencies.length > 0 && (
                  <span
                    className="text-xs"
                    style={{
                      color: 'var(--ink-20)',
                      fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                    }}
                  >
                    depends on WO-{wo.dependencies.map((d) => d.replace('wo-', '')).join(', ')}
                  </span>
                )}
                {codeGenerationComplete && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: avatar.color + '20',
                      color: avatar.senderColor,
                    }}
                  >
                    code generated
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Expand/collapse for code */}
          {generatedCode && (
            <button
              onClick={onToggleExpand}
              className="mt-1 p-2 rounded-lg transition-all hover:brightness-125"
              style={{
                background: 'rgba(255,255,255,.04)',
                color: 'rgba(255,255,255,.5)',
              }}
              aria-label={isExpanded ? 'Collapse code' : 'Expand code'}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="transition-transform duration-200"
                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}
        </div>

        {/* Description */}
        <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
          {wo.description}
        </p>

        {/* Suggested files */}
        <div className="flex flex-wrap gap-1.5">
          {wo.suggestedFiles.map((f) => (
            <span
              key={f}
              className="px-2 py-1 rounded text-xs"
              style={{
                background: 'rgba(255,255,255,.04)',
                color: 'var(--ink-20)',
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                fontSize: '0.66rem',
              }}
            >
              {f}
            </span>
          ))}
        </div>

        {/* Generate button for individual WO (shown after all approved, before generation) */}
        {wo.status === 'approved' && !generatedCode && !isCodeGenerating && (
          <button
            onClick={onGenerateCode}
            className="mt-4 px-4 py-2 rounded-lg text-xs font-medium transition-all hover:brightness-110 flex items-center gap-2"
            style={{
              background: avatar.color + '18',
              color: avatar.senderColor,
              border: `1px solid ${avatar.color}30`,
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            Generate code
          </button>
        )}

        {/* Streaming / generating state */}
        {isCodeGenerating && !generatedCode && (
          <div className="mt-4 flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-full animate-pulse"
              style={{ background: avatar.glow }}
            />
            <span
              style={{
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                fontSize: '0.72rem',
                color: avatar.senderColor,
              }}
            >
              Generating implementation...
            </span>
          </div>
        )}

        {/* Code block */}
        {generatedCode && isExpanded && (
          <CodeBlock
            code={generatedCode}
            isStreaming={isCodeStreaming}
            accentColor={avatar.color}
          />
        )}
      </div>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function WorkOrdersPage() {
  const router = useRouter()
  const avatarKey = useSessionStore((s) => s.avatarKey)
  const sessionId = useSessionStore((s) => s.sessionId)
  const setPhase = useSessionStore((s) => s.setPhase)
  const nodes = useWorkflowStore((s) => s.nodes)
  const connections = useWorkflowStore((s) => s.connections)
  const workOrders = useWorkOrderStore((s) => s.workOrders)
  const setWorkOrders = useWorkOrderStore((s) => s.setWorkOrders)
  const approveAll = useWorkOrderStore((s) => s.approveAll)
  const [isGenerating, setIsGenerating] = useState(false)
  const [allApproved, setAllApproved] = useState(false)

  // Code generation state
  const [generatedCodes, setGeneratedCodes] = useState<Record<string, string>>({})
  const [streamingIds, setStreamingIds] = useState<Set<string>>(new Set())
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set())
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  const [allCodeGenerated, setAllCodeGenerated] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)

  const avatar = avatarKey ? AVATAR_PERSONALITIES[avatarKey] : null

  useEffect(() => {
    setPhase('build')
    if (!avatar) {
      router.push('/build')
      return
    }

    if (workOrders.length === 0 && !isGenerating) {
      generateWorkOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Check if all code is generated
  useEffect(() => {
    if (workOrders.length > 0 && completedIds.size === workOrders.length) {
      setAllCodeGenerated(true)
    }
  }, [completedIds, workOrders.length])

  const generateWorkOrders = async () => {
    setIsGenerating(true)

    const revealedNodes = nodes.filter((n) => n.isRevealed)
    const mockOrders: WorkOrder[] = []

    const sources = revealedNodes.filter((n) => n.type === 'source')
    const processors = revealedNodes.filter((n) => n.type === 'processor' || n.type === 'ai')
    const outputs = revealedNodes.filter((n) => n.type === 'output' || n.type === 'decision')

    if (sources.length > 0) {
      mockOrders.push({
        id: 'wo-1',
        orderIndex: 0,
        title: 'Set up data source connectors',
        description: `Create connectors for ${sources.map((s) => s.label).join(', ')}. Each connector should handle authentication, rate limiting, and data normalization.`,
        implementationPlan: `1. Create a base DataSourceConnector interface\n2. Implement ${sources.map((s) => s.label + 'Connector').join(', ')}\n3. Add connection pooling and retry logic\n4. Write unit tests for each connector`,
        suggestedFiles: sources.map((s) => `src/connectors/${s.id}.ts`),
        dependencies: [],
        complexity: 'medium',
        status: 'pending',
      })
    }

    if (processors.length > 0) {
      mockOrders.push({
        id: 'wo-2',
        orderIndex: 1,
        title: 'Build data processing pipeline',
        description: `Implement the processing stages: ${processors.map((p) => p.label).join(' \u2192 ')}. Each stage transforms and enriches the data.`,
        implementationPlan: `1. Define Pipeline interface with stage composition\n2. Implement each processing stage\n3. Add error handling and logging per stage\n4. Create integration tests for the full pipeline`,
        suggestedFiles: processors.map((p) => `src/pipeline/${p.id}.ts`),
        dependencies: ['wo-1'],
        complexity: 'high',
        status: 'pending',
      })
    }

    if (outputs.length > 0) {
      mockOrders.push({
        id: 'wo-3',
        orderIndex: 2,
        title: 'Create output destinations',
        description: `Set up output handlers for ${outputs.map((o) => o.label).join(', ')}. Each output receives processed data and delivers it to the right channel.`,
        implementationPlan: `1. Create OutputHandler base class\n2. Implement ${outputs.map((o) => o.label + 'Handler').join(', ')}\n3. Add delivery confirmation and error recovery\n4. Write end-to-end tests`,
        suggestedFiles: outputs.map((o) => `src/outputs/${o.id}.ts`),
        dependencies: ['wo-2'],
        complexity: 'medium',
        status: 'pending',
      })
    }

    mockOrders.push({
      id: 'wo-4',
      orderIndex: 3,
      title: 'Orchestration & scheduling',
      description: 'Wire everything together with a scheduler that runs the full pipeline on a defined cadence.',
      implementationPlan: '1. Create Orchestrator class\n2. Implement cron-based scheduling\n3. Add health checks and monitoring\n4. Write integration tests for the full flow',
      suggestedFiles: ['src/orchestrator.ts', 'src/scheduler.ts', 'src/health.ts'],
      dependencies: ['wo-3'],
      complexity: 'medium',
      status: 'pending',
    })

    await new Promise((r) => setTimeout(r, 1500))
    setWorkOrders(mockOrders)
    setIsGenerating(false)
  }

  const handleApproveAll = () => {
    approveAll()
    setAllApproved(true)
  }

  const generateCodeForWorkOrder = useCallback(
    async (workOrderId: string) => {
      setGeneratingIds((prev) => new Set(prev).add(workOrderId))
      setStreamingIds((prev) => new Set(prev).add(workOrderId))
      setExpandedIds((prev) => new Set(prev).add(workOrderId))

      try {
        const controller = new AbortController()
        abortControllerRef.current = controller

        const response = await fetch('/api/generate-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nodes,
            connections,
            workOrders,
            workOrderId,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          accumulated += chunk
          setGeneratedCodes((prev) => ({ ...prev, [workOrderId]: accumulated }))
        }

        // Mark complete
        setStreamingIds((prev) => {
          const next = new Set(prev)
          next.delete(workOrderId)
          return next
        })
        setCompletedIds((prev) => new Set(prev).add(workOrderId))
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Code generation failed:', error)
          setGeneratedCodes((prev) => ({
            ...prev,
            [workOrderId]: `// Error generating code: ${(error as Error).message}`,
          }))
        }
        setStreamingIds((prev) => {
          const next = new Set(prev)
          next.delete(workOrderId)
          return next
        })
      } finally {
        setGeneratingIds((prev) => {
          const next = new Set(prev)
          next.delete(workOrderId)
          return next
        })
      }
    },
    [nodes, connections, workOrders]
  )

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true)
    // Generate sequentially so they stream one at a time
    for (const wo of workOrders) {
      if (!completedIds.has(wo.id)) {
        await generateCodeForWorkOrder(wo.id)
      }
    }
    setIsGeneratingAll(false)
  }

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (!avatar) return null

  const complexityColors: Record<string, string> = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
  }

  const totalGenerated = completedIds.size
  const totalOrders = workOrders.length

  return (
    <>
      <TopBar
        status="Build Plan"
        showBack
        onBack={() => router.push(`/build/session/${sessionId}/review`)}
        showPhases
        avatarColor={avatar.color}
      />
      <main className="pt-14 min-h-screen px-8 py-10 max-w-4xl mx-auto">
        <div className="text-center mb-10">
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
            04 — Build plan
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-fraunces), Fraunces, serif',
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              letterSpacing: '-0.02em',
              marginBottom: '8px',
            }}
          >
            {allCodeGenerated ? (
              <>
                Code <em className="italic font-light" style={{ color: avatar.senderColor }}>generated.</em>
              </>
            ) : allApproved ? (
              <>
                Ready to <em className="italic font-light" style={{ color: avatar.senderColor }}>build.</em>
              </>
            ) : (
              <>
                Build plan <em className="italic font-light" style={{ color: avatar.senderColor }}>generated.</em>
              </>
            )}
          </h1>
          <p className="font-light" style={{ color: 'var(--ink-20)', fontSize: '0.95rem' }}>
            {allCodeGenerated
              ? 'All work orders have been implemented. Review the generated code below.'
              : allApproved
                ? 'Generate production-ready TypeScript code for each work order.'
                : 'Review and approve your build plan. Each step is a discrete, buildable piece of your micro tool.'}
          </p>
        </div>

        {isGenerating && (
          <div className="flex flex-col items-center gap-4 py-20">
            <div
              className="w-12 h-12 rounded-full animate-pulse"
              style={{ background: avatar.glow }}
            />
            <p style={{ color: 'var(--ink-20)', fontSize: '0.85rem' }}>Generating work orders...</p>
          </div>
        )}

        {!isGenerating && workOrders.length > 0 && (
          <div className="flex flex-col gap-4">
            {/* Progress bar (visible during code generation) */}
            {allApproved && totalGenerated > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span
                    style={{
                      fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                      fontSize: '0.68rem',
                      color: 'rgba(255,255,255,.4)',
                    }}
                  >
                    Code generation progress
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                      fontSize: '0.68rem',
                      color: avatar.senderColor,
                    }}
                  >
                    {totalGenerated}/{totalOrders} complete
                  </span>
                </div>
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,.06)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${(totalGenerated / totalOrders) * 100}%`,
                      background: avatar.color,
                      boxShadow: `0 0 12px ${avatar.glow}`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Work order cards */}
            {workOrders.map((wo) => (
              <WorkOrderCard
                key={wo.id}
                wo={wo}
                avatar={avatar}
                complexityColors={complexityColors}
                generatedCode={generatedCodes[wo.id] ?? null}
                isCodeStreaming={streamingIds.has(wo.id)}
                isExpanded={expandedIds.has(wo.id)}
                onToggleExpand={() => toggleExpand(wo.id)}
                onGenerateCode={() => generateCodeForWorkOrder(wo.id)}
                isCodeGenerating={generatingIds.has(wo.id)}
                codeGenerationComplete={completedIds.has(wo.id)}
              />
            ))}

            {/* Bottom action area */}
            <div className="flex justify-center mt-6 mb-10">
              {!allApproved ? (
                <button
                  onClick={handleApproveAll}
                  className="px-10 py-4 rounded-full font-semibold text-white transition-all hover:translate-y-[-2px] hover:brightness-110"
                  style={{
                    background: avatar.color,
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-outfit), Outfit, sans-serif',
                    boxShadow: `0 8px 32px ${avatar.glow}`,
                  }}
                >
                  Approve Build Plan
                </button>
              ) : !allCodeGenerated ? (
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full"
                    style={{ background: avatar.color + '20', color: avatar.senderColor }}
                  >
                    <span className="font-bold">&#x2713;</span> Build plan approved
                  </div>

                  {!isGeneratingAll ? (
                    <button
                      onClick={handleGenerateAll}
                      className="group px-10 py-4 rounded-full font-semibold text-white transition-all hover:translate-y-[-2px] hover:brightness-110 flex items-center gap-3"
                      style={{
                        background: avatar.color,
                        fontSize: '0.95rem',
                        fontFamily: 'var(--font-outfit), Outfit, sans-serif',
                        boxShadow: `0 8px 32px ${avatar.glow}`,
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="transition-transform group-hover:rotate-12"
                      >
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </svg>
                      Generate All Code
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full animate-pulse"
                        style={{ background: avatar.glow }}
                      />
                      <span
                        style={{
                          fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                          fontSize: '0.78rem',
                          color: avatar.senderColor,
                        }}
                      >
                        Generating code for all work orders...
                      </span>
                    </div>
                  )}

                  <p
                    className="text-center max-w-md"
                    style={{
                      fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                      fontSize: '0.65rem',
                      color: 'rgba(255,255,255,.25)',
                      lineHeight: '1.6',
                    }}
                  >
                    Claude will generate production-ready TypeScript for each work order.
                    You can also generate code individually per work order.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
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
                    <span className="font-bold">All code generated</span>
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                      fontSize: '0.68rem',
                      color: 'rgba(255,255,255,.3)',
                    }}
                  >
                    {totalOrders} work orders &middot; {Object.values(generatedCodes).reduce((sum, c) => sum + c.split('\n').length, 0)} lines generated
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
