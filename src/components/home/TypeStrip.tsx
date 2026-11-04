import type { IconName } from '@/components/icons';
import { data } from '@/lib/cms';
import { filterListings, listingHref, type Filters } from '@/lib/listings';
import { TypeShowcase, type TypeRow } from './TypeShowcase';
import { sectionCopy, TitleText } from '@/lib/homeCopy';

/**
 * "Browse by budget" (soft UI): a deck of price-band cards plus the latest off-plan launches
 * (see TypeShowcase). Counts and photos come from the CMS; each card links to its filtered results.
 */
export async function TypeStrip() {
  const copy = await sectionCopy('budget');
  const d = await data();
  const fallback = d.c.site.home.heroImage;
  const project = d.liveProjects()[0];
  const rows: TypeRow[] = [
    // Price ranges from the CMS (Site settings > Homepage), in its order.
    ...d.c.site.home.bands.map(b => {
      // Cheapest first, so each band opens at its lower bound (3M, then 4M, then 5M…).
      const f: Filters = { min: b.min, max: b.max, sort: 'price-asc' };
      const list = filterListings(d, 'buy', f);
      const p = list[0];
      return {
        label: b.label, href: listingHref('buy', f), blurb: b.blurb, icon: b.icon as IconName, count: list.length,
        meta: `${list.length} ${list.length === 1 ? 'property' : 'properties'}`,
        img: p?.images[0] ?? fallback,
        caption: p ? { title: p.title, place: `${p.building}, ${d.communityName(p.community)}` } : null,
      };
    }),
    ...(!d.c.site.home.launches.show ? [] : [{
      label: 'Latest launches', href: '/off-plan', icon: 'crane', count: d.liveProjects().length,
      meta: `${d.liveProjects().length} new projects`,
      blurb: d.c.site.home.launches.blurb,
      img: project?.img ?? fallback,
      caption: project ? { title: project.name, place: d.communityName(project.community) } : null,
    } satisfies TypeRow]),
  ];
  return (
    <section aria-labelledby="types-title" className="bg-mist py-[clamp(48px,6vw,88px)]">
      <div className="wrap">
        <span className="eyebrow mb-3">{copy.eyebrow}</span>
        <h2 id="types-title" className="mb-[clamp(24px,3vw,40px)] text-[clamp(1.7rem,3vw,2.6rem)]">
          <TitleText c={copy} />
        </h2>
        <TypeShowcase rows={rows} />
      </div>
    </section>
  );
}
