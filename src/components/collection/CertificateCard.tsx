import { useRef } from 'react'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { Download, Share2 } from 'lucide-react'
import type { Certificate } from '@/types'
import { getLevel } from '@/data/levels'
import { getItemById } from '@/data/items'
import { shareCertificate } from '@/services/shareService'

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  const ref = useRef<HTMLDivElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const level = getLevel(certificate.level)

  useEffect(() => {
    QRCode.toDataURL(`https://pomodoroodyssey.example/verify/${certificate.shareCode}`, {
      width: 96,
      margin: 1,
    }).then(setQrDataUrl)
  }, [certificate.shareCode])

  async function handleDownloadPdf() {
    if (!ref.current) return
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas-pro'),
      import('jspdf'),
    ])
    const canvas = await html2canvas(ref.current, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height],
    })
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
    pdf.save(`pomodoro-odyssey-certificate-level-${certificate.level}.pdf`)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={ref}
        className="flex aspect-[8/5.6] w-full max-w-xl flex-col justify-between rounded-2xl border-8 p-8 text-center shadow-lg"
        style={{
          borderColor: level?.color ?? '#a78bfa',
          background: `linear-gradient(135deg, ${level?.color}11, #ffffff)`,
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
            Certificate of Completion
          </p>
          <span className="text-4xl">{level?.emoji}</span>
          <h2 className="font-heading text-2xl font-semibold text-zinc-800">
            Level {certificate.level}: {level?.name}
          </h2>
          <p className="text-sm text-zinc-500">
            {certificate.itemsCount}/{certificate.itemsCount} items collected ·{' '}
            {certificate.goldenItemsCount} golden
          </p>
          <p className="max-w-xs text-xs text-zinc-400">
            Completed{' '}
            {new Date(certificate.completedAt).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            · {certificate.totalFocusHours}h focused
          </p>
        </div>

        <div className="flex items-end justify-between">
          <span className="text-[10px] text-zinc-300">🍅 Pomodoro Odyssey</span>
          <div className="flex gap-1.5">
            {certificate.favoriteItemIds.slice(0, 5).map((id) => {
              const item = getItemById(id)
              return item ? (
                <span key={id} className="text-xl" title={item.name}>
                  {item.categoryEmoji}
                </span>
              ) : null
            })}
          </div>
          <div className="flex flex-col items-center gap-1">
            {qrDataUrl && <img src={qrDataUrl} alt="Verification QR code" className="h-14 w-14" />}
            <span className="font-mono text-[9px] text-zinc-400">{certificate.shareCode}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDownloadPdf}
          className="flex items-center gap-1.5 rounded-full bg-violet-400 px-4 py-2 text-xs font-medium text-white transition hover:scale-105"
        >
          <Download size={14} /> Download PDF
        </button>
        <button
          onClick={() => shareCertificate(certificate, level?.name ?? '')}
          className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 transition hover:border-violet-300 dark:border-zinc-700 dark:text-zinc-300"
        >
          <Share2 size={14} /> Share
        </button>
      </div>
    </div>
  )
}
