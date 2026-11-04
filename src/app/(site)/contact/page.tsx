import { Icon, type IconName } from '@/components/icons';
import { CmsPageHero } from '@/components/layout/CmsPageHero';
import { EnquiryForm } from '@/components/property/EnquiryForm';
import { MapFacade } from '@/components/property/MapFacade';
import { JsonLd } from '@/components/seo/JsonLd';
import { data } from '@/lib/cms';
import { absoluteUrl } from '@/lib/seo';
import { SITE_URL, telHref, waHref } from '@/lib/site';
import { cmsPageMetadata } from '@/lib/pageSeo';

export async function generateMetadata() {
  const { site: SITE, heroCommunity } = await data();
  return cmsPageMetadata('contact', {
    title: 'Contact Splendid Homes',
    description: `Call ${SITE.phone}, WhatsApp or email ${SITE.email}, or visit us at ${SITE.address.full}. Open ${SITE.hours}.`,
    path: '/contact',
    image: heroCommunity(1)?.img,
  });
}

/** Contact page. NAP comes from SITE, the same source as the footer and the Organization schema. */
export default async function ContactPage() {
  const { site: SITE, heroCommunity } = await data();
  const hero = heroCommunity(1);
  const CC = SITE.contactCareers, T = CC.text;
  // Company details from Site settings; labels and extra rows from CMS > Contact & Careers pages.
  const rows: [IconName, string, string, string | null][] = [
    ['phone', T.callLabel, SITE.phone, telHref(SITE.phone)],
    ['wa', T.waLabel, T.waValue, waHref(SITE.whatsapp)],
    ['mail', T.emailLabel, SITE.email, `mailto:${SITE.email}`],
    ['pin', T.visitLabel, SITE.address.full, null],
    ['cal', T.hoursLabel, SITE.hours, null],
    ...CC.extraRows.map(r => [r.icon as IconName, r.label, r.value, r.href || null] as [IconName, string, string, string | null]),
  ];
  return (
    <>
      <CmsPageHero page="contact" eyebrow="Contact" img={hero?.img ?? ''} alt={`${hero?.name ?? 'Dubai'}, Dubai`}
        title={[{ text: 'Let’s talk ' }, { text: 'property', em: true }]}
        sub="Our team typically replies within 15 minutes during office hours."
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Contact', href: '/contact' }]} />

      <section className="wrap grid gap-[clamp(28px,4vw,56px)] py-[clamp(40px,6vw,80px)] lg:grid-cols-[1fr_420px] lg:items-start">
        <div>
          <h2 className="sr-only">Contact details</h2>
          <address className="mb-6 grid gap-3 not-italic sm:grid-cols-2">
            {rows.map(([icon, label, value, href]) => {
              const body = (
                <>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full soft-raised-sm text-gold"><Icon name={icon} /></span>
                  <span className="min-w-0"><span className="block text-[0.8rem] font-semibold text-muted">{label}</span><span className="block break-words font-bold">{value}</span></span>
                </>
              );
              const cls = 'flex items-center gap-3.5 rounded-[20px] soft-raised-sm p-4 transition-[translate] duration-300';
              return href
                ? <a key={label} href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})} className={`${cls} pointer-fine:hover:-translate-y-0.5`}>{body}</a>
                : <div key={label} className={cls}>{body}</div>;
            })}
          </address>
          {CC.showMap && <MapFacade lat={SITE.geo.lat} lng={SITE.geo.lng} label={`${SITE.name}, ${SITE.address.street}`} />}
          <p className="mt-3 text-[0.84rem] text-muted">{SITE.legalName} · RERA ORN {SITE.orn}</p>
        </div>
        <div className="rounded-[28px] soft-raised p-[22px]">
          <EnquiryForm type="contact" withInterest propertyRef="General" title={T.formTitle} cta={T.formCta}
            message={T.formMessage} interests={CC.interests} interestLabel={T.interestLabel} />
        </div>
      </section>

      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'ContactPage', url: absoluteUrl('/contact'), name: `Contact ${SITE.name}`, about: { '@id': `${SITE_URL}/#organization` } }} />
    </>
  );
}
