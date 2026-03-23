import { create } from 'zustand'
import type { WorkflowNode, WorkflowConnection, WorkflowNodeType } from '@/lib/types'
import { calculateNodePosition, calculateSmartLayout } from '@/lib/workflow-layout'

interface Commentary {
  text: string
  visible: boolean
}

interface WorkflowState {
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  commentary: Commentary | null
  selectedNodeId: string | null

  addNode: (node: Omit<WorkflowNode, 'x' | 'y' | 'isRevealed'>) => void
  revealNode: (nodeId: string) => void
  addConnection: (conn: { from: string; to: string; label?: string }) => void
  revealConnection: (connId: string) => void
  updateNode: (nodeId: string, updates: Partial<Pick<WorkflowNode, 'label' | 'icon' | 'description'>>) => void
  deleteNode: (nodeId: string) => void
  selectNode: (nodeId: string | null) => void
  relayoutAll: () => void
  setCommentary: (text: string) => void
  clearCommentary: () => void
  updateNodeImage: (nodeId: string, imageUrl: string) => void
  updateNodePosition: (nodeId: string, x: number, y: number) => void
  reset: () => void
}

let connCounter = 0

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  connections: [],
  commentary: null,
  selectedNodeId: null,

  addNode: (node) =>
    set((state) => {
      if (state.nodes.some(n => n.id === node.id)) {
        return state  // Skip duplicate
      }
      const existingOfType = state.nodes.filter((n) => n.type === node.type)
      const position = calculateNodePosition(node.type as WorkflowNodeType, existingOfType.length)
      return {
        nodes: [
          ...state.nodes,
          {
            ...node,
            x: position.x,
            y: position.y,
            isRevealed: false,
          },
        ],
      }
    }),

  revealNode: (nodeId) =>
    set((state) => {
      const updatedNodes = state.nodes.map((n) =>
        n.id === nodeId ? { ...n, isRevealed: true } : n
      )
      // Auto-reveal connections where both endpoints are now revealed
      const updatedConnections = state.connections.map((c) => {
        if (c.isRevealed) return c
        const fromRevealed = updatedNodes.find((n) => n.id === c.from)?.isRevealed
        const toRevealed = updatedNodes.find((n) => n.id === c.to)?.isRevealed
        if (fromRevealed && toRevealed) {
          return { ...c, isRevealed: true }
        }
        return c
      })
      return { nodes: updatedNodes, connections: updatedConnections }
    }),

  addConnection: (conn) => {
    const id = `conn-${++connCounter}`
    set((state) => ({
      connections: [
        ...state.connections,
        { id, from: conn.from, to: conn.to, label: conn.label, isRevealed: false },
      ],
    }))

    // Relayout after adding a connection
    setTimeout(() => {
      get().relayoutAll()
    }, 100)

    // Auto-reveal connection after delay
    setTimeout(() => {
      const state = get()
      const fromNode = state.nodes.find((n) => n.id === conn.from)
      const toNode = state.nodes.find((n) => n.id === conn.to)
      if (fromNode?.isRevealed && toNode?.isRevealed) {
        set((s) => ({
          connections: s.connections.map((c) =>
            c.id === id ? { ...c, isRevealed: true } : c
          ),
        }))
      }
    }, 600)
  },

  revealConnection: (connId) =>
    set((state) => ({
      connections: state.connections.map((c) =>
        c.id === connId ? { ...c, isRevealed: true } : c
      ),
    })),

  updateNode: (nodeId, updates) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, ...updates } : n
      ),
    })),

  deleteNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      connections: state.connections.filter((c) => c.from !== nodeId && c.to !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    })),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  relayoutAll: () => {
    const state = get()
    const revealedNodes = state.nodes.filter(n => n.isRevealed)
    const revealedConnections = state.connections.filter(c => c.isRevealed)

    if (revealedNodes.length < 2 || revealedConnections.length === 0) return

    const newPositions = calculateSmartLayout(revealedNodes, revealedConnections)
    set({
      nodes: state.nodes.map((n) => {
        const pos = newPositions.get(n.id)
        if (pos) return { ...n, x: pos.x, y: pos.y }
        return n
      }),
    })
  },

  setCommentary: (text) => set({ commentary: { text, visible: true } }),
  clearCommentary: () => set({ commentary: null }),

  updateNodeImage: (nodeId, imageUrl) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === nodeId ? { ...n, imageUrl } : n)),
    })),

  updateNodePosition: (nodeId, x, y) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)),
    })),

  reset: () => {
    connCounter = 0
    set({ nodes: [], connections: [], commentary: null, selectedNodeId: null })
  },
}))
