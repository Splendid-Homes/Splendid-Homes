import Link from 'next/link';
import { Icon } from '@/components/icons';
import { SplitHeading } from '@/components/motion/SplitHeading';
import { data } from '@/lib/cms';
import { waHref } from '@/lib/site';
import { ServiceTabs } from './ServiceTabs';
import { sectionCopy, titleSegments } from '@/lib/homeCopy';

/** "What we do": heading, then the service tabs with a detail panel (see ServiceTabs). */
export async function ServicesList() {
  const copy = await sectionCopy('services');
  const d = await data();
  const { services } = d.c;
  if (!services.length) return null;
  const items = services.map((s, i) => ({
    slug: s.slug, name: s.name, icon: s.icon, desc: s.desc, points: s.points, img: d.serviceImg(i),
    wa: waHref(d.site.whatsapp, `Hi, I'd like to talk to a specialist about ${s.name}.`),
  }));
  return (
    <section aria-labelledby="services-title" className="bg-mist py-[clamp(56px,8vw,110px)]">
      <div className="wrap">
        <div className="mb-[clamp(24px,3vw,40px)] flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="eyebrow mb-3">{copy.eyebrow}</span>
            <SplitHeading id="services-title" segments={titleSegments(copy)}
              className="mb-3 text-[clamp(1.7rem,3vw,2.6rem)]" />
            {copy.intro && <p className="max-w-[52ch] text-muted">{copy.intro}</p>}
          </div>
          <Link href="/services" className="group inline-flex items-center gap-2.5 text-[0.92rem] font-bold text-forest">
            All services
            <span className="grid size-8 place-items-center rounded-full soft-raised-sm transition-transform duration-300 group-hover:translate-x-1"><Icon name="arrow" className="size-4" /></span>
          </Link>
        </div>
        <ServiceTabs items={items} />
      </div>
    </section>
  );
}
