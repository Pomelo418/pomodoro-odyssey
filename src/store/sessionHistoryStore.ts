import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SessionHistoryDay } from '@/types'

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function dayBefore(dateKey: string) {
  const d = new Date(dateKey)
  d.setDate(d.getDate() - 1)
  return todayKey(d)
}

interface SessionHistoryState {
  days: Record<string, SessionHistoryDay>
  currentStreak: number
  longestStreak: number
  totalSessions: number

  recordSession: (focusMinutes: number, itemsUnlocked: number) => void
  heatmapData: () => { date: string; count: number }[]
}

export const useSessionHistoryStore = create<SessionHistoryState>()(
  persist(
    (set, get) => ({
      days: {},
      currentStreak: 0,
      longestStreak: 0,
      totalSessions: 0,

      recordSession: (focusMinutes, itemsUnlocked) => {
        const key = todayKey()
        const days = { ...get().days }
        const existing = days[key] ?? {
          date: key,
          sessionsCount: 0,
          itemsUnlocked: 0,
          focusTime: 0,
        }
        days[key] = {
          ...existing,
          sessionsCount: existing.sessionsCount + 1,
          itemsUnlocked: existing.itemsUnlocked + itemsUnlocked,
          focusTime: existing.focusTime + focusMinutes,
        }

        const wasNewDay = !get().days[key]
        let currentStreak = get().currentStreak
        if (wasNewDay) {
          const yesterday = dayBefore(key)
          currentStreak = get().days[yesterday] ? currentStreak + 1 : 1
        } else if (currentStreak === 0) {
          currentStreak = 1
        }

        set({
          days,
          currentStreak,
          longestStreak: Math.max(get().longestStreak, currentStreak),
          totalSessions: get().totalSessions + 1,
        })
      },

      heatmapData: () =>
        Object.values(get().days).map((d) => ({ date: d.date, count: d.sessionsCount })),
    }),
    { name: 'pomodoro-odyssey:session-history' },
  ),
)
