import { Icon } from '@/components/icons';
import { SplitHeading } from '@/components/motion/SplitHeading';
import { data } from '@/lib/cms';
import { ReviewFilter } from './ReviewFilter';
import { sectionCopy, titleSegments } from '@/lib/homeCopy';

/**
 * Testimonials (soft UI): reviews filtered by who the visitor is (buyer, seller, investor...).
 * Client type and result are set per review in the CMS.
 * Note: the Google rating badge shows placeholder figures; AggregateRating schema is only added
 * once real, verifiable reviews are connected (no fake review markup).
 */
export async function Testimonials() {
  const copy = await sectionCopy('testimonials');
  const { c: { testimonials }, site } = await data();
  if (!testimonials.length) return null;
  return (
    <section aria-labelledby="testi-title" className="cv-auto bg-mist py-[clamp(56px,8vw,110px)]">
      <div className="wrap">
        <div className="mb-[clamp(22px,3vw,30px)] flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="eyebrow mb-3">{copy.eyebrow}</span>
            <SplitHeading id="testi-title" segments={titleSegments(copy)}
              className="text-[clamp(1.7rem,3vw,2.6rem)]" />
          </div>
          {site.showFigures && <div className="inline-flex items-center gap-2.5 rounded-full soft-raised-sm px-[18px] py-2.5">
            <b className="text-[1.4rem]">4.9</b>
            <span className="flex gap-0.5 text-star" role="img" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }, (_, i) => <Icon key={i} name="star" className="size-4 fill-current" />)}
            </span>
            <span className="text-[0.82rem] text-muted">1,200+ Google reviews</span>
          </div>}
        </div>
        <ReviewFilter items={testimonials} />
      </div>
    </section>
  );
}
