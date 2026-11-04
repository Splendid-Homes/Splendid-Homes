'use client';

import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';

// Register once, client-side only.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
  gsap.defaults({ ease: 'power3.out', duration: 1 });
}

/*
 * ScrollTrigger is loaded on demand (dynamic import) and registered only where a
 * scroll-scrubbed effect needs it (desktop parallax). Once registered it runs a permanent
 * requestAnimationFrame keep-alive loop, and phones never need it.
 */
let ST: typeof ScrollTriggerType | null = null;
let loading: Promise<typeof ScrollTriggerType> | null = null;
export function loadScrollTrigger() {
  if (ST) return Promise.resolve(ST);
  loading ??= import('gsap/ScrollTrigger').then(m => { gsap.registerPlugin(m.ScrollTrigger); ST = m.ScrollTrigger; return m.ScrollTrigger; });
  return loading;
}
/** The registered ScrollTrigger, or null if nothing on this page has needed it. */
export const activeScrollTrigger = () => ST;

/**
 * Media queries for gsap.matchMedia(). Use matchMedia ONLY for continuous,
 * scroll-linked effects (parallax). ScrollTrigger.refresh() reverts and re-runs
 * matchMedia contexts, which would reset one-shot entrance animations.
 */
export const MQ = {
  motion: '(prefers-reduced-motion: no-preference)',
  desktopMotion: '(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (hover: hover) and (pointer: fine)',
} as const;

/** True when the pre-paint script allowed motion (JS on, no reduced-motion preference). */
/** Curtain lift timing (globals.css: 0.6s delay + 0.95s). Load entrances start as it is halfway up. */
const INTRO_REVEAL_AT = 1.05;
/**
 * Seconds a load-time entrance should wait so it plays as the intro curtain lifts
 * (0 when there is no curtain). Measured from navigation start, like the CSS animation.
 */
export const introDelay = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('intro')
    ? Math.max(0, INTRO_REVEAL_AT - performance.now() / 1000) : 0;

export const motionAllowed = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('motion-ok');

/**
 * Marks elements as revealed: the pre-paint "hidden" CSS stops applying and
 * inline animation styles are cleared, so content can never be left hidden.
 */
export function markRevealed(targets: Element | Element[] | NodeListOf<Element> | null | undefined) {
  if (!targets) return;
  const list = targets instanceof Element ? [targets] : Array.from(targets);
  list.forEach(el => el.setAttribute('data-revealed', ''));
  gsap.set(list, { clearProps: 'all' });
}

export { gsap, useGSAP };
