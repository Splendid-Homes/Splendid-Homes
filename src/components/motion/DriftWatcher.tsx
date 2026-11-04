'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Background light drift. Renders the page-wide layer (behind every page's plain areas, so the
 * glow shows on all pages) and runs the section glows (mist sections, `.drift-dark`) only while
 * they are on screen. Opaque mist sections cover the page layer, so the two never double up.
 */
export function DriftWatcher() {
  const path = usePathname();
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('main section.bg-mist, .drift-dark');
    const io = new IntersectionObserver(entries => {
      for (const e of entries) (e.target as HTMLElement).toggleAttribute('data-drift-on', e.isIntersecting);
    }, { rootMargin: '100px 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [path]);
  return <div aria-hidden="true" className="page-drift" />;
}
