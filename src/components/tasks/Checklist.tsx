import { useMemo, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, Archive } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { TaskItem } from './TaskItem'
import type { TaskCategory } from '@/types'

const CATEGORIES: TaskCategory[] = ['work', 'personal', 'health', 'learning', 'other']

export function Checklist() {
  const { tasks, addTask, reorderTasks, archiveCompleted } = useTaskStore()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<TaskCategory>('work')
  const [dueDate, setDueDate] = useState('')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const sorted = useMemo(
    () => [...tasks].sort((a, b) => Number(b.priority) - Number(a.priority) || a.order - b.order),
    [tasks],
  )
  const completedCount = tasks.filter((t) => t.completed).length
  const progressPct = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    addTask(title.trim(), category, dueDate || undefined)
    setTitle('')
    setDueDate('')
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderTasks(String(active.id), String(over.id))
    }
  }

  return (
    <div className="glass w-full max-w-md rounded-2xl p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Today's Checklist
        </h3>
        <button
          onClick={archiveCompleted}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <Archive size={13} /> Archive done
        </button>
      </div>

      <div className="mb-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="mt-1 block text-right text-[11px] text-zinc-400">
          {completedCount}/{tasks.length} complete ({progressPct}%)
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mb-3 flex flex-wrap gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task..."
          className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white/70 px-3 py-1.5 text-sm outline-none focus:border-violet-300 dark:border-zinc-700 dark:bg-zinc-800/70"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TaskCategory)}
          className="rounded-lg border border-zinc-200 bg-white/70 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800/70"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white/70 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-800/70"
        />
        <button
          type="submit"
          className="flex items-center justify-center rounded-lg bg-violet-400 px-3 text-white transition hover:scale-105"
          aria-label="Add task"
        >
          <Plus size={16} />
        </button>
      </form>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sorted.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto pr-1">
            {sorted.length === 0 && (
              <p className="py-6 text-center text-xs text-zinc-400">No tasks yet — add one above.</p>
            )}
            {sorted.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
