import Link from 'next/link';
import { Icon } from '@/components/icons';
import { CmsPageHero } from '@/components/layout/CmsPageHero';
import { ClipReveal } from '@/components/motion/ClipReveal';
import { JsonLd } from '@/components/seo/JsonLd';
import { itemListJsonLd } from '@/lib/schema';
import { data } from '@/lib/cms';
import { fillTokens } from '@/payload/communityDefaults';
import { cmsPageMetadata } from '@/lib/pageSeo';

export async function generateMetadata() {
  const { communities, developers } = (await data()).c;
  return cmsPageMetadata('developers', {
    title: 'Dubai Property Developers & Their Projects',
    description: `Profiles of ${developers.length} Dubai developers we work with, including founding year, track record and their current off-plan launches.`,
    path: '/developers',
    image: communities[7].img,
  });
}

/** Developer directory. Wordmarks are typographic until official logos are licensed. */
export default async function DevelopersPage() {
  const __d = await data();
  const { communities, developers } = __d.c;
  const { liveProjects } = __d;
  const DP = __d.site.developerPage;
  const launches = (slug: string) => liveProjects().filter(p => p.developer === slug).length;
  // Order chosen in the CMS (Developer pages > Developers list); "manual" keeps the Order numbers.
  const list = DP.listOrder === 'name' ? [...developers].sort((a, b) => a.name.localeCompare(b.name))
    : DP.listOrder === 'founded' ? [...developers].sort((a, b) => a.founded - b.founded)
    : DP.listOrder === 'launches' ? [...developers].sort((a, b) => launches(b.slug) - launches(a.slug))
    : developers;
  return (
    <>
      <CmsPageHero page="developers" eyebrow="Partners" img={communities[7].img} alt="Dubai Creek Harbour skyline"
        title={[{ text: 'Dubai ' }, { text: 'developers', em: true }]}
        sub="We work directly with Dubai's master developers, so clients get launch allocations, price lists and payment plans first."
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Developers', href: '/developers' }]} />
      <section aria-label="Developers" className="wrap py-[clamp(36px,5vw,64px)]">
        <ClipReveal as="ul" stagger={0.07} className="grid gap-[clamp(16px,2vw,24px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr))]">
          {list.map(d => {
            const n = launches(d.slug);
            return (
              <li key={d.slug}>
                <Link href={`/developer/${d.slug}`} className="group flex h-full flex-col rounded-[26px] soft-raised p-6 transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-1 hover:shadow-card">
                  <span className="mb-5 grid h-16 place-items-center rounded-[14px] soft-inset-sm font-serif text-[1.5rem] italic text-forest">
                    {DP.showLogos && d.logo
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={d.logo} alt={`${d.name} logo`} className="max-h-10 max-w-[70%] object-contain" />
                      : d.name.split(' ')[0]}
                  </span>
                  <h2 className="mb-1.5 text-[1.3rem] transition-colors group-hover:text-forest">{d.name}</h2>
                  <p className="mb-4 flex-1 text-[0.94rem] text-ink-2">{d.desc}</p>
                  <span className="flex items-center justify-between text-[0.84rem] text-muted">
                    {fillTokens(DP.text.cardLine, { name: d.name, founded: String(d.founded), launches: `${n} ${n === 1 ? 'launch' : 'launches'}`, delivered: String(d.projects || '') })}
                    <Icon name="arrow" className="size-4 text-forest transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ClipReveal>
      </section>
      <JsonLd data={itemListJsonLd('Dubai property developers', developers.map(d => ({ name: d.name, href: `/developer/${d.slug}` })))} />
    </>
  );
}
