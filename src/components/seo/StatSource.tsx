import { fmtDate } from '@/lib/market';

/** "Source · Last updated" line shown under every statistic (GEO: citable, dated figures). */
export function StatSource({ source, url, updated, className = '' }: { source: string; url?: string; updated?: string | null; className?: string }) {
  return (
    <p className={`text-[0.8rem] text-muted ${className}`}>
      Source: {url ? <a href={url} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-forest">{source}</a> : source}
      {updated && <> · Last updated <time dateTime={updated}>{fmtDate(updated)}</time></>}
    </p>
  );
}
