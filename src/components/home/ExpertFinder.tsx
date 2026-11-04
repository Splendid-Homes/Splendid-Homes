'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Icon } from '@/components/icons';
import { SoftSelect } from '@/components/ui/SoftSelect';
import type { Agent } from '@/data/types';
import { waHref } from '@/lib/site';

const MAX = 4;
const ANY = '';
// Each label stays beside its dropdown; on phones the pairs stack, full width.
const pair = 'flex items-center gap-3 max-sm:w-full';
const cap = 'shrink-0 pl-2 text-[0.76rem] font-extrabold uppercase tracking-[0.06em] text-muted max-sm:w-[88px]';

/**
 * "Find your expert" (soft UI): pick a language and an area, the matching agents show as raised
 * cards with their RERA BRN, languages and WhatsApp / call buttons. Options come from the agents'
 * own languages and specialties in the CMS. Desktop grid; phones swipe.
 */
export function ExpertFinder({ agents }: { agents: Agent[] }) {
  const [lang, setLang] = useState(ANY);
  const [area, setArea] = useState(ANY);
  const langs = [...new Set(agents.flatMap(a => a.languages))].sort();
  const areas = [...new Set(agents.flatMap(a => a.specialties))].sort();
  const match = agents.filter(a => (!lang || a.languages.includes(lang)) && (!area || a.specialties.includes(area)));
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-[26px] soft-inset p-2.5">
        <SoftSelect variant="pill" label="I speak" labelClassName={cap} className={pair} value={lang} onChange={setLang}
          options={[{ value: ANY, label: 'Any language' }, ...langs.map(l => ({ value: l, label: l, meta: String(agents.filter(a => a.languages.includes(l) && (!area || a.specialties.includes(area))).length) }))]} />
        <SoftSelect variant="pill" label="Looking at" labelClassName={cap} className={pair} value={area} onChange={setArea}
          options={[{ value: ANY, label: 'Any area' }, ...areas.map(s => ({ value: s, label: s, meta: String(agents.filter(a => a.specialties.includes(s) && (!lang || a.languages.includes(lang))).length) }))]} />
        <span aria-live="polite" className="ml-auto pr-2.5 text-[0.9rem] font-bold text-muted max-sm:w-full max-sm:pl-2">
          {match.length} expert{match.length === 1 ? '' : 's'}
        </span>
      </div>

      {match.length ? (
        <ul key={`${lang}|${area}`}
          className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-6 pt-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:p-0 lg:grid-cols-4">
          {match.slice(0, MAX).map((a, i) => (
            <li key={a.id} style={{ animationDelay: `${i * 60}ms` }}
              className="group relative flex w-[78%] shrink-0 snap-start flex-col rounded-[26px] soft-raised p-2.5 motion-safe:animate-[sh-fade-up_.5s_cubic-bezier(.16,1,.3,1)_both] md:w-auto">
              <span className="relative block h-[250px] overflow-hidden rounded-[18px]">
                <Image src={a.img} alt={`${a.name}, ${a.title}`} fill sizes="(min-width:1024px) 280px, (min-width:768px) 45vw, 78vw"
                  className="object-cover transition-[scale] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05]" />
                <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-mist/92 px-2.5 py-1.5 text-[0.72rem] font-extrabold text-forest backdrop-blur-md">
                  <Icon name="shield" className="size-3.5 text-gold" />RERA BRN {a.brn}
                </span>
              </span>
              <div className="flex flex-1 flex-col gap-2.5 px-2 pb-2 pt-4">
                <h3 className="text-[1.1rem] transition-colors group-hover:text-forest">
                  <Link href={`/team/${a.slug}`} className="after:absolute after:inset-0 after:content-['']">{a.name}</Link>
                </h3>
                <p className="-mt-1.5 text-[0.86rem] text-muted">{a.title}</p>
                <p className="flex flex-wrap gap-1.5">
                  {a.languages.map(l => (
                    <span key={l} className={`rounded-full px-2.5 py-1 text-[0.74rem] font-bold ${l === lang ? 'soft-raised-sm text-forest' : 'soft-inset-sm text-ink-2'}`}>{l}</span>
                  ))}
                </p>
                <div className="relative z-[1] mt-auto flex gap-2 pt-1">
                  <a href={waHref(a.phone, `Hi ${a.name.split(' ')[0]}, I found you on the Splendid Homes website.`)} target="_blank" rel="noopener"
                    aria-label={`WhatsApp ${a.name}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#127A3F] px-3 py-2.5 text-[0.86rem] font-bold text-white shadow-btn">
                    <Icon name="wa" className="size-4" />WhatsApp
                  </a>
                  <a href={`tel:${a.phone.replace(/\s/g, '')}`} aria-label={`Call ${a.name}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full soft-raised-sm px-3 py-2.5 text-[0.86rem] font-bold text-forest active:soft-pressed">
                    <Icon name="phone" className="size-4" />Call
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-[26px] soft-raised p-8 text-center">
          <p className="mb-4 text-ink-2">No one matches both yet. Try any area, or ask us and we will pair you with the right person.</p>
          <button type="button" onClick={() => setArea(ANY)} className="rounded-full soft-raised-sm px-5 py-3 font-bold text-forest active:soft-pressed">Show any area</button>
        </div>
      )}
      {match.length > MAX && (
        <p className="mt-5 text-center text-[0.9rem] text-muted md:mt-6">
          Showing {MAX} of {match.length}. <Link href="/team" className="font-bold text-forest underline underline-offset-2">See the full team</Link>
        </p>
      )}
    </>
  );
}
