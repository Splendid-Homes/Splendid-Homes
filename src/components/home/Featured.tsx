import Link from 'next/link';
import { PropertyCard } from '@/components/cards/PropertyCard';
import { Icon } from '@/components/icons';
import { SplitHeading } from '@/components/motion/SplitHeading';
import { data } from '@/lib/cms';
import type { Property } from '@/data/types';
import { FeaturedTabs } from './FeaturedTabs';
import { ClipReveal } from '@/components/motion/ClipReveal';
import { sectionCopy, titleSegments } from '@/lib/homeCopy';

const Grid = ({ items }: { items: Property[] }) => (
  <ClipReveal className="grid gap-[clamp(18px,2.4vw,30px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr))]">
    {items.map(p => <PropertyCard key={p.id} p={p} />)}
  </ClipReveal>
);

export async function Featured() {
  const copy = await sectionCopy('featured');
  const d = await data();
  return (
    <section aria-labelledby="featured-title" className="cv-auto py-[clamp(56px,8vw,110px)]">
      <div className="wrap">
        <FeaturedTabs
          heading={
            <div>
              <span className="eyebrow mb-3">{copy.eyebrow}</span>
              <SplitHeading id="featured-title" segments={titleSegments(copy)} className="m-0 text-[clamp(1.7rem,3vw,2.6rem)]" />
            </div>
          }
          sale={<Grid items={d.listingsFor('buy').slice(0, 6)} />}
          rent={<Grid items={d.listingsFor('rent').slice(0, 6)} />}
        />
        <div className="mt-10 text-center">
          <Link href="/buy" data-magnetic className="btn-sweep group inline-flex items-center gap-2 rounded-full soft-raised active:soft-pressed px-6 py-3.5 text-[0.92rem] font-bold hover:border-gold hover:text-deep">
            Browse all properties <Icon name="arrow" className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
