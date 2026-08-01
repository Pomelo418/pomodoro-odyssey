import { create } from 'zustand'
import type { SessionMode } from '@/types'

interface TimerState {
  mode: SessionMode
  secondsRemaining: number
  isRunning: boolean
  focusSessionsInCycle: number

  play: () => void
  pause: () => void
  toggle: () => void
  tick: () => void
  setDuration: (mode: SessionMode, seconds: number) => void
  advanceCycle: () => void
}

export const useTimerStore = create<TimerState>()((set, get) => ({
  mode: 'focus',
  secondsRemaining: 25 * 60,
  isRunning: false,
  focusSessionsInCycle: 0,

  play: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  toggle: () => set({ isRunning: !get().isRunning }),

  tick: () =>
    set((state) => ({ secondsRemaining: Math.max(0, state.secondsRemaining - 1) })),

  setDuration: (mode, seconds) => set({ mode, secondsRemaining: seconds, isRunning: false }),

  advanceCycle: () =>
    set((state) => ({
      focusSessionsInCycle:
        state.mode === 'focus' ? state.focusSessionsInCycle + 1 : state.focusSessionsInCycle,
    })),
}))
