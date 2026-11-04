'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Icon, type IconName } from '@/components/icons';

export type FinderArea = {
  slug: string; name: string; img: string; roi: number; avgSale: number; x: number; y: number;
  beach: boolean; metro: boolean; schools: number; toDowntown: number; toAirport: number;
};
type Geo = { w: number; h: number; land: string; creek: string; roads: string[]; palm: string; world: [number, number][] };

/** A chip from the CMS (Site settings > Homepage > "Dubai, mapped" options). */
export type FinderWant = { key: 'beach' | 'metro' | 'schools' | 'yield' | 'central' | 'value'; label: string; limit: number | null; on: boolean };

/** How an area qualifies for each kind of chip, using the chip's limit. */
const TESTS: Record<FinderWant['key'], { icon: IconName; test: (a: FinderArea, n: number) => boolean; n: number }> = {
  beach: { icon: 'sun', test: a => a.beach, n: 0 },
  metro: { icon: 'metro', test: a => a.metro, n: 0 },
  schools: { icon: 'school', test: (a, n) => a.schools >= n, n: 4 },
  yield: { icon: 'trend', test: (a, n) => a.roi >= n, n: 6 },
  central: { icon: 'tower', test: (a, n) => a.toDowntown <= n, n: 15 },
  value: { icon: 'wallet', test: (a, n) => a.avgSale < n, n: 2000 },
};

/**
 * Area finder (soft UI, light). Raised "I want…" chips press in when chosen; the embossed map
 * shows every community as a small raised dot, and matching ones grow into photo pins; the list
 * shows the top matches with their facts. Hovering a list row highlights its pin.
 */
export function AreaFinder({ areas, geo, wants: chips }: { areas: FinderArea[]; geo: Geo; wants: FinderWant[] }) {
  // Each chip gets a unique key (the same kind may appear twice with different limits).
  const WANTS = chips.map((w, i) => {
    const t = TESTS[w.key];
    return { key: `${w.key}-${i}`, icon: t.icon, label: w.label, test: (a: FinderArea) => t.test(a, w.limit ?? t.n) };
  });
  const [on, setOn] = useState<Set<string>>(() => new Set(WANTS.filter((_, i) => chips[i].on).map(w => w.key)));
  const [hot, setHot] = useState<string | null>(null);
  const toggle = (k: string) => setOn(prev => { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const tests = WANTS.filter(w => on.has(w.key));
  const hits = areas.filter(a => tests.every(t => t.test(a))).sort((a, b) => b.roi - a.roi);
  const isHit = new Set(hits.map(h => h.slug));
  const spots = spread(areas, isHit);

  return (
    <div className="grid items-start gap-[clamp(24px,3vw,40px)] lg:grid-cols-[1fr_1.15fr]">
      <div>
        <p id="finder-q" className="mb-3 text-[1.05rem] font-extrabold">I want…</p>
        <div role="group" aria-labelledby="finder-q" className="mb-5 flex flex-wrap gap-2.5">
          {WANTS.map(w => (
            <button key={w.key} type="button" aria-pressed={on.has(w.key)} onClick={() => toggle(w.key)}
              className={`inline-flex items-center gap-2 rounded-full px-[1.1em] py-[0.7em] text-[0.88rem] font-bold transition-[box-shadow,color] duration-300 ${on.has(w.key) ? 'soft-inset-sm text-forest' : 'soft-raised-sm text-ink-2 hover:text-forest'}`}>
              <Icon name={w.icon} className={`size-4 ${on.has(w.key) ? 'text-gold' : ''}`} />{w.label}
              {/* The × shows a chosen chip can be tapped again to remove it. */}
              {on.has(w.key) && <span aria-hidden="true" className="-mr-1 grid size-5 place-items-center rounded-full soft-raised-sm text-[0.9rem] leading-none text-muted">×</span>}
            </button>
          ))}
        </div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p aria-live="polite" className="text-[0.88rem] text-muted">
            {hits.length ? <><b className="text-forest">{hits.length} {hits.length === 1 ? 'area' : 'areas'}</b> {tests.length ? 'match' : 'to explore'}</> : 'No single area has all of these. Try removing one.'}
          </p>
          {on.size > 0 && (
            <button type="button" onClick={() => setOn(new Set())}
              className="inline-flex items-center gap-1.5 rounded-full soft-raised-sm px-3.5 py-1.5 text-[0.8rem] font-bold text-forest transition-[box-shadow] duration-300 hover:soft-inset-sm">
              <Icon name="pin" className="size-3.5 text-gold" />Show all areas
            </button>
          )}
        </div>
        <ul className="grid gap-3">
          {hits.slice(0, 4).map((a, i) => (
            <li key={a.slug} className="motion-safe:animate-[sh-fade-up_.45s_cubic-bezier(.16,1,.3,1)_both]" style={{ animationDelay: `${i * 60}ms` }}>
              <Link href={`/community/${a.slug}`} onPointerEnter={() => setHot(a.slug)} onPointerLeave={() => setHot(null)} onFocus={() => setHot(a.slug)} onBlur={() => setHot(null)}
                className="group grid grid-cols-[84px_1fr_auto] items-center gap-3.5 rounded-[22px] soft-raised p-2.5">
                <span className="relative h-[70px] overflow-hidden rounded-[16px]"><Image src={a.img} alt="" fill sizes="84px" className="object-cover" /></span>
                <span className="min-w-0">
                  <b className="block text-[1.02rem]">{a.name}</b>
                  <span className="mt-1.5 flex flex-wrap gap-1.5 text-[0.72rem] font-bold text-ink-2">
                    {a.beach && <Fact icon="sun">Beach</Fact>}
                    {a.metro && <Fact icon="metro">Metro</Fact>}
                    <Fact icon="school">{a.schools} schools</Fact>
                    <Fact icon="tower">{a.toDowntown ? `${a.toDowntown} min to Downtown` : 'In Downtown'}</Fact>
                    <Fact icon="trend">{a.roi}% yield</Fact>
                  </span>
                </span>
                <span className="grid size-10 place-items-center rounded-full soft-raised-sm text-forest transition-[background-color,color,box-shadow] duration-300 group-hover:bg-forest group-hover:text-white group-hover:shadow-btn">
                  <Icon name="arrow" className="size-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative rounded-[30px] soft-inset p-3.5" aria-hidden="true">
        <svg viewBox={`0 0 ${geo.w} ${geo.h}`} className="block h-auto w-full">
          <defs>
            <filter id="af-emb" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="-6" dy="-6" stdDeviation="6" floodColor="#fff" />
              <feDropShadow dx="7" dy="7" stdDeviation="8" floodColor="#12261a" floodOpacity="0.14" />
            </filter>
            <linearGradient id="af-sea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#dbe7e2" /><stop offset="1" stopColor="#e8efe9" /></linearGradient>
          </defs>
          <rect width={geo.w} height={geo.h} rx="22" fill="url(#af-sea)" />
          <path d={geo.land} fill="#f2f5f0" filter="url(#af-emb)" />
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={geo.roads[0]} stroke="#c9d5cc" strokeWidth="5" />
            <path d={geo.roads[1]} stroke="#d6e0d8" strokeWidth="4" />
            <path d={geo.creek} stroke="#cfdcd6" strokeWidth="10" />
            <path d={geo.palm} stroke="#f2f5f0" strokeWidth="7" filter="url(#af-emb)" />
          </g>
          <g fill="#f2f5f0" filter="url(#af-emb)">{geo.world.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" />)}</g>
        </svg>
        {areas.map(a => {
          const lit = isHit.has(a.slug), { x, y, above } = spots[a.slug];
          return (
            <span key={a.slug} data-area={a.slug} data-lit={lit ? '' : undefined} data-above={above ? '' : undefined}
              style={{ left: `calc(14px + (100% - 28px) * ${x / geo.w})`, top: `calc(14px + (100% - 28px) * ${y / geo.h})` }}
              className={`af-pin ${hot === a.slug ? 'af-hot' : ''}`}>
              {lit && <Image src={a.img} alt="" fill sizes="56px" className="rounded-full object-cover" />}
              <span className="af-name">{a.name.replace('Jumeirah Village Circle', 'JVC')}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Display positions: lit (photo) pins that would overlap are pushed apart a little (they stay
 * near their real spot), and a pin with another lit pin just below gets its name above it.
 */
const MIN_GAP = 95; // map units between lit pin centres
function spread(areas: FinderArea[], lit: Set<string>) {
  const pos = Object.fromEntries(areas.map(a => [a.slug, { x: a.x, y: a.y, above: false }]));
  const on = areas.filter(a => lit.has(a.slug)).map(a => a.slug);
  for (let pass = 0; pass < 6; pass++) {
    for (let i = 0; i < on.length; i++) for (let j = i + 1; j < on.length; j++) {
      const p = pos[on[i]], q = pos[on[j]];
      const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 1;
      if (d >= MIN_GAP) continue;
      const push = (MIN_GAP - d) / 2, ux = dx / d, uy = dy / d;
      p.x -= ux * push; p.y -= uy * push; q.x += ux * push; q.y += uy * push;
    }
  }
  for (const a of on) pos[a].above = on.some(b => b !== a && pos[b].y > pos[a].y && pos[b].y - pos[a].y < 130 && Math.abs(pos[b].x - pos[a].x) < 120);
  return pos;
}

function Fact({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-full soft-inset-sm px-2 py-0.5"><Icon name={icon} className="size-3.5 text-leaf" />{children}</span>;
}
