import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Community } from '@/data/types';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { PropertyCard } from '@/components/cards/PropertyCard';
import { CompareTable } from '@/components/community/CompareTable';
import { GuideToc } from '@/components/community/GuideToc';
import { ListingTabs, type ListingTab } from '@/components/community/ListingTabs';
import { Icon, type IconName } from '@/components/icons';
import { PageHero } from '@/components/layout/PageHero';
import { CountUp } from '@/components/motion/CountUp';
import { MapFacade } from '@/components/property/MapFacade';
import { FaqBlock } from '@/components/seo/FaqBlock';
import { JsonLd } from '@/components/seo/JsonLd';
import { StatSource } from '@/components/seo/StatSource';
import { latestFirst, num } from '@/lib/data';
import { communityFaqs } from '@/lib/faq';
import { placeJsonLd } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';
import { data } from '@/lib/cms';
import { km } from '@/lib/similar';
import { fillTokens, RANK_OPTIONS } from '@/payload/communityDefaults';

// Pages added in the CMS after a build (slugs not in generateStaticParams) render on their first visit,
// then are cached. A blocking first render keeps real 404s for unknown slugs (instead of a streamed shell).
export const instant = false;

export async function generateStaticParams() {
  const __d = await data();
  const { communities } = __d.c;
  return communities.map(c => ({ slug: c.slug }));
}

const h3 = 'mb-4 text-[clamp(1.3rem,2.1vw,1.65rem)] font-bold tracking-[-0.02em] text-ink';
/** URL-safe id for a guide topic ("Location & connectivity" → "location-connectivity"). */
const anchor = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/** Paragraphs from a CMS textarea (blank line between paragraphs). */
const paras = (t: string) => t.split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);
/** Icon for a guide sub-topic, picked from words in its heading. */
const TOPIC_ICONS: [RegExp, IconName][] = [
  [/road|drive|car|traffic/i, 'car'], [/transport|metro|tram|monorail/i, 'metro'], [/character|residential|homes|layout/i, 'home'],
  [/who lives|people|residents/i, 'users'], [/available|supply|what you can buy/i, 'key'], [/check|before you buy|watch/i, 'doc'],
  [/retail|dining|shop|restaurant/i, 'star'], [/outdoor|beach|park|green/i, 'sun'], [/school|health|education/i, 'school'],
  [/invest|yield|rent/i, 'trend'],
];
const topicIcon = (h: string): IconName => TOPIC_ICONS.find(([re]) => re.test(h))?.[1] ?? 'pin';

/** Answer-first summary used as the hero intro and meta description. */
const summary = (c: Community) =>
  `${c.name} homes average AED ${num(c.avgSale)} per sq ft to buy and AED ${num(c.avgRent)} a year to rent, with a gross rental yield of about ${c.roi}%.`;

export async function generateMetadata({ params }: PageProps<'/community/[slug]'>): Promise<Metadata> {
  const c = (await data()).communityBySlug((await params).slug);
  if (!c) return {};
  return pageMetadata({
    title: `${c.name} Guide: Prices, Rents & Yields`,
    description: `${summary(c)} Homes for sale and rent, off-plan projects and FAQs for ${c.name}, Dubai.`,
    path: `/community/${c.slug}`,
    image: c.img,
  });
}

export default async function CommunityPage({ params }: PageProps<'/community/[slug]'>) {
  const __d = await data();
  const { communities, projects } = __d.c;
  const { avgYield, communityBySlug, communityCounts, publishedProperties } = __d;
  const MARKET_DATA = __d.site.market;
  const c = communityBySlug((await params).slug);
  if (!c) notFound();
  const counts = communityCounts(c.slug);
  const here = latestFirst(publishedProperties().filter(p => p.community === c.slug));
  const sale = here.filter(p => p.purpose === 'buy'), rent = here.filter(p => p.purpose === 'rent');
  const live = projects.filter(p => p.published && p.community === c.slug);
  // Shared wording and options: CMS > Community pages.
  const CP = __d.site.communityPage, T = CP.text;
  const fill = (t: string) => fillTokens(t, {
    name: c.name, yield: String(c.roi), price: `AED ${num(c.avgSale)}`, rent: `AED ${num(c.avgRent)}`, avgYield: avgYield().toFixed(1),
    count: String(communities.length), aboveBelow: c.roi >= avgYield() ? 'above' : 'below', rankedBy: RANK_OPTIONS.find(r => r.value === CP.rankBy)!.words,
  });
  const faqs = [...(CP.showAutoFaqs ? communityFaqs(c, counts, avgYield(), communities.length) : []), ...[...c.faqs, ...CP.extraFaqs].map(x => ({ q: fill(x.q), a: fill(x.a) }))];
  const words = c.name.split(' ');
  const grid = 'grid gap-[clamp(18px,2.4vw,30px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr))]';
  const tabs: ListingTab[] = [
    { key: 'sale', label: T.tabSale, count: sale.length, href: `/buy?community=${c.slug}`, linkLabel: fill(T.linkSale),
      panel: <div className={grid}>{sale.slice(0, CP.perTab).map(p => <PropertyCard key={p.id} p={p} />)}</div> },
    { key: 'rent', label: T.tabRent, count: rent.length, href: `/rent?community=${c.slug}`, linkLabel: fill(T.linkRent),
      panel: <div className={grid}>{rent.slice(0, CP.perTab).map(p => <PropertyCard key={p.id} p={p} />)}</div> },
    { key: 'offplan', label: T.tabOffplan, count: live.length, href: '/off-plan', linkLabel: fill(T.linkOffplan),
      panel: <div className={grid}>{live.slice(0, CP.perTab).map(p => <ProjectCard key={p.id} p={p} />)}</div> },
  ].filter(t => t.count > 0);
  const hasGuide = c.guide.length > 0;
  // Hand-picked in the CMS, otherwise the closest ones by distance between community centres.
  const near = c.nearby.length
    ? c.nearby.map(s => communityBySlug(s)).filter((n): n is Community => !!n)
    : communities.filter(n => n.slug !== c.slug).sort((a, b) => km(c.coords, a.coords) - km(c.coords, b.coords)).slice(0, CP.nearbyCount);
  const toc = [
    ...c.guide.map(g => ({ id: anchor(g.title), label: g.title })),
    ...(c.pros.length || c.cons.length ? [{ id: 'pros-cons', label: fill(T.tocPros) }] : []),
    ...(c.suits || c.notFor ? [{ id: 'right-for-you', label: fill(T.tocFit) }] : []),
    ...(near.length ? [{ id: 'nearby', label: fill(T.tocNearby) }] : []),
  ];
  const kpis: [string, string][] = [
    [T.kpiPrice, `AED ${num(c.avgSale)}`],
    [T.kpiRent, `AED ${num(c.avgRent)}`],
    [T.kpiYield, `${c.roi}%`],
    [T.kpiListings, String(counts.sale + counts.rent)],
  ];

  return (
    <>
      <PageHero tall eyebrow={c.tag} img={c.img} alt={`${c.name}, Dubai`} sub={c.intro || summary(c)}
        title={words.length > 1 ? [{ text: `${words.slice(0, -1).join(' ')} ` }, { text: words.at(-1)!, em: true }] : [{ text: c.name, em: true }]}
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Communities', href: '/communities' }, { name: c.name, href: `/community/${c.slug}` }]} />

      <section aria-labelledby="market" className="wrap pt-[clamp(28px,4vw,48px)]">
        <h2 id="market" className="sr-only">{c.name} market snapshot</h2>
        <dl className="grid grid-cols-2 gap-3 rounded-[26px] soft-inset p-2.5 lg:grid-cols-4">
          {kpis.map(([k, v]) => (
            <div key={k} className="flex flex-col-reverse gap-1 rounded-[18px] soft-raised-sm px-5 py-5">
              <dt className="text-[0.74rem] font-extrabold uppercase tracking-[0.05em] text-muted">{k}</dt>
              <dd className="text-[clamp(1.4rem,2.6vw,2rem)] font-extrabold tracking-[-0.02em] text-forest"><CountUp value={v} /></dd>
            </div>
          ))}
        </dl>
        <StatSource className="mt-3" source={MARKET_DATA.source} url={MARKET_DATA.sourceUrl} updated={MARKET_DATA.updated} />
      </section>

      {c.highlights.length > 0 && (
        <ul aria-label={`${c.name} is known for`} className="wrap mt-5 flex flex-wrap gap-2">
          {c.highlights.map(h => (
            <li key={h} className="inline-flex items-center gap-2 rounded-full soft-raised-sm px-3.5 py-2 text-[0.86rem] font-bold text-forest"><Icon name="check" className="size-4 text-gold" />{h}</li>
          ))}
        </ul>
      )}

      {tabs.length > 0 && (
        <section aria-labelledby="available" className="cv-auto wrap pt-[clamp(48px,7vw,88px)]">
          <span className="eyebrow mb-3">{fill(T.availableEyebrow)}</span>
          <h2 id="available" className="mb-5 text-[clamp(1.6rem,2.8vw,2.3rem)]">{fill(T.availableTitle)} <em>{c.name}</em></h2>
          <ListingTabs tabs={tabs} />
        </section>
      )}

      {hasGuide ? (
        <section aria-labelledby="about" className="wrap py-[clamp(48px,7vw,96px)]">
          <span className="eyebrow mb-3">{fill(T.guideEyebrow)}</span>
          <h2 id="about" className="mb-[clamp(24px,3vw,40px)] text-[clamp(1.6rem,2.8vw,2.3rem)]">{fill(T.guideTitle)} <em>{c.name}</em></h2>
          <div className="grid items-start gap-[clamp(28px,4vw,48px)] lg:grid-cols-[250px_minmax(0,1fr)]">
            <div className="hidden lg:sticky lg:top-[104px] lg:block"><GuideToc title={`${fill(T.guideTitle)} ${c.name}`} items={toc} /></div>
            <div className="min-w-0">
              {c.guide.map((g, gi) => (
                <section key={g.title} id={anchor(g.title)} aria-labelledby={`${anchor(g.title)}-h`} className="mb-[clamp(32px,4vw,48px)] scroll-mt-[110px]">
                  <h3 id={`${anchor(g.title)}-h`} className={h3}>{g.title}</h3>
                  <div className="grid gap-3.5">
                    {g.items.map(it => (
                      <div key={it.heading} className="grid grid-cols-[44px_minmax(0,1fr)] gap-4 max-sm:grid-cols-1 max-sm:gap-3 rounded-[22px] soft-raised-sm p-[clamp(16px,2vw,22px)]">
                        <span aria-hidden="true" className="grid size-11 place-items-center rounded-full soft-inset-sm text-forest"><Icon name={topicIcon(it.heading)} className="size-5" /></span>
                        <div className="min-w-0">
                          <h4 className="mb-1.5 text-[1.04rem] font-extrabold text-ink">{it.heading}</h4>
                          {paras(it.text).map((t, i) => <p key={i} className="mb-3 leading-[1.7] text-ink-2 last:mb-0">{t}</p>)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {gi === 0 && CP.showMap && <div className="mt-3.5 rounded-[24px] soft-inset p-2"><MapFacade lat={c.coords[0]} lng={c.coords[1]} label={`${c.name}, Dubai`} /></div>}
                </section>
              ))}

              {(c.pros.length > 0 || c.cons.length > 0) && (
                <section id="pros-cons" aria-labelledby="pros-cons-h" className="mb-[clamp(32px,4vw,48px)] scroll-mt-[110px]">
                  <h3 id="pros-cons-h" className={h3}>{fill(T.prosTitle)}{T.prosItalic && <> <em>{fill(T.prosItalic)}</em></>}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {([[T.prosLabel, c.pros, 'check', 'text-leaf'], [T.consLabel, c.cons, 'close', 'text-[#9a6b12]']] as const).map(([label, list, icon, tone]) => list.length > 0 && (
                      <div key={label} className="rounded-[24px] soft-raised p-[clamp(18px,2.2vw,24px)]">
                        <h4 className="mb-3.5 text-[1.05rem] font-extrabold text-ink">{label}</h4>
                        <ul className="grid gap-2.5">
                          {list.map(t => (
                            <li key={t} className="grid grid-cols-[24px_minmax(0,1fr)] gap-2.5 leading-normal text-ink-2">
                              <span aria-hidden="true" className={`mt-0.5 grid size-6 place-items-center rounded-full soft-inset-sm ${tone}`}><Icon name={icon} className="size-3.5" /></span>{t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {(c.suits || c.notFor) && (
                <section id="right-for-you" aria-labelledby="right-for-you-h" className="mb-[clamp(32px,4vw,48px)] scroll-mt-[110px]">
                  <h3 id="right-for-you-h" className={h3}>{fill(T.fitTitle)}{T.fitItalic && <> <em>{fill(T.fitItalic)}</em></>}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {c.suits && <div className="rounded-[22px] soft-inset p-5"><p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-leaf">{fill(T.suitsLabel)}</p>{paras(c.suits).map((t, i) => <p key={i} className="mb-2 leading-[1.7] text-ink-2 last:mb-0">{t}</p>)}</div>}
                    {c.notFor && <div className="rounded-[22px] soft-inset p-5"><p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-[#9a6b12]">{fill(T.notForLabel)}</p>{paras(c.notFor).map((t, i) => <p key={i} className="mb-2 leading-[1.7] text-ink-2 last:mb-0">{t}</p>)}</div>}
                  </div>
                </section>
              )}

              {near.length > 0 && (
                <section id="nearby" aria-labelledby="nearby-h" className="scroll-mt-[110px]">
                  <h3 id="nearby-h" className={h3}>{fill(T.nearbyTitle)}{T.nearbyItalic && <> <em>{fill(T.nearbyItalic)}</em></>}</h3>
                  <ul className="flex flex-wrap gap-2.5">
                    {near.map(n => (
                      <li key={n.slug}>
                        <Link href={`/community/${n.slug}`} className="inline-flex items-center gap-2.5 rounded-full soft-raised-sm py-1.5 pl-1.5 pr-4 text-[0.9rem] font-extrabold text-forest transition-[box-shadow] duration-300 hover:soft-inset-sm">
                          <Image src={n.img} alt="" width={34} height={34} className="size-[34px] rounded-full object-cover" />{n.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section aria-labelledby="living" className="wrap py-[clamp(40px,6vw,80px)]">
          <div className="grid items-center gap-[clamp(24px,4vw,48px)] rounded-[30px] soft-raised p-[clamp(18px,3vw,32px)] lg:grid-cols-2">
            <div>
              <span className="eyebrow mb-3">Area guide</span>
              <h2 id="living" className="mb-4 text-[clamp(1.6rem,2.8vw,2.3rem)]">Living in <em>{c.name}</em></h2>
              <p className="text-[1.08rem] leading-relaxed text-ink-2">{c.desc}</p>
            </div>
            <div className="rounded-[24px] soft-inset p-2"><MapFacade lat={c.coords[0]} lng={c.coords[1]} label={`${c.name}, Dubai`} /></div>
          </div>
        </section>
      )}

      <section aria-labelledby="compare" className="cv-auto bg-mist py-[clamp(48px,7vw,96px)]">
        <div className="wrap">
          <span className="eyebrow mb-3">{fill(T.compareEyebrow)}</span>
          <h2 id="compare" className="mb-3 text-[clamp(1.6rem,2.8vw,2.3rem)]">{fill(T.compareTitle)}{T.compareItalic && <> <em>{fill(T.compareItalic)}</em></>}</h2>
          {T.compareIntro && <p className="mb-6 max-w-[64ch] text-ink-2">{fill(T.compareIntro)}</p>}
          <CompareTable current={c.slug} caption={`${c.name} compared with other Dubai communities`} />
        </div>
      </section>

      <div className="wrap max-w-[880px] py-[clamp(48px,7vw,96px)]">
        {faqs.length > 0 && <FaqBlock id="community-faq" faqs={faqs} title={fill(T.faqTitle)} />}
      </div>

      <JsonLd data={placeJsonLd(c, { source: MARKET_DATA.source, updated: MARKET_DATA.updated })} />
    </>
  );
}
