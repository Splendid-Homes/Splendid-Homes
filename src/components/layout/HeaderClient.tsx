'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/icons';
import { useScrollLock } from '@/components/motion/useScrollLock';

const MobileDrawer = dynamic(() => import('./MobileDrawer'), { ssr: false });

/**
 * Sticky header bar: soft shadow once the page scrolls (as in the prototype), slides away
 * while scrolling down past the hero and returns on any upward scroll. It never hides while
 * hovered or holding keyboard focus. One rAF-throttled passive listener, state only on change.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let queued = false;
    const update = () => {
      queued = false;
      const y = window.scrollY;
      setScrolled(y > 10);
      if (y < 160) { setHidden(false); last = y; return; }
      if (Math.abs(y - last) < 8) return;
      const down = y > last;
      last = y;
      setHidden(down && !ref.current?.matches(':hover, :focus-within'));
    };
    const on = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    update();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header ref={ref} onFocus={() => setHidden(false)} data-hidden={hidden ? '' : undefined}
      className={`grain sticky top-0 z-[100] bg-deep text-white transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${scrolled ? 'shadow-header' : ''} ${hidden ? '-translate-y-full' : ''}`}>
      {children}
    </header>
  );
}

// Section names for the "You are on" pill (first path segment).
const SECTIONS: Record<string, string> = {
  '': 'Home', buy: 'Buy', rent: 'Rent', 'off-plan': 'Off-Plan', commercial: 'Commercial', communities: 'Communities', community: 'Communities',
  sell: 'Sell', services: 'Services', insights: 'Insights', team: 'Our team', developers: 'Developers', developer: 'Developers', about: 'About us',
  careers: 'Careers', contact: 'Contact', mortgage: 'Mortgage calculator', saved: 'Saved', compare: 'Compare', property: 'Property', legal: 'Legal',
};

/**
 * "You are on" pill beside the logo (soft UI): a pressed-in pill with a blinking green light and
 * the current page: the section name, plus the page's own heading on detail pages
 * (e.g. "Off-Plan · The Aurum Residences"). It shrinks and truncates to the room left in the header.
 * Decorative for screen readers (the page heading and breadcrumbs already say where they are).
 */
export function PageIndicator() {
  const path = usePathname();
  const parts = path.split('/').filter(Boolean);
  const section = SECTIONS[parts[0] ?? ''] ?? 'Splendid Homes';
  // Kept with its page, so a heading from the previous route never shows on the next one.
  const [found, setFound] = useState({ path: '', text: '' });
  const detail = found.path === path ? found.text : '';
  useEffect(() => {
    if (parts.length < 2) return;
    // Detail pages: use the page heading once it has rendered (it may stream in after the route change).
    const read = () => {
      const h = document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim();
      if (h) { setFound({ path, text: h }); return true; }
      return false;
    };
    if (read()) return;
    const mo = new MutationObserver(() => { if (read()) mo.disconnect(); });
    mo.observe(document.body, { childList: true, subtree: true });
    const t = window.setTimeout(() => mo.disconnect(), 4000);
    return () => { mo.disconnect(); window.clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
  const label = detail ? `${section} · ${detail}` : section;
  return (
    <span aria-hidden="true" title={label}
      className="flex min-w-0 max-w-[320px] items-center gap-2 rounded-full soft-dark-inset min-[1240px]:max-[1365px]:hidden py-[7px] pl-3 pr-3.5 max-sm:py-1.5 max-sm:pl-2.5 max-sm:pr-3 text-[0.78rem] text-[#C9D8CD] max-[1239px]:mr-auto">
      <span className="here-light relative size-2 shrink-0 rounded-full bg-[#3DDC84]" />
      <span className="hidden shrink-0 min-[1536px]:inline">You are on</span>
      <b className="truncate font-extrabold text-white max-sm:hidden">{label}</b>
      {/* Phones: just the page's own name (the section is implied), so it fits beside the logo. */}
      <b className="truncate text-[0.74rem] font-extrabold text-white sm:hidden">{detail || section}</b>
    </span>
  );
}

export function NavLink({ href, children, plain }: { href: string; children: React.ReactNode; plain?: boolean }) {
  return plain ? <NavAnchor href={href} active={false}>{children}</NavAnchor> : <ActiveNavLink href={href}>{children}</ActiveNavLink>;
}

function ActiveNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <NavAnchor href={href} active={usePathname() === href}>{children}</NavAnchor>;
}

function NavAnchor({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} aria-current={active ? 'page' : undefined}
      className={`whitespace-nowrap rounded-full px-[0.75em] py-[0.55em] text-[0.9rem] font-semibold transition-[color,box-shadow] min-[1440px]:px-[0.9em] ${active ? 'soft-dark-raised text-white' : 'text-[#C9D8CD] hover:text-white'}`}>
      {children}
    </Link>
  );
}

/** Burger + side drawer for screens below 1240px. The drawer (and Motion) load on first open. */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useScrollLock(open);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => { setLoaded(true); setOpen(true); }} aria-label="Open menu" aria-expanded={open}
        onPointerEnter={() => setLoaded(true)} onFocus={() => setLoaded(true)}
        className="grid size-[42px] place-items-center rounded-full soft-dark-raised transition-[color,box-shadow] hover:text-gold active:soft-dark-pressed min-[1240px]:hidden">
        <Icon name="menu" />
      </button>
      {loaded && <MobileDrawer open={open} onClose={() => setOpen(false)} />}
    </>
  );
}
