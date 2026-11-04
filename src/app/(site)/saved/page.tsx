import type { Metadata } from 'next';
import { PropertyCard } from '@/components/cards/PropertyCard';
import { CmsPageHero } from '@/components/layout/CmsPageHero';
import { SavedList } from '@/components/ui/SavedList';
import { latestFirst } from '@/lib/data';
import { cmsPageMetadata } from '@/lib/pageSeo';
import { data } from '@/lib/cms';

// Personal, device-specific page: never indexed.
export async function generateMetadata(): Promise<Metadata> {
  return { ...await cmsPageMetadata('saved', { title: 'Saved Properties', description: 'Your shortlist of saved Dubai properties for sale and rent, kept on this device so you can compare them later.', path: '/saved' }), robots: { index: false, follow: true } };
}

export default async function SavedPage() {
  const __d = await data();
  const { communities } = __d.c;
  const { publishedProperties } = __d;
  const cards = latestFirst(publishedProperties()).map(p => ({ id: p.id, card: <PropertyCard p={p} /> }));
  return (
    <>
      <CmsPageHero page="saved" eyebrow="Shortlist" img={communities[2].img} alt="Dubai Marina"
        title={[{ text: 'Saved ' }, { text: 'properties', em: true }]} sub="Your favourites, saved on this device."
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Saved', href: '/saved' }]} />
      <section aria-label="Saved properties" className="wrap py-[clamp(40px,6vw,80px)]">
        <SavedList cards={cards} text={__d.site.compare.text} buttons={__d.site.compare.savedButtons} />
      </section>
    </>
  );
}
