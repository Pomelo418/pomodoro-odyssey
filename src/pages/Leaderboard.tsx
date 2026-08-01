import { useMemo, useState } from 'react'
import { Trophy, Medal } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSessionHistoryStore } from '@/store/sessionHistoryStore'
import { useCollectionStore } from '@/store/collectionStore'

type LeaderboardCategory = 'items' | 'sessions' | 'streak' | 'focusTime'

const CATEGORY_LABELS: Record<LeaderboardCategory, string> = {
  items: 'Most Items Collected',
  sessions: 'Sessions Completed',
  streak: 'Current Streak',
  focusTime: 'Total Focus Time',
}

// Mock peers: leaderboards need a backend to be real. These are seeded fake
// entries so the ranking UI can be exercised end-to-end.
const MOCK_PEERS = [
  { name: 'Aiko', items: 412, sessions: 380, streak: 45, focusTime: 158 },
  { name: 'Marcus', items: 289, sessions: 240, streak: 12, focusTime: 100 },
  { name: 'Priya', items: 601, sessions: 520, streak: 88, focusTime: 216 },
  { name: 'Diego', items: 145, sessions: 130, streak: 6, focusTime: 54 },
  { name: 'Fatima', items: 355, sessions: 300, streak: 30, focusTime: 125 },
]

export default function Leaderboard() {
  const [category, setCategory] = useState<LeaderboardCategory>('items')
  const profile = useAuthStore((s) => s.profile)
  const { currentStreak, totalSessions } = useSessionHistoryStore()
  const totalFocusMinutes = useCollectionStore((s) => s.totalFocusMinutes)
  const unlockedCount = useCollectionStore((s) => Object.keys(s.unlocked).length)

  const optedIn = profile?.privacy.leaderboardOptIn ?? false

  const rows = useMemo(() => {
    const me = {
      name: profile?.privacy.anonymousMode ? 'Anonymous' : profile?.displayName ?? 'You',
      items: unlockedCount,
      sessions: totalSessions,
      streak: currentStreak,
      focusTime: Math.round(totalFocusMinutes / 60),
      isMe: true,
    }
    return [...MOCK_PEERS.map((p) => ({ ...p, isMe: false })), me].sort(
      (a, b) => b[category] - a[category],
    )
  }, [category, profile, unlockedCount, totalSessions, currentStreak, totalFocusMinutes])

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
          Leaderboard
        </h1>
        <p className="text-sm text-zinc-400">
          Rankings are seeded with demo peers for now — real global rankings need a backend.
        </p>
      </div>

      {!optedIn && (
        <div className="glass rounded-xl p-4 text-sm text-amber-600 dark:text-amber-400">
          You're opted out of leaderboards. Enable "Appear on leaderboards" in your Profile's
          privacy settings to be ranked publicly (you can still view rankings).
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_LABELS) as LeaderboardCategory[]).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              category === c
                ? 'bg-violet-400 text-white'
                : 'bg-white/60 text-zinc-500 dark:bg-zinc-800/60'
            }`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        {rows.map((row, i) => (
          <div
            key={row.name + i}
            className={`flex items-center gap-3 border-b border-zinc-100 px-4 py-3 last:border-none dark:border-zinc-800 ${
              row.isMe ? 'bg-violet-50 dark:bg-violet-500/10' : ''
            }`}
          >
            <span className="flex w-6 items-center justify-center font-mono text-sm text-zinc-400">
              {i === 0 ? <Trophy size={16} className="text-amber-400" /> : i < 3 ? <Medal size={15} className="text-zinc-400" /> : i + 1}
            </span>
            <span className="flex-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {row.name} {row.isMe && <span className="text-xs text-violet-400">(you)</span>}
            </span>
            <span className="font-mono text-sm text-zinc-500">
              {category === 'focusTime' ? `${row[category]}h` : row[category]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
