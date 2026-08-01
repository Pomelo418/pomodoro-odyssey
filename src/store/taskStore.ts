import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, TaskCategory } from '@/types'

interface TaskState {
  tasks: Task[]
  archive: Task[]
  addTask: (title: string, category: TaskCategory, dueDate?: string) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  togglePriority: (id: string) => void
  reorderTasks: (activeId: string, overId: string) => void
  archiveCompleted: () => void
  clearArchive: () => void
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      archive: [],

      addTask: (title, category, dueDate) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: crypto.randomUUID(),
              title,
              completed: false,
              priority: false,
              category,
              dueDate,
              createdAt: new Date().toISOString(),
              order: state.tasks.length,
            },
          ],
        })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? new Date().toISOString() : undefined,
                }
              : t,
          ),
        })),

      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      togglePriority: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, priority: !t.priority } : t)),
        })),

      reorderTasks: (activeId, overId) => {
        const tasks = [...get().tasks]
        const from = tasks.findIndex((t) => t.id === activeId)
        const to = tasks.findIndex((t) => t.id === overId)
        if (from === -1 || to === -1) return
        const [moved] = tasks.splice(from, 1)
        tasks.splice(to, 0, moved)
        set({ tasks: tasks.map((t, i) => ({ ...t, order: i })) })
      },

      archiveCompleted: () =>
        set((state) => ({
          tasks: state.tasks.filter((t) => !t.completed),
          archive: [...state.archive, ...state.tasks.filter((t) => t.completed)],
        })),

      clearArchive: () => set({ archive: [] }),
    }),
    { name: 'pomodoro-odyssey:tasks' },
  ),
)
