import { useMemo } from 'react'

interface Props {
  data: { date: string; count: number }[]
  weeks?: number
}

function colorFor(count: number) {
  if (count === 0) return 'bg-zinc-100 dark:bg-zinc-800'
  if (count <= 1) return 'bg-emerald-200 dark:bg-emerald-900'
  if (count <= 3) return 'bg-emerald-400 dark:bg-emerald-700'
  if (count <= 5) return 'bg-emerald-500 dark:bg-emerald-500'
  return 'bg-emerald-600 dark:bg-emerald-400'
}

export function Heatmap({ data, weeks = 20 }: Props) {
  const byDate = useMemo(() => new Map(data.map((d) => [d.date, d.count])), [data])

  const days = useMemo(() => {
    const totalDays = weeks * 7
    const today = new Date()
    const start = new Date(today)
    start.setDate(start.getDate() - totalDays + 1)
    // align to Sunday
    start.setDate(start.getDate() - start.getDay())

    return Array.from({ length: totalDays + 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      return { date: key, count: byDate.get(key) ?? 0 }
    })
  }, [byDate, weeks])

  const columns: { date: string; count: number }[][] = []
  for (let i = 0; i < days.length; i += 7) columns.push(days.slice(i, i + 7))

  return (
    <div className="flex gap-1 overflow-x-auto pb-2">
      {columns.map((col, i) => (
        <div key={i} className="flex flex-col gap-1">
          {col.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.count} session${day.count === 1 ? '' : 's'}`}
              className={`h-3 w-3 rounded-sm ${colorFor(day.count)}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
