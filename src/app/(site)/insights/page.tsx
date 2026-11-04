import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { Icon } from '@/components/icons';
import { PostCard } from '@/components/insights/PostCard';
import { ResultsSkeleton } from '@/components/listings/ResultsSkeleton';
import { CmsPageHero } from '@/components/layout/CmsPageHero';
import { InsightsNewsletter } from '@/components/insights/InsightsNewsletter';
import { JsonLd } from '@/components/seo/JsonLd';
import { readingMinutes } from '@/lib/insights';
import { fmtDate } from '@/lib/market';
import { itemListJsonLd } from '@/lib/schema';
import { data } from '@/lib/cms';
import { cmsPageMetadata } from '@/lib/pageSeo';

export async function generateMetadata() {
  const { communities } = (await data()).c;
  return cmsPageMetadata('insights', {
    title: 'Dubai Property Insights: Market Reports & Guides',
    description: 'Dubai property market reports and practical guides on the Golden Visa, mortgages, service charges and off-plan buying, written by RERA-registered specialists.',
    path: '/insights',
    image: communities[7].img,
  });
}

type SP = Promise<Record<string, string | string[] | undefined>>;

/** Insights index. Category chips filter via ?cat= (canonical stays /insights). */
export default async function InsightsPage({ searchParams }: PageProps<'/insights'>) {
  const { communities } = (await data()).c;
  return (
    <>
      <CmsPageHero page="insights" eyebrow="Insights" img={communities[7].img} alt="Dubai skyline at dusk"
        title={[{ text: 'Market news ' }, { text: '& guides', em: true }]}
        sub="Quarterly market reports and plain-English guides to buying, renting and investing in Dubai, written by RERA-registered specialists."
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Insights', href: '/insights' }]} />
      <section aria-label="Articles" className="wrap pb-[clamp(48px,7vw,96px)] pt-8">
        <Suspense fallback={<ResultsSkeleton filterClass="h-10 max-w-[620px] !rounded-full !border-0 bg-mist mb-8" head={false} cardClass="aspect-[16/14]" />}>
          <Articles searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}

async function Articles({ searchParams }: { searchParams: SP }) {
  const { allPosts, categories: used, site } = await data();
  const I = site.insights, T = I.text;
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  // Chips follow the CMS order; categories used by articles but missing from the list still get a chip.
  const names = [...I.categories.map(c => c.name), ...used().filter(c => !I.categories.some(k => k.name === c))]
    .filter(c => used().includes(c));
  const cat = names.find(c => c === one(sp.cat));
  const intro = I.categories.find(c => c.name === cat)?.intro;
  const all = allPosts().filter(p => !cat || p.cat === cat);
  const pick = I.featured === 'pick' ? all.find(p => p.id === I.featuredId) : undefined;
  const ordered = pick ? [pick, ...all.filter(p => p !== pick)] : all;
  const pages = Math.max(1, Math.ceil(ordered.length / I.perPage));
  const page = Math.min(pages, Math.max(1, Number(one(sp.page)) || 1));
  const list = ordered.slice((page - 1) * I.perPage, page * I.perPage);
  const feature = I.featured !== 'none' && page === 1;
  const first = feature ? list[0] : undefined, rest = feature ? list.slice(1) : list;
  const href = (c: string | undefined, n = 1) => {
    const q = new URLSearchParams();
    if (c) q.set('cat', c);
    if (n > 1) q.set('page', String(n));
    return q.size ? `/insights?${q}` : '/insights';
  };
  return (
    <>
      <nav aria-label="Categories" className="mb-8">
        <ul className="flex flex-wrap gap-2">
          {[undefined, ...names].map(c => {
            const on = c === cat;
            return (
              <li key={c ?? 'all'}>
                <Link href={href(c)} scroll={false} aria-current={on ? 'page' : undefined}
                  className={`inline-block rounded-full px-4 py-2 text-[0.88rem] font-semibold transition-[color,box-shadow] ${on ? 'soft-inset-sm text-forest' : 'soft-raised-sm text-ink-2 hover:text-forest active:soft-pressed'}`}>
                  {c ?? T.allLabel}
                </Link>
              </li>
            );
          })}
        </ul>
        {intro && <p className="mt-5 max-w-[760px] text-ink-2">{intro}</p>}
      </nav>

      {!list.length && <p className="rounded-[24px] soft-inset px-6 py-8 text-ink-2">{T.emptyText}</p>}

      {first && (
        <article className="group relative mb-[clamp(36px,5vw,60px)] grid overflow-hidden rounded-[28px] soft-raised p-2.5 lg:grid-cols-[1.25fr_1fr]">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-mint lg:aspect-auto lg:min-h-[380px]">
            <Image src={first.img} alt="" fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover zoom-slow group-hover:scale-[1.05]" />
          </div>
          <div className="flex flex-col justify-center p-[clamp(24px,4vw,48px)]">
            <span className="eyebrow mb-3">{first.cat} · <time dateTime={first.date}>{fmtDate(first.date)}</time> · {readingMinutes(first)} {T.minRead}</span>
            <h2 className="mb-3 text-[clamp(1.5rem,2.6vw,2.1rem)] leading-tight">
              <Link href={`/insights/${first.slug}`} className="after:absolute after:inset-0 after:content-[''] hover:text-forest">{first.title}</Link>
            </h2>
            <p className="mb-5 text-ink-2">{first.excerpt}</p>
            <span className="inline-flex items-center gap-2 font-bold text-forest">{T.readMore} <Icon name="arrow" className="transition-transform duration-300 group-hover:translate-x-1" /></span>
          </div>
        </article>
      )}

      {rest.length > 0 && (
        <div className="grid gap-[clamp(18px,2.4vw,30px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))]">
          {rest.map(p => <PostCard key={p.id} p={p} heading="h2" />)}
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pages" className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {page > 1 && <Link href={href(cat, page - 1)} className="rounded-full soft-raised-sm px-5 py-2.5 font-semibold text-forest active:soft-pressed">← {T.prevLabel}</Link>}
          <span className="px-2 text-[0.9rem] text-muted">{page} / {pages}</span>
          {page < pages && <Link href={href(cat, page + 1)} className="rounded-full soft-raised-sm px-5 py-2.5 font-semibold text-forest active:soft-pressed">{T.nextLabel} →</Link>}
        </nav>
      )}

      {I.nlShow && <InsightsNewsletter title={T.nlTitle} text={T.nlText} id="insights-nl-email" />}

      <JsonLd data={itemListJsonLd(cat ? `Dubai property insights: ${cat}` : 'Dubai property insights', list.map(p => ({ name: p.title, href: `/insights/${p.slug}` })))} />
    </>
  );
}
