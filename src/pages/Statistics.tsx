import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Heatmap } from '@/components/shared/Heatmap'
import { useSessionHistoryStore } from '@/store/sessionHistoryStore'
import { useCollectionStore } from '@/store/collectionStore'
import { ITEMS } from '@/data/items'

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#4ade80',
  rare: '#60a5fa',
  golden: '#fbbf24',
}

export default function Statistics() {
  const { days, currentStreak, longestStreak, totalSessions } = useSessionHistoryStore()
  const unlocked = useCollectionStore((s) => s.unlocked)
  const totalFocusMinutes = useCollectionStore((s) => s.totalFocusMinutes)

  const heatmapData = useMemo(
    () => Object.values(days).map((d) => ({ date: d.date, count: d.sessionsCount })),
    [days],
  )

  const weeklyData = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (6 - i))
      const key = d.toISOString().slice(0, 10)
      return {
        day: d.toLocaleDateString(undefined, { weekday: 'short' }),
        sessions: days[key]?.sessionsCount ?? 0,
      }
    })
  }, [days])

  const rarityData = useMemo(() => {
    const counts: Record<string, number> = { common: 0, uncommon: 0, rare: 0, golden: 0 }
    for (const id of Object.keys(unlocked)) {
      const item = ITEMS.find((i) => i.id === id)
      if (item) counts[item.rarity] += 1
    }
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }))
  }, [unlocked])

  const completionRate = ((Object.keys(unlocked).length / ITEMS.length) * 100).toFixed(1)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
        Statistics
      </h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Current streak', value: `${currentStreak}d` },
          { label: 'Longest streak', value: `${longestStreak}d` },
          { label: 'Total sessions', value: totalSessions },
          { label: 'Focus hours', value: (totalFocusMinutes / 60).toFixed(1) },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 text-center">
            <p className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">{s.value}</p>
            <p className="text-[11px] text-zinc-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-4">
        <h2 className="mb-3 font-heading text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Session Heatmap
        </h2>
        <Heatmap data={heatmapData} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-4">
          <h2 className="mb-3 font-heading text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Last 7 Days
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="sessions" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-4">
          <h2 className="mb-3 font-heading text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Collection by Rarity ({completionRate}% complete)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={rarityData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                {rarityData.map((entry) => (
                  <Cell key={entry.name} fill={RARITY_COLORS[entry.name]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
