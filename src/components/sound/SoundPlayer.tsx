import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, Volume1, VolumeX } from 'lucide-react'
import { useSoundStore, AMBIENT_SOUNDS } from '@/store/soundStore'
import { useSettingsStore } from '@/store/settingsStore'
import { startAmbientSound, primeAudioContext, type AmbientHandle } from '@/lib/audio'
import { SoundVisualizer } from './SoundVisualizer'
import type { AmbientSoundId } from '@/types'

export function SoundPlayer() {
  const { activeSound, isPlaying, play, pause } = useSoundStore()
  const ambientVolume = useSettingsStore((s) => s.ambientVolume)
  const updateSettings = useSettingsStore((s) => s.update)
  const [handle, setHandle] = useState<AmbientHandle | null>(null)
  const handleRef = useRef<AmbientHandle | null>(null)

  useEffect(() => {
    if (isPlaying && activeSound) {
      const newHandle = startAmbientSound(activeSound, ambientVolume)
      handleRef.current = newHandle
      setHandle(newHandle)
      return () => {
        newHandle.stop()
        handleRef.current = null
      }
    }
    setHandle(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, activeSound])

  useEffect(() => {
    handleRef.current?.setVolume(ambientVolume)
  }, [ambientVolume])

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      if (e.key.toLowerCase() === 's') {
        e.preventDefault()
        primeAudioContext()
        useSoundStore.getState().toggle()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        updateSettings({ ambientVolume: Math.min(1, ambientVolume + 0.05) })
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        updateSettings({ ambientVolume: Math.max(0, ambientVolume - 0.05) })
      }
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  }, [ambientVolume, updateSettings])

  const soundMeta = AMBIENT_SOUNDS.find((s) => s.id === activeSound) ?? AMBIENT_SOUNDS[0]
  const VolIcon = ambientVolume === 0 ? VolumeX : ambientVolume < 0.5 ? Volume1 : Volume2

  function selectSound(id: AmbientSoundId) {
    primeAudioContext()
    play(id)
  }

  return (
    <div className="glass w-full max-w-md rounded-2xl p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Ambient Focus Sounds
        </h3>
        <button
          onClick={() => {
            primeAudioContext()
            if (isPlaying) pause()
            else play(activeSound ?? 'lofi')
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white shadow transition hover:scale-105"
          style={{ background: soundMeta.color }}
          aria-label={isPlaying ? 'Pause ambient sound' : 'Play ambient sound'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>
      </div>

      <div className="mb-3 grid grid-cols-4 gap-2">
        {AMBIENT_SOUNDS.map((s) => (
          <button
            key={s.id}
            onClick={() => selectSound(s.id)}
            className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
              activeSound === s.id
                ? 'border-transparent text-white shadow'
                : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400'
            }`}
            style={activeSound === s.id ? { background: s.color } : undefined}
          >
            {s.label}
          </button>
        ))}
      </div>

      <SoundVisualizer handle={handle} color={soundMeta.color} isPlaying={isPlaying} />

      <div className="mt-3 flex items-center gap-2">
        <VolIcon size={16} className="text-zinc-400" />
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(ambientVolume * 100)}
          onChange={(e) => updateSettings({ ambientVolume: Number(e.target.value) / 100 })}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-current dark:bg-zinc-700"
          style={{ color: soundMeta.color }}
          aria-label="Ambient volume"
        />
        <span className="w-8 text-right text-xs text-zinc-400">
          {Math.round(ambientVolume * 100)}%
        </span>
      </div>
    </div>
  )
}
