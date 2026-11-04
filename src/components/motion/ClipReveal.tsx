'use client';

import { useEffect, useRef } from 'react';
import { motionAllowed } from '@/lib/gsap';

/** Longest reveal animation in globals.css (sh-img-settle, 1.9s) plus a small margin. */
const REVEAL_MS = 2000;

type Props = {
  children: React.ReactNode;
  as?: 'div' | 'ul' | 'ol';
  className?: string;
  /** Reveal the wrapper itself instead of each direct child. */
  self?: boolean;
  /** Seconds between items that enter the viewport together. */
  stagger?: number;
};

/**
 * Clip-path "rise" reveal for cards and media, staggered per batch of items that
 * enter the viewport together. Pure CSS animation (see globals.css), no GSAP.
 *
 * Server HTML is fully visible. An item is only armed (clipped) when its section
 * is still entirely below the viewport after hydration, so nothing on screen ever
 * disappears; groups already in view simply stay static. Once an item has played,
 * the attribute is removed so hover shadows/transforms are never clipped.
 * Images inside an item marked `data-reveal-img` settle from a slight zoom.
 */
export function ClipReveal({ children, as: Tag = 'div', className, self, stagger = 0.09 }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !motionAllowed() || typeof IntersectionObserver === 'undefined') return;
    const items = (self ? [root] : Array.from(root.children)) as HTMLElement[];

    const timers: number[] = [];
    const finish = (el: HTMLElement) => { delete el.dataset.reveal; el.style.removeProperty('--d'); };
    const reveal = new IntersectionObserver(entries => {
      let i = 0;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        const delay = i++ * stagger;
        reveal.unobserve(el);
        el.style.setProperty('--d', `${delay.toFixed(2)}s`);
        el.dataset.reveal = 'in';
        // A timer, not animationend: events are not dispatched reliably inside
        // content-visibility subtrees that scroll away mid-animation.
        timers.push(window.setTimeout(() => finish(el), (delay + REVEAL_MS / 1000) * 1000));
      }
    }, { rootMargin: '0px 0px -10% 0px' });

    // Decide once, from the section's own box (never inside a skipped content-visibility subtree).
    const anchor = root.closest('section') ?? root;
    const arm = new IntersectionObserver(([e]) => {
      arm.disconnect();
      if (e.boundingClientRect.top <= window.innerHeight) return;
      for (const el of items) { el.dataset.reveal = 'armed'; reveal.observe(el); }
    });
    arm.observe(anchor);

    return () => { arm.disconnect(); reveal.disconnect(); timers.forEach(clearTimeout); items.forEach(finish); };
  }, [self, stagger]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Tag ref={ref as any} className={className}>{children}</Tag>;
}
