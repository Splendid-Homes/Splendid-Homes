import Link from 'next/link';
import { Icon } from '@/components/icons';
import { AlertRequest } from '@/components/forms/RequestForms';
import type { Purpose } from '@/data/types';
import { data } from '@/lib/cms';
import { type Filters, listingHref } from '@/lib/listings';
import { marketPulse } from '@/lib/pulse';
import type { Chip } from '@/payload/listingDefaults';

type Quick = { label: string; patch: Partial<Filters> };
/** A CMS chip as a filter patch. A price chip also clears the other bound, so "Under 2M" drops a minimum. */
const toQuick = (c: Chip): Quick => ({
  label: c.label,
  patch: Object.fromEntries(Object.entries({
    type: c.type, beds: c.beds, status: c.status, furnishing: c.furnishing, min: c.min, max: c.max,
    ...(c.max != null && c.min == null ? { min: undefined } : {}), ...(c.min != null && c.max == null ? { max: undefined } : {}),
  }).filter(([k, v]) => v != null || ((k === 'min' || k === 'max') && (c.min != null || c.max != null)))) as Partial<Filters>,
});
const QUICK_KEYS = ['type', 'beds', 'min', 'max', 'status', 'furnishing'] as const;
const short = (n: number) => n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : `${Math.round(n / 1e3)}k`;

/**
 * Above the listing results (soft UI): a pressed-in row of quick-search chips (toggles on the URL
 * filters), then a market strip for the area being searched with a "new listings" alert.
 */
export async function ResultsTop({ purpose, f, total, criteria }: { purpose: Purpose; f: Filters; total: number; criteria: string }) {
  const d = await data();
  const L = d.site.listings;
  const quick = L.chips[purpose].map(toQuick);
  const on = (q: Quick) => Object.entries(q.patch).every(([k, v]) => v === undefined || f[k as keyof Filters] === v);
  const none = QUICK_KEYS.every(k => f[k] === undefined);
  const clearQuick = Object.fromEntries(QUICK_KEYS.map(k => [k, undefined])) as Partial<Filters>;
  const off = (q: Quick) => Object.fromEntries(Object.entries(q.patch).filter(([, v]) => v !== undefined).map(([k]) => [k, undefined])) as Partial<Filters>;

  const area = f.community ? d.c.communities.find(c => c.slug === f.community) : undefined;
  const pulse = marketPulse(area ? [area] : d.c.communities, d.site.market);
  const rent = purpose === 'rent';
  const avgRent = Math.round((area ? [area] : d.c.communities).reduce((a, c) => a + c.avgRent, 0) / Math.max(1, area ? 1 : d.c.communities.length));
  const updated = new Date(d.site.market.updated).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  const kpis = [
    rent ? { v: `AED ${short(avgRent)}`, l: 'Avg yearly rent' } : { v: pulse.pricePerSqft, l: 'Avg price / sq ft', ch: area ? undefined : pulse.priceChange },
    { v: pulse.yield, l: 'Avg rental yield' },
    { v: `${total} ${total === 1 ? 'home' : 'homes'}`, l: 'Match your search' },
  ];

  return (
    <div className="mt-6 grid gap-4">
      <nav aria-label="Quick searches" className="-mx-1 flex gap-2 overflow-x-auto rounded-full soft-inset p-2 [scrollbar-width:none]">
        <Link href={listingHref(purpose, f, { ...clearQuick, page: undefined })} scroll={false} aria-current={none ? 'true' : undefined} className={chip(none)}>All</Link>
        {quick.map(q => {
          const active = on(q);
          return (
            <Link key={q.label} href={listingHref(purpose, f, { ...(active ? off(q) : q.patch), page: undefined })} scroll={false}
              aria-current={active ? 'true' : undefined} className={chip(active)}>{q.label}</Link>
          );
        })}
      </nav>

      {L.showMarket && <div className="grid grid-cols-3 items-center gap-2 rounded-[24px] soft-raised p-3 sm:gap-3 sm:p-3.5 lg:grid-cols-[auto_repeat(3,1fr)_auto]">
        <p className="col-span-3 px-2 lg:col-span-1">
          <b className="block">{L.text.marketLabel.replace('{area}', area ? area.name : 'Dubai')}</b>
          <span className="text-[0.78rem] font-semibold text-muted">Updated {updated}</span>
        </p>
        {kpis.map(k => (
          <p key={k.l} className="min-w-0 rounded-[16px] soft-inset-sm px-2.5 py-2.5 sm:px-3.5 sm:py-3">
            <b className="block text-[0.98rem] tracking-[-0.02em] text-forest sm:text-[1.12rem]">{k.v}</b>
            <span className="block text-[0.7rem] font-bold leading-snug text-muted sm:inline sm:text-[0.75rem]">{k.l}
              {'ch' in k && k.ch != null && <span className={k.ch >= 0 ? 'text-[#127A3F]' : 'text-[#B42318]'}> · {k.ch >= 0 ? '▲' : '▼'} {Math.abs(k.ch)}%</span>}
            </span>
          </p>
        ))}
        <details className="group relative col-span-3 lg:col-span-1">
          <summary className="flex cursor-pointer list-none items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-[0.88rem] font-extrabold text-white shadow-btn transition hover:brightness-110 [&::-webkit-details-marker]:hidden">
            <Icon name="bell" className="size-4" />{L.text.alertCta}
          </summary>
          <div className="z-30 mt-3 rounded-[20px] bg-mist p-4 shadow-[0_18px_40px_-12px_rgba(15,36,24,.35),-4px_-4px_12px_#fff] lg:absolute lg:right-0 lg:top-full lg:w-[380px]">
            <p className="mb-1 text-[0.85rem] text-ink-2">We email you when a new home matches{criteria ? `: ${criteria}` : ' this search'}.</p>
            <AlertRequest purpose={purpose} criteria={criteria} className="" />
          </div>
        </details>
      </div>}
    </div>
  );
}

function chip(on: boolean) {
  return `shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[0.85rem] font-bold transition-[box-shadow,color] duration-300 ${on
    ? 'soft-inset-sm text-forest before:mr-1.5 before:inline-block before:size-[7px] before:rounded-full before:bg-gold before:align-middle before:content-[\'\']'
    : 'soft-raised-sm text-ink-2 hover:text-forest'}`;
}
