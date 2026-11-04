'use client';

import Image from 'next/image';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { everyMinute, openNow } from '@/lib/hours';

/**
 * Footer call-to-action copy with hooks: the last word of the headline flips through what
 * people come for, a live status chip (open now / back tomorrow, from the office hours) and
 * client proof from Site settings. Screen readers get the plain headline; reduced motion
 * keeps the word still.
 */
export function CtaHook({ hours, clients, sold, faces, text: T, words: WORDS }: {
  hours: string; clients: string; sold: string; faces: string[];
  text: { ctaTitle: string; ctaItalic: string; ctaOpen: string; ctaClosed: string; ctaDefault: string; ctaTrust: string }; words: string[];
}) {
  const [i, setI] = useState(0);
  // Re-checked every minute; the server and first paint claim nothing (null).
  const open = useSyncExternalStore(everyMinute, () => openNow(hours), () => null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => { if (!document.hidden) setI(n => (n + 1) % WORDS.length); }, 2400);
    return () => window.clearInterval(t);
  }, [WORDS.length]);

  return (
    <div>
      <p className="mb-3.5 inline-flex items-center gap-2 rounded-full soft-inset-sm py-1.5 pl-2.5 pr-3.5 text-[0.8rem] font-bold text-forest">
        <span className="relative grid size-2.5 place-items-center">
          {open !== false && <span className="absolute inset-0 rounded-full bg-[#1FA855] motion-safe:animate-ping" />}
          <span className={`relative size-2.5 rounded-full ${open === false ? 'bg-gold' : 'bg-[#1FA855]'}`} />
        </span>
        {open === false ? T.ctaClosed : open ? T.ctaOpen : T.ctaDefault}
      </p>
      <h2 className="mb-3 text-[clamp(1.7rem,3vw,2.6rem)]">
        {T.ctaTitle}{T.ctaItalic && <> <em>{T.ctaItalic}</em></>}{' '}
        <span className="sr-only">{WORDS[0]}</span>
        <span aria-hidden="true" className="relative inline-grid overflow-hidden pb-[0.12em] align-bottom">
          {WORDS.map((w, n) => (
            <span key={w} className={`relative col-start-1 row-start-1 justify-self-start whitespace-nowrap transition-[translate,opacity] duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${n === i ? 'translate-y-0 opacity-100' : n === (i + WORDS.length - 1) % WORDS.length ? '-translate-y-full opacity-0' : 'translate-y-full opacity-0'}`}>
              {w}
              {n === i && <span key={i} className="absolute inset-x-0 -bottom-[0.06em] h-[3px] origin-left rounded-full bg-gold motion-safe:animate-[sh-underline_2.4s_linear_both]" />}
            </span>
          ))}
        </span>
      </h2>
      <div className="flex flex-wrap items-center gap-3 text-ink-2">
        <span className="flex rounded-full soft-inset-sm p-1">
          {faces.map((src, n) => (
            <Image key={src} src={src} alt="" width={32} height={32} className={`size-8 rounded-full border-2 border-mist object-cover ${n ? '-ml-2.5' : ''}`} />
          ))}
        </span>
        <span>{T.ctaTrust.split(/(\{clients\}|\{sold\})/).map((bit, n) => bit === '{clients}' ? <b key={n} className="text-ink">{clients}</b> : bit === '{sold}' ? <b key={n} className="text-ink">{sold}</b> : bit)}</span>
      </div>
    </div>
  );
}
