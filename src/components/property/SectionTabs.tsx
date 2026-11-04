'use client';

import { useEffect, useState } from 'react';

/**
 * Sticky section tabs for the property page (soft UI): a pressed-in bar that stays in view while
 * scrolling (just under the site header, or at the very top once the header slides away), jumps
 * to each section and raises the tab of the section being read (scroll spy).
 * Plain in-page links, so it still works without JavaScript.
 */
export function SectionTabs({ items }: { items: { id: string; label: string }[] }) {
  const [on, setOn] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map(i => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(entries => {
      const seen = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (seen) setOn(seen.target.id);
    }, { rootMargin: '-180px 0px -55% 0px' });
    els.forEach(e => io.observe(e));
    return () => io.disconnect();
  }, [items]);
  return (
    <nav aria-label="On this page"
      className="prop-tabs sticky top-[96px] z-20 -mx-1 mb-6 flex gap-1 overflow-x-auto rounded-full bg-mist p-1.5 shadow-[inset_4px_4px_9px_rgba(18,38,26,.13),inset_-4px_-4px_9px_#fff,0_10px_24px_-18px_rgba(15,36,24,.5)] transition-[top] duration-500 ease-[cubic-bezier(.16,1,.3,1)] [scrollbar-width:none]">
      {items.map(i => (
        <a key={i.id} href={`#${i.id}`} aria-current={on === i.id ? 'location' : undefined}
          onClick={() => setOn(i.id)}
          className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[0.86rem] font-bold transition-[box-shadow,color] duration-300 ${on === i.id ? 'soft-raised-sm text-forest' : 'text-muted hover:text-forest'}`}>
          {i.label}
        </a>
      ))}
    </nav>
  );
}
