import { Heart, Share2 } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import type { CollectionItem } from '@/types'
import { useCollectionStore } from '@/store/collectionStore'
import { getMetadataFields } from '@/lib/itemMetadata'
import { getHistoricalFact, FALLBACK_FACT_MESSAGES } from '@/data/historicalFacts'
import { shareItem } from '@/services/shareService'

interface Props {
  item: CollectionItem | null
  onClose: () => void
}

export function ItemDetailModal({ item, onClose }: Props) {
  const record = useCollectionStore((s) => (item ? s.unlocked[item.id] : undefined))
  const isFavorite = useCollectionStore((s) => (item ? s.favorites.includes(item.id) : false))
  const toggleFavorite = useCollectionStore((s) => s.toggleFavorite)

  if (!item) return null
  const fields = getMetadataFields(item)
  const unlockedDate = record ? new Date(record.unlockedAt) : null
  const fact = unlockedDate ? getHistoricalFact(unlockedDate) : undefined

  return (
    <Modal open={Boolean(item)} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <div className="text-6xl">{item.categoryEmoji}</div>
        <h2 className="mt-2 font-heading text-xl font-semibold text-zinc-800 dark:text-zinc-100">
          {item.name}
        </h2>
        <span
          className={`mt-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${
            record?.isGoldenRoll ? 'bg-amber-100 text-amber-600' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
          }`}
        >
          {record?.isGoldenRoll ? 'Golden Variant' : item.rarity}
        </span>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{item.description}</p>

        <div className="mt-4 w-full space-y-1.5 rounded-xl bg-white/60 p-3 text-left text-xs dark:bg-zinc-900/40">
          {fields.map((f) => (
            <div key={f.label} className="flex justify-between gap-3">
              <span className="shrink-0 font-medium text-zinc-400">{f.label}</span>
              <span className="text-right text-zinc-600 dark:text-zinc-300">{f.value}</span>
            </div>
          ))}
        </div>

        {unlockedDate && (
          <div className="mt-3 w-full rounded-xl bg-violet-50 p-3 text-left text-xs text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
            <p className="mb-1 font-semibold">
              Unlocked {unlockedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <p>{fact ? fact.fact : FALLBACK_FACT_MESSAGES[0]}</p>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => toggleFavorite(item.id)}
            className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 transition hover:border-rose-300 hover:text-rose-500 dark:border-zinc-700 dark:text-zinc-300"
          >
            <Heart size={14} className={isFavorite ? 'fill-rose-400 text-rose-400' : ''} />
            {isFavorite ? 'Favorited' : 'Favorite'}
          </button>
          <button
            onClick={() => shareItem(item)}
            className="flex items-center gap-1.5 rounded-full bg-violet-400 px-4 py-2 text-xs font-medium text-white transition hover:scale-105"
          >
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>
    </Modal>
  )
}
