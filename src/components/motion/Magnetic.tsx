'use client';

import { useEffect } from 'react';
import { MQ } from '@/lib/gsap';

/**
 * Magnetic buttons (homepage round 1, item 4): any element marked `data-magnetic` leans
 * toward the cursor while hovered and springs back on leave. `data-magnetic="0.4"` sets the
 * pull (share of the cursor's offset from centre, default 0.3). One delegated listener for
 * the whole site; desktop pointers only, never with reduced motion. GSAP loads on first use.
 */
const MAX_SHIFT = 14; // px: wide buttons stay subtle
const clamp = (v: number) => Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, v));

export function Magnetic() {
  useEffect(() => {
    const mq = matchMedia(MQ.desktopMotion);
    let gsapMod: typeof import('gsap') | null = null;
    let el: HTMLElement | null = null;
    let moveX: ((v: number) => void) | null = null;
    let moveY: ((v: number) => void) | null = null;

    const release = () => {
      if (el && gsapMod) gsapMod.gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
      el = null; moveX = moveY = null;
    };
    const over = (e: PointerEvent) => {
      if (!mq.matches || e.pointerType !== 'mouse') return;
      const target = (e.target as Element).closest<HTMLElement>('[data-magnetic]');
      if (target === el) return;
      release();
      if (!target) return;
      el = target;
      if (!gsapMod) void import('gsap').then(m => { gsapMod = m; });
    };
    const move = (e: PointerEvent) => {
      if (!el || !gsapMod) return;
      if (!moveX) {
        moveX = gsapMod.gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' });
        moveY = gsapMod.gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' });
      }
      if (!moveX || !moveY) return;
      const r = el.getBoundingClientRect();
      const pull = Number(el.dataset.magnetic) || 0.3;
      // Measure from the untransformed centre so the button doesn't chase itself.
      const tx = Number(gsapMod.gsap.getProperty(el, 'x')) || 0, ty = Number(gsapMod.gsap.getProperty(el, 'y')) || 0;
      moveX(clamp((e.clientX - (r.left - tx + r.width / 2)) * pull));
      moveY(clamp((e.clientY - (r.top - ty + r.height / 2)) * pull));
    };
    const out = (e: PointerEvent) => {
      if (el && !(e.relatedTarget instanceof Node && el.contains(e.relatedTarget))) release();
    };

    document.addEventListener('pointerover', over, { passive: true });
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerout', out, { passive: true });
    return () => {
      document.removeEventListener('pointerover', over);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerout', out);
    };
  }, []);
  return null;
}
