'use client';

import { ReactLenis, type LenisRef } from 'lenis/react';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useRef, useState, type RefObject } from 'react';
import { activeScrollTrigger, gsap } from '@/lib/gsap';

/**
 * Smooth wheel scrolling on desktop. Lenis is driven by gsap.ticker (autoRaf off)
 * and keeps ScrollTrigger in sync. On touch devices (where Lenis doesn't smooth
 * anyway) and for reduced-motion visitors, the frame loop is not attached at all,
 * so the main thread can go idle. The Lenis tree stays mounted either way.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const [smooth, setSmooth] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)');
    const sync = () => setSmooth(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!smooth) return;
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    const onScroll = () => activeScrollTrigger()?.update();
    const lenis = lenisRef.current?.lenis;
    lenis?.on('scroll', onScroll);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(update);
      lenis?.off('scroll', onScroll);
    };
  }, [smooth]);

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.1, smoothWheel: smooth }}>
      {/* Reads the URL, so it sits behind Suspense: the page itself never waits for it. */}
      <Suspense fallback={null}><RouteReset lenisRef={lenisRef} /></Suspense>
      {children}
    </ReactLenis>
  );
}

/** New route: jump to top and re-measure triggers once images have settled. */
function RouteReset({ lenisRef }: { lenisRef: RefObject<LenisRef | null> }) {
  const pathname = usePathname();
  useEffect(() => {
    if (lenisRef.current?.lenis) lenisRef.current.lenis.scrollTo(0, { immediate: true });
    const refresh = () => activeScrollTrigger()?.refresh();
    const id = window.setTimeout(refresh, 150);
    window.addEventListener('load', refresh, { once: true });
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('load', refresh);
    };
  }, [pathname, lenisRef]);
  return null;
}
