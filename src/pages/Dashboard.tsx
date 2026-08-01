import { useMemo } from 'react'
import { Flame, Trophy, ListChecks } from 'lucide-react'
import { Timer } from '@/components/timer/Timer'
import { SoundPlayer } from '@/components/sound/SoundPlayer'
import { Checklist } from '@/components/tasks/Checklist'
import { useSessionHistoryStore } from '@/store/sessionHistoryStore'
import { useCollectionStore, computeLevelProgress } from '@/store/collectionStore'
import { getLevel } from '@/data/levels'
import { getHistoricalFact, FALLBACK_FACT_MESSAGES } from '@/data/historicalFacts'

function StatPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Flame
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="glass flex items-center gap-3 rounded-xl px-4 py-3">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full text-white"
        style={{ background: color }}
      >
        <Icon size={16} />
      </div>
      <div>
        <p className="text-lg font-semibold leading-none text-zinc-800 dark:text-zinc-100">
          {value}
        </p>
        <p className="text-[11px] text-zinc-400">{label}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { currentStreak, totalSessions } = useSessionHistoryStore()
  const currentLevel = useCollectionStore((s) => s.currentLevel)
  const unlocked = useCollectionStore((s) => s.unlocked)
  const levelProgress = useMemo(
    () => computeLevelProgress(unlocked, currentLevel),
    [unlocked, currentLevel],
  )
  const level = getLevel(currentLevel)
  const fact = getHistoricalFact(new Date())

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="grid grid-cols-3 gap-3">
        <StatPill icon={Flame} label="Day streak" value={currentStreak} color="#fb923c" />
        <StatPill icon={ListChecks} label="Total sessions" value={totalSessions} color="#4ade80" />
        <StatPill
          icon={Trophy}
          label={`Level ${currentLevel}: ${level?.name}`}
          value={`${levelProgress.unlocked}/${levelProgress.total}`}
          color={level?.color ?? '#a78bfa'}
        />
      </div>

      <div className="flex flex-col items-center gap-6 rounded-3xl bg-white/40 py-8 shadow-sm backdrop-blur dark:bg-zinc-900/30">
        <Timer />
        <p className="max-w-sm text-center text-xs text-zinc-400">
          Space to play/pause · R to reset · S to toggle ambient sound · ↑/↓ to adjust ambient volume
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SoundPlayer />
        <Checklist />
      </div>

      <div className="glass rounded-2xl p-4 text-sm">
        <p className="mb-1 font-heading font-semibold text-zinc-700 dark:text-zinc-200">
          This Day in History
        </p>
        <p className="text-zinc-500 dark:text-zinc-400">
          {fact ? fact.fact : FALLBACK_FACT_MESSAGES[1]}
        </p>
      </div>
    </div>
  )
}
