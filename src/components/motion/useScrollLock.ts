'use client';

import { useLenis } from 'lenis/react';
import { useEffect } from 'react';

/** Stops smooth scrolling (and page scroll) while a modal or drawer is open. */
export function useScrollLock(locked: boolean) {
  const lenis = useLenis();
  useEffect(() => {
    if (!locked) return;
    lenis?.stop();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = prev;
    };
  }, [locked, lenis]);
}
