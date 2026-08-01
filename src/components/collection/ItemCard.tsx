import { motion } from 'framer-motion'
import { Heart, Lock } from 'lucide-react'
import type { CollectionItem } from '@/types'
import { useCollectionStore } from '@/store/collectionStore'

const RARITY_STYLES: Record<string, { border: string; label: string; glow?: string }> = {
  common: { border: 'border-zinc-300 dark:border-zinc-600', label: 'text-zinc-500' },
  uncommon: { border: 'border-emerald-400', label: 'text-emerald-500' },
  rare: { border: 'border-blue-400', label: 'text-blue-500' },
  golden: {
    border: 'border-amber-400',
    label: 'text-amber-500',
    glow: 'shadow-[0_0_20px_rgba(251,191,36,0.5)]',
  },
}

interface Props {
  item: CollectionItem
  onOpen?: (item: CollectionItem) => void
}

export function ItemCard({ item, onOpen }: Props) {
  const isUnlocked = useCollectionStore((s) => s.isUnlocked(item.id))
  const isGolden = useCollectionStore((s) => s.unlocked[item.id]?.isGoldenRoll)
  const isFavorite = useCollectionStore((s) => s.favorites.includes(item.id))
  const toggleFavorite = useCollectionStore((s) => s.toggleFavorite)

  const rarityKey = isGolden ? 'golden' : item.rarity
  const rarity = RARITY_STYLES[rarityKey]

  return (
    <motion.div
      layout
      role="button"
      tabIndex={0}
      whileHover={{ y: -4, rotate: isUnlocked ? -1 : 0 }}
      onClick={() => isUnlocked && onOpen?.(item)}
      onKeyDown={(e) => {
        if (isUnlocked && (e.key === 'Enter' || e.key === ' ')) onOpen?.(item)
      }}
      className={`relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 bg-white/70 p-3 text-center shadow-sm transition dark:bg-zinc-800/70 ${
        isUnlocked ? rarity.border : 'border-dashed border-zinc-200 dark:border-zinc-700'
      } ${isUnlocked && rarity.glow ? rarity.glow : ''}`}
    >
      {isUnlocked ? (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(item.id)
            }}
            className="absolute right-2 top-2"
            aria-label="Toggle favorite"
          >
            <Heart
              size={15}
              className={isFavorite ? 'animate-bounce-heart fill-rose-400 text-rose-400' : 'text-zinc-300'}
            />
          </button>
          <span className="text-3xl">{item.categoryEmoji}</span>
          <span className="mt-1 line-clamp-2 text-xs font-medium text-zinc-700 dark:text-zinc-200">
            {item.name}
          </span>
          <span className={`mt-0.5 text-[10px] font-semibold uppercase ${rarity.label}`}>
            {rarityKey}
          </span>
        </>
      ) : (
        <>
          <Lock size={22} className="text-zinc-300 dark:text-zinc-600" />
          <span className="mt-1 text-[10px] text-zinc-300 dark:text-zinc-600">Locked</span>
        </>
      )}
    </motion.div>
  )
}
