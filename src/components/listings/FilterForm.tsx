'use client';

import { SoftSelect } from '@/components/ui/SoftSelect';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Icon } from '@/components/icons';
import type { Purpose } from '@/data/types';
import { BEDS, FURNISHING, shortAed, SORTS, STATUS, TYPES, type Filters, type SortKey } from '@/lib/listings';

type Values = Record<'q' | 'community' | 'type' | 'beds' | 'min' | 'max' | 'status' | 'furnishing' | 'sort', string>;
const toValues = (f: Filters, defaultSort: SortKey): Values => ({
  q: f.q ?? '', community: f.community ?? '', type: f.type ?? '', beds: f.beds ?? '', min: f.min ? String(f.min) : '',
  max: f.max ? String(f.max) : '', status: f.status ?? '', furnishing: f.furnishing ?? '', sort: f.sort ?? defaultSort,
});

const control = 'w-full rounded-field border-0 soft-inset px-3.5 py-3 text-base text-ink outline-none transition-shadow focus:outline-solid focus:outline-2 focus:outline-gold/60 lg:py-2.5 lg:text-[0.9rem]';

/**
 * Listing filters (F04). A plain GET form, so it works without JavaScript; with JS, each change
 * updates the URL in place (router.replace) and the server re-renders the results.
 * Controlled fields keep keyboard focus while results refresh. Results passed as children
 * are dimmed while a change is loading.
 */
export function FilterForm({ purpose, filters, communities, activeCount, steps, defaultSort, children }: {
  purpose: Purpose; filters: Filters; communities: [string, string][]; activeCount: number; steps: number[]; defaultSort: SortKey; children: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState(() => toValues(filters, defaultSort));
  const [prev, setPrev] = useState(filters);
  if (prev !== filters) { setPrev(filters); setV(toValues(filters, defaultSort)); } // URL changed elsewhere (chip, back button)

  const apply = (next: Values) => {
    const qs = new URLSearchParams();
    for (const [k, val] of Object.entries(next)) if (val.trim() && !(k === 'sort' && val === defaultSort)) qs.set(k, val.trim());
    start(() => router.replace(`/${purpose}${qs.size ? `?${qs}` : ''}`, { scroll: false }));
  };
  const set = (k: keyof Values) => (val: string) => { const next = { ...v, [k]: val }; setV(next); apply(next); };
  const sel = (k: keyof Values, label: string, opts: [string, string][], any: string) => (
    <SoftSelect variant="filter" label={label} name={k} value={v[k]} onChange={set(k)}
      options={[{ value: '', label: any }, ...opts.map(([val, text]) => ({ value: val, label: text }))]} />
  );

  return (
    <>
      <form method="get" action={`/${purpose}`} role="search" aria-label={`Filter properties for ${purpose === 'rent' ? 'rent' : 'sale'}`}
        onSubmit={e => { e.preventDefault(); apply(v); setOpen(false); }}
        className="rounded-[24px] soft-card bg-white p-3 sm:p-4">
        <div className="flex gap-2.5">
          <div className="relative flex-1">
            <label htmlFor="f-q" className="sr-only">Search by tower, community or reference</label>
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted" />
            <input id="f-q" name="q" type="search" value={v.q} onChange={e => setV({ ...v, q: e.target.value })}
              placeholder="Tower, community or ref…" enterKeyHint="search" className={`${control} pl-10`} />
          </div>
          <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="filter-panel"
            className="inline-flex shrink-0 items-center gap-2 rounded-field soft-raised px-4 font-bold active:soft-pressed lg:hidden">
            <Icon name="layers" className="size-[18px]" /> Filters{activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-forest text-[0.72rem] text-white">{activeCount}</span>}
          </button>
          <button className="shrink-0 rounded-field bg-forest px-5 font-bold text-white max-lg:hidden">Search</button>
        </div>
        <div id="filter-panel" className={`mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-7 ${open ? '' : 'max-lg:hidden'}`}>
          {sel('community', 'Community', communities, 'All areas')}
          {sel('type', 'Property type', TYPES.map(t => [t, t]), 'All types')}
          {sel('beds', 'Bedrooms', BEDS.map(b => [b, b === '0' ? 'Studio' : `${b} Bed${b === '1' ? '' : 's'}`]), 'Any beds')}
          {sel('min', 'Minimum price', steps.map(n => [String(n), `Min AED ${shortAed(n)}`]), 'No min')}
          {sel('max', 'Maximum price', steps.map(n => [String(n), `Max AED ${shortAed(n)}`]), 'No max')}
          {purpose === 'buy' ? sel('status', 'Completion status', STATUS.map(s => [s, s]), 'Any status') : sel('furnishing', 'Furnishing', FURNISHING.map(s => [s, s]), 'Furnishing')}
          <SoftSelect variant="filter" label="Sort by" name="sort" value={v.sort} onChange={set('sort')}
            options={Object.entries(SORTS).map(([k, label]) => ({ value: k, label }))} />
          <button className="col-span-2 rounded-field bg-forest py-3 font-bold text-white sm:col-span-3 lg:hidden">Show results</button>
        </div>
      </form>
      <div aria-busy={pending} className={`transition-opacity duration-300 ${pending ? 'pointer-events-none opacity-55' : ''}`}>{children}</div>
    </>
  );
}
