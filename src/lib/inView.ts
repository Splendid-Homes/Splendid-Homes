'use client';

/**
 * Runs `onEnter` once when `el` scrolls into view. IntersectionObserver is
 * asynchronous and never forces layout, unlike creating a ScrollTrigger per
 * element (which measures the page during hydration). Returns a cleanup.
 */
export function onceInView(el: Element, onEnter: () => void, rootMargin = '0px 0px -12% 0px') {
  if (typeof IntersectionObserver === 'undefined') { onEnter(); return () => {}; }
  const io = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) { io.disconnect(); onEnter(); }
  }, { rootMargin });
  io.observe(el);
  return () => io.disconnect();
}
