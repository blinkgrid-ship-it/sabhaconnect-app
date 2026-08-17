export function Placeholder({ titleEn, titleMl }: { titleEn: string; titleMl: string }) {
  return (
    <div className="card animate-fade-in p-8 text-center">
      <p className="font-display text-2xl text-ink">{titleEn}</p>
      <p className="font-ml mt-1 text-base text-ink/60">{titleMl}</p>
      <p className="mt-4 text-sm text-ink/50">Screen not built yet — data spine only.</p>
    </div>
  )
}
