'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/icons';
import { Price } from '@/components/ui/Price';

export type CoverCommunity = { slug: string; name: string; tag: string; img: string; roi: number; avgSale: number; avgRent: number };

/**
 * "Where to live" coverflow: the centre community is large with its yield, price and rent; the
 * neighbours tilt back in 3D on either side. Arrows, dots, keyboard (← →), swipe/drag and
 * clicking a side card move it; clicking the centre card opens the community. Two neighbours
 * show each side on desktop, one on phones. Reduced motion: no tilt, instant moves.
 */
export function CommunityCoverflow({ items }: { items: CoverCommunity[] }) {
  const [cur, setCur] = useState(0);
  const n = items.length;
  const go = (i: number) => setCur(((i % n) + n) % n);
  const drag = useRef<number | null>(null);
  const root = useRef<HTMLDivElement>(null);

  // Arrow keys while the carousel (or something inside it) has focus.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); setCur(c => (c - 1 + n) % n); }
      if (e.key === 'ArrowRight') { e.preventDefault(); setCur(c => (c + 1) % n); }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [n]);

  return (
    <div ref={root} role="region" aria-roledescription="carousel" aria-label="Popular communities">
      <div className="cover-stage"
        onPointerDown={e => { drag.current = e.clientX; }}
        onPointerUp={e => {
          if (drag.current === null) return;
          const dx = e.clientX - drag.current; drag.current = null;
          if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
        }}>
        {items.map((c, i) => {
          let o = i - cur;
          if (o > n / 2) o -= n;
          if (o < -n / 2) o += n;
          const a = Math.abs(o), centre = o === 0;
          return (
            <div key={c.slug} className="cover-card" data-centre={centre ? '' : undefined}
              aria-hidden={!centre} style={{ '--o': o, '--a': a, zIndex: 10 - a, opacity: a > 2 ? 0 : 1, pointerEvents: a > 2 ? 'none' : undefined } as React.CSSProperties}>
              <Image src={c.img} alt="" fill sizes="(min-width:1024px) 440px, 78vw" loading={a <= 2 ? 'eager' : 'lazy'} className="object-cover" />
              <span className="cover-shade" />
              {centre ? (
                <Link href={`/community/${c.slug}`} data-cursor="Explore" className="absolute inset-0 z-[2]" aria-label={`${c.name}: ${c.roi}% rental yield`} draggable={false} />
              ) : (
                <button type="button" tabIndex={-1} onClick={() => go(i)} className="absolute inset-0 z-[2]" aria-label={`Show ${c.name}`} />
              )}
              <div className="cover-info">
                <span className="mb-2 inline-block rounded-full bg-white/16 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] backdrop-blur-sm">{c.tag}</span>
                <h3 className="text-[clamp(1.5rem,2.4vw,1.9rem)] text-white">{c.name}</h3>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <dl className="flex gap-5 text-[0.76rem]">
                    <div><dt className="text-white/70">Yield</dt><dd className="text-[1.05rem] font-bold text-gold">{c.roi}%</dd></div>
                    <div><dt className="text-white/70">Avg. price</dt><dd className="text-[1.05rem] font-bold"><Price aed={c.avgSale} /><small className="font-semibold text-white/70">/sqft</small></dd></div>
                    <div className="max-sm:hidden"><dt className="text-white/70">Avg. rent</dt><dd className="text-[1.05rem] font-bold"><Price aed={c.avgRent} compact /><small className="font-semibold text-white/70">/yr</small></dd></div>
                  </dl>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-forest"><Icon name="arrow" className="size-4" /></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-center gap-4">
        <button type="button" onClick={() => go(cur - 1)} aria-label="Previous community"
          className="grid size-12 place-items-center rounded-full soft-raised text-forest active:soft-pressed"><Icon name="arrow" className="size-4 rotate-180" /></button>
        <div className="flex gap-2 rounded-full soft-inset-sm px-3 py-2.5">
          {items.map((c, i) => (
            <button key={c.slug} type="button" onClick={() => go(i)} aria-label={`Go to ${c.name}`} aria-current={i === cur ? 'true' : undefined}
              className={`h-2 rounded-full transition-[width,background-color] duration-300 ${i === cur ? 'w-6 bg-forest' : 'w-2 bg-line-strong hover:bg-leaf'}`} />
          ))}
        </div>
        <button type="button" onClick={() => go(cur + 1)} aria-label="Next community"
          className="grid size-12 place-items-center rounded-full soft-raised text-forest active:soft-pressed"><Icon name="arrow" className="size-4" /></button>
      </div>
      <p className="sr-only" aria-live="polite">{items[cur].name}, {items[cur].roi}% rental yield</p>
    </div>
  );
}
