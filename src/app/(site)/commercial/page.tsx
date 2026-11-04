import Image from 'next/image';
import Link from 'next/link';
import { PropertyCard } from '@/components/cards/PropertyCard';
import { OfficeFilter } from '@/components/listings/OfficeFilter';
import { Icon, type IconName } from '@/components/icons';
import { CmsPageHero } from '@/components/layout/CmsPageHero';
import { EnquiryForm } from '@/components/property/EnquiryForm';
import { JsonLd } from '@/components/seo/JsonLd';
import { data } from '@/lib/cms';
import { latestFirst } from '@/lib/data';
import { waHref } from '@/lib/site';
import { itemListJsonLd } from '@/lib/schema';
import { cmsPageMetadata } from '@/lib/pageSeo';

export async function generateMetadata() {
  const hero = (await data()).heroCommunity(4);
  return cmsPageMetadata('commercial', {
    title: 'Commercial Property in Dubai: Offices for Lease & Sale',
    description: 'Offices for lease and sale in Dubai, from fitted business centre suites to full floors, with Ejari registration and trade-licence support handled for you.',
    path: '/commercial',
    image: hero?.img,
  });
}

// Business districts shown as tiles (only those in the CMS appear).
const DISTRICTS = ['business-bay', 'downtown-dubai', 'dubai-marina', 'dubai-creek-harbour'];

const POINTS: [IconName, string, string][] = [
  ['doc', 'Ejari and trade licence', 'A registered (Ejari) office lease is needed to issue or renew most mainland trade licences; we register it for you.'],
  ['wallet', 'Pricing', 'Commercial rents are quoted per sq ft per year and are often subject to VAT, unlike residential rents.'],
  ['briefcase', 'Fit-out', 'Choose fitted offices to move in quickly, or shell-and-core space to design your own layout.'],
];

export default async function CommercialPage() {
  const d = await data();
  const hero = d.heroCommunity(4);
  const offices = latestFirst(d.publishedProperties().filter(p => p.type === 'Office'));
  const districts = DISTRICTS.flatMap(slug => d.c.communities.filter(c => c.slug === slug));
  const tags = (p: (typeof offices)[number]) => [p.furnishing === 'Unfurnished' ? 'shell' : 'fitted', p.purpose === 'rent' ? 'lease' : 'sale'];
  return (
    <>
      <CmsPageHero page="commercial" eyebrow="Commercial" img={hero?.img ?? ''} alt={`${hero?.name ?? 'Dubai'}, Dubai`}
        title={[{ text: 'Commercial property ' }, { text: 'in Dubai', em: true }]}
        sub="Offices for lease and sale in Dubai's business districts, with Ejari registration and licensing support from a dedicated commercial desk."
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Commercial', href: '/commercial' }]} />

      <section aria-labelledby="offices" className="wrap py-[clamp(40px,6vw,80px)]">
        <h2 id="offices" className="mb-6 text-[clamp(1.3rem,2.2vw,1.7rem)]">{offices.length} {offices.length === 1 ? 'office' : 'offices'} available now</h2>
        <OfficeFilter items={offices.map(p => ({ id: p.id, tags: tags(p), card: <PropertyCard p={p} /> }))} extra={
          <div className="flex flex-col justify-center gap-3 rounded-[26px] soft-inset p-7">
            <span className="grid size-12 place-items-center rounded-full soft-raised-sm text-gold"><Icon name="briefcase" /></span>
            <h3 className="text-[1.25rem]">Need something specific?</h3>
            <p className="text-ink-2">Most commercial space is let before it is advertised. Tell us the size, area and budget, and our commercial desk will send a shortlist.</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <a href="#commercial-guide" className="rounded-full bg-forest px-5 py-3 text-[0.88rem] font-bold text-white shadow-btn transition hover:brightness-110">Send requirements</a>
              <a href={waHref(d.site.whatsapp, 'Hi, I am looking for commercial space in Dubai.')} target="_blank" rel="noopener"
                className="inline-flex items-center gap-2 rounded-full bg-[#127A3F] px-5 py-3 text-[0.88rem] font-bold text-white shadow-btn transition hover:brightness-110"><Icon name="wa" className="size-4" />WhatsApp</a>
            </div>
          </div>
        } />
        {districts.length > 0 && (
          <div className="mt-[clamp(32px,5vw,56px)]">
            <h3 className="mb-4 text-[1.2rem]">Dubai&apos;s business districts</h3>
            <ul className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
              {districts.map(c => (
                <li key={c.slug}>
                  <Link href={`/community/${c.slug}`} className="group block rounded-[20px] soft-raised-sm p-2 transition-[translate] duration-500 pointer-fine:hover:-translate-y-1">
                    <span className="relative block h-[110px] overflow-hidden rounded-[14px]">
                      <Image src={c.img} alt="" fill sizes="(min-width:1024px) 300px, 45vw" className="object-cover transition-[scale] duration-700 group-hover:scale-[1.06]" />
                    </span>
                    <b className="block px-1.5 pt-2.5 group-hover:text-forest">{c.name}</b>
                    <span className="block px-1.5 pb-1 text-[0.8rem] font-semibold text-muted">{c.tag}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-labelledby="commercial-guide" className="cv-auto bg-mist py-[clamp(48px,7vw,90px)]">
        <div className="wrap grid gap-[clamp(28px,4vw,56px)] lg:grid-cols-[1fr_380px]">
          <div>
            <span className="eyebrow mb-3">Good to know</span>
            <h2 id="commercial-guide" className="mb-6 text-[clamp(1.6rem,2.8vw,2.3rem)]">Leasing an office <em>in Dubai</em></h2>
            <ul className="grid gap-3">
              {POINTS.map(([icon, t, d]) => (
                <li key={t} className="flex gap-4 rounded-[20px] soft-raised-sm p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full soft-raised-sm text-gold"><Icon name={icon} className="size-[18px]" /></span>
                  <p className="text-[0.95rem] text-ink-2"><b className="mb-0.5 block text-ink">{t}</b>{d}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="self-start rounded-[28px] soft-raised p-[22px]">
            <EnquiryForm type="contact" subject="Commercial requirements" propertyRef="Commercial" title="Send your requirements" cta="Get a shortlist"
              message="Area, size (sq ft), budget and move-in date: " />
          </div>
        </div>
      </section>

      {offices.length > 0 && <JsonLd data={itemListJsonLd('Commercial property in Dubai', offices.map(p => ({ name: p.title, href: `/property/${p.slug}` })))} />}
    </>
  );
}
