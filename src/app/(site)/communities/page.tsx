import { CommunityGrid } from '@/components/community/CommunityGrid';
import { CompareTable } from '@/components/community/CompareTable';
import { CmsPageHero } from '@/components/layout/CmsPageHero';
import { JsonLd } from '@/components/seo/JsonLd';
import { itemListJsonLd } from '@/lib/schema';
import { data } from '@/lib/cms';
import { fillTokens, RANK_OPTIONS } from '@/payload/communityDefaults';
import { cmsPageMetadata } from '@/lib/pageSeo';

export async function generateMetadata() {
  const { c } = await data();
  const { communities } = c;
  return cmsPageMetadata('communities', {
    title: 'Dubai Communities: Area Guides, Prices & Yields',
    description: `Compare ${communities.length} Dubai communities on price per sq ft, rent and rental yield, with area guides, live listings and FAQs for each.`,
    path: '/communities',
    image: communities[1].img,
  });
}

export default async function CommunitiesPage() {
  const __d = await data();
  const { communities } = __d.c;
  const { avgYield, byYield, communityCounts } = __d;
  const top = byYield()[0];
  const CT = __d.site.communityPage.text;
  return (
    <>
      <CmsPageHero page="communities" eyebrow="Area guides" img={communities[1].img} alt="Downtown Dubai skyline"
        title={[{ text: 'Dubai ' }, { text: 'communities', em: true }]}
        sub={`Average gross rental yields across the ${communities.length} areas we cover run at ${avgYield().toFixed(1)}%, led by ${top.name} at ${top.roi}%. Explore each area's lifestyle, prices and homes.`}
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Communities', href: '/communities' }]} />

      <section aria-label="All communities" className="wrap py-[clamp(36px,5vw,64px)]">
        <CommunityGrid chips={__d.site.communityPage.life} allLabel={__d.site.communityPage.text.allAreas} figures={__d.site.communityPage.cardFigures} showChips={__d.site.communityPage.showCardChips} items={communities.map(c => {
          const n = communityCounts(c.slug);
          return { slug: c.slug, name: c.name, tag: c.tag, img: c.img, roi: c.roi, avgSale: c.avgSale, avgRent: c.avgRent, listings: n.sale + n.rent, life: c.life };
        })} />
      </section>

      <section aria-labelledby="compare" className="cv-auto bg-mist py-[clamp(48px,7vw,96px)]">
        <div className="wrap">
          <span className="eyebrow mb-3">{CT.listCompareEyebrow}</span>
          <h2 id="compare" className="mb-3 text-[clamp(1.6rem,2.8vw,2.3rem)]">{CT.listCompareTitle}{CT.listCompareItalic && <> <em>{CT.listCompareItalic}</em></>}</h2>
          {CT.listCompareIntro && <p className="mb-6 max-w-[64ch] text-ink-2">{fillTokens(CT.listCompareIntro, { rankedBy: RANK_OPTIONS.find(r => r.value === __d.site.communityPage.rankBy)!.words, count: String(communities.length) })}</p>}
          <CompareTable caption="Dubai communities compared by price, rent and yield" />
        </div>
      </section>

      <JsonLd data={itemListJsonLd('Dubai communities', communities.map(c => ({ name: c.name, href: `/community/${c.slug}` })))} />
    </>
  );
}
