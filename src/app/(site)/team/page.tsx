import Link from 'next/link';
import { Suspense } from 'react';
import { AgentCard } from '@/components/cards/AgentCard';
import { AgentsSoon } from '@/components/ui/AgentsSoon';
import { CmsPageHero } from '@/components/layout/CmsPageHero';
import { ResultsSkeleton } from '@/components/listings/ResultsSkeleton';
import { JsonLd } from '@/components/seo/JsonLd';
import { itemListJsonLd } from '@/lib/schema';
import { data } from '@/lib/cms';
import { cmsPageMetadata } from '@/lib/pageSeo';

const languages = async () => [...new Set((await data()).c.agents.flatMap(a => a.languages))].sort();

export async function generateMetadata() {
  const { communities } = (await data()).c;
  const LANGS = await languages();
  return cmsPageMetadata('team', {
    title: 'Our Team: RERA-Registered Property Consultants',
    description: LANGS.length ? `Meet the Splendid Homes team: RERA-registered consultants in Dubai speaking ${LANGS.join(', ')}. Find a specialist by language and area.` : 'Meet the Splendid Homes team of property consultants in Dubai.',
    path: '/team',
    image: communities[1].img,
  });
}

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function TeamPage({ searchParams }: PageProps<'/team'>) {
  const LANGS = await languages();
  const __d = await data();
  const { communities } = __d.c;
  return (
    <>
      <CmsPageHero page="team" eyebrow="Our people" img={communities[1].img} alt="Downtown Dubai skyline"
        title={[{ text: 'Meet the ' }, { text: 'team', em: true }]}
        sub={LANGS.length ? `RERA-registered specialists speaking ${LANGS.length} languages, each with a broker registration number (BRN) you can verify.` : ''}
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Team', href: '/team' }]} />
      <section aria-label="Team members" className="wrap py-[clamp(36px,5vw,64px)]">
        <Suspense fallback={<ResultsSkeleton filterClass="h-10 max-w-[620px] !rounded-full !border-0 bg-mist mb-8" head={false} />}>
          <Members searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}

async function Members({ searchParams }: { searchParams: SP }) {
  const LANGS = await languages();
  const __d = await data();
  const { agents } = __d.c;
  if (!agents.length) return <AgentsSoon />;
  const raw = (await searchParams).lang;
  const lang = LANGS.find(l => l === (Array.isArray(raw) ? raw[0] : raw));
  const list = agents.filter(a => !lang || a.languages.includes(lang));
  return (
    <>
      <nav aria-label="Filter by language" className="mb-8">
        <ul className="flex flex-wrap gap-2">
          {[undefined, ...LANGS].map(l => (
            <li key={l ?? 'all'}>
              <Link href={l ? `/team?lang=${l}` : '/team'} scroll={false} aria-current={l === lang ? 'page' : undefined}
                className={`inline-block rounded-full px-4 py-2 text-[0.88rem] font-semibold transition-[color,box-shadow] ${l === lang ? 'soft-inset-sm text-forest' : 'soft-raised-sm text-ink-2 hover:text-forest active:soft-pressed'}`}>
                {l ?? __d.site.aboutTeam.text.allLanguages}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <ul className="grid gap-[clamp(18px,2.4vw,30px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr))]">
        {list.map(a => <li key={a.id}><AgentCard a={a} heading="h2" /></li>)}
      </ul>
      <JsonLd data={itemListJsonLd('Splendid Homes team', list.map(a => ({ name: a.name, href: `/team/${a.slug}` })))} />
    </>
  );
}
