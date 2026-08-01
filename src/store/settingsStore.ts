import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TimerSettings } from '@/types'

interface SettingsState extends TimerSettings {
  update: (patch: Partial<TimerSettings>) => void
  resetDefaults: () => void
}

export const DEFAULT_SETTINGS: TimerSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsUntilLongBreak: 4,
  autoStartNext: false,
  autoPlayAmbient: false,
  chimeSound: 'chime',
  soundVolume: 0.6,
  ambientVolume: 0.4,
  theme: 'system',
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      update: (patch) => set(patch),
      resetDefaults: () => set(DEFAULT_SETTINGS),
    }),
    { name: 'pomodoro-odyssey:settings' },
  ),
)
