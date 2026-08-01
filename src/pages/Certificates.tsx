import { useCollectionStore } from '@/store/collectionStore'
import { CertificateCard } from '@/components/collection/CertificateCard'

export default function Certificates() {
  const certificates = useCollectionStore((s) => s.certificates)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
          Certificates
        </h1>
        <p className="text-sm text-zinc-400">
          Earned automatically when you finish collecting all 100 items in a level.
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-sm text-zinc-400">
          No certificates yet — complete a full 100-item level to earn your first one.
        </div>
      ) : (
        <div className="flex flex-col items-center gap-10">
          {certificates.map((c) => (
            <CertificateCard key={c.id} certificate={c} />
          ))}
        </div>
      )}
    </div>
  )
}
