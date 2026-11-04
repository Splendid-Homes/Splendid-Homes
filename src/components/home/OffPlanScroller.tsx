'use client';

import { useRef } from 'react';
import { gsap, loadScrollTrigger, MQ, useGSAP } from '@/lib/gsap';

/**
 * Off-plan band as a horizontal gallery (homepage round 2, item 8).
 * Desktop pointers: the section pins and vertical scrolling slides the track sideways, with
 * card photos drifting inside their frames, a slight lean with scroll speed, and a gold
 * progress line + counter. Everywhere else (and with reduced motion) it is a native swipe row
 * with snap points; the same progress line follows the swipe.
 */
export function OffPlanScroller({ total, children }: { total: number; children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  const show = (progress: number) => {
    gsap.set(bar.current, { scaleX: Math.max(0.02, progress) });
    if (count.current) count.current.textContent = String(Math.min(total, Math.floor(progress * total) + 1)).padStart(2, '0');
  };

  useGSAP(() => {
    const vp = viewport.current!, tr = track.current!;
    // Swipe row (phones, tablets, reduced motion): progress follows the native scroll.
    let pinned = false;
    const onScroll = () => { const max = vp.scrollWidth - vp.clientWidth; if (!pinned && max > 0) show(vp.scrollLeft / max); };
    vp.addEventListener('scroll', onScroll, { passive: true });
    show(0);

    const mm = gsap.matchMedia();
    mm.add(MQ.desktopMotion, (ctx) => {
      let alive = true;
      loadScrollTrigger().then(() => alive && ctx.add(() => {
        const section = root.current!.closest('section')!;
        const cards = gsap.utils.toArray<HTMLElement>('[data-hcard]', tr);
        const distance = () => tr.scrollWidth - vp.clientWidth;
        pinned = true;
        // Snapping would otherwise shift the hidden-overflow track to its first snap point.
        gsap.set(vp, { overflow: 'hidden', scrollSnapType: 'none' });
        vp.scrollLeft = 0;
        const lean = gsap.quickTo(cards, 'skewX', { duration: 0.5, ease: 'power3.out' });
        let settle = 0;
        const slide = gsap.to(tr, {
          x: () => -distance(), ease: 'none',
          scrollTrigger: {
            trigger: section, start: 'center center', end: () => `+=${distance()}`,
            pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
            onUpdate: self => {
              show(self.progress);
              lean(gsap.utils.clamp(-4, 4, self.getVelocity() / -450));
              window.clearTimeout(settle);
              settle = window.setTimeout(() => lean(0), 140);
            },
          },
        });
        // Each photo drifts inside its frame as its card crosses the screen.
        cards.forEach(card => {
          const img = card.querySelector('img');
          if (img) gsap.fromTo(img, { xPercent: -7, scale: 1.16 }, {
            xPercent: 7, scale: 1.16, ease: 'none',
            scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true },
          });
        });
        return () => { pinned = false; window.clearTimeout(settle); };
      }));
      return () => { alive = false; };
    });
    return () => { vp.removeEventListener('scroll', onScroll); mm.revert(); };
  }, { scope: root });

  return (
    <div ref={root}>
      <div ref={viewport}
        className="snap-x snap-mandatory scroll-px-[max(16px,calc((100%_-_1240px)/2))] overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div ref={track} className="flex w-max gap-[clamp(14px,2vw,28px)] px-[max(16px,calc((100%_-_1240px)/2))] will-change-transform">
          {children}
        </div>
      </div>
      <div className="wrap mt-[clamp(24px,3vw,40px)] flex items-center gap-5 text-[0.85rem] font-semibold text-white/80">
        <span className="tabular-nums"><span ref={count} className="text-white">01</span> / {String(total).padStart(2, '0')}</span>
        <span className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-white/15">
          <span ref={bar} className="absolute inset-0 origin-left scale-x-[0.02] rounded-full bg-gold" />
        </span>
        <span className="max-lg:hidden">Scroll to explore</span>
        <span className="lg:hidden">Swipe to explore</span>
      </div>
    </div>
  );
}
