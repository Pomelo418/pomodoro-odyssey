import { useEffect, useRef } from 'react'
import type { AmbientHandle } from '@/lib/audio'

interface Props {
  handle: AmbientHandle | null
  color: string
  isPlaying: boolean
}

export function SoundVisualizer({ handle, color, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx2d = canvas.getContext('2d')
    if (!ctx2d) return

    const bufferLength = handle?.analyser.frequencyBinCount ?? 128
    const dataArray = new Uint8Array(bufferLength)

    function draw() {
      rafRef.current = requestAnimationFrame(draw)
      const { width, height } = canvas!.getBoundingClientRect()
      canvas!.width = width * devicePixelRatio
      canvas!.height = height * devicePixelRatio
      ctx2d!.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
      ctx2d!.clearRect(0, 0, width, height)

      if (handle && isPlaying) {
        handle.analyser.getByteFrequencyData(dataArray)
      } else {
        dataArray.fill(0)
      }

      const barCount = 32
      const step = Math.floor(dataArray.length / barCount) || 1
      const barWidth = width / barCount
      ctx2d!.fillStyle = color

      for (let i = 0; i < barCount; i++) {
        const v = isPlaying ? dataArray[i * step] / 255 : 0.05 + Math.sin(Date.now() / 400 + i) * 0.02
        const barHeight = Math.max(2, v * height)
        const x = i * barWidth
        const y = height - barHeight
        ctx2d!.globalAlpha = 0.6 + v * 0.4
        ctx2d!.beginPath()
        const radius = Math.min(3, barWidth / 2)
        ctx2d!.roundRect(x + 1, y, barWidth - 2, barHeight, radius)
        ctx2d!.fill()
      }
    }
    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [handle, color, isPlaying])

  return <canvas ref={canvasRef} className="h-16 w-full" />
}
