'use client';

import { useRef } from 'react';
import { gsap, introDelay, loadScrollTrigger, markRevealed, MQ, motionAllowed, useGSAP } from '@/lib/gsap';

/**
 * Hero entrance + scroll parallax.
 * - Photo (LCP on desktop): never faded. Clip-path opens and the image eases from 1.15x to 1x.
 * - Supporting elements fade up after the headline (the subtitle stays static: it is the LCP on mobile).
 * - Desktop: scroll "settle": the frame shrinks and rounds, the photo drifts/zooms, the copy rises faster.
 * Pre-paint start states live in globals.css under `.motion-ok`, so there is no flash
 * and the server HTML is fully visible without JS or with reduced motion.
 */
export function HeroMotion({ children, className }: { children: React.ReactNode; className?: string }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const root = scope.current!;
    const media = root.querySelector<HTMLElement>('[data-hero-media]');
    const img = media?.querySelector('img');
    const parallax = root.querySelector<HTMLElement>('[data-hero-parallax]');
    const fades = Array.from(root.querySelectorAll<HTMLElement>('[data-hero-fade]'));
    const entering = [media, ...fades].filter((el): el is HTMLElement => !!el);
    let safety = 0;

    // One-shot entrance in a plain context (gsap.matchMedia is re-run by ScrollTrigger.refresh()).
    if (!motionAllowed()) {
      markRevealed(entering);
    } else {
      gsap.set(entering, { animation: 'none' });
      const finish = () => { markRevealed(entering); if (img) gsap.set(img, { clearProps: 'transform' }); };
      const wait = introDelay(); // play as the intro curtain lifts, if there is one
      const tl = gsap.timeline({ delay: wait, defaults: { ease: 'expo.out', lazy: false }, onComplete: finish });
      if (media) tl.fromTo(media, { clipPath: 'inset(6% 6% 6% 6% round 32px 32px 32px 140px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 32px 32px 32px 140px)', duration: 1.6 }, 0);
      if (img) tl.fromTo(img, { scale: 1.15 }, { scale: 1, duration: 2.2, ease: 'power3.out' }, 0);
      tl.fromTo(fades, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.09, ease: 'power3.out' }, 0.45);
      // Failsafe: if animation frames are paused (background tab), finish via a timer.
      safety = window.setTimeout(() => { if (tl.progress() < 1) { tl.kill(); finish(); } }, 3200 + wait * 1000);
    }

    // Continuous scroll parallax: desktop only; safe to re-run on refresh.
    const mm = gsap.matchMedia();
    mm.add(MQ.desktopMotion, (ctx) => {
      if (!parallax) return;
      let alive = true;
      // ScrollTrigger is fetched on demand (desktop only); add the tween to this context once loaded.
      const frame = root.querySelector<HTMLElement>('[data-hero-frame]');
      const copy = root.querySelector<HTMLElement>('[data-hero-copy]');
      loadScrollTrigger().then(() => alive && ctx.add(() => {
        // Scroll "settle": as the hero leaves, the photo frame shrinks a touch and rounds further
        // while the photo drifts and gently zooms inside it, and the copy rises a little faster.
        const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.6 } });
        tl.to(parallax, { yPercent: 6, scale: 1.06 }, 0);
        if (frame) tl.to(frame, { scale: 0.94, transformOrigin: '50% 30%' }, 0);
        if (media) tl.to(media, { borderRadius: '48px 48px 48px 190px' }, 0);
        if (copy) tl.to(copy, { yPercent: -10 }, 0); // move only: fading made the search card look disabled
      }));
      return () => { alive = false; };
    });
    return () => { window.clearTimeout(safety); mm.revert(); };
  }, { scope });

  return <div ref={scope} className={className}>{children}</div>;
}
