import { SellForm } from '@/components/forms/SellForm';
import { CmsPageHero } from '@/components/layout/CmsPageHero';
import { CountUp } from '@/components/motion/CountUp';
import { FaqBlock } from '@/components/seo/FaqBlock';
import { data } from '@/lib/cms';
import { fillFees } from '@/payload/feeDefaults';
import { cmsPageMetadata } from '@/lib/pageSeo';

export async function generateMetadata() {
  const hero = (await data()).heroCommunity(3);
  return cmsPageMetadata('sell', {
    title: 'Sell or Let Your Property in Dubai: Free Valuation',
    description: 'List your Dubai property with Splendid Homes: free valuation within 24 hours, professional marketing on all major portals, and end-to-end handling through to transfer at the DLD.',
    path: '/sell',
    image: hero?.img,
  });
}

export default async function SellPage() {
  const { site, c, heroCommunity } = await data();
  const { communities } = c;
  const hero = heroCommunity(3);
  const S = site.sell, T = S.text;
  const s = site.stats;
  const stats: [string, string][] = [[`${s.years}+`, 'Years in Dubai'], [s.sold, 'Property sold'], [s.clients, 'Happy clients'], [`${s.agents}+`, 'Expert agents']];
  return (
    <>
      <CmsPageHero page="sell" eyebrow="Sell or let" img={hero?.img ?? ''} alt={`${hero?.name ?? 'Dubai'}, Dubai`}
        title={[{ text: 'List your property ' }, { text: 'with us', em: true }]}
        sub="A free, data-led valuation within 24 hours, then marketing that reaches buyers and tenants in Dubai and abroad."
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Sell', href: '/sell' }]} />

      <section className="wrap grid gap-[clamp(28px,5vw,64px)] py-[clamp(40px,6vw,80px)] lg:grid-cols-[1fr_1fr] lg:items-start">
        <div>
          <span className="eyebrow mb-3">{T.whyEyebrow}</span>
          <h2 className="mb-6 text-[clamp(1.6rem,2.8vw,2.3rem)]">{T.whyTitle}{T.whyItalic && <> <em>{T.whyItalic}</em></>}</h2>
          <ol className="mb-8 flex flex-col gap-5">
            {S.why.map(({ title: t, text: d }, i) => (
              <li key={t} className="flex gap-4">
                <span className="font-serif text-[1.3rem] italic text-leaf">{String(i + 1).padStart(2, '0')}</span>
                <div><h3 className="mb-0.5 text-[1.1rem]">{t}</h3><p className="text-ink-2">{fillFees(d, site.fees)}</p></div>
              </li>
            ))}
          </ol>
          {S.showStats && site.showFigures && <dl className="grid grid-cols-2 gap-5">
            {stats.map(([v, l]) => (
              <div key={l} className="flex flex-col-reverse">
                <dt className="text-[0.85rem] font-semibold text-muted">{l}</dt>
                <dd className="text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold tracking-[-0.03em] text-forest"><CountUp value={v} /></dd>
              </div>
            ))}
          </dl>}
        </div>
        <div className="lg:sticky lg:top-[104px]"><SellForm communities={communities.map(c => c.name)} text={T} intents={S.intents} /></div>
      </section>

      <section aria-labelledby="process" className="cv-auto bg-mist py-[clamp(48px,7vw,90px)]">
        <div className="wrap">
          <span className="eyebrow mb-3">{T.stepsEyebrow}</span>
          <h2 id="process" className="mb-8 text-[clamp(1.6rem,2.8vw,2.3rem)]">{T.stepsTitle}{T.stepsItalic && <> <em>{T.stepsItalic}</em></>}</h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {S.steps.map(({ title: t, text: d }, i) => (
              <li key={t} className="rounded-[22px] soft-raised p-5">
                <span className="mb-3 grid size-9 place-items-center rounded-full bg-forest font-bold text-white">{i + 1}</span>
                <h3 className="mb-1 text-[1.02rem]">{t}</h3>
                <p className="text-[0.9rem] text-ink-2">{fillFees(d, site.fees)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="wrap max-w-[880px] py-[clamp(48px,7vw,96px)]">
        <FaqBlock id="sell-faq" faqs={S.faqs.map(x => ({ q: x.q, a: fillFees(x.a, site.fees) }))} title={T.faqTitle} />
      </div>
    </>
  );
}
