import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { Icon, type IconName } from '@/components/icons';
import { data } from '@/lib/cms';
import { telHref, waHref } from '@/lib/site';
import { SavedCount } from '@/components/ui/SaveButton';
import { CurrencySelect } from './CurrencySelect';
import { HeaderShell, MobileMenu, NavLink, PageIndicator } from './HeaderClient';
import { Suspense } from 'react';

type Col = { title: string; icon: IconName; links: { label: string; href: string }[]; all?: { label: string; href: string } };

/**
 * Sticky header in the footer's deep forest colour, soft UI: nav in a pressed-in track with the
 * current page raised, raised currency, saved and CTA pills. "More" opens a mega menu (hover or
 * keyboard focus): up to four soft columns (CMS > Menus & footer: services, latest guides or
 * hand-picked links) and a contact strip.
 */
export async function Header() {
  const d = await data();
  // Guides first, topped up with the latest other how-to articles (not market reports) so the column is never thin.
  const posts = d.allPosts().filter(p => p.cat !== 'Market Reports');
  const guides = [...posts.filter(p => p.cat === 'Guides'), ...posts.filter(p => p.cat !== 'Guides')].slice(0, 5);
  const M = d.site.menus, T = M.text, NAV = M.mainNav;
  const cols: Col[] = M.moreCols.map(c => ({
    title: c.title, icon: c.icon as IconName,
    links: c.source === 'services' ? d.c.services.map(s => ({ label: s.name, href: `/services#${s.slug}` }))
      : c.source === 'guides' ? guides.map(p => ({ label: p.title.replace(/:.*$/, ''), href: `/insights/${p.slug}` }))
      : c.links,
    all: c.allLabel && c.allHref ? { label: c.allLabel, href: c.allHref } : undefined,
  }));
  return (
    <HeaderShell>
      <div className="relative mx-auto flex h-[84px] w-[min(1480px,100%-32px)] items-center gap-4 max-sm:gap-2 min-[1440px]:gap-5">
        <Link href="/" className="shrink-0 text-white text-[13px] max-sm:text-[10px]">
          <Logo />
        </Link>
        <Suspense fallback={null}><PageIndicator /></Suspense>

        <nav aria-label="Main" className="mx-auto hidden shrink-0 items-center gap-0.5 rounded-full soft-dark-inset p-1.5 min-[1240px]:flex min-[1440px]:gap-1">
          {/* Plain links until the current page is known (keeps new CMS pages prerenderable). */}
          <Suspense fallback={NAV.map(n => <NavLink key={n.href} href={n.href} plain>{n.label}</NavLink>)}>
            {NAV.map(n => <NavLink key={n.href} href={n.href}>{n.label}</NavLink>)}
          </Suspense>
          <div className="group">
            <button type="button" aria-haspopup="true" aria-controls="mega-more"
              className="inline-flex items-center gap-1 rounded-full px-[0.9em] py-[0.55em] text-[0.9rem] font-semibold text-[#C9D8CD] transition-colors hover:text-white group-hover:text-white group-focus-within:text-white">
              {T.moreLabel} <Icon name="chevD" className="size-3.5 transition-transform duration-300 group-hover:rotate-180 group-focus-within:rotate-180" />
            </button>
            {/* Mega menu, anchored to the header row; the transparent top padding bridges the hover gap. */}
            <div id="mega-more" className="invisible absolute inset-x-0 top-[calc(100%-22px)] z-50 pt-[30px] opacity-0 transition-[opacity,visibility] duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="max-h-[calc(100svh-120px)] translate-y-[-6px] overflow-y-auto rounded-[30px] bg-mist p-[clamp(16px,1.8vw,24px)] text-ink shadow-[0_30px_70px_-20px_rgba(0,0,0,.55)] transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-y-0 group-focus-within:translate-y-0">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.max(1, cols.length)}, minmax(0, 1fr))` }}>
                  {cols.map(c => (
                    <div key={c.title} className="flex min-w-0 flex-col rounded-[22px] soft-inset p-3.5">
                      <p className="mb-2.5 flex items-center gap-2.5 px-1.5 text-[0.74rem] font-extrabold uppercase tracking-[0.1em] text-forest">
                        <span className="grid size-8 place-items-center rounded-full soft-raised-sm text-gold"><Icon name={c.icon} className="size-4" /></span>{c.title}
                      </p>
                      <ul className="grid gap-0.5">
                        {c.links.map(l => (
                          <li key={l.href + l.label}>
                            <Link href={l.href} className="block rounded-[12px] px-2.5 py-2 text-[0.9rem] leading-snug font-medium text-ink-2 transition-[color,box-shadow] duration-200 hover:soft-raised-sm hover:text-forest focus-visible:soft-raised-sm focus-visible:text-forest focus-visible:outline-none">{l.label}</Link>
                          </li>
                        ))}
                      </ul>
                      {c.all && (
                        <Link href={c.all.href} className="group/all mt-auto inline-flex items-center gap-2 self-start px-2.5 pt-3 text-[0.84rem] font-bold text-forest">
                          {c.all.label}<Icon name="arrow" className="size-3.5 transition-transform group-hover/all:translate-x-0.5" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[20px] soft-raised-sm px-5 py-3">
                  <p className="text-[0.9rem] text-ink-2"><b className="text-ink">{T.helpBold}</b> {T.helpText}</p>
                  <div className="flex gap-2">
                    <a href={waHref(d.site.whatsapp)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-[#127A3F] px-4 py-2 text-[0.84rem] font-bold text-white shadow-btn"><Icon name="wa" className="size-4" />WhatsApp</a>
                    <a href={telHref(d.site.phone)} className="inline-flex items-center gap-2 rounded-full soft-raised-sm px-4 py-2 text-[0.84rem] font-bold text-forest active:soft-pressed"><Icon name="phone" className="size-4" />{d.site.phone}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-2.5 max-sm:gap-1.5">
          <CurrencySelect className="rounded-full soft-dark-raised py-1 pl-3 pr-1 max-sm:hidden" />
          <Link href="/saved" aria-label="Saved properties" data-magnetic="0.4" className="relative grid size-[42px] max-[419px]:hidden place-items-center rounded-full soft-dark-raised transition-[color,box-shadow] hover:text-gold active:soft-dark-pressed">
            <Icon name="heart" /><SavedCount />
          </Link>
          <Link href={T.ctaHref} data-magnetic className="btn-sweep inline-flex items-center rounded-full soft-dark-raised px-[1.2em] py-[0.7em] text-[0.82rem] font-bold text-on-dark hover:text-deep active:soft-dark-pressed max-sm:hidden">
            {T.ctaLabel}
          </Link>
          <MobileMenu />
        </div>
      </div>
    </HeaderShell>
  );
}
