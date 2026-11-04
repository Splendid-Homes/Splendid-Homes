import Image from 'next/image';
import Link from 'next/link';
import { Icon, type IconName } from '@/components/icons';
import { CmsPageHero } from '@/components/layout/CmsPageHero';
import { JsonLd } from '@/components/seo/JsonLd';
import { data } from '@/lib/cms';
import { absoluteUrl } from '@/lib/seo';
import { SITE_URL, waHref } from '@/lib/site';
import { ServiceRequest } from '@/components/forms/RequestForms';
import { fillFees } from '@/payload/feeDefaults';
import { FaqBlock } from '@/components/seo/FaqBlock';
import { cmsPageMetadata } from '@/lib/pageSeo';

export async function generateMetadata() {
  const { c, heroCommunity } = await data();
  return cmsPageMetadata('services', {
    title: 'Real Estate Services in Dubai',
    description: `${c.services.map(s => s.name).join(', ')}: Splendid Homes handles every step of owning property in Dubai under one roof.`,
    path: '/services',
    image: heroCommunity(3)?.img,
  });
}

/** Services, one row each with an anchor (#slug) that the homepage list links to. */
export default async function ServicesPage() {
  const { site, c, heroCommunity, serviceImg } = await data();
  const { services } = c;
  const hero = heroCommunity(3);
  const SP = site.servicesPage, T = SP.text;
  const fill = (t: string, s: string) => t.replaceAll('{service}', s);
  const lower = (s: string) => s.toLowerCase();
  const faqs = [...services.flatMap(s => s.faqs), ...SP.faqs].map(x => ({ q: x.q, a: fillFees(x.a, site.fees) }));
  return (
    <>
      <CmsPageHero page="services" eyebrow="Services" img={hero?.img ?? ''} alt={`${hero?.name ?? 'Dubai'}, Dubai`}
        title={[{ text: 'Everything property, ' }, { text: 'under one roof', em: true }]}
        sub={`${services.length} services from the first viewing to managing your portfolio: ${services.map(s => s.name.toLowerCase()).join(', ')}.`}
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Services', href: '/services' }]} />

      <div className="wrap flex flex-col gap-[clamp(48px,7vw,96px)] py-[clamp(48px,7vw,96px)]">
        {services.map((s, i) => (
          <section key={s.slug} id={s.slug} aria-labelledby={`${s.slug}-title`} className="grid scroll-mt-[110px] items-center gap-[clamp(24px,4vw,56px)] lg:grid-cols-2">
            <div className={`relative aspect-[4/3] overflow-hidden rounded-[28px] bg-mint ${i % 2 ? 'lg:order-2' : ''}`}>
              <Image src={serviceImg(i)} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div>
              <span className="mb-4 grid size-12 place-items-center rounded-full soft-raised-sm text-gold"><Icon name={s.icon as IconName} /></span>
              <h2 id={`${s.slug}-title`} className="mb-3 text-[clamp(1.6rem,2.8vw,2.2rem)]">{s.name}</h2>
              <p className="mb-5 text-[1.08rem] text-ink-2">{s.desc}</p>
              <ul className="mb-6 grid gap-2.5 sm:grid-cols-2">
                {s.points.map(p => <li key={p} className="flex items-center gap-2.5"><span className="grid size-6 shrink-0 place-items-center rounded-full soft-raised-sm text-gold"><Icon name="check" className="size-3.5" /></span>{p}</li>)}
              </ul>
              <div className="flex flex-wrap gap-2.5">
                <ServiceRequest service={s.name} label={T.talkCta} title={fill(T.formTitle, lower(s.name))} cta={T.formCta} hint={T.formHint} />
                <a href={waHref(site.whatsapp, fill(T.waMessage, lower(s.name)))} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full soft-raised active:soft-pressed px-5 py-3 font-bold transition-colors hover:border-forest hover:text-forest"><Icon name="wa" /> {T.whatsappCta}</a>
                {/* Optional extra button, set on each service in the CMS */}
                {s.ctaLabel && s.ctaHref && <Link href={s.ctaHref} className="rounded-full soft-raised active:soft-pressed px-5 py-3 font-bold transition-colors hover:border-forest hover:text-forest">{s.ctaLabel}</Link>}
              </div>
            </div>
          </section>
        ))}
      </div>

      {SP.showCta && (
        <section aria-labelledby="services-cta" className="drift-dark mx-4 rounded-[40px] bg-forest py-[clamp(44px,6vw,80px)] text-white max-sm:mx-0 max-sm:rounded-[24px]">
          <div className="wrap flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-[640px]">
              <span className="eyebrow mb-3 text-[#B9DBC2]">{T.ctaEyebrow}</span>
              <h2 id="services-cta" className="mb-3 text-[clamp(1.7rem,3vw,2.5rem)] text-white">{T.ctaTitle}{T.ctaItalic && <> <em className="text-[#B9DBC2]">{T.ctaItalic}</em></>}</h2>
              {T.ctaText && <p className="text-white/80">{T.ctaText}</p>}
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link href={T.ctaPrimaryHref} className="rounded-full bg-mist px-6 py-3.5 font-bold text-forest shadow-btn transition hover:brightness-105">{T.ctaPrimary}</Link>
              <a href={waHref(site.whatsapp)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-[#127A3F] px-6 py-3.5 font-bold text-white shadow-btn transition hover:brightness-110"><Icon name="wa" /> {T.ctaSecondary}</a>
            </div>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <div className="wrap max-w-[880px] py-[clamp(48px,7vw,96px)]">
          <FaqBlock id="services-faq" faqs={faqs} title={T.faqTitle} />
        </div>
      )}

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Splendid Homes services',
        itemListElement: services.map((s, i) => ({
          '@type': 'ListItem', position: i + 1,
          item: { '@type': 'Service', name: s.name, description: s.desc, url: absoluteUrl(`/services#${s.slug}`), provider: { '@id': `${SITE_URL}/#organization` }, areaServed: { '@type': 'City', name: 'Dubai' } },
        })),
      }} />
    </>
  );
}
