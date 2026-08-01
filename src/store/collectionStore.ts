import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Certificate, UnlockedItemRecord } from '@/types'
import { itemsByLevel } from '@/data/items'
import { LEVELS } from '@/data/levels'

const GOLDEN_ROLL_CHANCE = 0.05
const TOTAL_LEVELS = LEVELS.length

function generateShareCode() {
  return Array.from({ length: 10 }, () =>
    '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 34)],
  ).join('')
}

// Pure helper (not a store selector) — call this from a useMemo in components
// instead of `useCollectionStore((s) => s.levelProgress(level))`, since that
// selector pattern returns a fresh object every render and starves React's
// external-store snapshot check into an infinite loop.
export function computeLevelProgress(
  unlocked: Record<string, UnlockedItemRecord>,
  level: number,
): { unlocked: number; total: number } {
  const levelItems = itemsByLevel(level)
  return {
    unlocked: levelItems.filter((i) => unlocked[i.id]).length,
    total: levelItems.length,
  }
}

interface UnlockResult {
  record: UnlockedItemRecord
  levelCompleted: boolean
  newLevel?: number
}

interface CollectionState {
  unlocked: Record<string, UnlockedItemRecord>
  favorites: string[]
  certificates: Certificate[]
  currentLevel: number
  totalFocusMinutes: number

  isUnlocked: (itemId: string) => boolean
  unlockRandomItem: (focusMinutesSoFar: number) => UnlockResult | null
  toggleFavorite: (itemId: string) => void
  addFocusMinutes: (minutes: number) => void
  exportData: () => object
  importData: (data: {
    unlocked?: Record<string, UnlockedItemRecord>
    favorites?: string[]
    certificates?: Certificate[]
    currentLevel?: number
  }) => void
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      unlocked: {},
      favorites: [],
      certificates: [],
      currentLevel: 1,
      totalFocusMinutes: 0,

      isUnlocked: (itemId) => Boolean(get().unlocked[itemId]),

      unlockRandomItem: (focusMinutesSoFar) => {
        const { currentLevel, unlocked } = get()
        const pool = itemsByLevel(currentLevel).filter((i) => !unlocked[i.id])
        if (pool.length === 0) return null

        const item = pool[Math.floor(Math.random() * pool.length)]
        const record: UnlockedItemRecord = {
          itemId: item.id,
          unlockedAt: new Date().toISOString(),
          isGoldenRoll: Math.random() < GOLDEN_ROLL_CHANCE,
        }

        const nextUnlocked = { ...unlocked, [item.id]: record }
        const levelItems = itemsByLevel(currentLevel)
        const levelDone = levelItems.every((i) => nextUnlocked[i.id])

        let newLevel = currentLevel
        const certificates = [...get().certificates]

        if (levelDone) {
          const goldenCount = levelItems.filter((i) => nextUnlocked[i.id]?.isGoldenRoll).length
          certificates.push({
            id: `cert-${currentLevel}-${Date.now()}`,
            level: currentLevel,
            itemsCount: levelItems.length,
            completedAt: new Date().toISOString(),
            totalFocusHours: Math.round((focusMinutesSoFar / 60) * 10) / 10,
            goldenItemsCount: goldenCount,
            favoriteItemIds: get().favorites.filter((id) =>
              levelItems.some((i) => i.id === id),
            ),
            shareCode: generateShareCode(),
          })
          newLevel = Math.min(currentLevel + 1, TOTAL_LEVELS)
        }

        set({ unlocked: nextUnlocked, currentLevel: newLevel, certificates })

        return { record, levelCompleted: levelDone, newLevel: levelDone ? newLevel : undefined }
      },

      toggleFavorite: (itemId) =>
        set((state) => ({
          favorites: state.favorites.includes(itemId)
            ? state.favorites.filter((id) => id !== itemId)
            : [...state.favorites, itemId],
        })),

      addFocusMinutes: (minutes) =>
        set((state) => ({ totalFocusMinutes: state.totalFocusMinutes + minutes })),

      exportData: () => ({
        unlocked: get().unlocked,
        favorites: get().favorites,
        certificates: get().certificates,
        currentLevel: get().currentLevel,
        totalFocusMinutes: get().totalFocusMinutes,
      }),

      importData: (data) =>
        set((state) => ({
          unlocked: { ...state.unlocked, ...(data.unlocked ?? {}) },
          favorites: Array.from(new Set([...state.favorites, ...(data.favorites ?? [])])),
          certificates: [...state.certificates, ...(data.certificates ?? [])],
          currentLevel: data.currentLevel ?? state.currentLevel,
        })),
    }),
    { name: 'pomodoro-odyssey:collection' },
  ),
)
