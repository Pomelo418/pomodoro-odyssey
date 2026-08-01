import { useEffect, useRef } from 'react'
import { useTimerStore } from '@/store/timerStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useCollectionStore } from '@/store/collectionStore'
import { useSessionHistoryStore } from '@/store/sessionHistoryStore'
import { useSoundStore } from '@/store/soundStore'
import { playChime, resumeAudioContext } from '@/lib/audio'
import type { SessionMode } from '@/types'

export interface UnlockEvent {
  itemId: string
  isGoldenRoll: boolean
  levelCompleted: boolean
  newLevel?: number
}

/**
 * Drives the Pomodoro state machine: ticks every second, and on completion
 * of a focus session unlocks a collection item + records history, then
 * transitions to the correct next mode (short vs. long break).
 * Mount this once near the app root so the timer keeps running across pages.
 */
function secondsForMode(mode: SessionMode, settings: ReturnType<typeof useSettingsStore.getState>) {
  if (mode === 'focus') return settings.focusMinutes * 60
  if (mode === 'shortBreak') return settings.shortBreakMinutes * 60
  return settings.longBreakMinutes * 60
}

export function useTimerEngine(onUnlock?: (event: UnlockEvent) => void) {
  const settings = useSettingsStore()
  const isRunning = useTimerStore((s) => s.isRunning)
  const onUnlockRef = useRef(onUnlock)
  onUnlockRef.current = onUnlock

  useEffect(() => {
    const interval = setInterval(() => {
      const { isRunning, secondsRemaining } = useTimerStore.getState()
      if (!isRunning) return

      if (secondsRemaining <= 0) {
        handleCompletion()
        return
      }
      useTimerStore.getState().tick()
    }, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the displayed countdown in sync with duration settings whenever the
  // timer isn't actively running (so editing Settings takes effect right
  // away instead of only after the next full session completes).
  useEffect(() => {
    if (isRunning) return
    const mode = useTimerStore.getState().mode
    useTimerStore.getState().setDuration(mode, secondsForMode(mode, settings))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, settings.focusMinutes, settings.shortBreakMinutes, settings.longBreakMinutes])

  function handleCompletion() {
    const { mode, focusSessionsInCycle } = useTimerStore.getState()
    resumeAudioContext()
    playChime(settings.chimeSound, settings.soundVolume)

    if (mode === 'focus') {
      useTimerStore.getState().advanceCycle()
      const result = useCollectionStore.getState().unlockRandomItem(
        useCollectionStore.getState().totalFocusMinutes + settings.focusMinutes,
      )
      useCollectionStore.getState().addFocusMinutes(settings.focusMinutes)
      useSessionHistoryStore.getState().recordSession(settings.focusMinutes, result ? 1 : 0)

      if (result) {
        onUnlockRef.current?.({
          itemId: result.record.itemId,
          isGoldenRoll: result.record.isGoldenRoll,
          levelCompleted: result.levelCompleted,
          newLevel: result.newLevel,
        })
      }

      const nextCount = focusSessionsInCycle + 1
      const isLongBreak = nextCount % settings.sessionsUntilLongBreak === 0
      const nextMode: SessionMode = isLongBreak ? 'longBreak' : 'shortBreak'
      const nextSeconds =
        (isLongBreak ? settings.longBreakMinutes : settings.shortBreakMinutes) * 60
      useTimerStore.getState().setDuration(nextMode, nextSeconds)

      if (settings.autoPlayAmbient) {
        const sound = useSoundStore.getState().activeSound
        if (sound) useSoundStore.getState().play(sound)
      }
    } else {
      useTimerStore.getState().setDuration('focus', settings.focusMinutes * 60)
    }

    if (settings.autoStartNext) {
      useTimerStore.getState().play()
    }
  }
}
