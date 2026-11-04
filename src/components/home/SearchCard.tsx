'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from '@/components/icons';
import { SoftSelect } from '@/components/ui/SoftSelect';
import { useCompare } from '@/lib/clientStores';

const PURPOSES = [['buy', 'Buy'], ['rent', 'Rent'], ['off-plan', 'Off-Plan']] as const;
const TYPES = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Office'];
const BEDS: [string, string][] = [['0', 'Studio'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5+', '5+']];


type Purpose = (typeof PURPOSES)[number][0];
/** Slim listing facts for the live count (same matching rules as lib/listings `filterListings`). */
export type SearchListing = { p: 'buy' | 'rent'; c: string; t: string; b: number };
type Choice = { community: string; type: string; beds: string };

function countMatches(purpose: Purpose, f: Choice, listings: SearchListing[], projects: string[]) {
  if (purpose === 'off-plan') return projects.filter(c => !f.community || c === f.community).length;
  return listings.filter(l => l.p === purpose
    && (!f.community || l.c === f.community)
    && (!f.type || l.t === f.type)
    && (!f.beds || (f.beds === '5+' ? l.b >= 5 : l.b === Number(f.beds)))).length;
}

/**
 * Quick search (homepage round 3, item 3). Works without JS (GET to /buy); with JS it routes to
 * /buy, /rent or /off-plan with clean query params, the active tab's highlight slides between
 * tabs, the Location label suggests areas in turn, and the button shows how many listings match
 * before you search.
 */
export function SearchCard({ communities, listings, projects }: {
  communities: { slug: string; name: string }[];
  listings: SearchListing[];
  /** Community slug of each live off-plan project. */
  projects: string[];
}) {
  const router = useRouter();
  const [purpose, setPurpose] = useState<Purpose>('buy');
  const [choice, setChoice] = useState<Choice>({ community: '', type: '', beds: '' });
  const comparing = useCompare().length;
  const tabs = useRef<HTMLFieldSetElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const [hint, setHint] = useState(0);

  // Sliding highlight: measure the checked tab (re-measured when fonts or the layout change).
  useLayoutEffect(() => {
    const box = tabs.current;
    if (!box) return;
    const place = () => {
      const tab = box.querySelector<HTMLElement>(`[data-tab="${purpose}"]`);
      if (tab) setPill({ x: tab.offsetLeft, w: tab.offsetWidth });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(box);
    return () => ro.disconnect();
  }, [purpose]);

  // "e.g. Dubai Marina" beside the Location label, changing every few seconds (still with reduced motion).
  useEffect(() => {
    if (communities.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => { if (!document.hidden) setHint(i => (i + 1) % communities.length); }, 2600);
    return () => window.clearInterval(t);
  }, [communities.length]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const qs = new URLSearchParams();
    for (const k of ['community', 'type', 'beds'] as const) {
      const v = choice[k];
      if (v && !(purpose === 'off-plan' && k !== 'community')) qs.set(k, v);
    }
    router.push(`/${purpose}${qs.size ? `?${qs}` : ''}`);
  }

  const n = countMatches(purpose, choice, listings, projects);
  const noun = purpose === 'off-plan' ? (n === 1 ? 'project' : 'projects') : n === 1 ? 'home' : 'homes';

  return (
    <form action="/buy" method="get" onSubmit={onSubmit} role="search" aria-label="Property search"
      className="rounded-[26px] soft-raised p-3">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <fieldset ref={tabs} className="relative inline-flex rounded-[16px] soft-inset p-1.5">
          <legend className="sr-only">I want to</legend>
          {pill && (
            <span aria-hidden="true" style={{ translate: `${pill.x - 6}px 0`, width: pill.w }}
              className="absolute inset-y-1.5 left-1.5 rounded-[11px] soft-raised-sm transition-[translate,width] duration-500 ease-[cubic-bezier(.16,1,.3,1)]" />
          )}
          {PURPOSES.map(([v, l]) => (
            <label key={v} data-tab={v} className="relative cursor-pointer">
              <input type="radio" name="purpose" value={v} checked={purpose === v} onChange={() => setPurpose(v)} className="peer sr-only" />
              <span className={`block rounded-[10px] px-[1.4em] py-[0.6em] text-[0.88rem] font-semibold text-muted transition-colors duration-300 peer-checked:text-forest peer-focus-visible:ring-2 peer-focus-visible:ring-forest ${pill ? '' : 'peer-checked:soft-raised-sm'}`}>
                {l}
              </span>
            </label>
          ))}
        </fieldset>
        <Link href="/compare"
          className="inline-flex items-center gap-1.5 rounded-[14px] soft-raised-sm px-[1.1em] py-[0.7em] text-[0.88rem] font-semibold text-muted transition-colors hover:border-forest hover:text-forest">
          <Icon name="compare" className="size-4" />Compare
          {comparing > 0 && <span className="min-w-[18px] rounded-[9px] bg-forest px-1 text-center text-[10px] font-bold leading-[18px] text-white">{comparing}</span>}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto] sm:items-stretch">
        <SoftSelect name="community" label="Location" value={choice.community} onChange={v => setChoice(c => ({ ...c, community: v }))}
          className="max-sm:col-span-2"
          labelExtra={!choice.community && communities[hint] && (
            <span key={hint} aria-hidden="true" className="truncate font-medium normal-case tracking-normal text-forest sm:hidden motion-safe:animate-[sh-hint-in_.5s_cubic-bezier(.16,1,.3,1)]">
              e.g. {communities[hint].name}
            </span>
          )}
          options={[{ value: '', label: 'All Dubai', meta: String(countMatches(purpose, { ...choice, community: '' }, listings, projects)) },
            ...communities.map(c => ({ value: c.slug, label: c.name, meta: String(countMatches(purpose, { ...choice, community: c.slug }, listings, projects)) }))]} />
        <SoftSelect name="type" label="Type" value={choice.type} onChange={v => setChoice(c => ({ ...c, type: v }))} disabled={purpose === 'off-plan'}
          options={[{ value: '', label: 'Any type' }, ...TYPES.map(t => ({ value: t, label: t }))]} />
        <SoftSelect name="beds" label="Bedrooms" value={choice.beds} onChange={v => setChoice(c => ({ ...c, beds: v }))} disabled={purpose === 'off-plan'} columns={4} align="right"
          options={[{ value: '', label: 'Any' }, ...BEDS.map(([v, l]) => ({ value: v, label: l }))]} />
        <button type="submit" data-magnetic="0.2" aria-describedby="s-count"
          className="btn-sweep inline-flex min-h-[56px] items-center justify-center gap-2 whitespace-nowrap rounded-[16px] bg-forest px-[1.4em] text-[0.95rem] font-bold text-white shadow-btn hover:text-deep max-sm:col-span-2">
          <Icon name="search" />
          Search
          <span key={`${purpose}-${n}`} aria-hidden="true" title={`${n} ${noun}`}
            className="min-w-[24px] rounded-full bg-white/18 px-1.5 py-0.5 text-center text-[0.76rem] tabular-nums motion-safe:animate-[sh-fade-up_.35s_cubic-bezier(.16,1,.3,1)]">{n}</span>
        </button>
      </div>
      <p id="s-count" aria-live="polite" className="sr-only">{n} {noun} {n === 1 ? 'matches' : 'match'} these choices</p>
    </form>
  );
}
