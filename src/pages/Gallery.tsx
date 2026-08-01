import { useState } from 'react'
import { LevelProgress } from '@/components/collection/LevelProgress'
import { ItemGrid } from '@/components/collection/ItemGrid'
import { itemsByLevel } from '@/data/items'
import { getLevel } from '@/data/levels'
import { useCollectionStore } from '@/store/collectionStore'

export default function Gallery() {
  const currentLevel = useCollectionStore((s) => s.currentLevel)
  const [selectedLevel, setSelectedLevel] = useState(currentLevel)
  const level = getLevel(selectedLevel)
  const items = itemsByLevel(selectedLevel)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
          Collection Gallery
        </h1>
        <p className="text-sm text-zinc-400">
          Unlock one random item per completed focus session. Complete a level's 100 items to earn
          its certificate and open the next one.
        </p>
      </div>

      <LevelProgress selectedLevel={selectedLevel} onSelect={setSelectedLevel} />

      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">{level?.emoji}</span>
          <div>
            <h2 className="font-heading text-lg font-semibold text-zinc-700 dark:text-zinc-200">
              {level?.name}
            </h2>
            <p className="text-xs text-zinc-400">{level?.description}</p>
          </div>
        </div>
        <ItemGrid items={items} />
      </div>
    </div>
  )
}
