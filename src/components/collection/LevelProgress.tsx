import { Lock } from 'lucide-react'
import { LEVELS } from '@/data/levels'
import { useCollectionStore, computeLevelProgress } from '@/store/collectionStore'

export function LevelProgress({
  onSelect,
  selectedLevel,
}: {
  onSelect: (level: number) => void
  selectedLevel: number
}) {
  const currentLevel = useCollectionStore((s) => s.currentLevel)
  const unlockedMap = useCollectionStore((s) => s.unlocked)

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
      {LEVELS.map((level) => {
        const isLocked = level.id > currentLevel
        const { unlocked, total } = computeLevelProgress(unlockedMap, level.id)
        const pct = total ? Math.round((unlocked / total) * 100) : 0
        const isSelected = selectedLevel === level.id

        return (
          <button
            key={level.id}
            disabled={isLocked}
            onClick={() => onSelect(level.id)}
            className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
              isSelected ? 'border-transparent shadow-md' : 'border-zinc-200 dark:border-zinc-700'
            }`}
            style={isSelected ? { background: `${level.color}22`, borderColor: level.color } : undefined}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-lg">{level.emoji}</span>
              {isLocked && <Lock size={12} className="text-zinc-400" />}
            </div>
            <span className="w-full truncate text-xs font-semibold text-zinc-700 dark:text-zinc-200">
              {level.name}
            </span>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: level.color }}
              />
            </div>
            <span className="text-[10px] text-zinc-400">
              {unlocked}/{total}
            </span>
          </button>
        )
      })}
    </div>
  )
}
