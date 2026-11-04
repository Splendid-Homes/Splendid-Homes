'use client';

import { useEffect, useRef, useState } from 'react';
import { MQ } from '@/lib/gsap';

/**
 * Cursor label (homepage round 2, item 5): over anything marked `data-cursor="View"` the pointer
 * becomes a small frosted dark circle with that word, trailing with a soft lag. Over buttons and form controls
 * inside (save, compare…) it shrinks to a dot and the normal pointer returns, so they still read
 * as clickable. Desktop pointers only, never with reduced motion; the native cursor is hidden
 * only while the label is actually showing (html.cursor-label). GSAP loads on first use.
 */
export function CursorLabel() {
  const dot = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [label, setLabel] = useState('');
  const [mode, setMode] = useState<'off' | 'label' | 'dot'>('off');

  useEffect(() => {
    const mq = matchMedia(MQ.desktopMotion);
    const sync = () => setOn(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const el = dot.current;
    if (!on || !el) return;
    let alive = true;
    let move: ((x: number, y: number) => void) | null = null;
    let last: [number, number] | null = null;
    void import('gsap').then(({ gsap }) => {
      if (!alive) return;
      const x = gsap.quickTo(el, 'x', { duration: 0.3, ease: 'power3.out' });
      const y = gsap.quickTo(el, 'y', { duration: 0.3, ease: 'power3.out' });
      move = (cx, cy) => { x(cx); y(cy); };
      if (last) { gsap.set(el, { x: last[0], y: last[1] }); }
    });

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const t = e.target as Element;
      const host = t.closest<HTMLElement>('[data-cursor]');
      const control = host && t.closest('button, input, select, textarea, [data-cursor-off]');
      const next = !host ? 'off' : control && host.contains(control) ? 'dot' : 'label';
      setMode(next);
      if (host) setLabel(host.dataset.cursor || 'View');
      document.documentElement.classList.toggle('cursor-label', next === 'label');
      // Jump into place on entry rather than flying in from the last spot.
      if (!last || next === 'off') last = [e.clientX, e.clientY];
      move?.(e.clientX, e.clientY);
    };
    const hide = () => { setMode('off'); document.documentElement.classList.remove('cursor-label'); };
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', hide);
    window.addEventListener('blur', hide);
    return () => {
      alive = false;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', hide);
      window.removeEventListener('blur', hide);
      document.documentElement.classList.remove('cursor-label');
    };
  }, [on]);

  if (!on) return null;
  return (
    <div ref={dot} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[300]">
      <div className={`-ml-[30px] -mt-[30px] grid size-[60px] place-items-center rounded-full bg-deep/80 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white ring-1 ring-white/25 backdrop-blur-md transition-[scale,opacity] duration-300 ease-[cubic-bezier(.16,1,.3,1)] ${mode === 'label' ? 'scale-100 opacity-100' : mode === 'dot' ? 'scale-[0.18] opacity-100' : 'scale-0 opacity-0'}`}>
        <span className={`transition-opacity duration-200 ${mode === 'label' ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
      </div>
    </div>
  );
}
