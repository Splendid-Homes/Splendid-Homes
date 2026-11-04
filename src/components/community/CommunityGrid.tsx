'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Icon } from '@/components/icons';

export type CommunityItem = {
  slug: string; name: string; tag: string; img: string; roi: number; avgSale: number; avgRent: number; listings: number;
  life: { beach: boolean; metro: boolean; schools: number; toDowntown: number; toAirport: number };
};

export type LifeChip = { key: 'beach' | 'metro' | 'family' | 'yield' | 'luxury' | 'central' | 'value'; label: string; limit: number | null };

// How a community qualifies for each kind of chip, using the chip's limit (Community pages > Lifestyle filter).
const TESTS: Record<LifeChip['key'], { test: (c: CommunityItem, n: number) => boolean; n: number }> = {
  beach: { test: c => c.life.beach, n: 0 },
  metro: { test: c => c.life.metro, n: 0 },
  family: { test: (c, n) => c.life.schools >= n, n: 4 },
  yield: { test: (c, n) => c.roi >= n, n: 6 },
  luxury: { test: (c, n) => c.avgSale >= n, n: 3000 },
  central: { test: (c, n) => c.life.toDowntown <= n, n: 15 },
  value: { test: (c, n) => c.avgSale < n, n: 2000 },
};
export type CardFigure = 'yield' | 'price' | 'rent' | 'listings' | 'downtown' | 'airport' | 'schools';
/** Card figures (value, label), chosen in the CMS (Community pages > Lifestyle filter). */
const FIGURE: Record<CardFigure, (c: CommunityItem) => [string, string]> = {
  yield: c => [`${c.roi}%`, 'Yield'],
  price: c => [c.avgSale.toLocaleString('en-US'), 'AED / sq ft'],
  rent: c => [short(c.avgRent), 'Avg rent'],
  listings: c => [String(c.listings), c.listings === 1 ? 'Listing' : 'Listings'],
  downtown: c => [c.life.toDowntown ? `${c.life.toDowntown} min` : '0 min', 'To Downtown'],
  airport: c => [`${c.life.toAirport} min`, 'To DXB'],
  schools: c => [String(c.life.schools), 'Schools'],
};
const short = (n: number) => n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : `${Math.round(n / 1e3)}k`;

/**
 * Communities index (soft UI): a pressed-in row of lifestyle filters (counts per filter), then
 * bright photo cards in raised frames with the figures underneath as pressed-in tiles and the
 * area's lifestyle chips. Every card is in the HTML; filtering only hides cards.
 */
export function CommunityGrid({ items, chips, allLabel, figures, showChips }: {
  items: CommunityItem[]; chips: LifeChip[]; allLabel: string; figures: CardFigure[]; showChips: boolean;
}) {
  const FILTERS = chips.map((x, i) => ({ key: `${x.key}-${i}`, label: x.label, test: (c: CommunityItem) => TESTS[x.key].test(c, x.limit ?? TESTS[x.key].n) }));
  const [on, setOn] = useState<string | null>(null);
  const f = FILTERS.find(x => x.key === on);
  const shown = items.filter(c => !f || f.test(c));
  const chip = (active: boolean) => `shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[0.86rem] font-bold transition-[box-shadow,color] duration-300 ${active
    ? 'soft-inset-sm text-forest before:mr-1.5 before:inline-block before:size-[7px] before:rounded-full before:bg-gold before:align-middle before:content-[\'\']'
    : 'soft-raised-sm text-ink-2 hover:text-forest'}`;
  return (
    <>
      <div role="group" aria-label="Filter by lifestyle" className="-mx-1 mb-6 flex gap-2 overflow-x-auto rounded-full soft-inset p-2 [scrollbar-width:none]">
        <button type="button" aria-pressed={!on} onClick={() => setOn(null)} className={chip(!on)}>{allLabel} <span className="ml-1 text-[0.78rem] text-muted">{items.length}</span></button>
        {FILTERS.map(x => {
          const n = items.filter(x.test).length;
          if (!n) return null;
          return (
            <button key={x.key} type="button" aria-pressed={on === x.key} onClick={() => setOn(on === x.key ? null : x.key)} className={chip(on === x.key)}>
              {x.label} <span className="ml-1 text-[0.78rem] text-muted">{n}</span>
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="sr-only">{shown.length} areas shown</p>
      <ul className="grid gap-[clamp(16px,2vw,22px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr))]">
        {items.map(c => {
          const lifestyle = FILTERS.filter(x => x.test(c)).map(x => x.label);
          return (
            <li key={c.slug} hidden={!shown.includes(c)} className="motion-safe:animate-[sh-fade-up_.45s_cubic-bezier(.16,1,.3,1)_both]">
              <Link href={`/community/${c.slug}`}
                className="group flex h-full flex-col rounded-[26px] soft-raised p-2.5 transition-[translate] duration-500 ease-[cubic-bezier(.16,1,.3,1)] pointer-fine:hover:-translate-y-1">
                <span className="relative block aspect-[4/3] overflow-hidden rounded-[19px] bg-mint">
                  <Image src={c.img} alt="" fill sizes="(min-width: 1240px) 400px, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-[scale] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]" />
                  <span className="absolute right-3.5 top-3.5 grid size-10 place-items-center rounded-full bg-mist text-forest shadow-[3px_4px_10px_rgba(15,36,24,.3)] transition-all duration-300 group-hover:-rotate-45 group-hover:bg-forest group-hover:text-white">
                    <Icon name="arrow" className="size-4" />
                  </span>
                </span>
                <span className="flex flex-1 flex-col gap-3 px-2 pb-1.5 pt-3.5">
                  <span>
                    <span className="block text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-leaf">{c.tag}</span>
                    <h2 className="text-[1.3rem] tracking-[-0.02em] transition-colors group-hover:text-forest">{c.name}</h2>
                  </span>
                  {figures.length > 0 && <span className={`grid gap-2 ${['', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3'][figures.length]}`}>
                    {figures.map(k => FIGURE[k](c)).map(([v, l]) => (
                      <span key={l} className="rounded-[13px] soft-inset-sm px-3 py-2">
                        <b className="block text-[0.98rem] text-forest">{v}</b>
                        <span className="text-[0.66rem] font-extrabold uppercase tracking-[0.04em] text-muted">{l}</span>
                      </span>
                    ))}
                  </span>}
                  {showChips && <span className="mt-auto flex flex-wrap gap-1.5">
                    {lifestyle.map(l => <span key={l} className="rounded-full soft-raised-sm px-2.5 py-1 text-[0.74rem] font-bold text-forest">{l}</span>)}
                    <span className="rounded-full soft-raised-sm px-2.5 py-1 text-[0.74rem] font-bold text-ink-2">{c.listings} {c.listings === 1 ? 'listing' : 'listings'}</span>
                  </span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
