'use client';

import { useState } from 'react';

type Item = { id: string; tags: string[]; card: React.ReactNode };

const KINDS: [string, string][] = [['fitted', 'Fitted office'], ['shell', 'Shell & core'], ['lease', 'For lease'], ['sale', 'For sale']];

/**
 * Commercial listings (soft UI): a pressed-in row of space-type chips with counts (only types that
 * have offices), then the cards. Cards are rendered on the server and passed in; filtering hides them.
 * `extra` (the "need something specific" tile) always stays at the end.
 */
export function OfficeFilter({ items, extra }: { items: Item[]; extra: React.ReactNode }) {
  const [on, setOn] = useState<string | null>(null);
  const kinds = KINDS.map(([k, l]) => ({ k, l, n: items.filter(i => i.tags.includes(k)).length })).filter(x => x.n);
  const chip = (a: boolean) => `shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[0.86rem] font-bold transition-[box-shadow,color] duration-300 ${a
    ? 'soft-inset-sm text-forest before:mr-1.5 before:inline-block before:size-[7px] before:rounded-full before:bg-gold before:align-middle before:content-[\'\']'
    : 'soft-raised-sm text-ink-2 hover:text-forest'}`;
  const shown = items.filter(i => !on || i.tags.includes(on));
  return (
    <>
      {kinds.length > 0 && (
        <div role="group" aria-label="Filter by space type" className="-mx-1 mb-6 flex gap-2 overflow-x-auto rounded-full soft-inset p-2 [scrollbar-width:none]">
          <button type="button" aria-pressed={!on} onClick={() => setOn(null)} className={chip(!on)}>All space <span className="ml-1 text-[0.78rem] text-muted">{items.length}</span></button>
          {kinds.map(x => (
            <button key={x.k} type="button" aria-pressed={on === x.k} onClick={() => setOn(on === x.k ? null : x.k)} className={chip(on === x.k)}>
              {x.l} <span className="ml-1 text-[0.78rem] text-muted">{x.n}</span>
            </button>
          ))}
        </div>
      )}
      <p aria-live="polite" className="sr-only">{shown.length} offices shown</p>
      <div className="grid gap-[clamp(18px,2.4vw,26px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr))]">
        {items.map(i => <div key={i.id} hidden={!shown.includes(i)} className="grid">{i.card}</div>)}
        {extra}
      </div>
    </>
  );
}
