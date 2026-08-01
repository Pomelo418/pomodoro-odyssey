import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { CollectionItem, Rarity } from '@/types'
import { ItemCard } from './ItemCard'
import { ItemDetailModal } from './ItemDetailModal'
import { useCollectionStore } from '@/store/collectionStore'

type SortKey = 'default' | 'name' | 'rarity-desc' | 'recent'
const RARITY_RANK: Record<Rarity, number> = { golden: 3, rare: 2, uncommon: 1, common: 0 }

interface Props {
  items: CollectionItem[]
}

export function ItemGrid({ items }: Props) {
  const [query, setQuery] = useState('')
  const [rarityFilter, setRarityFilter] = useState<'all' | Rarity>('all')
  const [showLockedOnly, setShowLockedOnly] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('default')
  const [selected, setSelected] = useState<CollectionItem | null>(null)
  const unlocked = useCollectionStore((s) => s.unlocked)

  const filtered = useMemo(() => {
    let list = items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
    if (rarityFilter !== 'all') list = list.filter((i) => i.rarity === rarityFilter)
    if (showLockedOnly === 'unlocked') list = list.filter((i) => unlocked[i.id])
    if (showLockedOnly === 'locked') list = list.filter((i) => !unlocked[i.id])

    if (sortKey === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sortKey === 'rarity-desc')
      list = [...list].sort((a, b) => RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity])
    if (sortKey === 'recent')
      list = [...list].sort((a, b) => {
        const ta = unlocked[a.id]?.unlockedAt ?? ''
        const tb = unlocked[b.id]?.unlockedAt ?? ''
        return tb.localeCompare(ta)
      })
    return list
  }, [items, query, rarityFilter, showLockedOnly, sortKey, unlocked])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full rounded-lg border border-zinc-200 bg-white/70 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-violet-300 dark:border-zinc-700 dark:bg-zinc-800/70"
          />
        </div>
        <select
          value={rarityFilter}
          onChange={(e) => setRarityFilter(e.target.value as 'all' | Rarity)}
          className="rounded-lg border border-zinc-200 bg-white/70 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800/70"
        >
          <option value="all">All rarities</option>
          <option value="common">Common</option>
          <option value="uncommon">Uncommon</option>
          <option value="rare">Rare</option>
          <option value="golden">Golden</option>
        </select>
        <select
          value={showLockedOnly}
          onChange={(e) => setShowLockedOnly(e.target.value as 'all' | 'unlocked' | 'locked')}
          className="rounded-lg border border-zinc-200 bg-white/70 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800/70"
        >
          <option value="all">All items</option>
          <option value="unlocked">Unlocked</option>
          <option value="locked">Locked</option>
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-lg border border-zinc-200 bg-white/70 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800/70"
        >
          <option value="default">Default order</option>
          <option value="name">Name (A-Z)</option>
          <option value="rarity-desc">Rarity (high-low)</option>
          <option value="recent">Recently unlocked</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {filtered.map((item) => (
          <ItemCard key={item.id} item={item} onOpen={setSelected} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="py-10 text-center text-sm text-zinc-400">No items match your filters.</p>
      )}

      <ItemDetailModal item={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
