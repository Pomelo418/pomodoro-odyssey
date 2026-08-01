import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { getItemById } from '@/data/items'
import { getLevel } from '@/data/levels'
import type { UnlockEvent } from '@/hooks/useTimerEngine'

interface Props {
  event: UnlockEvent | null
  onClose: () => void
}

export function UnlockModal({ event, onClose }: Props) {
  const [revealed, setRevealed] = useState(false)
  const item = event ? getItemById(event.itemId) : undefined
  const level = item ? getLevel(item.level) : undefined

  useEffect(() => {
    setRevealed(false)
    if (!event) return
    const t = setTimeout(() => {
      setRevealed(true)
      confetti({
        particleCount: event.isGoldenRoll ? 160 : 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: event.isGoldenRoll
          ? ['#fbbf24', '#fde68a', '#f59e0b']
          : [level?.color ?? '#a78bfa', '#ffffff'],
      })
      if (event.levelCompleted) {
        setTimeout(() => {
          confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } })
        }, 400)
      }
    }, 900)
    return () => clearTimeout(t)
  }, [event, level])

  if (!item) return null

  return (
    <Modal open={Boolean(event)} onClose={onClose}>
      <div className="flex flex-col items-center py-4 text-center">
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="box"
              initial={{ scale: 0.6, rotate: -8 }}
              animate={{ scale: [1, 1.08, 1], rotate: [0, 4, -4, 0] }}
              transition={{ duration: 0.9, repeat: Infinity }}
              className="flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-300 to-fuchsia-300 text-5xl shadow-lg"
            >
              🎁
            </motion.div>
          ) : (
            <motion.div
              key="reveal"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="animate-pop flex flex-col items-center"
            >
              <div
                className={`flex h-28 w-28 items-center justify-center rounded-3xl text-5xl shadow-lg ${
                  event?.isGoldenRoll ? 'shadow-[0_0_30px_rgba(251,191,36,0.6)] bg-gradient-to-br from-amber-200 to-yellow-300' : 'bg-white/70 dark:bg-zinc-800'
                }`}
              >
                {item.categoryEmoji}
              </div>
              {event?.isGoldenRoll && (
                <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-amber-500">
                  <Sparkles size={14} /> Golden Variant!
                </div>
              )}
              <h3 className="mt-2 font-heading text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                {item.name}
              </h3>
              <p className="text-xs uppercase tracking-wide text-zinc-400">
                {item.rarity} · {level?.name}
              </p>
              <p className="mt-2 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
                {item.description}
              </p>

              {event?.levelCompleted && (
                <div className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-400 to-fuchsia-400 p-3 text-sm font-medium text-white">
                  🎉 Level {level?.id} complete! Certificate unlocked, and{' '}
                  {event.newLevel ? `Level ${event.newLevel} is now open.` : 'you\'ve mastered every level!'}
                </div>
              )}

              <button
                onClick={onClose}
                className="mt-4 rounded-full bg-violet-400 px-6 py-2 text-sm font-medium text-white transition hover:scale-105"
              >
                Nice!
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {!revealed && <p className="mt-4 text-sm text-zinc-400">Unlocking a new item...</p>}
      </div>
    </Modal>
  )
}
