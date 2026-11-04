'use client';

import { useEffect, useRef, useState } from 'react';

type Conn = { saveData?: boolean; effectiveType?: string };

/**
 * Optional looping hero video over the hero photo (F01).
 * - The photo underneath is the LCP and is always shown first; the video is only requested
 *   after the page has loaded and the browser is idle, and fades in once it is really playing.
 * - Not loaded on phones, with Data Saver / slow connections, or when reduced motion is set.
 * - Pauses while scrolled out of view; a visible pause/play control satisfies WCAG 2.2.2.
 */
export function HeroVideo({ src }: { src: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: Conn }).connection;
    const allowed = matchMedia('(min-width: 768px)').matches
      && !matchMedia('(prefers-reduced-motion: reduce)').matches
      && !conn?.saveData && !/(^|-)2g|3g/.test(conn?.effectiveType ?? '');
    if (!allowed) return;
    let idle = 0;
    const start = () => {
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      idle = ric ? ric(() => setLoad(true), { timeout: 2500 }) : window.setTimeout(() => setLoad(true), 1200);
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => { window.removeEventListener('load', start); window.clearTimeout(idle); };
  }, []);

  // Pause when the hero is off-screen (saves battery/CPU), resume when it returns unless the visitor paused it.
  useEffect(() => {
    const v = video.current;
    if (!v || !load) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) v.pause();
      else if (!paused) void v.play().catch(() => {});
    }, { threshold: 0.15 });
    io.observe(v);
    return () => io.disconnect();
  }, [load, paused]);

  if (!load) return null;
  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) { setPaused(false); void v.play().catch(() => {}); } else { setPaused(true); v.pause(); }
  };

  return (
    <>
      <video ref={video} src={src} muted loop playsInline autoPlay preload="auto" aria-hidden="true" tabIndex={-1}
        onPlaying={() => setPlaying(true)}
        className={`absolute inset-0 size-full object-cover transition-opacity duration-[1.2s] ease-out ${playing ? 'opacity-100' : 'opacity-0'}`} />
      {playing && (
        <button type="button" onClick={toggle} aria-label={paused ? 'Play background video' : 'Pause background video'}
          className="absolute right-4 top-[calc(4.55%+16px)] z-[2] grid size-10 place-items-center rounded-full bg-mist/90 text-forest shadow-[3px_4px_12px_rgba(15,36,24,.3)] backdrop-blur-md transition hover:text-gold sm:right-6 sm:top-[calc(4.55%+24px)]">
          {paused
            ? <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
            : <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>}
        </button>
      )}
    </>
  );
}
