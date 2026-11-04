'use client';

import Link from 'next/link';
import { useState, useSyncExternalStore } from 'react';
import { Icon } from '@/components/icons';
import { everyMinute, openNow, parseHours } from '@/lib/hours';

/** Live office status chip from the CMS hours (Dubai time); claims nothing until hydrated. */
export function OfficeStatus({ hours }: { hours: string }) {
  const open = useSyncExternalStore(everyMinute, () => openNow(hours), () => null);
  const h = parseHours(hours);
  if (open === null || !h) return null;
  return (
    <span className={`inline-flex items-center gap-2 justify-self-start rounded-full soft-dark-inset px-3 py-1.5 text-[0.78rem] font-extrabold ${open ? 'text-[#6FD497]' : 'text-gold'}`}>
      <span aria-hidden="true" className={`size-2 rounded-full ${open ? 'bg-[#1FA855]' : 'bg-gold'}`} />
      {open ? `Office open · until ${h.closes}` : `Office closed · opens ${h.opens}`}
    </span>
  );
}

/**
 * Footer link columns. Desktop shows every column; on phones each title is a button that
 * folds its links open, so the footer stays short. Links are always in the HTML (SEO).
 */
export function FooterLinks({ cols }: { cols: [string, [string, string][]][] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <nav aria-label="Footer" className="grid gap-x-5 md:grid-cols-3 max-md:rounded-[22px] max-md:soft-dark-inset max-md:p-2">
      {cols.map(([title, links]) => {
        const on = open === title;
        const id = `fl-${title.toLowerCase()}`;
        return (
          <div key={title}>
            <h3 className="text-base text-white">
              <button type="button" aria-expanded={on} aria-controls={id} onClick={() => setOpen(on ? null : title)}
                className="flex w-full items-center justify-between rounded-2xl py-1 text-left max-md:px-3 max-md:py-3 md:pointer-events-none md:mb-2.5">
                {title}
                <Icon name="chevron" className={`size-4 text-deep-text transition-transform duration-300 md:hidden ${on ? 'rotate-180' : ''}`} />
              </button>
            </h3>
            <ul id={id} className={`max-md:px-3 max-md:pb-2 ${on ? '' : 'max-md:hidden'}`}>
              {links.map(([label, href]) => (
                <li key={href + label}><Link href={href} className="block py-1 text-[0.92rem] text-deep-text transition-colors hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export function BackToTop() {
  return (
    <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
      className="inline-flex items-center gap-2 rounded-full soft-dark-raised px-3.5 py-2 font-bold text-white transition-[color,box-shadow] hover:text-gold active:soft-dark-pressed">
      <Icon name="arrow" className="size-3.5 -rotate-90" />Back to top
    </button>
  );
}
