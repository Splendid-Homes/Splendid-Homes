'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Testimonial, TestimonialKind } from '@/data/types';

const KINDS: [TestimonialKind, string][] = [['buyer', 'Buyers'], ['seller', 'Sellers'], ['investor', 'Investors'], ['tenant', 'Tenants'], ['landlord', 'Landlords']];
const MAX = 6;
const initials = (name: string) => name.split(/[\s&]+/).filter(w => /^\p{L}/u.test(w)).slice(0, 2).map(w => w[0]).join('').toUpperCase();

/**
 * "Reviews from people like you": a pressed-in rail of client types (only types that have
 * reviews, with counts), the chosen one raised; raised review cards below with an outcome chip.
 * Each card leads with the home photo (CMS, optional) with the result chip on it; the client
 * photo (optional) replaces the initials. Desktop shows a grid, phones a swipe row.
 */
export function ReviewFilter({ items }: { items: Testimonial[] }) {
  const [kind, setKind] = useState<TestimonialKind | 'all'>('all');
  const kinds = KINDS.map(([k, label]) => ({ k, label, n: items.filter(t => t.kind === k).length })).filter(x => x.n);
  const shown = items.filter(t => kind === 'all' || t.kind === kind).slice(0, MAX);
  const chips = [{ k: 'all' as const, label: 'All', n: items.length }, ...kinds];
  return (
    <>
      {kinds.length > 1 && (
        <div role="group" aria-label="Show reviews from" className="inline-flex max-w-full gap-1.5 overflow-x-auto rounded-full soft-inset p-1.5 [scrollbar-width:none]">
          {chips.map(c => {
            const on = c.k === kind;
            return (
              <button key={c.k} type="button" aria-pressed={on} onClick={() => setKind(c.k)}
                className={`shrink-0 rounded-full px-[18px] py-2.5 text-[0.92rem] font-bold transition-[box-shadow,color,background-color] duration-300 ${on ? 'soft-raised-sm text-forest' : 'text-ink-2 hover:text-forest'}`}>
                {c.label}<span className="ml-1.5 text-[0.8rem] text-muted">{c.n}</span>
              </button>
            );
          })}
        </div>
      )}
      <ul key={kind} aria-live="polite"
        className="-mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-6 pt-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:p-0 lg:grid-cols-3">
        {shown.map((t, i) => (
          <li key={t.id} style={{ animationDelay: `${i * 60}ms` }}
            className="group flex w-[84%] shrink-0 snap-start flex-col rounded-[26px] soft-raised p-2.5 motion-safe:animate-[sh-fade-up_.5s_cubic-bezier(.16,1,.3,1)_both] md:w-auto">
            {t.img && (
              <span className="relative block h-[clamp(170px,15vw,200px)] overflow-hidden rounded-[18px]">
                <Image src={t.img} alt="" fill sizes="(min-width:1024px) 380px, (min-width:768px) 45vw, 84vw"
                  className="object-cover transition-[scale] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05]" />
                {t.outcome && <Outcome text={t.outcome} className="absolute bottom-3 left-3 bg-mist/92 shadow-[3px_3px_8px_rgba(18,38,26,.2)] backdrop-blur-md" />}
              </span>
            )}
            <div className="flex flex-1 flex-col gap-4 px-3.5 pb-3.5 pt-5">
              <span aria-hidden="true" className="h-[26px] font-serif text-[3.4rem] leading-[0.6] text-gold">&ldquo;</span>
              <blockquote className="text-[1.02rem] leading-relaxed text-ink-2">{t.text}</blockquote>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full soft-raised-sm font-extrabold text-forest">
                    {t.photo ? <Image src={t.photo} alt="" fill sizes="48px" className="object-cover" /> : initials(t.name)}
                  </span>
                  <span><b className="block">{t.name}</b><span className="text-[0.84rem] text-muted">{t.role}</span></span>
                </div>
                {t.outcome && !t.img && <Outcome text={t.outcome} className="soft-inset-sm" />}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function Outcome({ text, className }: { text: string; className: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.84rem] font-extrabold text-forest ${className}`}>
      <i aria-hidden="true" className="size-2 rounded-full bg-gold" />{text}
    </span>
  );
}
