'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Infinite horizontal marquee. Only `transform` animates; edge fades are static
 * overlays. The animation is paused whenever the marquee is off-screen, so it
 * costs nothing while the visitor is elsewhere on the page.
 * Content is rendered twice; the duplicate is hidden from assistive tech and inert.
 * Pauses on hover and stops entirely for reduced-motion visitors.
 */
export function Marquee({ children, className = '', duration = 40, label, fade = 'from-white' }: {
  children: React.ReactNode; className?: string; duration?: number; label?: string; fade?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} aria-label={label} role={label ? 'region' : undefined}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {/* Play state is inline: the `animation` shorthand from the animate-[] utility would reset a class-based pause. */}
      <div className="flex w-max will-change-transform motion-safe:animate-[sh-marquee_var(--d)_linear_infinite]"
        style={{ ['--d' as string]: `${duration}s`, animationPlayState: visible && !hovered ? 'running' : 'paused' }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true" inert>{children}</div>
      </div>
      <span aria-hidden="true" className={`pointer-events-none absolute inset-y-0 left-0 w-[8%] bg-gradient-to-r ${fade} to-transparent`} />
      <span aria-hidden="true" className={`pointer-events-none absolute inset-y-0 right-0 w-[8%] bg-gradient-to-l ${fade} to-transparent`} />
    </div>
  );
}
