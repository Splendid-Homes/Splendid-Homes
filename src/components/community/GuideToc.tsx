'use client';

import { useEffect, useState } from 'react';

/**
 * Sticky "On this page" menu beside the community guide (desktop only). The entry for the section
 * nearest the top of the screen is raised; links jump to each section.
 */
export function GuideToc({ title, items }: { title: string; items: { id: string; label: string }[] }) {
  const [on, setOn] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map(i => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(entries => {
      for (const e of entries) seen.set(e.target.id, e.isIntersecting);
      const first = items.find(i => seen.get(i.id));
      if (first) setOn(first.id);
    }, { rootMargin: '-110px 0px -55% 0px' });
    els.forEach(e => io.observe(e));
    return () => io.disconnect();
  }, [items]);
  return (
    <nav aria-label="On this page" className="rounded-[24px] soft-inset p-4">
      <p className="mb-2.5 px-2.5 text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-muted">{title}</p>
      <ul className="grid gap-1">
        {items.map(i => (
          <li key={i.id}>
            <a href={`#${i.id}`} aria-current={on === i.id ? 'true' : undefined}
              className={`flex items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-[0.86rem] font-bold transition-[box-shadow,color] duration-300 ${on === i.id ? 'soft-raised-sm text-forest' : 'text-ink-2 hover:text-forest'}`}>
              <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${on === i.id ? 'bg-leaf' : 'bg-[#c9d5cc]'}`} />{i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
