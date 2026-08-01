import { Cloud, CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react'
import { useSyncStore } from '@/store/syncStore'
import { useAuthStore } from '@/store/authStore'

const STATUS_CONFIG = {
  synced: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Synced' },
  syncing: { icon: RefreshCw, color: 'text-amber-500 animate-spin', label: 'Syncing' },
  offline: { icon: CloudOff, color: 'text-zinc-400', label: 'Offline' },
  error: { icon: Cloud, color: 'text-red-500', label: 'Sync error' },
}

export function SyncIndicator() {
  const { status, triggerSync } = useSyncStore()
  const profile = useAuthStore((s) => s.profile)
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  if (!profile) return null

  return (
    <button
      onClick={() => void triggerSync()}
      className="flex items-center gap-1.5 rounded-full bg-white/60 px-2.5 py-1 text-xs text-zinc-500 shadow-sm transition hover:bg-white/90 dark:bg-zinc-800/60 dark:text-zinc-300"
      title="Click to manually sync"
    >
      <Icon size={13} className={config.color} />
      {config.label}
    </button>
  )
}
