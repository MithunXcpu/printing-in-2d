'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { useSessionStore } from '@/stores/session.store'
import { useWorkflowStore } from '@/stores/workflow.store'
import { useWorkOrderStore } from '@/stores/workorder.store'
import { AVATAR_PERSONALITIES } from '@/lib/avatar-config'
import type { WorkOrder } from '@/lib/types'

export default function WorkOrdersPage() {
  const router = useRouter()
  const avatarKey = useSessionStore((s) => s.avatarKey)
  const sessionId = useSessionStore((s) => s.sessionId)
  const nodes = useWorkflowStore((s) => s.nodes)
  const workOrders = useWorkOrderStore((s) => s.workOrders)
  const setWorkOrders = useWorkOrderStore((s) => s.setWorkOrders)
  const approveAll = useWorkOrderStore((s) => s.approveAll)
  const [isGenerating, setIsGenerating] = useState(false)
  const [allApproved, setAllApproved] = useState(false)

  const avatar = avatarKey ? AVATAR_PERSONALITIES[avatarKey] : null

  useEffect(() => {
    if (!avatar) {
      router.push('/build')
      return
    }

    if (workOrders.length === 0 && !isGenerating) {
      generateWorkOrders()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateWorkOrders = async () => {
    setIsGenerating(true)

    // For now, generate mock work orders based on the workflow nodes
    // Later this will call the Claude API
    const revealedNodes = nodes.filter((n) => n.isRevealed)
    const mockOrders: WorkOrder[] = []

    // Group nodes by type and create work orders
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
        description: `Implement the processing stages: ${processors.map((p) => p.label).join(' → ')}. Each stage transforms and enriches the data.`,
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

    // Simulate generation delay
    await new Promise((r) => setTimeout(r, 1500))
    setWorkOrders(mockOrders)
    setIsGenerating(false)
  }

  const handleApproveAll = () => {
    approveAll()
    setAllApproved(true)
  }

  if (!avatar) return null

  const complexityColors: Record<string, string> = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
  }

  return (
    <>
      <TopBar
        status="Work orders"
        showBack
        onBack={() => router.push(`/build/session/${sessionId}/review`)}
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
            03 — Work orders
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-fraunces), Fraunces, serif',
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              letterSpacing: '-0.02em',
              marginBottom: '8px',
            }}
          >
            Build plan <em className="italic font-light" style={{ color: avatar.senderColor }}>generated.</em>
          </h1>
          <p className="font-light" style={{ color: 'var(--ink-20)', fontSize: '0.95rem' }}>
            Review and approve these work orders. Each is a discrete unit of buildable software.
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
            {workOrders.map((wo) => (
              <div
                key={wo.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,.03)',
                  border: `1.5px solid ${wo.status === 'approved' ? avatar.color + '40' : 'rgba(255,255,255,.06)'}`,
                }}
              >
                <div className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{
                          background: wo.status === 'approved' ? avatar.color : 'rgba(255,255,255,.06)',
                          color: wo.status === 'approved' ? '#fff' : 'var(--ink-20)',
                        }}
                      >
                        {wo.status === 'approved' ? '✓' : wo.orderIndex + 1}
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
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
                    {wo.description}
                  </p>

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
                </div>
              </div>
            ))}

            <div className="flex justify-center mt-6">
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
                  Approve All Work Orders
                </button>
              ) : (
                <div className="text-center">
                  <div
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full mb-3"
                    style={{ background: avatar.color + '20', color: avatar.senderColor }}
                  >
                    <span className="font-bold">&#x2713;</span> All work orders approved
                  </div>
                  <p className="text-sm" style={{ color: 'var(--ink-20)' }}>
                    Code generation will be available in a future update.
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
