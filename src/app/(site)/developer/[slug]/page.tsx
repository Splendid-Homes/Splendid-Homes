import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { PropertyCard } from '@/components/cards/PropertyCard';
import { Icon } from '@/components/icons';
import { PageHero } from '@/components/layout/PageHero';
import { ClipReveal } from '@/components/motion/ClipReveal';
import { JsonLd } from '@/components/seo/JsonLd';
import { SectionHead } from '@/components/ui/SectionHead';
import { latestFirst } from '@/lib/data';
import { developerJsonLd } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';
import { data } from '@/lib/cms';
import { fillTokens } from '@/payload/communityDefaults';
import { FaqBlock } from '@/components/seo/FaqBlock';

const bySlug = async (slug: string) => (await data()).developerBySlug(slug);

export async function generateStaticParams() {
  return (await data()).c.developers.map(d => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<'/developer/[slug]'>): Promise<Metadata> {
  const __d = await data();
  const { communities } = __d.c;
  const { liveProjects } = __d;
  const d = await bySlug((await params).slug);
  if (!d) return {};
  const n = liveProjects().filter(p => p.developer === d.slug).length;
  return pageMetadata({
    title: `${d.name}: Projects in Dubai`,
    description: `${d.desc} Founded in ${d.founded}. ${n ? `${n} current off-plan ${n === 1 ? 'launch' : 'launches'} and` : 'Ready'} homes by ${d.name} with Splendid Homes.`,
    path: `/developer/${d.slug}`,
    image: liveProjects().find(p => p.developer === d.slug)?.img ?? communities[1].img,
  });
}

export default async function DeveloperPage({ params }: PageProps<'/developer/[slug]'>) {
  const __d = await data();
  const { communities } = __d.c;
  const { liveProjects, publishedProperties } = __d;
  const d = await bySlug((await params).slug);
  if (!d) notFound();
  const projects = liveProjects().filter(p => p.developer === d.slug);
  const allResale = publishedProperties().filter(p => p.developer === d.slug);
  // Shared wording and options: CMS > Developer pages. Tokens: {name} {founded} {launches} {delivered}.
  const DP = __d.site.developerPage, T = DP.text;
  const fill = (t: string) => fillTokens(t, { name: d.name, founded: String(d.founded), launches: String(projects.length), delivered: String(d.projects || '') });
  const resale = DP.showResale ? latestFirst(allResale).slice(0, DP.resaleCount) : [];
  const hero = d.heroImage || projects[0]?.img || communities[1].img;
  const facts: [string, string][] = [
    [T.factFounded, String(d.founded)],
    [T.factDelivered, d.projects ? String(d.projects) : '–'],
    [T.factLaunches, String(projects.length)],
    [T.factReady, String(allResale.length)],
  ];
  const showSide = DP.showFacts || (DP.showKnownFor && d.knownFor.length > 0);

  return (
    <>
      <PageHero eyebrow={fill(T.heroEyebrow)} img={hero} alt={d.heroImage ? d.name : projects[0] ? `${projects[0].name} by ${d.name}` : 'Dubai skyline'}
        title={[{ text: d.name }]} sub={d.desc}
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Developers', href: '/developers' }, { name: d.name, href: `/developer/${d.slug}` }]}>
        {d.website && (
          <a href={d.website} target="_blank" rel="noopener" className="mt-5 inline-flex items-center gap-2 rounded-full bg-mist/95 px-5 py-2.5 text-[0.9rem] font-bold text-forest shadow-btn transition hover:brightness-105">
            {fill(T.websiteCta)} <Icon name="arrow" className="size-4 -rotate-45" />
          </a>
        )}
      </PageHero>

      {d.about && (
        <section aria-labelledby="dev-about" className="wrap pt-[clamp(40px,6vw,80px)]">
          <div className={`grid gap-[clamp(20px,3vw,40px)] rounded-[30px] soft-raised p-[clamp(20px,3vw,36px)] ${showSide ? 'lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]' : ''}`}>
            <div>
              <span className="eyebrow mb-3">{fill(T.aboutEyebrow)}</span>
              <h2 id="dev-about" className="mb-4 text-[clamp(1.5rem,2.6vw,2.1rem)]">{fill(T.aboutTitle)} <em>{d.name}</em></h2>
              {d.about.split(/\n\s*\n/).map((t, i) => <p key={i} className="mb-3 leading-[1.75] text-ink-2 last:mb-0">{t.trim()}</p>)}
            </div>
            {showSide && <div className="flex flex-col gap-4">
              {DP.showFacts && <dl className="grid grid-cols-2 gap-3 rounded-[22px] soft-inset p-2.5">
                {facts.map(([k, v]) => (
                  <div key={k} className="flex flex-col-reverse gap-0.5 rounded-[16px] soft-raised-sm px-4 py-3.5">
                    <dt className="text-[0.72rem] font-extrabold uppercase tracking-[0.05em] text-muted">{k}</dt>
                    <dd className="text-[1.35rem] font-extrabold tracking-[-0.02em] text-forest">{v}</dd>
                  </div>
                ))}
              </dl>}
              {DP.showKnownFor && d.knownFor.length > 0 && (
                <div>
                  <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-muted">{fill(T.knownForLabel)}</p>
                  <ul className="flex flex-wrap gap-2">
                    {d.knownFor.map(k => (
                      <li key={k} className="inline-flex items-center gap-1.5 rounded-full soft-raised-sm px-3 py-1.5 text-[0.84rem] font-bold text-forest"><Icon name="check" className="size-3.5 text-gold" />{k}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>}
          </div>
        </section>
      )}

      <section aria-labelledby="dev-projects" className="wrap pt-[clamp(40px,6vw,80px)]">
        <SectionHead id="dev-projects" eyebrow={fill(T.projectsEyebrow)} title={[{ text: `${fill(T.projectsTitle)} ` }, { text: d.name, em: true }]} link="/off-plan" linkLabel={fill(T.projectsLink)} />
        {projects.length ? (
          <ClipReveal className="grid gap-[clamp(18px,2.4vw,30px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr))]">
            {projects.map(p => <ProjectCard key={p.id} p={p} />)}
          </ClipReveal>
        ) : (
          <p className="rounded-[24px] soft-inset px-6 py-8 text-ink-2">{fill(T.emptyText)} <Link href="/contact" className="font-bold text-forest underline-offset-4 hover:underline">{fill(T.emptyLink)}</Link>.</p>
        )}
      </section>

      {resale.length > 0 && (
        <section aria-labelledby="dev-resale" className="cv-auto wrap pt-[clamp(56px,8vw,110px)]">
          <SectionHead id="dev-resale" eyebrow={fill(T.resaleEyebrow)} title={[{ text: `${d.name} ` }, { text: fill(T.resaleItalic), em: true }]} />
          <ClipReveal className="grid gap-[clamp(18px,2.4vw,30px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr))]">
            {resale.map(p => <PropertyCard key={p.id} p={p} />)}
          </ClipReveal>
        </section>
      )}

      {d.faqs.length > 0 && (
        <div className="wrap max-w-[880px] pt-[clamp(56px,8vw,110px)]">
          <FaqBlock id="developer-faq" faqs={d.faqs.map(x => ({ q: fill(x.q), a: fill(x.a) }))} title={fill(T.faqTitle)} />
        </div>
      )}

      <JsonLd data={developerJsonLd(d)} />
    </>
  );
}
