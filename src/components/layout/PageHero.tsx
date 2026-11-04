import Image from 'next/image';
import { SplitHeading, type Segment } from '@/components/motion/SplitHeading';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import type { Crumb } from '@/lib/schema';

/**
 * Inner-page hero (Forest "phero"): rounded photo panel with a forest gradient, breadcrumbs,
 * eyebrow, the page's single H1 and an intro line. The photo is preloaded and never animated.
 */
export function PageHero({ eyebrow, title, sub, img, alt, crumbs, tall, children }: {
  eyebrow: string; title: Segment[]; sub?: React.ReactNode; img: string; alt: string; crumbs: Crumb[]; tall?: boolean; children?: React.ReactNode;
}) {
  return (
    <section className="pt-5">
      <div className="wrap">
        <div className={`relative flex items-end overflow-hidden rounded-[32px] bg-forest max-sm:rounded-[24px] ${tall ? 'min-h-[min(520px,72svh)]' : 'min-h-[340px]'}`}>
          <Image src={img} alt={alt} fill preload sizes="(min-width: 1240px) 1240px, 100vw" className="object-cover" />
          <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,48,32,.94)_0%,rgba(18,48,32,.7)_45%,rgba(18,48,32,.1))] max-sm:bg-[linear-gradient(0deg,rgba(18,48,32,.95)_10%,rgba(18,48,32,.55)_70%,rgba(18,48,32,.2))]" />
          <div className="relative z-[1] max-w-[720px] p-[clamp(24px,5vw,60px)] text-white">
            <Breadcrumbs tone="light" className="mb-4" items={crumbs} />
            <span className="eyebrow mb-3 !text-[#B9DBC2]">{eyebrow}</span>
            <SplitHeading as="h1" trigger="load" segments={title}
              className="mb-3 text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.06] text-white [&_em]:!text-[#B9DBC2]" />
            {sub && <p className="max-w-[60ch] text-[1.05rem] text-[#D5E7DA]">{sub}</p>}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
