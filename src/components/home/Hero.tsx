import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/icons';
import { SplitHeading, type Segment } from '@/components/motion/SplitHeading';
import { data } from '@/lib/cms';
import { marketPulse } from '@/lib/pulse';
import { HeroMotion } from './HeroMotion';
import { HeroVideo } from './HeroVideo';
import { SearchCard } from './SearchCard';

// Frosted mist card over the hero photo.
const glass = 'absolute rounded-[18px] bg-mist/90 px-4 py-3 shadow-[4px_6px_16px_rgba(15,36,24,.25)] backdrop-blur-md';

/** Same split as the prototype: second half of the headline in Fraunces italic. */
function headlineSegments(title: string): Segment[] {
  const words = title.split(' ');
  const mid = Math.ceil(words.length / 2);
  return [{ text: words.slice(0, mid).join(' ') + ' ' }, { text: words.slice(mid).join(' '), em: true }];
}

export async function Hero() {
  const { site, c } = await data();
  const { home, stats } = site;
  const { agents, communities } = c;
  const pulse = communities.length ? marketPulse(communities, site.market) : null;
  const cards = home.cards;
  const fill = (t: string) => t.replace('{agents}', String(stats.agents)).replace('{clients}', stats.clients);
  const change = (n: number | undefined, unit: string) => n == null ? null : (
    <span className={n >= 0 ? 'text-[#127A3F]' : 'text-[#B42318]'}>
      <span aria-hidden="true"> · {n >= 0 ? '▲' : '▼'} </span><span className="sr-only">, {n >= 0 ? 'up' : 'down'} </span>{Math.abs(n)}{unit}
    </span>
  );
  return (
    <section aria-labelledby="hero-title" className="bg-gradient-to-b from-white to-mist pb-[clamp(30px,4vw,60px)] pt-[clamp(24px,4vw,48px)]">
      <HeroMotion className="wrap grid items-center gap-[clamp(30px,4vw,60px)] lg:grid-cols-[1.05fr_1fr]">
        <div data-hero-copy>
          {site.showFigures && cards.badge && (
            <p data-hero-fade className="mb-[22px] inline-flex items-center gap-2 rounded-full soft-inset-sm py-1.5 pl-1.5 pr-4 text-[0.82rem] font-bold text-forest">
              <span className="grid size-7 place-items-center rounded-full soft-raised-sm"><Icon name="star" className="size-3.5 fill-star text-star" /></span> {cards.badge}
            </p>
          )}
          <SplitHeading
            as="h1" id="hero-title" trigger="load" delay={0.15}
            segments={headlineSegments(home.heroTitle)}
            className="mb-[0.35em] text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.04]"
          />
          <p className="mb-7 max-w-[520px] text-[1.12rem] text-muted">{home.heroSubtitle}</p>
          <div data-hero-fade>
            <SearchCard communities={communities.map(c => ({ slug: c.slug, name: c.name }))}
              listings={c.properties.map(p => ({ p: p.purpose, c: p.community, t: p.type, b: p.beds }))}
              projects={c.projects.map(p => p.community)} />
          </div>
          {home.picks.length > 0 && (
            <nav data-hero-fade aria-label="Popular searches" className="mt-[18px] flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[0.74rem] font-extrabold uppercase tracking-[0.06em] text-muted">Popular</span>
              {home.picks.map(p => (
                <Link key={p.href + p.label} href={p.href}
                  className="rounded-full soft-raised-sm px-3.5 py-2 text-[0.84rem] font-bold text-forest transition-[box-shadow,translate] duration-300 pointer-fine:hover:-translate-y-0.5 active:soft-pressed">{p.label}</Link>
              ))}
            </nav>
          )}
        </div>

        <div data-hero-frame className="relative h-[clamp(420px,46vw,640px)] rounded-[42px_42px_42px_152px] soft-raised max-sm:rounded-[36px_36px_36px_100px]">
          <div data-hero-media className="absolute inset-3 isolate overflow-hidden [mask-image:linear-gradient(#000,#000)] rounded-[32px_32px_32px_140px] bg-mint max-sm:rounded-[28px_28px_28px_90px]">
            <div data-hero-parallax className="absolute -inset-y-[5%] inset-x-0">
              <Image
                src={home.heroImage} alt="Burj Al Arab on the Dubai coastline" fill preload fetchPriority="high"
                sizes="(min-width: 1024px) 48vw, (min-width: 768px) 100vw, 75vw" className="object-cover"
              />
              {home.heroVideo && <HeroVideo src={home.heroVideo} />}
            </div>
            {/* Live market figures (same community data as the Insights market pulse) unless set in the CMS */}
            {pulse && cards.showMarket && (
              <>
                <p className={`${glass} left-4 top-4 sm:left-6 sm:top-6`}>
                  <b className="block text-[1.1rem] tracking-[-0.02em] text-forest">{cards.priceValue || pulse.pricePerSqft}</b>
                  <span className="text-[0.74rem] font-bold text-muted">{cards.priceLabel}{!cards.priceValue && change(pulse.priceChange, '%')}</span>
                </p>
                <p className={`${glass} right-4 top-[104px] sm:right-6 sm:top-[118px]`}>
                  <b className="block text-[1.1rem] tracking-[-0.02em] text-forest">{cards.yieldValue || pulse.yield}</b>
                  <span className="text-[0.74rem] font-bold text-muted">{cards.yieldLabel}</span>
                </p>
              </>
            )}
            {site.showFigures && cards.showExperts && agents.length > 0 && <div className={`${glass} bottom-5 right-5 flex max-w-[calc(100%-40px)] items-center gap-3 pr-5 sm:bottom-7 sm:right-7`}>
              <span className="flex">
                {agents.slice(0, 4).map((a, i) => (
                  <Image key={a.id} src={a.img} alt="" width={36} height={36}
                    className={`size-9 rounded-full border-2 border-mist object-cover ${i ? '-ml-2.5' : ''} ${i === 3 ? 'max-sm:hidden' : ''}`} />
                ))}
              </span>
              <span className="min-w-0">
                <strong className="block whitespace-nowrap text-[1rem] leading-tight text-ink sm:text-[1.05rem]">{fill(cards.expertsTitle)}</strong>
                <span className="flex items-center gap-1.5 whitespace-nowrap text-[0.8rem] font-semibold text-muted">
                  <i className="size-1.5 shrink-0 rounded-full bg-[#5BE38C] shadow-[0_0_0_3px_rgba(91,227,140,0.25)]" aria-hidden="true" />{fill(cards.expertsStatus)}
                </span>
              </span>
            </div>}
          </div>
        </div>
      </HeroMotion>
    </section>
  );
}
