import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { PropertyCard } from '@/components/cards/PropertyCard';
import { Icon } from '@/components/icons';
import { CmsPageHero } from '@/components/layout/CmsPageHero';
import { JsonLd } from '@/components/seo/JsonLd';
import type { Purpose } from '@/data/types';
import { data } from '@/lib/cms';
import { fillFees } from '@/payload/feeDefaults';
import { activeChips, filterListings, listingHref, parseFilters } from '@/lib/listings';
import { absoluteUrl } from '@/lib/seo';
import { telHref, waHref } from '@/lib/site';
import { FilterForm } from './FilterForm';
import { ResultsSkeleton } from './ResultsSkeleton';
import { AlertRequest } from '@/components/forms/RequestForms';
import { ResultsTop } from './ResultsTop';

type SP = Promise<Record<string, string | string[] | undefined>>;

const COPY: Record<Purpose, { eyebrow: string; h1: [string, string]; sub: string; img: number; noun: string }> = {
  buy: { eyebrow: 'For sale', h1: ['Properties for sale ', 'in Dubai'], sub: 'Villas, apartments and penthouses for sale across Dubai, every one advertised under a DLD permit.', img: 0, noun: 'for sale' },
  rent: { eyebrow: 'For rent', h1: ['Properties for rent ', 'in Dubai'], sub: 'Homes to rent across Dubai, from studios to beachfront villas, with Ejari paperwork handled for you.', img: 2, noun: 'for rent' },
};

/**
 * Buy / Rent listing page (F02, F03, F04). The hero is the static shell; results depend on the
 * URL's filters, so they render per request inside Suspense (Cache Components). All results
 * are in the server HTML. Every filtered URL canonicalises to /buy or /rent (see the page metadata).
 */
export async function ListingsPage({ purpose, searchParams }: { purpose: Purpose; searchParams: SP }) {
  const c = COPY[purpose];
  const hero = (await data()).heroCommunity(c.img);
  return (
    <>
      <CmsPageHero page={purpose} eyebrow={c.eyebrow} title={[{ text: c.h1[0] }, { text: c.h1[1], em: true }]} sub={c.sub}
        img={hero?.img ?? ''} alt={`${hero?.name ?? 'Dubai'}, Dubai`}
        crumbs={[{ name: 'Home', href: '/' }, { name: purpose === 'rent' ? 'Rent' : 'Buy', href: `/${purpose}` }]} />
      <section aria-label="Search results" className="wrap pb-[clamp(48px,7vw,96px)] pt-6">
        <Suspense fallback={<ResultsSkeleton />}>
          <Results purpose={purpose} searchParams={searchParams} />
        </Suspense>
      </section>
      <GoodToKnow purpose={purpose} />
    </>
  );
}

async function Results({ purpose, searchParams }: { purpose: Purpose; searchParams: SP }) {
  const d = await data();
  const { communities } = d.c;
  const SITE = d.site;
  const T = SITE.listings.text;
  const f = parseFilters(await searchParams, communities.map(c => c.slug));
  const PAGE_SIZE = SITE.listings.pageSize;
  const all = filterListings(d, purpose, f, SITE.listings.sort[purpose]);
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const page = Math.min(f.page ?? 1, pages);
  const list = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const chips = activeChips(d, purpose, f);
  const where = f.community ? `in ${d.communityName(f.community)}` : 'in Dubai';
  const noun = COPY[purpose].noun;

  return (
    <FilterForm purpose={purpose} filters={f} activeCount={chips.length} steps={SITE.listings.steps[purpose]} defaultSort={SITE.listings.sort[purpose]} communities={communities.map(c => [c.slug, c.name])}>
      <ResultsTop purpose={purpose} f={f} total={all.length} criteria={chips.map(ch => ch.label).join(', ')} />
      <div className="mb-6 mt-7 flex flex-wrap items-center justify-between gap-3">
        <h2 aria-live="polite" className="text-[clamp(1.2rem,2vw,1.5rem)]">
          {all.length} {all.length === 1 ? 'property' : 'properties'} {noun} {where}
        </h2>
        {chips.length > 0 && (
          <ul className="flex flex-wrap items-center gap-2" aria-label="Active filters">
            {chips.map(ch => (
              <li key={ch.label}>
                <Link href={ch.href} scroll={false} aria-label={`Remove filter ${ch.label}`}
                  className="inline-flex items-center gap-1.5 rounded-full soft-raised-sm px-3 py-1.5 text-[0.82rem] font-semibold text-forest transition-[color,box-shadow] hover:text-[#B42318] active:soft-pressed">
                  {ch.label}<Icon name="close" className="size-3.5" />
                </Link>
              </li>
            ))}
            <li><Link href={`/${purpose}`} scroll={false} className="px-2 text-[0.84rem] font-bold text-forest underline-offset-4 hover:underline">Clear all</Link></li>
          </ul>
        )}
      </div>

      {list.length ? (
        <div className="grid grid-cols-1 gap-[clamp(18px,2.4vw,26px)] md:grid-cols-2 lg:grid-cols-3">
          {/* The first home on page 1 gets a wide featured card when there are enough results. */}
          {list.map((p, i) => <PropertyCard key={p.id} p={p} wide={i === 0 && page === 1 && list.length >= 4} preload={i === 0} />)}
        </div>
      ) : (
        <div className="rounded-[28px] soft-inset px-6 py-14 text-center">
          <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full soft-raised-sm text-forest"><Icon name="search" className="size-6" /></span>
          <p className="mb-1 text-[1.2rem] font-bold">{T.emptyTitle}</p>
          <p className="mx-auto mb-6 max-w-[48ch] text-ink-2">{T.emptyText}</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link href={`/${purpose}`} scroll={false} className="rounded-full soft-raised active:soft-pressed px-5 py-3 font-bold transition-colors hover:border-forest hover:text-forest">{T.emptyClear}</Link>
            <a href={waHref(SITE.whatsapp, `Hi, I'm looking for a property ${noun} ${where}.`)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full shadow-btn bg-[#127A3F] px-5 py-3 font-bold text-white"><Icon name="wa" /> {T.emptyAsk}</a>
            <a href={telHref(SITE.phone)} className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 font-bold text-white"><Icon name="phone" /> {T.callbackCta}</a>
          </div>
          <AlertRequest purpose={purpose} criteria={chips.map(ch => ch.label).join(', ')} />
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
            <Link key={n} href={listingHref(purpose, f, { page: n })} aria-current={n === page ? 'page' : undefined}
              className={`grid size-11 place-items-center rounded-full font-bold transition-[box-shadow,color] ${n === page ? 'soft-inset-sm text-forest' : 'soft-raised-sm hover:text-forest active:soft-pressed'}`}>{n}</Link>
          ))}
        </nav>
      )}

      {list.length > 0 && (
        <JsonLd data={{
          '@context': 'https://schema.org', '@type': 'ItemList', name: `Properties ${noun} ${where}`, numberOfItems: all.length,
          itemListElement: list.map((p, i) => ({ '@type': 'ListItem', position: (page - 1) * PAGE_SIZE + i + 1, url: absoluteUrl(`/property/${p.slug}`), name: p.title })),
        }} />
      )}
    </FilterForm>
  );
}

/** Short, answer-first explainer under the results (AEO) as a soft accordion, plus photo links into the area guides. */
async function GoodToKnow({ purpose }: { purpose: Purpose }) {
  const d = await data();
  const L = d.site.listings;
  const g = L.good[purpose];
  // Picked tiles in CMS order, or every community.
  const communities = L.tiles.length ? L.tiles.map(t => d.c.communities.find(c => c.slug === t)).filter(c => !!c) : d.c.communities;
  return (
    <section aria-labelledby="good-to-know" className="cv-auto bg-mist py-[clamp(48px,7vw,90px)]">
      <div className="wrap grid gap-[clamp(24px,4vw,48px)] lg:grid-cols-[1fr_1.1fr]">
        <div>
          <span className="eyebrow mb-3">{L.text.goodEyebrow}</span>
          <h2 id="good-to-know" className="mb-5 text-[clamp(1.6rem,2.8vw,2.3rem)]">{g.title}{g.titleItalic && <> <em>{g.titleItalic}</em></>}</h2>
          {/* Answers stay in the HTML (AEO); the first is open. */}
          <div className="grid gap-2 rounded-[26px] soft-inset p-2.5">
            {g.items.map(({ q, a }, i) => (
              <details key={q} open={i === 0} className="group rounded-[18px] transition-[box-shadow,background-color] open:soft-raised">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 font-bold [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="grid size-7 shrink-0 place-items-center rounded-full soft-raised-sm text-forest transition-transform duration-300 group-open:rotate-45"><Icon name="plus" className="size-3.5" /></span>
                </summary>
                <p className="px-4 pb-4 text-[0.94rem] text-ink-2">{fillFees(a, d.site.fees)}</p>
              </details>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-[1.15rem] lg:mt-[86px]">{L.text.tilesTitle}</h3>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {communities.map(c => (
              <li key={c.slug}>
                <Link href={`/community/${c.slug}`} className="group relative block h-[104px] overflow-hidden rounded-[18px] soft-raised-sm p-1.5">
                  <span className="relative block size-full overflow-hidden rounded-[13px]">
                    <Image src={c.img} alt="" fill sizes="(min-width:1024px) 200px, 45vw" className="object-cover transition-[scale] duration-700 group-hover:scale-[1.07]" />
                  </span>
                  <span className="absolute bottom-3 left-3 right-3 truncate rounded-full bg-mist/93 px-2.5 py-1 text-[0.76rem] font-extrabold text-forest backdrop-blur-sm">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
