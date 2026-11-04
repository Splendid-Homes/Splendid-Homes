import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { Icon, type IconName } from '@/components/icons';
import { PageHero } from '@/components/layout/PageHero';
import { ClipReveal } from '@/components/motion/ClipReveal';
import { EnquiryForm } from '@/components/property/EnquiryForm';
import { Gallery } from '@/components/property/Gallery';
import { MapFacade } from '@/components/property/MapFacade';
import { PropertyModals } from '@/components/property/PropertyModals';
import { FaqBlock } from '@/components/seo/FaqBlock';
import { JsonLd } from '@/components/seo/JsonLd';
import { Price } from '@/components/ui/Price';
import { SectionHead } from '@/components/ui/SectionHead';
import { num } from '@/lib/data';
import { projectFaqs } from '@/lib/faq';
import { planSchedule, priceRange } from '@/lib/offplan';
import { projectJsonLd } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';
import { telHref, waHref } from '@/lib/site';
import { aOrAn } from '@/lib/offplan';
import { data } from '@/lib/cms';
import { amenityIcon } from '@/lib/amenities';
import { BrochureRequest } from '@/components/forms/RequestForms';
import { fillFees } from '@/payload/feeDefaults';
import { fillProject } from '@/payload/offplanDefaults';

// Pages added in the CMS after a build (slugs not in generateStaticParams) render on their first visit,
// then are cached. A blocking first render keeps real 404s for unknown slugs (instead of a streamed shell).
export const instant = false;

export async function generateStaticParams() {
  const __d = await data();
  const { liveProjects } = __d;
  return liveProjects().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<'/off-plan/[slug]'>): Promise<Metadata> {
  const __d = await data();
  const { developers } = __d.c;
  const { communityBySlug, projectBySlug } = __d;
  const p = projectBySlug((await params).slug);
  if (!p) return {};
  const c = communityBySlug(p.community);
  const dev = developers.find(d => d.slug === p.developer)?.name ?? p.developer;
  return pageMetadata({
    title: `${p.name}: Prices & Payment Plan`,
    description: `${p.name} by ${dev} in ${c?.name ?? 'Dubai'}: from AED ${num(p.startPrice)}, ${p.paymentPlan} payment plan, handover ${p.handover}. Unit types, prices and FAQs.`,
    path: `/off-plan/${p.slug}`,
    image: p.img,
  });
}

export default async function ProjectPage({ params }: PageProps<'/off-plan/[slug]'>) {
  const __d = await data();
  const site = __d.site;
  const { developers } = __d.c;
  const { agentById, communityBySlug, liveProjects, projectBySlug } = __d;
  const p = projectBySlug((await params).slug);
  if (!p) notFound();
  const c = communityBySlug(p.community);
  const area = c?.name ?? 'Dubai';
  const dev = developers.find(d => d.slug === p.developer);
  const devName = dev?.name ?? p.developer;
  const schedule = planSchedule(p);
  const range = priceRange(p);
  // Shared wording and options: CMS > Off-plan pages. Project and fee tokens are filled in.
  const O = site.offplan, T = O.text;
  const fill = (t: string) => fillFees(fillProject(t, { name: p.name, developer: devName, area, plan: p.paymentPlan, price: `AED ${num(p.startPrice)}`, status: p.status.toLowerCase(), handover: p.handover }), site.fees);
  const others = liveProjects().filter(x => x.id !== p.id).slice(0, O.moreCount);
  const consultant = agentById(O.deskAgent); // off-plan desk (first agent if none is set)
  const waText = fill(T.waMessage);
  const faqs = [...(O.showAutoFaqs ? projectFaqs(p, c, devName, site.fees) : []), ...O.extraFaqs.map(x => ({ q: fill(x.q), a: fill(x.a) }))];
  const kpis: [string, React.ReactNode][] = [
    ['Starting price', <Price key="p" aed={p.startPrice} />],
    ['Payment plan', p.paymentPlan],
    ['Handover', p.handover],
    ['Developer', devName],
    ['Status', p.status],
  ];

  return (
    <article>
      <PageHero tall eyebrow={`${devName} · ${area}`} img={p.img} alt={`${p.name}, ${area}`}
        title={[{ text: p.name }]}
        sub={`${p.desc} Prices from AED ${num(p.startPrice)} with ${aOrAn(p.paymentPlan)} ${p.paymentPlan} payment plan and handover in ${p.handover}.`}
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Off-plan', href: '/off-plan' }, { name: p.name, href: `/off-plan/${p.slug}` }]}>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <a href="#register" className="rounded-full bg-mist px-6 py-3.5 font-bold text-forest shadow-[-3px_-3px_8px_rgba(255,255,255,.12),5px_5px_14px_rgba(0,0,0,.35)] transition hover:text-deep active:soft-pressed">Register interest</a>
          <a href={waHref(site.whatsapp, waText)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-[#127A3F] px-6 py-3.5 font-bold text-white shadow-btn transition hover:brightness-110"><Icon name="wa" /> {T.whatsappCta}</a>
        </div>
      </PageHero>

      <div className="wrap pt-[clamp(24px,4vw,40px)]">
        <dl className="grid grid-cols-2 gap-3 rounded-[26px] soft-inset p-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map(([k, v]) => (
            <div key={k} className="flex flex-col-reverse gap-1 rounded-[18px] soft-raised-sm px-5 py-4">
              <dt className="text-[0.74rem] font-extrabold uppercase tracking-[0.05em] text-muted">{k}</dt>
              <dd className="text-[1.15rem] font-extrabold text-forest">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-[clamp(28px,4vw,48px)] grid gap-[clamp(28px,4vw,56px)] lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid min-w-0 gap-[clamp(22px,3vw,30px)]">
            <section aria-labelledby="about" className="rounded-[26px] soft-raised p-[clamp(18px,2.4vw,26px)]">
              <h2 id="about" className="mb-4 text-[clamp(1.35rem,2.2vw,1.75rem)]">{fill(T.aboutTitle)}</h2>
              <p className="mb-3 max-w-[68ch] text-[1.05rem] leading-relaxed text-ink-2">{p.desc}</p>
              {T.aboutNote && <p className="max-w-[68ch] text-muted">{fill(T.aboutNote)}</p>}
            </section>

            {p.highlights.length > 0 && (
              <section aria-labelledby="why">
                <h2 id="why" className="mb-5 text-[clamp(1.35rem,2.2vw,1.75rem)]">{fill(T.whyTitleP)}</h2>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {p.highlights.map(h => (
                    <li key={h.id} className="flex gap-4 rounded-card soft-raised p-5">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full soft-raised-sm text-forest"><Icon name={h.icon as IconName} className="size-5" /></span>
                      <span>
                        <b className="block">{h.label}</b>
                        {h.desc && <span className="mt-0.5 block text-[0.9rem] text-muted">{h.desc}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="plan" className="rounded-[26px] soft-raised p-[clamp(18px,2.4vw,26px)]">
              <h2 id="plan" className="mb-2 text-[clamp(1.35rem,2.2vw,1.75rem)]">{fill(T.planTitle)}</h2>
              {T.planIntro && <p className="mb-5 text-ink-2">{fill(T.planIntro)}</p>}
              <div className="mb-6 flex h-16 gap-1.5 rounded-[18px] soft-inset p-1.5" aria-hidden="true">
                {p.plan.map((m, i) => (
                  <div key={m.label} style={{ flexGrow: m.pct }} className={`grid min-w-12 place-items-center rounded-[13px] text-[0.9rem] font-extrabold shadow-btn ${['bg-gold text-deep', 'bg-forest text-white', 'bg-leaf text-white', 'bg-[#3d7a58] text-white'][i % 4]}`}>{m.pct}%</div>
                ))}
              </div>
              <div className="overflow-x-auto rounded-[22px] soft-inset p-2">
                <table className="soft-table w-full min-w-[420px] text-[0.94rem]">
                  <caption className="sr-only">Payment schedule for {p.name} at the starting price</caption>
                  <thead className="text-left text-[0.74rem] font-bold uppercase tracking-[0.08em] text-muted">
                    <tr><th scope="col" className="px-4 py-3">{T.planColMilestone}</th><th scope="col" className="px-4 py-3 text-right">{T.planColShare}</th><th scope="col" className="px-4 py-3 text-right">On AED {num(p.startPrice)}</th></tr>
                  </thead>
                  <tbody>
                    {schedule.map(m => (
                      <tr key={m.label} >
                        <th scope="row" className="px-4 py-3.5 text-left font-semibold">{m.label}</th>
                        <td className="px-4 py-3.5 text-right tabular-nums">{m.pct}%</td>
                        <td className="px-4 py-3.5 text-right font-bold tabular-nums">AED {num(m.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {T.planNote && <p className="mt-3 text-[0.82rem] text-muted">{fill(T.planNote)}</p>}
            </section>

            <section aria-labelledby="units" className="rounded-[26px] soft-raised p-[clamp(18px,2.4vw,26px)]">
              <h2 id="units" className="mb-5 text-[clamp(1.35rem,2.2vw,1.75rem)]">{fill(T.unitsTitle)}</h2>
              <div className="overflow-x-auto rounded-[22px] soft-inset p-2">
                <table className="soft-table w-full min-w-[460px] text-[0.94rem]">
                  <caption className="sr-only">Unit types, sizes and starting prices at {p.name}</caption>
                  <thead className="text-left text-[0.74rem] font-bold uppercase tracking-[0.08em] text-muted">
                    <tr><th scope="col" className="px-4 py-3">{T.unitColType}</th><th scope="col" className="px-4 py-3">{T.unitColSize}</th><th scope="col" className="px-4 py-3 text-right">{T.unitColFrom}</th></tr>
                  </thead>
                  <tbody>
                    {p.units.map(u => (
                      <tr key={u.type} >
                        <th scope="row" className="px-4 py-3.5 text-left font-semibold">{u.type}</th>
                        <td className="px-4 py-3.5 tabular-nums">{u.size}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-forest"><Price aed={u.from} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section aria-labelledby="gallery">
              <h2 id="gallery" className="mb-5 text-[clamp(1.35rem,2.2vw,1.75rem)]">{fill(T.galleryTitle)}</h2>
              <Gallery images={p.images} title={p.name} location={area} preloadFirst={false} />
            </section>

            <section aria-labelledby="amenities">
              <h2 id="amenities" className="mb-5 text-[clamp(1.35rem,2.2vw,1.75rem)]">{fill(T.amenitiesTitle)}</h2>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {p.amenities.map(a => (
                  <li key={a} className="grid justify-items-center gap-2.5 rounded-[20px] soft-raised-sm px-3 py-4 text-center text-[0.86rem] font-bold">
                    <span className="grid size-10 place-items-center rounded-full soft-raised-sm text-gold"><Icon name={amenityIcon(a)} className="size-[18px]" /></span>{a}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="location" className="rounded-[26px] soft-raised p-[clamp(18px,2.4vw,26px)]">
              <h2 id="location" className="mb-4 text-[clamp(1.35rem,2.2vw,1.75rem)]">{fill(T.locationTitle)}</h2>
              {c && <p className="mb-5 max-w-[68ch] text-ink-2">{c.desc} <Link href={`/community/${c.slug}`} className="font-semibold text-forest underline-offset-4 hover:underline">{c.name} area guide</Link></p>}
              {c && <MapFacade lat={c.coords[0]} lng={c.coords[1]} label={`${p.name}, ${area}`} />}
            </section>

            {dev && (
              <section aria-labelledby="developer" className="rounded-[26px] soft-inset p-[clamp(18px,2.4vw,26px)]">
                <h2 id="developer" className="mb-3 text-[clamp(1.35rem,2.2vw,1.75rem)]">{fill(T.devTitle)}</h2>
                <p className="max-w-[68ch] text-ink-2">{dev.desc} Founded in {dev.founded}.</p>
              </section>
            )}

            {faqs.length > 0 && <FaqBlock id="project-faq" faqs={faqs} title={fill(T.faqTitle)} />}
          </div>

          <aside id="register" aria-label="Register interest" className="scroll-mt-[110px] lg:sticky lg:top-[104px] lg:self-start">
            <div className="flex flex-col gap-4 rounded-[28px] soft-raised p-[22px]">
              {T.contactIntro && <p className="text-[0.92rem] text-ink-2">{fill(T.contactIntro)}</p>}
              <div className="grid grid-cols-2 gap-2.5">
                <a href={waHref(site.whatsapp, waText)} target="_blank" rel="noopener" className="inline-flex items-center justify-center gap-2 rounded-full shadow-btn bg-[#127A3F] px-4 py-3 text-[0.9rem] font-bold text-white"><Icon name="wa" /> {T.whatsappCta}</a>
                <a href={telHref(consultant.phone)} className="inline-flex items-center justify-center gap-2 rounded-full soft-raised active:soft-pressed px-4 py-3 text-[0.9rem] font-bold hover:border-forest hover:text-forest"><Icon name="phone" /> {T.callCta}</a>
              </div>
              <hr className="border-t border-dashed border-line" />
              <EnquiryForm type="interest" projectId={p.id} propertyRef={p.name} title={fill(T.interestTitle)} cta={T.interestCta}
                message={fill(T.interestMessage)} />
              <hr className="border-t border-dashed border-line" />
              <BrochureRequest projectId={p.id} projectName={p.name} title={fill(T.brochureTitle)} cta={T.brochureCta} />
            </div>
          </aside>
        </div>
      </div>

      {others.length > 0 && (
        <section aria-labelledby="more" className="cv-auto wrap py-[clamp(48px,7vw,96px)]">
          <SectionHead id="more" eyebrow={T.moreEyebrow} title={[{ text: T.moreItalic ? `${T.moreTitle} ` : T.moreTitle }, ...(T.moreItalic ? [{ text: T.moreItalic, em: true }] : [])]} link="/off-plan" linkLabel="All projects" />
          <ClipReveal className="grid gap-[clamp(18px,2.4vw,30px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr))]">
            {others.map(o => <ProjectCard key={o.id} p={o} />)}
          </ClipReveal>
        </section>
      )}

      <PropertyModals info={{ title: p.name, ref: p.name, agentName: consultant.name, projectId: p.id }} images={p.images} />
      <JsonLd data={projectJsonLd(p, c, devName, range)} />
    </article>
  );
}
