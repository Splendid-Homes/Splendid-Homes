'use client';

import { useRef } from 'react';
import { gsap, motionAllowed, useGSAP } from '@/lib/gsap';
import { onceInView } from '@/lib/inView';

/**
 * Number ticker. The final value is in the server HTML (SEO and no-JS safe);
 * it only counts up from zero when scrolled into view with motion allowed.
 * Keeps any prefix/suffix, e.g. "AED 6.2B", "4,800+", "12+".
 * Uses IntersectionObserver (no layout reads at hydration).
 */
export function CountUp({ value, className, duration = 1.8 }: { value: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = ref.current;
    const m = value.match(/^(\D*)([\d,]*\.?\d+)(.*)$/);
    if (!el || !m || !motionAllowed()) return;
    const [, prefix, num, suffix] = m;
    const target = parseFloat(num.replace(/,/g, ''));
    const decimals = (num.split('.')[1] ?? '').length;
    const fmt = (n: number) => prefix + n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;

    const stop = onceInView(el, () => {
      const counter = { n: 0 };
      el.textContent = fmt(0);
      gsap.to(counter, {
        n: target, duration, ease: 'power2.out',
        onUpdate: () => { el.textContent = fmt(counter.n); },
        onComplete: () => { el.textContent = value; },
      });
    }, '0px 0px -8% 0px');
    return () => { stop(); el.textContent = value; };
  }, { scope: ref, dependencies: [value] });

  return <span ref={ref} className={`tabular-nums ${className ?? ''}`}>{value}</span>;
}
