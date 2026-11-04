import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PropertyCard } from '@/components/cards/PropertyCard';
import { Icon } from '@/components/icons';
import { PostCard } from '@/components/insights/PostCard';
import { ClipReveal } from '@/components/motion/ClipReveal';
import { SplitHeading } from '@/components/motion/SplitHeading';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { SectionHead } from '@/components/ui/SectionHead';
import { latestFirst } from '@/lib/data';
import { profileJsonLd } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';
import { telHref, waHref } from '@/lib/site';
import { data } from '@/lib/cms';

// Pages added in the CMS after a build (slugs not in generateStaticParams) render on their first visit,
// then are cached. A blocking first render keeps real 404s for unknown slugs (instead of a streamed shell).
export const instant = false;

const bySlug = async (slug: string) => (await data()).agentBySlug(slug);

export async function generateStaticParams() {
  const __d = await data();
  const { agents } = __d.c;
  return agents.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<'/team/[slug]'>): Promise<Metadata> {
  const a = await bySlug((await params).slug);
  if (!a) return {};
  return pageMetadata({
    title: `${a.name}, ${a.title}`,
    description: `${a.name} (RERA BRN ${a.brn}) is a ${a.title} at Splendid Homes in Dubai, speaking ${a.languages.join(', ')} and specialising in ${a.specialties.join(' and ')}.`,
    path: `/team/${a.slug}`,
    image: a.img,
  });
}

export default async function AgentPage({ params }: PageProps<'/team/[slug]'>) {
  const { site } = await data();
  const __d = await data();
  const { allPosts, publishedProperties } = __d;
  const a = await bySlug((await params).slug);
  if (!a) notFound();
  const listings = latestFirst(publishedProperties().filter(p => p.agent === a.id));
  const articles = allPosts().filter(p => p.author === a.id);
  const first = a.name.split(' ')[0];
  const AT = site.aboutTeam, T = AT.text;
  const fill = (t: string) => t.replaceAll('{first}', first);
  const facts: [string, string][] = [
    [T.labelBrn, a.brn], [T.labelLanguages, a.languages.join(', ')], [T.labelAreas, a.specialties.join(', ')],
    ...(AT.showDeals && a.deals ? [[T.labelDeals, String(a.deals)] as [string, string]] : []),
  ];
  const socials = [['LinkedIn', a.linkedin], ['Instagram', a.instagram]].filter(([, u]) => u);

  return (
    <>
      <section className="wrap grid items-center gap-[clamp(28px,5vw,64px)] pt-6 lg:grid-cols-[0.85fr_1fr]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[32px_140px_32px_32px] bg-mint max-lg:max-h-[520px] max-sm:rounded-[24px_80px_24px_24px]">
          <Image src={a.img} alt={`${a.name}, ${a.title}`} fill preload sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
        </div>
        <div>
          <Breadcrumbs className="mb-5" items={[{ name: 'Home', href: '/' }, { name: 'Team', href: '/team' }, { name: a.name, href: `/team/${a.slug}` }]} />
          <span className="eyebrow mb-3">{a.title}</span>
          <SplitHeading as="h1" trigger="load" segments={[{ text: a.name }]} className="mb-4 text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.06]" />
          <p className="mb-6 max-w-[56ch] text-[1.1rem] text-ink-2">{a.bio}</p>
          <dl className="mb-7 grid grid-cols-2 gap-3">
            {facts.map(([k, v]) => (
              <div key={k} className="rounded-[14px] soft-inset-sm px-4 py-3">
                <dt className="text-[0.74rem] font-semibold uppercase tracking-[0.06em] text-muted">{k}</dt>
                <dd className="font-bold">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-2.5">
            <a href={waHref(AT.waTo === 'agent' ? a.phone : site.whatsapp, fill(T.cardMessage))} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full shadow-btn bg-[#127A3F] px-5 py-3 font-bold text-white"><Icon name="wa" /> {T.profileWhatsapp}</a>
            <a href={telHref(a.phone)} className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 font-bold text-white"><Icon name="phone" /> {a.phone}</a>
            <a href={`mailto:${a.email}`} className="inline-flex items-center gap-2 rounded-full soft-raised active:soft-pressed px-5 py-3 font-bold transition-colors hover:border-forest hover:text-forest"><Icon name="mail" /> {T.profileEmail}</a>
          </div>
          {socials.length > 0 && (
            <ul aria-label={`${a.name} online`} className="mt-4 flex flex-wrap gap-2">
              {socials.map(([n, u]) => (
                <li key={n}><a href={u} target="_blank" rel="noopener me" className="inline-flex rounded-full soft-raised-sm px-4 py-2 text-[0.86rem] font-bold text-forest hover:soft-inset-sm">{n} ↗</a></li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {listings.length > 0 && (
        <section aria-labelledby="agent-listings" className="cv-auto wrap pt-[clamp(56px,8vw,110px)]">
          <SectionHead id="agent-listings" eyebrow={T.listingsEyebrow} title={[{ text: `${fill(T.listingsTitle)} ` }, { text: T.listingsItalic, em: true }]} />
          <ClipReveal className="grid gap-[clamp(18px,2.4vw,30px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr))]">
            {listings.map(p => <PropertyCard key={p.id} p={p} />)}
          </ClipReveal>
        </section>
      )}

      {articles.length > 0 && (
        <section aria-labelledby="agent-articles" className="cv-auto wrap pt-[clamp(56px,8vw,110px)]">
          <SectionHead id="agent-articles" eyebrow={T.articlesEyebrow} title={[{ text: `${fill(T.articlesTitle)} ` }, { text: first, em: true }]} link="/insights" linkLabel="All articles" />
          <ClipReveal className="grid gap-[clamp(18px,2.4vw,30px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))]">
            {articles.map(p => <PostCard key={p.id} p={p} />)}
          </ClipReveal>
        </section>
      )}

      <JsonLd data={profileJsonLd(a)} />
    </>
  );
}
