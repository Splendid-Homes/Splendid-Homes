'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Icon, type IconName } from '@/components/icons';

export type ServiceTab = { slug: string; name: string; icon: string; desc: string; points: string[]; img: string; wa: string };

/**
 * "What we do" (soft UI): a pressed-in rail of services on the left, the chosen one raised out
 * of it; the panel on the right shows its photo, description, key points (CMS) and two actions.
 * Hover or click picks a service on desktop; phones get a horizontal row of chips above the panel.
 * The rail is a real tab list (arrow keys move between tabs).
 */
export function ServiceTabs({ items }: { items: ServiceTab[] }) {
  const [cur, setCur] = useState(0);
  const s = items[cur];
  const onKey = (e: React.KeyboardEvent) => {
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (cur + d + items.length) % items.length;
    setCur(n);
    document.getElementById(`svc-tab-${items[n].slug}`)?.focus();
  };
  return (
    <div className="grid gap-[clamp(18px,2.4vw,28px)] lg:grid-cols-[340px_1fr]">
      <div role="tablist" aria-label="Services" aria-orientation="vertical" onKeyDown={onKey}
        className="flex gap-2 overflow-x-auto rounded-[28px] soft-inset p-2.5 [scrollbar-width:none] lg:flex-col lg:overflow-visible">
        {items.map((t, i) => {
          const on = i === cur;
          return (
            <button key={t.slug} id={`svc-tab-${t.slug}`} type="button" role="tab" aria-selected={on} aria-controls="svc-panel" tabIndex={on ? 0 : -1}
              onClick={() => setCur(i)} onPointerEnter={e => { if (e.pointerType === 'mouse') setCur(i); }}
              className={`flex shrink-0 items-center gap-3.5 rounded-[20px] p-2.5 pr-4 text-left font-bold transition-[box-shadow,color,background-color] duration-300 ${on ? 'soft-raised text-forest' : 'text-ink-2 hover:text-forest'}`}>
              <span className={`grid size-10 shrink-0 place-items-center rounded-full transition-[box-shadow,color] duration-300 ${on ? 'soft-raised-sm text-gold' : ''}`}>
                <Icon name={t.icon as IconName} className="size-[18px]" />
              </span>
              <span className="whitespace-nowrap lg:whitespace-normal">{t.name}</span>
            </button>
          );
        })}
      </div>

      <div id="svc-panel" role="tabpanel" aria-labelledby={`svc-tab-${s.slug}`}
        className="grid overflow-hidden rounded-[30px] soft-raised md:grid-cols-2 lg:min-h-[460px]">
        <div className="relative min-h-[220px]">
          {items.map((t, i) => (
            <Image key={t.slug} src={t.img} alt="" fill sizes="(min-width:1024px) 440px, (min-width:768px) 50vw, 100vw"
              className={`object-cover transition-[opacity,scale] duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${i === cur ? 'scale-100 opacity-100' : 'scale-[1.05] opacity-0'}`} />
          ))}
        </div>
        <div key={s.slug} className="flex flex-col p-[clamp(22px,3vw,36px)] motion-safe:animate-[sh-fade-up_.45s_cubic-bezier(.16,1,.3,1)]">
          <span className="mb-3.5 grid size-12 place-items-center rounded-full soft-raised-sm text-forest"><Icon name={s.icon as IconName} className="size-5" /></span>
          <h3 className="mb-2 text-[clamp(1.4rem,2.2vw,1.75rem)]">{s.name}</h3>
          <p className="mb-5 text-ink-2">{s.desc}</p>
          {s.points.length > 0 && (
            <ul className="mb-6 grid gap-2.5">
              {s.points.map(pt => (
                <li key={pt} className="flex items-center gap-2.5 rounded-[14px] soft-inset-sm px-3 py-2.5 text-[0.9rem] font-semibold">
                  <Icon name="check" className="size-4 shrink-0 text-gold" />{pt}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto flex flex-wrap gap-2.5">
            <a href={s.wa} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-[#127A3F] px-5 py-3 text-[0.9rem] font-bold text-white shadow-btn">
              <Icon name="wa" className="size-4" />WhatsApp a specialist
            </a>
            <Link href={`/services#${s.slug}`} className="group inline-flex items-center gap-2 rounded-full soft-raised-sm px-5 py-3 text-[0.9rem] font-bold text-forest active:soft-pressed">
              Learn more <Icon name="arrow" className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
