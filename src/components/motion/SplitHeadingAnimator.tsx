'use client';

import { useRef } from 'react';
import { gsap, introDelay, markRevealed, motionAllowed, useGSAP } from '@/lib/gsap';
import { onceInView } from '@/lib/inView';

/**
 * Plays the masked word reveal once.
 * - 'load' (hero): animates right away, with a timer failsafe.
 * - 'scroll': waits for an IntersectionObserver (no layout reads at hydration).
 * Hydration only adds one class (`split-armed`) to cancel the CSS failsafe; no per-word writes.
 */
export function SplitHeadingAnimator({ children, trigger, delay }: { children: React.ReactNode; trigger: 'load' | 'scroll'; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const root = ref.current;
    const words = root?.querySelectorAll<HTMLElement>('[data-split-line]');
    if (!root || !words?.length) return;
    if (!motionAllowed()) { words.forEach(w => w.setAttribute('data-revealed', '')); return; }

    const heading = root.firstElementChild as HTMLElement | null;
    heading?.classList.add('split-armed');
    const done = () => { markRevealed(words); heading?.classList.remove('split-armed'); };
    let tween: gsap.core.Tween | undefined;
    const play = (wait = 0) => {
      tween = gsap.fromTo(words, { yPercent: 105 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.06, delay: delay + wait, lazy: false, onComplete: done });
    };

    if (trigger === 'load') {
      const wait = introDelay(); // hero headline rises as the intro curtain lifts
      play(wait);
      // Failsafe for paused animation frames (background tab): never leave the headline hidden.
      const safety = window.setTimeout(() => { if (!tween || tween.progress() < 1) { tween?.kill(); done(); } }, 3200 + wait * 1000);
      return () => window.clearTimeout(safety);
    }
    return onceInView(root.firstElementChild ?? root, () => play());
  }, { scope: ref });

  return <div ref={ref} className="contents">{children}</div>;
}
