import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { useTimerStore } from '@/store/timerStore'
import { useSettingsStore } from '@/store/settingsStore'

const MODE_LABELS: Record<string, string> = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
}

const MODE_GRADIENTS: Record<string, [string, string]> = {
  focus: ['#ff8a80', '#ff6b6b'],
  shortBreak: ['#4ecdc4', '#22d3ee'],
  longBreak: ['#a78bfa', '#818cf8'],
}

const RADIUS = 120
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')
  return `${m}:${s}`
}

export function Timer() {
  const { mode, secondsRemaining, isRunning, toggle, focusSessionsInCycle, setDuration } =
    useTimerStore()
  const settings = useSettingsStore()

  const totalSeconds = useMemo(() => {
    if (mode === 'focus') return settings.focusMinutes * 60
    if (mode === 'shortBreak') return settings.shortBreakMinutes * 60
    return settings.longBreakMinutes * 60
  }, [mode, settings.focusMinutes, settings.shortBreakMinutes, settings.longBreakMinutes])

  const progress = totalSeconds > 0 ? 1 - secondsRemaining / totalSeconds : 0
  const [gradFrom, gradTo] = MODE_GRADIENTS[mode]

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      if (e.code === 'Space') {
        e.preventDefault()
        toggle()
      } else if (e.key.toLowerCase() === 'r') {
        setDuration(mode, totalSeconds)
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [toggle, setDuration, mode, totalSeconds])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-[280px] w-[280px]">
        <svg width="280" height="280" viewBox="0 0 280 280" className="-rotate-90">
          <defs>
            <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradFrom} />
              <stop offset="100%" stopColor={gradTo} />
            </linearGradient>
          </defs>
          <circle
            cx="140"
            cy="140"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
            className="text-cream-200/60 dark:text-zinc-800"
          />
          <motion.circle
            cx="140"
            cy="140"
            r={RADIUS}
            fill="none"
            stroke="url(#timer-gradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - progress) }}
            transition={{ duration: 0.4, ease: 'linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {MODE_LABELS[mode]}
          </span>
          <span className="font-mono text-6xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {formatTime(secondsRemaining)}
          </span>
          <span className="mt-1 text-xs text-zinc-400">
            Session {focusSessionsInCycle % settings.sessionsUntilLongBreak || settings.sessionsUntilLongBreak}/
            {settings.sessionsUntilLongBreak}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setDuration(mode, totalSeconds)}
          aria-label="Reset timer"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-zinc-600 shadow transition hover:scale-105 hover:shadow-lg dark:bg-zinc-800/70 dark:text-zinc-300"
        >
          <RotateCcw size={20} />
        </button>
        <motion.button
          onClick={toggle}
          whileTap={{ scale: 0.95 }}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
          className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
        >
          {isRunning ? <Pause size={26} /> : <Play size={26} className="ml-1" />}
        </motion.button>
        <div className="h-12 w-12" />
      </div>
    </div>
  )
}
