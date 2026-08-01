import { useCollectionStore } from '@/store/collectionStore'
import { useSessionHistoryStore } from '@/store/sessionHistoryStore'
import { useAuthStore } from '@/store/authStore'
import { ITEMS, getItemById } from '@/data/items'

const APP_VERSION = '2.0.0'

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportCollectionJson() {
  const collection = useCollectionStore.getState()
  const history = useSessionHistoryStore.getState()
  const profile = useAuthStore.getState().profile

  const unlockedIds = Object.keys(collection.unlocked)
  const goldenCount = unlockedIds.filter((id) => collection.unlocked[id].isGoldenRoll).length
  const dayValues = Object.values(history.days)
  const avgDaily = dayValues.length
    ? dayValues.reduce((sum, d) => sum + d.sessionsCount, 0) / dayValues.length
    : 0
  const busiestDay = dayValues.length
    ? [...dayValues].sort((a, b) => b.sessionsCount - a.sessionsCount)[0].date
    : null

  const payload = {
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    appVersion: APP_VERSION,
    user: {
      username: profile?.username ?? 'guest',
      level: collection.currentLevel,
      totalSessions: history.totalSessions,
      currentStreak: history.currentStreak,
      longestStreak: history.longestStreak,
      totalFocusTime: collection.totalFocusMinutes,
    },
    collection: unlockedIds.map((id) => getItemById(id)).filter(Boolean),
    certificates: collection.certificates,
    statistics: {
      heatmap: dayValues,
      levelCompletions: collection.certificates.map((c) => ({
        level: c.level,
        completedAt: c.completedAt,
      })),
      favorites: collection.favorites,
    },
    metadata: {
      totalItems: unlockedIds.length,
      completionRate: Number(((unlockedIds.length / ITEMS.length) * 100).toFixed(1)),
      goldenItems: goldenCount,
      averageDailySessions: Number(avgDaily.toFixed(1)),
      mostProductiveDay: busiestDay
        ? new Date(busiestDay).toLocaleDateString(undefined, { weekday: 'long' })
        : null,
    },
  }

  download('pomodoro-odyssey-export.json', JSON.stringify(payload, null, 2), 'application/json')
}

export function exportStatisticsCsv() {
  const history = useSessionHistoryStore.getState()
  const rows = [['date', 'sessions', 'items_unlocked', 'focus_minutes']]
  for (const d of Object.values(history.days)) {
    rows.push([d.date, String(d.sessionsCount), String(d.itemsUnlocked), String(d.focusTime)])
  }
  const csv = rows.map((r) => r.join(',')).join('\n')
  download('pomodoro-odyssey-stats.csv', csv, 'text/csv')
}

export function exportHtmlPortfolio() {
  const collection = useCollectionStore.getState()
  const profile = useAuthStore.getState().profile
  const unlockedItems = Object.keys(collection.unlocked)
    .map((id) => getItemById(id))
    .filter(Boolean)

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${
    profile?.displayName ?? 'My'
  } Pomodoro Odyssey Collection</title>
  <style>body{font-family:sans-serif;background:#fcf6f5;padding:2rem}h1{color:#333}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:1rem}
  .card{background:white;border-radius:12px;padding:1rem;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.08)}
  .emoji{font-size:2rem}</style></head><body>
  <h1>${profile?.displayName ?? 'Guest'}'s Collection</h1>
  <p>${unlockedItems.length} items collected across ${collection.currentLevel} level(s).</p>
  <div class="grid">${unlockedItems
    .map((i) => `<div class="card"><div class="emoji">${i!.categoryEmoji}</div>${i!.name}</div>`)
    .join('')}</div>
  </body></html>`

  download('pomodoro-odyssey-portfolio.html', html, 'text/html')
}

export function importCollectionJson(file: File) {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        const unlocked: Record<string, { itemId: string; unlockedAt: string; isGoldenRoll: boolean }> = {}
        for (const item of data.collection ?? []) {
          unlocked[item.id] = {
            itemId: item.id,
            unlockedAt: data.exportDate ?? new Date().toISOString(),
            isGoldenRoll: false,
          }
        }
        useCollectionStore.getState().importData({
          unlocked,
          favorites: data.statistics?.favorites ?? [],
          certificates: data.certificates ?? [],
          currentLevel: data.user?.level,
        })
        resolve()
      } catch (e) {
        reject(e)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}
