import Link from 'next/link';
import { Suspense } from 'react';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { Icon, type IconName } from '@/components/icons';
import { CmsPageHero } from '@/components/layout/CmsPageHero';
import { AutoFilterForm } from '@/components/listings/AutoFilterForm';
import { ResultsSkeleton } from '@/components/listings/ResultsSkeleton';
import { JsonLd } from '@/components/seo/JsonLd';
import { shortAed } from '@/lib/listings';
import { filterProjects, parseProjectFilters } from '@/lib/offplan';
import { itemListJsonLd } from '@/lib/schema';
import { data } from '@/lib/cms';
import { fillFees } from '@/payload/feeDefaults';
import { cmsPageMetadata } from '@/lib/pageSeo';

export async function generateMetadata() {
  const { communities } = (await data()).c;
  return cmsPageMetadata('offPlan', {
    title: 'Off-Plan Projects in Dubai: New Launches',
    description: 'New off-plan launches in Dubai from leading developers, with starting prices in AED, handover dates and payment plans. Filter by developer, community, handover year and budget.',
    path: '/off-plan',
    image: communities[7].img,
  });
}

type SP = Promise<Record<string, string | string[] | undefined>>;

/** Off-plan list. Static hero shell; filtered results render per request (canonical stays /off-plan). */
export default async function OffPlanPage({ searchParams }: PageProps<'/off-plan'>) {
  const __d = await data();
  const { communities } = __d.c;
  const { liveProjects } = __d;
  const O = __d.site.offplan, T = O.text;
  return (
    <>
      <CmsPageHero page="offPlan" eyebrow="New launches" img={communities[7].img} alt="Dubai Creek Harbour skyline"
        title={[{ text: 'Off-plan projects ' }, { text: 'in Dubai', em: true }]}
        sub={`${liveProjects().length} new developments with starting prices, handover dates and payment plans, sourced directly from Dubai's leading developers.`}
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Off-plan', href: '/off-plan' }]} />
      <section aria-label="Projects" className="wrap pb-[clamp(48px,7vw,96px)] pt-6">
        <Suspense fallback={<ResultsSkeleton filterClass="h-[132px] lg:h-[76px]" />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </section>
      <section aria-labelledby="why-offplan" className="cv-auto bg-mist py-[clamp(48px,7vw,90px)]">
        <div className="wrap">
          <span className="eyebrow mb-3">{T.whyEyebrow}</span>
          <h2 id="why-offplan" className="mb-8 text-[clamp(1.6rem,2.8vw,2.3rem)]">{T.whyTitle}{T.whyItalic && <> <em>{T.whyItalic}</em></>}</h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {O.whyCards.map(({ icon, title: t, text: d }) => (
              <li key={t} className="rounded-[24px] soft-raised p-6 transition-[translate] duration-500 ease-[cubic-bezier(.16,1,.3,1)] pointer-fine:hover:-translate-y-1">
                <span className="mb-4 grid size-11 place-items-center rounded-full soft-raised-sm text-gold"><Icon name={icon as IconName} /></span>
                <h3 className="mb-1.5 text-[1.1rem]">{t}</h3>
                <p className="text-[0.93rem] text-ink-2">{fillFees(d, __d.site.fees)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

async function Results({ searchParams }: { searchParams: SP }) {
  const __d = await data();
  const { communities, developers } = __d.c;
  const { communityName, developerName, handoverYears, liveProjects } = __d;
  const O = __d.site.offplan, T = O.text;
  const f = parseProjectFilters(await searchParams, __d, O.budgets);
  const list = filterProjects(__d, f);
  const values = { developer: f.developer ?? '', community: f.community ?? '', year: f.year ?? '', max: f.max ? String(f.max) : '' };
  const used = new Set(liveProjects().flatMap(p => [p.developer, p.community]));
  const active = [f.developer && developerName(f.developer), f.community && communityName(f.community), f.year && `Handover ${f.year}`, f.max && `Under AED ${shortAed(f.max)}`].filter(Boolean);

  return (
    <AutoFilterForm action="/off-plan" label="Filter off-plan projects" values={values} fields={[
      { name: 'developer', label: T.fDeveloper, any: 'All developers', options: developers.filter(d => used.has(d.slug)).map(d => [d.slug, d.name]) },
      { name: 'community', label: T.fCommunity, any: 'All areas', options: communities.filter(c => used.has(c.slug)).map(c => [c.slug, c.name]) },
      { name: 'year', label: T.fYear, any: 'Any handover', options: handoverYears().map(y => [y, `Handover ${y}`]) },
      { name: 'max', label: T.fBudget, any: 'Any budget', options: O.budgets.map(b => [String(b), `From under AED ${shortAed(b)}`]) },
    ]}>
      <div className="mb-6 mt-7 flex flex-wrap items-center justify-between gap-3">
        <h2 aria-live="polite" className="text-[clamp(1.2rem,2vw,1.5rem)]">
          {list.length} off-plan {list.length === 1 ? 'project' : 'projects'}{active.length ? ` · ${active.join(' · ')}` : ''}
        </h2>
        {active.length > 0 && <Link href="/off-plan" scroll={false} className="rounded-full soft-raised-sm px-4 py-2 text-[0.85rem] font-bold text-forest active:soft-pressed">{T.clearFilters}</Link>}
      </div>
      {list.length ? (
        <div className="grid gap-[clamp(18px,2.4vw,30px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr))]">
          {list.map(p => <ProjectCard key={p.id} p={p} />)}
        </div>
      ) : (
        <div className="rounded-[28px] soft-inset px-6 py-14 text-center">
          <p className="mb-1 text-[1.2rem] font-bold">{T.emptyTitle}</p>
          <p className="mb-6 text-ink-2">{T.emptyText}</p>
          <Link href="/off-plan" scroll={false} className="inline-block rounded-full bg-forest px-6 py-3 font-bold text-white shadow-btn">{T.emptyCta}</Link>
        </div>
      )}
      {list.length > 0 && <JsonLd data={itemListJsonLd('Off-plan projects in Dubai', list.map(p => ({ name: p.name, href: `/off-plan/${p.slug}` })))} />}
    </AutoFilterForm>
  );
}
