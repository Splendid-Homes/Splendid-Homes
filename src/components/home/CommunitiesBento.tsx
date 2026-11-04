import { SectionHead } from '@/components/ui/SectionHead';
import { data } from '@/lib/cms';
import { CommunityCoverflow } from './CommunityCoverflow';
import { sectionCopy, titleSegments } from '@/lib/homeCopy';

/**
 * Popular communities ("Where to live"): a 3D coverflow of every community in CMS order, the
 * centre one large with its yield, price and rent (see CommunityCoverflow).
 */
export async function CommunitiesBento() {
  const copy = await sectionCopy('communities');
  const d = await data();
  const items = d.c.communities.map(c => ({ slug: c.slug, name: c.name, tag: c.tag, img: c.img, roi: c.roi, avgSale: c.avgSale, avgRent: c.avgRent }));
  if (!items.length) return null;
  return (
    <section aria-labelledby="comm-title" className="py-[clamp(56px,8vw,110px)]">
      <div className="wrap">
        <SectionHead id="comm-title" eyebrow={copy.eyebrow} link="/communities" linkLabel="Explore all areas"
          title={titleSegments(copy)} />
        <CommunityCoverflow items={items} />
      </div>
    </section>
  );
}
