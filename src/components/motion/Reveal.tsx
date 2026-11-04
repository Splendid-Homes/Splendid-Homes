'use client';

import { useRef } from 'react';
import { gsap, motionAllowed, useGSAP } from '@/lib/gsap';
import { onceInView } from '@/lib/inView';

type Props = {
  children: React.ReactNode;
  as?: 'div' | 'section' | 'li' | 'ul' | 'article';
  className?: string;
  /** Animate direct children one after another instead of the wrapper. */
  stagger?: number;
  y?: number;
  delay?: number;
};

/**
 * Fades/slides content in when it scrolls into view.
 * Server HTML is fully visible. Content is only hidden once the IntersectionObserver
 * reports it as entering (so it is never hidden while off-screen or without JS).
 */
export function Reveal({ children, as: Tag = 'div', className, stagger, y = 28, delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el || !motionAllowed()) return;
    const targets = stagger ? Array.from(el.children) : [el];
    return onceInView(el, () => {
      gsap.fromTo(targets, { autoAlpha: 0, y }, {
        autoAlpha: 1, y: 0, duration: 0.9, delay, stagger: stagger ?? 0, ease: 'power3.out', clearProps: 'opacity,visibility,transform',
      });
    }, '0px 0px 8% 0px'); // fire just before it enters, so it never flashes visible-then-hidden
  }, { scope: ref });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Tag ref={ref as any} className={className}>{children}</Tag>;
}
