'use client';

import { useRef } from 'react';
import { gsap, loadScrollTrigger, MQ, useGSAP } from '@/lib/gsap';

/**
 * Gentle scroll parallax for an image inside an overflow-hidden frame.
 * Wrap a next/image (fill) in this; the inner layer is oversized so edges never show.
 * Desktop + motion-allowed only.
 */
export function ParallaxImage({ children, className = '', amount = 8 }: { children: React.ReactNode; className?: string; amount?: number }) {
  const frame = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.desktopMotion, (ctx) => {
      let alive = true;
      loadScrollTrigger().then(() => alive && ctx.add(() => {
        gsap.fromTo(layer.current, { yPercent: -amount / 2 }, {
          yPercent: amount / 2, ease: 'none',
          scrollTrigger: { trigger: frame.current, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      }));
      return () => { alive = false; };
    });
    return () => mm.revert();
  }, { scope: frame });

  return (
    <div ref={frame} className={`relative overflow-hidden ${className}`}>
      <div ref={layer} className="absolute -inset-y-[6%] inset-x-0">{children}</div>
    </div>
  );
}
