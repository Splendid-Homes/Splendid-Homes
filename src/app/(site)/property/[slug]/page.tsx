import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PropertyCard } from '@/components/cards/PropertyCard';
import { Icon, type IconName } from '@/components/icons';
import { ClipReveal } from '@/components/motion/ClipReveal';
import { ContactPanel } from '@/components/property/ContactPanel';
import { Gallery } from '@/components/property/Gallery';
import { MapFacade } from '@/components/property/MapFacade';
import { PropertyModals } from '@/components/property/PropertyModals';
import { StickyCta } from '@/components/property/StickyCta';
import { CostBreakdown } from '@/components/property/CostBreakdown';
import { SectionTabs } from '@/components/property/SectionTabs';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { FaqBlock } from '@/components/seo/FaqBlock';
import { JsonLd } from '@/components/seo/JsonLd';
import { Price } from '@/components/ui/Price';
import { CompareButton } from '@/components/ui/CompareButton';
import { SaveButton } from '@/components/ui/SaveButton';
import type { Property } from '@/data/types';
import { num } from '@/lib/data';
import { propertyFaqs } from '@/lib/faq';
import { listingJsonLd } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';
import { data } from '@/lib/cms';
import { amenityIcon } from '@/lib/amenities';
import { similarHomes } from '@/lib/similar';
import { propertyFacts } from '@/lib/propertyFacts';
import { fillFees, propertyAuthority, propertyFees } from '@/payload/feeDefaults';
import { fillProperty } from '@/payload/propertyDefaults';

const bySlug = async (slug: string) => (await data()).propertyBySlug(slug);

/** Every published listing is prerendered; unknown slugs 404. */
export async function generateStaticParams() {
  const __d = await data();
  const { publishedProperties } = __d;
  return publishedProperties().map(p => ({ slug: p.slug }));
}

const kind = (p: Property) => (p.type === 'Office' ? 'office' : `${p.beds ? `${p.beds}-bed ` : 'studio '}${p.type.toLowerCase()}`);

export async function generateMetadata({ params }: PageProps<'/property/[slug]'>): Promise<Metadata> {
  const __d = await data();
  const { communityBySlug } = __d;
  const p = await bySlug((await params).slug);
  if (!p) return {};
  const c = communityBySlug(p.community);
  const area = c?.name ?? 'Dubai';
  const price = `AED ${num(p.price)}${p.purpose === 'rent' ? '/yr' : ''}`;
  return pageMetadata({
    title: `${p.title}, ${area}`.length <= 52 ? `${p.title}, ${area}` : p.title,
    description: `${kind(p)[0].toUpperCase()}${kind(p).slice(1)} for ${p.purpose === 'rent' ? 'rent' : 'sale'} in ${p.building}, ${area}: ${num(p.size)} sq ft, ${p.baths} baths, ${price}. Ref ${p.ref}${p.permit ? `, ${propertyAuthority(p).short} permit ${p.permit}` : ''}.`,
    path: `/property/${p.slug}`,
    image: p.images[0],
  });
}

export default async function PropertyPage({ params }: PageProps<'/property/[slug]'>) {
  const __d = await data();
  const { agentById, communityBySlug, developerName, publishedProperties } = __d;
  const SITE = __d.site;
  const p = await bySlug((await params).slug);
  if (!p) notFound();
  const c = communityBySlug(p.community);
  const area = c?.name ?? 'Dubai';
  const agent = agentById(p.agent);
  const rent = p.purpose === 'rent';
  const listHref = rent ? '/rent' : '/buy';
  // Shared wording and options: CMS > Property page. Tokens: {title} {ref} {area} {agent} and fee tokens.
  const PP = __d.site.propertyPage, T = PP.text;
  const fees = propertyFees(p, __d.site.fees), authority = propertyAuthority(p);
  const fill = (t: string) => fillFees(fillProperty(t, { title: p.title, ref: p.ref, area, agent: agent.name }), fees);
  const waText = fill(T.waMessage);
  const faqs = [...(PP.showAutoFaqs ? propertyFaqs(p, c, agent, fees) : []), ...PP.extraFaqs.map(x => ({ q: fill(x.q), a: fill(x.a) }))];
  const similar = PP.similarCount ? similarHomes(p, publishedProperties(), communityBySlug, PP.similarCount) : [];

  // Tiles and detail rows chosen in the CMS (Property page > Facts); facts a listing lacks are skipped.
  const all = propertyFacts(p, developerName(p.developer), T.rentPayment);
  const keyFacts = PP.keyFacts.flatMap(k => (all[k]?.tile ? [[all[k].icon, ...all[k].tile] as [IconName, string, string]] : []));
  const tabs = [
    { id: 'overview', label: T.tabOverview }, { id: 'details', label: T.tabDetails }, { id: 'amenities', label: T.tabAmenities },
    { id: 'costs', label: T.tabCosts }, { id: 'location', label: T.tabLocation }, { id: 'regulatory', label: p.permit ? T.tabPermit : 'Details' },
    ...(faqs.length ? [{ id: 'property-faq', label: T.tabQa }] : []),
  ];
  const sec = 'scroll-mt-[170px]';
  const h2 = 'mb-4 text-[clamp(1.3rem,2.2vw,1.65rem)]';
  const facts: [string, React.ReactNode][] = PP.detailRows.flatMap(({ fact, label }) => {
    const r = all[fact]?.row;
    return r ? [[label || r[0], r[1]] as [string, React.ReactNode]] : [];
  });

  return (
    <article className="pb-[clamp(56px,8vw,110px)]">
      <div className="wrap pt-6">
        <Breadcrumbs className="mb-5" items={[
          { name: 'Home', href: '/' },
          { name: rent ? 'Rent' : 'Buy', href: listHref },
          { name: area, href: `/community/${p.community}` },
          { name: p.title, href: `/property/${p.slug}` },
        ]} />
        <Gallery images={p.images} title={p.title} location={`${p.building}, ${area}`} morphName={`property-photo-${p.id}`}
          media={{ video: p.videoUrl, tour: p.tourUrl, floor: p.floorPlan }} />

        <div className="mt-[clamp(24px,4vw,44px)] grid gap-[clamp(28px,4vw,48px)] lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <header className="pb-6">
              <ul className="mb-3 flex flex-wrap gap-2 text-[0.74rem] font-extrabold">
                {p.featured && <li className="rounded-full bg-forest px-3 py-1 text-white shadow-btn">Featured</li>}
                <li className="rounded-full soft-raised-sm px-3 py-1 text-forest">{p.status}</li>
                <li className="rounded-full soft-raised-sm px-3 py-1 text-ink-2">For {rent ? 'rent' : 'sale'}</li>
              </ul>
              <h1 className="mb-2 text-[clamp(1.75rem,3.6vw,2.7rem)] leading-[1.12]">{p.title}</h1>
              <p className="mb-4 flex items-center gap-1.5 text-muted"><Icon name="pin" className="size-4" />{p.building}, {area}, Dubai</p>
              {/* Summary sentence for answer engines: the listing in one line. */}
              <p className="mb-5 max-w-[62ch] text-[1.05rem] text-ink-2">
                A {p.furnishing.toLowerCase()} {kind(p)} for {rent ? 'rent' : 'sale'} in {p.building}, {area}, with {num(p.size)} sq ft
                of space and {p.view} views, {rent ? 'at' : 'priced at'} AED {num(p.price)}{rent ? ' a year' : ''}.
              </p>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Price aed={p.price} perYear={rent} className="text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold tracking-[-0.02em] text-forest" />
                  <span className="rounded-full soft-inset-sm px-3 py-1 text-[0.8rem] font-bold text-muted">
                    {rent ? `≈ AED ${num(Math.round(p.price / 12))} / month` : `AED ${num(Math.round(p.price / p.size))} / sq ft`}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CompareButton id={p.id} title={p.title} img={p.images[0]} variant="page" />
                  <SaveButton id={p.id} title={p.title} className="relative" />
                </div>
              </div>
            </header>

            <SectionTabs items={tabs} />

            <div className="grid gap-[clamp(22px,3vw,30px)]">
              <section id="overview" aria-labelledby="about" className={`${sec} grid gap-4`}>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {keyFacts.map(([icon, v, l]) => (
                    <li key={l} className="grid gap-2 rounded-[20px] soft-raised-sm p-4">
                      <span className="grid size-10 place-items-center rounded-full soft-raised-sm text-forest"><Icon name={icon} className="size-[18px]" /></span>
                      <b className="text-[1.1rem] tracking-[-0.01em]">{v}</b>
                      <span className="text-[0.78rem] font-bold text-muted">{l}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-[26px] soft-raised p-[clamp(18px,2.4vw,26px)]">
                  <h2 id="about" className={h2}>{fill(T.aboutTitle)}</h2>
                  <p className="mb-3 max-w-[68ch] text-[1.05rem] leading-relaxed text-ink-2">{p.desc}</p>
                  {T.aboutNote && <p className="max-w-[68ch] text-muted">{fill(T.aboutNote)}</p>}
                </div>
              </section>

              <section id="details" aria-labelledby="details-title" className={`${sec} rounded-[26px] soft-raised p-[clamp(18px,2.4vw,26px)]`}>
                <h2 id="details-title" className={h2}>{fill(T.detailsTitle)}</h2>
                <dl className="grid gap-x-3 gap-y-1.5 sm:grid-cols-2">
                  {facts.map(([k, v], i) => (
                    <div key={k} className={`flex justify-between gap-4 rounded-[12px] px-3.5 py-2.5 text-[0.93rem] ${Math.floor(i / 2) % 2 ? '' : 'soft-inset-sm'}`}>
                      <dt className="text-muted">{k}</dt><dd className="text-right font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section id="amenities" aria-labelledby="amenities-title" className={sec}>
                <h2 id="amenities-title" className={h2}>{fill(T.amenitiesTitle)}</h2>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {p.amenities.map(a => (
                    <li key={a} className="grid justify-items-center gap-2.5 rounded-[20px] soft-raised-sm px-3 py-4 text-center text-[0.86rem] font-bold">
                      <span className="grid size-10 place-items-center rounded-full soft-raised-sm text-gold"><Icon name={amenityIcon(a)} className="size-[18px]" /></span>{a}
                    </li>
                  ))}
                </ul>
              </section>

              <CostBreakdown p={p} fees={fees} text={{
                title: fill(rent ? T.costsRentTitle : T.costsBuyTitle), note: fill(rent ? T.costsRentNote : T.costsBuyNote), footnote: fill(T.costsFootnote),
              }} />

              <section id="location" aria-labelledby="location-title" className={`${sec} rounded-[26px] soft-raised p-[clamp(18px,2.4vw,26px)]`}>
                <h2 id="location-title" className={h2}>{fill(T.locationTitle)}</h2>
                {c && <p className="mb-5 max-w-[68ch] text-ink-2">{c.desc} <Link href={`/community/${c.slug}`} className="font-semibold text-forest underline-offset-4 hover:underline">Explore {c.name}</Link></p>}
                {c && <MapFacade lat={c.coords[0]} lng={c.coords[1]} label={`${p.building}, ${area}`} />}
              </section>

              <section id="regulatory" aria-labelledby="regulatory-title" className={`${sec} rounded-[26px] soft-inset p-[clamp(14px,2vw,20px)]`}>
                <h2 id="regulatory-title" className={`${h2} px-2 pt-1`}>{fill(T.regulatoryTitle)}</h2>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[[authority.short === 'DLD' ? T.regPermit : `${authority.short} Permit No.`, p.permit], [T.regRef, p.ref], [T.regBrn, agent.brn], [T.regOrn, SITE.orn]].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="rounded-[16px] soft-raised-sm px-4 py-3">
                      <dt className="text-[0.72rem] font-extrabold uppercase tracking-[0.06em] text-muted">{k}</dt>
                      <dd className="font-bold tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
                {p.permit && <p className="mt-3 flex items-start gap-2 px-2 text-[0.82rem] text-muted"><Icon name="shield" className="mt-0.5 size-4 shrink-0 text-gold" />{authority.short === 'DLD' ? fill(T.regulatoryNote) : `Advertised under a ${authority.name} permit.`}</p>}
              </section>

              {faqs.length > 0 && <FaqBlock id="property-faq" faqs={faqs} title={fill(T.faqTitle)} className={sec} />}
            </div>
          </div>

          <aside aria-label="Contact the agent" className="lg:sticky lg:top-[104px] lg:self-start">
            <ContactPanel agent={agent} propertyRef={p.ref} propertyId={p.id} waText={waText} text={{ ...T, enquiryTitle: fill(T.enquiryTitle), enquiryMessage: fill(T.enquiryMessage) }} />
          </aside>
        </div>
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similar" className="cv-auto wrap mt-[clamp(48px,7vw,96px)]">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div><span className="eyebrow mb-2">{fill(T.similarEyebrow)}</span><h2 id="similar" className="text-[clamp(1.6rem,2.8vw,2.3rem)]">{fill(T.similarTitle)}{T.similarItalic && <> <em>{fill(T.similarItalic)}</em></>}</h2></div>
            <Link href={listHref} className="font-bold text-forest underline-offset-4 hover:underline">View all</Link>
          </div>
          <ClipReveal className="grid gap-[clamp(18px,2.4vw,30px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr))]">
            {similar.map(s => <PropertyCard key={s.p.id} p={s.p} match={s.match} />)}
          </ClipReveal>
        </section>
      )}

      <StickyCta price={p.price} perYear={rent} waText={waText} viewingCta={T.viewingCta} whatsappCta={T.whatsappCta} />
      <PropertyModals info={{ title: p.title, ref: p.ref, agentName: agent.name, propertyId: p.id }} images={p.images} />
      <JsonLd data={listingJsonLd(p, c, agent)} />
    </article>
  );
}
