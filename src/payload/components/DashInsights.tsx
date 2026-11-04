'use client';

import { useMemo, useState } from 'react';

export type LeadPoint = { at: string; type: string; source: string };
type Opt = { value: string; label: string };

const RANGES = [
  { key: '7', label: '7D', days: 7, unit: 'day' },
  { key: '30', label: '30D', days: 30, unit: 'day' },
  { key: '180', label: '6M', days: 182, unit: 'week' },
  { key: '365', label: '12M', days: 365, unit: 'month' },
] as const;
const DAY = 864e5;

/** Smooth line through the points (horizontal control handles, so it never overshoots a value). */
function linePath(pts: [number, number][]) {
  return pts.reduce((d, [x, y], i) => {
    if (!i) return `M${x} ${y}`;
    const [px, py] = pts[i - 1];
    const mid = (px + x) / 2;
    return `${d}C${mid} ${py} ${mid} ${y} ${x} ${y}`;
  }, '');
}

function Bars({ rows, empty }: { rows: { label: string; n: number }[]; empty: string }) {
  const max = Math.max(1, ...rows.map(r => r.n));
  if (!rows.length) return <p className="sh-empty">{empty}</p>;
  return <>{rows.map(r => (
    <div key={r.label} className="sh-type"><span>{r.label}</span><span className="tr"><i style={{ width: `${(r.n / max) * 100}%` }} /></span><b>{r.n}</b></div>
  ))}</>;
}

/** Leads chart with a date-range switch; the type and source breakdowns follow the same range. */
export function DashInsights({ points, now, types, sources }: { points: LeadPoint[]; now: number; types: Opt[]; sources: Opt[] }) {
  const [key, setKey] = useState<(typeof RANGES)[number]['key']>('30');
  const range = RANGES.find(r => r.key === key)!;
  const { buckets, inRange } = useMemo(() => {
    const since = now - range.days * DAY;
    const inRange = points.filter(p => new Date(p.at).getTime() >= since);
    const buckets: { label: string; n: number }[] = [];
    if (range.unit === 'month') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - i);
        const ym = d.toISOString().slice(0, 7);
        buckets.push({ label: d.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }), n: inRange.filter(p => p.at.slice(0, 7) === ym).length });
      }
    } else {
      const step = range.unit === 'week' ? 7 : 1;
      const count = Math.round(range.days / step);
      for (let i = count - 1; i >= 0; i--) {
        const end = now - i * step * DAY, start = end - step * DAY;
        buckets.push({
          label: new Date(end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
          n: inRange.filter(p => { const t = new Date(p.at).getTime(); return t > start && t <= end; }).length,
        });
      }
    }
    return { buckets, inRange };
  }, [points, now, range]);

  const W = 700, H = 190, top = 12;
  const max = Math.max(1, ...buckets.map(b => b.n));
  const pts: [number, number][] = buckets.map((b, i) => [(i / Math.max(1, buckets.length - 1)) * W, H - 6 - (b.n / max) * (H - top - 6)]);
  const line = linePath(pts);
  const ticks = buckets.length <= 7 ? buckets : Array.from({ length: 5 }, (_, i) => buckets[Math.round((i / 4) * (buckets.length - 1))]);
  const tally = (list: Opt[], pick: (p: LeadPoint) => string) => list
    .map(o => ({ label: o.label, n: inRange.filter(p => pick(p) === o.value).length })).filter(x => x.n).sort((a, b) => b.n - a.n);
  const unknown = inRange.filter(p => !p.source).length;
  const sourceRows = [...tally(sources, p => p.source), ...(unknown ? [{ label: 'Not recorded', n: unknown }] : [])];

  return (
    <>
      <div className="sh-panel sh-chart">
        <h3>
          <span>Leads <small>{inRange.length} in this range</small></span>
          <span className="sh-range" role="group" aria-label="Date range">
            {RANGES.map(r => <button key={r.key} type="button" aria-pressed={r.key === key} onClick={() => setKey(r.key)}>{r.label}</button>)}
          </span>
        </h3>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={buckets.map(b => `${b.label}: ${b.n}`).join(', ')}>
          <defs><linearGradient id="sh-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--sh-forest)" stopOpacity=".35" /><stop offset="1" stopColor="var(--sh-forest)" stopOpacity="0" /></linearGradient></defs>
          {[0.25, 0.5, 0.75].map(f => <path key={f} d={`M0 ${H * f}H${W}`} stroke="var(--sh-line)" vectorEffect="non-scaling-stroke" />)}
          <path d={`${line}L${W} ${H}L0 ${H}Z`} fill="url(#sh-area)" />
          <path d={line} fill="none" stroke="var(--sh-forest)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="sh-ticks">{ticks.map((t, i) => <span key={`${t.label}${i}`}>{t.label}</span>)}</div>
      </div>
      <div className="sh-row sh-row--2">
        <div className="sh-panel"><h3>By type <small>{range.label}</small></h3><Bars rows={tally(types, p => p.type)} empty="No leads in this range." /></div>
        <div className="sh-panel"><h3>Where leads came from <small>{range.label}</small></h3><Bars rows={sourceRows} empty="No leads in this range." /></div>
      </div>
    </>
  );
}
