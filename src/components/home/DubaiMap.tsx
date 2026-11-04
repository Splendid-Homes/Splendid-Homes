import { AreaFinder, type FinderArea } from './AreaFinder';
import { data } from '@/lib/cms';
import { MAP, MAP_H, MAP_W, project } from '@/lib/dubaiMap';
import { sectionCopy, TitleText } from '@/lib/homeCopy';

/**
 * "Dubai, mapped": the area finder. Visitors tap what matters (beach, metro, schools, yield…)
 * and matching communities light up as photo pins on an embossed map, with a list explaining
 * why each fits. Lifestyle facts are edited per community in the CMS.
 */
export async function DubaiMap() {
  const copy = await sectionCopy('map');
  const { c, site } = await data();
  const areas: FinderArea[] = c.communities.map(m => {
    const [x, y] = project(m.coords);
    return { slug: m.slug, name: m.name, img: m.img, roi: m.roi, avgSale: m.avgSale, x, y, ...m.life };
  });
  if (!areas.length) return null;
  return (
    <section aria-labelledby="map-title" className="bg-mist py-[clamp(56px,7vw,100px)]">
      <div className="wrap">
        <span className="eyebrow mb-3">{copy.eyebrow}</span>
        <h2 id="map-title" className="mb-2 text-[clamp(1.8rem,3.2vw,2.8rem)]">
          <TitleText c={copy} />
        </h2>
        <p className="mb-[clamp(24px,3vw,36px)] max-w-[60ch] text-muted">{copy.intro}</p>
        <AreaFinder areas={areas} wants={site.home.finder} geo={{ w: MAP_W, h: MAP_H, land: MAP.land, creek: MAP.creek, roads: MAP.roads, palm: MAP.palm, world: MAP.world }} />
        <p className="mt-5 text-[0.78rem] text-muted">Yields and prices: {site.market.source}{site.market.updated ? `, ${site.market.updated}` : ''}.</p>
      </div>
    </section>
  );
}
