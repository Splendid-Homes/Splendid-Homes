'use client';

import { useEffect, useRef, useState } from 'react';

const WORD = 'SPLENDID';

/**
 * Oversized footer wordmark (homepage round 1, item 13): SPLENDID with a smaller ruled HOMES
 * line under it, echoing the logo lockup. Letters rise one by one out of a masked line each
 * time the bottom of the footer scrolls into view, then the rules draw out and HOMES rises; the fill
 * is a soft ivory-to-gold sheen. Decorative only (aria-hidden): the brand name is already in
 * the footer logo. CSS transitions only, so it costs nothing on phones; reduced motion shows it static.
 */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Plays when 35% is visible; resets once fully out of view, so it replays on every visit.
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio >= 0.35) setInView(true);
      else if (!e.isIntersecting) setInView(false);
    }, { threshold: [0, 0.35] });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} aria-hidden="true" data-in={inView ? '' : undefined}
      className="footer-mark wrap select-none pb-[clamp(24px,4vw,56px)] pt-[clamp(8px,2vw,28px)] font-logo font-semibold">
      <div className="flex justify-between overflow-hidden text-[clamp(56px,15.2vw,232px)] leading-[0.78]">
        {[...WORD].map((ch, i) => (
          <span key={i} style={{ '--i': i } as React.CSSProperties} className="footer-mark-letter inline-block">{ch}</span>
        ))}
      </div>
      <div className="mt-[clamp(10px,1.6vw,24px)] flex items-center gap-[clamp(14px,2.4vw,36px)] overflow-hidden text-[clamp(13px,2.4vw,36px)] font-medium leading-none">
        <i className="footer-mark-rule h-px flex-1 origin-right" />
        <span className="footer-mark-sub -mr-[0.6em] tracking-[0.6em]">HOMES</span>
        <i className="footer-mark-rule h-px flex-1 origin-left" />
      </div>
    </div>
  );
}
