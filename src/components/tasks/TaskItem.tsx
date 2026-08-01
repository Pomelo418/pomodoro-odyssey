import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Star, Trash2, GripVertical } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Task } from '@/types'
import { useTaskStore } from '@/store/taskStore'

const CATEGORY_COLORS: Record<string, string> = {
  work: '#60a5fa',
  personal: '#f472b6',
  health: '#4ade80',
  learning: '#fbbf24',
  other: '#a1a1aa',
}

export function TaskItem({ task }: { task: Task }) {
  const { toggleTask, deleteTask, togglePriority } = useTaskStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2 rounded-xl bg-white/60 px-3 py-2.5 shadow-sm transition dark:bg-zinc-800/60"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-zinc-300 hover:text-zinc-500 active:cursor-grabbing dark:text-zinc-600"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>

      <button
        onClick={() => toggleTask(task.id)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
          task.completed
            ? 'border-emerald-400 bg-emerald-400'
            : 'border-zinc-300 dark:border-zinc-600'
        }`}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed && <span className="text-[10px] text-white">✓</span>}
      </button>

      <span
        className={`flex-1 truncate text-sm ${
          task.completed ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-200'
        }`}
      >
        {task.title}
      </span>

      <span
        className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white/90"
        style={{ background: CATEGORY_COLORS[task.category] }}
      >
        {task.category}
      </span>

      {task.dueDate && (
        <span className="text-[10px] text-zinc-400">
          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
      )}

      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => togglePriority(task.id)}
        aria-label="Toggle priority"
      >
        <Star
          size={16}
          className={task.priority ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}
        />
      </motion.button>

      <button
        onClick={() => deleteTask(task.id)}
        className="text-zinc-300 opacity-0 transition group-hover:opacity-100 hover:text-red-400"
        aria-label="Delete task"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}
