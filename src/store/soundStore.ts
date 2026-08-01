import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AmbientSoundId } from '@/types'

export const AMBIENT_SOUNDS: { id: AmbientSoundId; label: string; color: string }[] = [
  { id: 'lofi', label: 'Lofi Beats', color: '#c084fc' },
  { id: 'rain', label: 'Rain', color: '#60a5fa' },
  { id: 'forest', label: 'Forest', color: '#4ade80' },
  { id: 'ocean', label: 'Ocean', color: '#22d3ee' },
]

interface SoundState {
  activeSound: AmbientSoundId | null
  isPlaying: boolean
  play: (sound: AmbientSoundId) => void
  pause: () => void
  toggle: (sound?: AmbientSoundId) => void
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      activeSound: 'lofi',
      isPlaying: false,

      play: (sound) => set({ activeSound: sound, isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      toggle: (sound) => {
        const target = sound ?? get().activeSound
        if (!target) return
        if (get().isPlaying && target === get().activeSound) {
          set({ isPlaying: false })
        } else {
          set({ activeSound: target, isPlaying: true })
        }
      },
    }),
    { name: 'pomodoro-odyssey:sound', partialize: (state) => ({ activeSound: state.activeSound }) },
  ),
)
