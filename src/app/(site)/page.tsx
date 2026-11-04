import { CommunitiesBento } from '@/components/home/CommunitiesBento';
import { DeveloperMarquee } from '@/components/home/DeveloperMarquee';
import { DubaiMap } from '@/components/home/DubaiMap';
import { Featured } from '@/components/home/Featured';
import { Hero } from '@/components/home/Hero';
import { Insights } from '@/components/home/Insights';
import { OffPlanBand } from '@/components/home/OffPlanBand';
import { SellBox } from '@/components/home/SellBox';
import { ServicesList } from '@/components/home/ServicesList';
import { TeamStrip } from '@/components/home/TeamStrip';
import { Testimonials } from '@/components/home/Testimonials';
import { TypeStrip } from '@/components/home/TypeStrip';
import { WhySection } from '@/components/home/WhySection';
import { data } from '@/lib/cms';
import type { HomeSectionKey } from '@/payload/homeOptions';
import { cmsPageMetadata } from '@/lib/pageSeo';

export async function generateMetadata() {
  const { site } = await data();
  // The layout template appends " | Splendid Homes".
  return cmsPageMetadata('home', {
    title: 'Luxury Real Estate in Dubai',
    description: `${site.tagline}. Buy, rent and invest in Dubai villas, apartments, penthouses and off-plan projects with a RERA-regulated agency.`,
    path: '/',
    image: site.home.heroImage,
  });
}

/** One component per homepage section key (Site settings > Homepage > Sections). */
const SECTIONS: Record<HomeSectionKey, () => Promise<React.ReactNode>> = {
  marquee: DeveloperMarquee, budget: TypeStrip, featured: Featured, offplan: OffPlanBand, communities: CommunitiesBento,
  map: DubaiMap, services: ServicesList, why: WhySection, testimonials: Testimonials, sell: SellBox, team: TeamStrip, insights: Insights,
};

/** Homepage: the hero, then the sections in the order set in the CMS (hidden ones are skipped). */
export default async function HomePage() {
  const { site } = await data();
  return (
    // `home-index`: editorial headline sizes and spacing (globals.css).
    <div className="home-index">
      <Hero />
      {site.home.sections.filter(s => s.show).map(s => {
        const Section = SECTIONS[s.key];
        return <Section key={s.key} />;
      })}
    </div>
  );
}
