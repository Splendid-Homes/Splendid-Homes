'use client';

import Link from 'next/link';
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

export type ListingTab = { key: string; label: string; count: number; href: string; linkLabel: string; panel: ReactNode };

/**
 * "Available in …" on the community page: For sale / For rent / Off-plan tabs (soft UI: a pressed-in
 * tray with the chosen tab raised). Every panel stays in the HTML (inactive ones are `hidden`), so
 * all listing links remain crawlable. Arrow keys move between tabs.
 */
export function ListingTabs({ tabs }: { tabs: ListingTab[] }) {
  const [on, setOn] = useState(tabs[0]?.key);
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (e: KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + tabs.length) % tabs.length;
    setOn(tabs[next].key);
    refs.current[next]?.focus();
  };
  const current = tabs.find(t => t.key === on) ?? tabs[0];
  return (
    <>
      <div role="tablist" aria-label="Listing type" className="mb-[clamp(20px,2.6vw,30px)] inline-flex flex-wrap gap-1.5 rounded-full soft-inset p-1.5">
        {tabs.map((t, i) => (
          <button key={t.key} ref={el => { refs.current[i] = el; }} type="button" role="tab" id={`${id}-${t.key}`} aria-controls={`${id}-${t.key}-panel`}
            aria-selected={t.key === on} tabIndex={t.key === on ? 0 : -1} onClick={() => setOn(t.key)} onKeyDown={e => move(e, i)}
            className={`rounded-full px-4 py-2.5 text-[0.88rem] font-extrabold transition-[box-shadow,color] duration-300 ${t.key === on ? 'soft-raised-sm text-forest' : 'text-muted hover:text-forest'}`}>
            {t.label}<span className="ml-1.5 text-[0.74rem] text-leaf">{t.count}</span>
          </button>
        ))}
      </div>
      {tabs.map(t => (
        <div key={t.key} role="tabpanel" id={`${id}-${t.key}-panel`} aria-labelledby={`${id}-${t.key}`} hidden={t.key !== on}>
          {t.panel}
        </div>
      ))}
      {current && (
        <p className="mt-6 text-right">
          <Link href={current.href} className="font-bold text-forest underline-offset-4 hover:underline">{current.linkLabel} →</Link>
        </p>
      )}
    </>
  );
}
