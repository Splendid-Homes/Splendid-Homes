import Image from 'next/image';
import { AgentCard } from '@/components/cards/AgentCard';
import { Icon, type IconName } from '@/components/icons';
import { CmsPageHero } from '@/components/layout/CmsPageHero';
import { ClipReveal } from '@/components/motion/ClipReveal';
import { CountUp } from '@/components/motion/CountUp';
import { JsonLd } from '@/components/seo/JsonLd';
import { SectionHead } from '@/components/ui/SectionHead';
import { data } from '@/lib/cms';
import { absoluteUrl } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';
import { cmsPageMetadata } from '@/lib/pageSeo';

export async function generateMetadata() {
  const { site: SITE, heroCommunity } = await data();
  return cmsPageMetadata('about', {
    title: 'About Splendid Homes: Dubai Real Estate Agency',
    description: `${SITE.description} RERA ORN ${SITE.orn}. Office in ${SITE.address.full}.`,
    path: '/about',
    image: heroCommunity(0)?.img,
  });
}

export default async function AboutPage() {
  const { site: SITE, c, heroCommunity } = await data();
  const { agents } = c;
  const hero = heroCommunity(0), side = heroCommunity(1);
  const s = SITE.stats;
  const AT = SITE.aboutTeam, T = AT.text;
  const fill = (t: string) => t.replaceAll('{company}', SITE.legalName).replaceAll('{orn}', SITE.orn);
  // Picked in the CMS (in that order), else the first four in the team order.
  const leaders = AT.leaders.length ? AT.leaders.map(id => agents.find(a => a.id === id)).filter(a => !!a) : agents.slice(0, 4);
  const stats: [string, string][] = [[`${s.years}+`, 'Years in Dubai'], [s.sold, 'Property sold'], [s.clients, 'Happy clients'], [`${s.agents}+`, 'Expert agents']];
  return (
    <>
      <CmsPageHero page="about" eyebrow="About us" img={hero?.img ?? ''} alt={`${hero?.name ?? 'Dubai'}, Dubai`}
        title={[{ text: 'A house of ' }, { text: 'splendid living', em: true }]} sub={SITE.tagline}
        crumbs={[{ name: 'Home', href: '/' }, { name: 'About', href: '/about' }]} />

      <section aria-labelledby="story" className="wrap grid items-center gap-[clamp(28px,5vw,64px)] py-[clamp(48px,7vw,96px)] lg:grid-cols-2">
        <div>
          <span className="eyebrow mb-3">{T.storyEyebrow}</span>
          <h2 id="story" className="mb-4 text-[clamp(1.6rem,2.8vw,2.3rem)]">{T.storyTitle}{T.storyItalic && <> <em>{T.storyItalic}</em></>}</h2>
          {T.storyText1 && <p className="mb-4 text-[1.1rem] text-ink-2">{fill(T.storyText1)}</p>}
          {T.storyText2 && <p className="text-ink-2">{fill(T.storyText2)}</p>}
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[32px_32px_32px_120px] bg-mint">
          <Image src={AT.storyImage || side?.img || ''} alt={AT.storyImage ? SITE.name : `${side?.name ?? 'Dubai'}, Dubai`} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>

      {AT.showStats && <section aria-label="Splendid Homes in numbers" className="wrap">
        <dl className="grid grid-cols-2 gap-3 rounded-[26px] soft-inset p-2.5 lg:grid-cols-4">
          {stats.map(([v, l]) => (
            <div key={l} className="flex flex-col-reverse gap-1 rounded-[18px] soft-raised-sm px-6 py-6">
              <dt className="text-[0.85rem] font-semibold text-muted">{l}</dt>
              <dd className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-extrabold tracking-[-0.03em] text-forest"><CountUp value={v} /></dd>
            </div>
          ))}
        </dl>
      </section>}

      <section aria-labelledby="values" className="cv-auto wrap py-[clamp(48px,7vw,96px)]">
        <h2 id="values" className="mb-8 text-[clamp(1.6rem,2.8vw,2.3rem)]">{T.valuesTitle}{T.valuesItalic && <> <em>{T.valuesItalic}</em></>}</h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {AT.values.map(({ icon, title: t, text: d }) => (
            <li key={t} className="rounded-[24px] soft-raised p-6">
              <span className="mb-4 grid size-11 place-items-center rounded-full soft-raised-sm text-gold"><Icon name={icon as IconName} /></span>
              <h3 className="mb-1.5 text-[1.15rem]">{t}</h3>
              <p className="text-[0.94rem] text-ink-2">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="leadership" className="cv-auto bg-mist py-[clamp(48px,7vw,96px)]">
        <div className="wrap">
          <SectionHead id="leadership" eyebrow={T.leadEyebrow} title={[{ text: T.leadItalic ? `${T.leadTitle} ` : T.leadTitle }, ...(T.leadItalic ? [{ text: T.leadItalic, em: true }] : [])]} link="/team" linkLabel={T.leadLink} />
          <ClipReveal as="ul" className="grid gap-[clamp(18px,2.4vw,30px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,230px),1fr))]">
            {leaders.map(a => <li key={a.id}><AgentCard a={a} /></li>)}
          </ClipReveal>
        </div>
      </section>

      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'AboutPage', url: absoluteUrl('/about'), name: `About ${SITE.name}`, about: { '@id': `${SITE_URL}/#organization` } }} />
    </>
  );
}
