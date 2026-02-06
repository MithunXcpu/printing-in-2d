import { create } from 'zustand'
import type { WorkOrder } from '@/lib/types'

interface WorkOrderState {
  workOrders: WorkOrder[]
  isGenerating: boolean

  setWorkOrders: (orders: WorkOrder[]) => void
  reorder: (fromIndex: number, toIndex: number) => void
  approveAll: () => void
  approveOne: (id: string) => void
  setGenerating: (generating: boolean) => void
  reset: () => void
}

export const useWorkOrderStore = create<WorkOrderState>((set) => ({
  workOrders: [],
  isGenerating: false,

  setWorkOrders: (workOrders) => set({ workOrders }),

  reorder: (fromIndex, toIndex) =>
    set((state) => {
      const orders = [...state.workOrders]
      const [moved] = orders.splice(fromIndex, 1)
      orders.splice(toIndex, 0, moved)
      return { workOrders: orders.map((o, i) => ({ ...o, orderIndex: i })) }
    }),

  approveAll: () =>
    set((state) => ({
      workOrders: state.workOrders.map((o) => ({ ...o, status: 'approved' as const })),
    })),

  approveOne: (id) =>
    set((state) => ({
      workOrders: state.workOrders.map((o) =>
        o.id === id ? { ...o, status: 'approved' as const } : o
      ),
    })),

  setGenerating: (isGenerating) => set({ isGenerating }),
  reset: () => set({ workOrders: [], isGenerating: false }),
}))
