/**
 * Suspense fallback for URL-filtered results. Its height matches the real results (filter bar,
 * count line, a row of cards) so nothing below moves when the streamed results arrive (CLS 0).
 */
export function ResultsSkeleton({ filterClass = 'h-[74px] lg:h-[128px]', cardClass = 'aspect-[4/5]', head = true }: { filterClass?: string; cardClass?: string; head?: boolean }) {
  return (
    <div aria-hidden="true">
      <div className={`rounded-[24px] soft-card bg-white ${filterClass}`} />
      {head && <div className="mb-6 mt-7 h-7 w-64 rounded-full bg-mist" />}
      <div className="grid gap-[clamp(18px,2.4vw,30px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr))]">
        {[0, 1, 2].map(i => <div key={i} className={`rounded-card bg-mist ${cardClass}`} />)}
      </div>
    </div>
  );
}
