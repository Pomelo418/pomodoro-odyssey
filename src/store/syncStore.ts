import { create } from 'zustand'
import type { SyncStatus } from '@/types'
import { mockDelay } from '@/services/mockDelay'

interface SyncState {
  status: SyncStatus
  lastSyncedAt: string | null
  syncProgress: number
  triggerSync: () => Promise<void>
}

export const useSyncStore = create<SyncState>()((set) => ({
  status: navigator.onLine ? 'synced' : 'offline',
  lastSyncedAt: null,
  syncProgress: 0,

  triggerSync: async () => {
    if (!navigator.onLine) {
      set({ status: 'offline' })
      return
    }
    set({ status: 'syncing', syncProgress: 0 })
    for (const p of [30, 65, 100]) {
      await mockDelay(null, 200)
      set({ syncProgress: p })
    }
    set({ status: 'synced', lastSyncedAt: new Date().toISOString() })
  },
}))

window.addEventListener('online', () => useSyncStore.setState({ status: 'synced' }))
window.addEventListener('offline', () => useSyncStore.setState({ status: 'offline' }))
