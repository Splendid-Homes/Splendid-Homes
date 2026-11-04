import type { Metadata } from 'next';
import { CompareView, type CompareRow } from '@/components/compare/CompareView';
import { CmsPageHero } from '@/components/layout/CmsPageHero';
import { latestFirst } from '@/lib/data';
import { cmsPageMetadata } from '@/lib/pageSeo';
import { data } from '@/lib/cms';

// Personal, device-specific page: never indexed.
export async function generateMetadata(): Promise<Metadata> {
  return { ...await cmsPageMetadata('compare', { title: 'Compare Properties', description: 'Compare up to three Dubai properties side by side: location, developer, price, price per sq ft, size and more.', path: '/compare' }), robots: { index: false, follow: true } };
}

export default async function ComparePage() {
  const d = await data();
  const rows: CompareRow[] = latestFirst(d.publishedProperties()).map(p => ({
    id: p.id, slug: p.slug, title: p.title, img: p.images[0], purpose: p.purpose, type: p.type, price: p.price,
    beds: p.beds, baths: p.baths, size: p.size, building: p.building,
    community: p.community, communityName: d.communityName(p.community),
    developer: p.developer, developerName: p.developer ? d.developerName(p.developer) : '',
    status: p.status, completion: p.completion, serviceCharge: p.serviceCharge, furnishing: p.furnishing, view: p.view, parking: p.parking,
  }));
  return (
    <>
      <CmsPageHero page="compare" eyebrow="Side by side" img={d.c.communities[0].img} alt="Dubai skyline"
        title={[{ text: 'Compare ' }, { text: 'properties', em: true }]} sub="Pick up to three homes and see location, developer and pricing side by side."
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Compare', href: '/compare' }]} />
      <section aria-label="Compare properties" className="wrap py-[clamp(40px,6vw,80px)]">
        <CompareView rows={rows} cfg={d.site.compare} />
      </section>
    </>
  );
}
