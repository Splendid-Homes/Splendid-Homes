import Link from 'next/link';
import { MortgageCalculator } from '@/components/forms/MortgageCalculator';
import { CmsPageHero } from '@/components/layout/CmsPageHero';
import { FaqBlock } from '@/components/seo/FaqBlock';
import { data } from '@/lib/cms';
import { MortgageRequest } from '@/components/forms/RequestForms';
import { fillFees } from '@/payload/feeDefaults';
import { fillRules } from '@/payload/mortgageDefaults';
import { cmsPageMetadata } from '@/lib/pageSeo';

export async function generateMetadata() {
  const hero = (await data()).heroCommunity(5);
  return cmsPageMetadata('mortgage', {
    title: 'Dubai Mortgage Calculator: Repayments & Upfront Costs',
    description: `Work out your monthly mortgage repayment in Dubai and the full cash needed upfront: deposit, ${(await data()).site.fees.dldPct}% DLD fee, trustee, registration, agency and bank fees, for expats, UAE nationals and non-residents.`,
    path: '/mortgage',
    image: hero?.img,
  });
}

export default async function MortgagePage() {
  const d = await data();
  const hero = d.heroCommunity(5);
  const fees = d.site.fees;
  const M = d.site.mortgage, R = M.rules, T = M.text;
  const fill = (t: string) => fillFees(fillRules(t, R), fees);
  const lim = `AED ${+(R.threshold / 1_000_000).toFixed(2)}M`;
  const LTV = [[T.expatLabel, `${R.expatDep}%`, `${R.expatDepHigh}%`], [T.nationalLabel, `${R.nationalDep}%`, `${R.nationalDepHigh}%`], [T.nonResLabel, fill(T.nonResNote), fill(T.nonResNote)]];
  return (
    <>
      <CmsPageHero page="mortgage" eyebrow="Finance" img={hero?.img ?? ''} alt={`${hero?.name ?? 'Dubai'}, Dubai`}
        title={[{ text: 'Mortgage ' }, { text: 'calculator', em: true }]}
        sub="Estimate your monthly repayment and the full cash you need upfront to buy in Dubai, based on Central Bank of the UAE limits and current DLD fees."
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Mortgage calculator', href: '/mortgage' }]} />

      <section aria-label="Calculator" className="wrap py-[clamp(40px,6vw,80px)]">
        <MortgageCalculator fees={fees} rules={R} text={T} />
        <div className="mt-[clamp(28px,4vw,48px)] grid gap-6 rounded-[28px] soft-raised p-[clamp(22px,3vw,36px)] lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <h2 className="mb-2 text-[clamp(1.4rem,2.4vw,1.9rem)]">{T.preTitle}{T.preItalic && <> <em>{T.preItalic}</em></>}</h2>
            {T.preText && <p className="text-ink-2">{fill(T.preText)}</p>}
          </div>
          <MortgageRequest cta={T.preCta} buyers={[T.expatLabel, T.nationalLabel, T.nonResLabel]} budgetLabel={T.budgetLabel} budgetHint={T.budgetHint} />
        </div>
      </section>

      <section aria-labelledby="ltv" className="cv-auto bg-mist py-[clamp(48px,7vw,90px)]">
        <div className="wrap grid gap-[clamp(28px,4vw,56px)] lg:grid-cols-[1fr_1.2fr]">
          <div>
            <span className="eyebrow mb-3">{T.ltvEyebrow}</span>
            <h2 id="ltv" className="mb-4 text-[clamp(1.6rem,2.8vw,2.3rem)]">{T.ltvTitle}{T.ltvItalic && <> <em>{T.ltvItalic}</em></>}</h2>
            {T.ltvText1 && <p className="mb-4 text-ink-2">{fill(T.ltvText1)}</p>}
            <p className="text-ink-2">{fill(T.ltvText2)} {T.guideHref && <Link href={T.guideHref} className="font-semibold text-forest underline-offset-4 hover:underline">{T.guideLabel}</Link>}</p>
          </div>
          <div>
            <div role="region" aria-label="Minimum deposit by buyer type" tabIndex={0} className="overflow-x-auto rounded-[22px] soft-inset p-2">
              <table className="soft-table w-full min-w-[480px] text-[0.94rem]">
                <caption className="sr-only">Minimum deposit for a first home by buyer type and price</caption>
                <thead className="text-left text-[0.74rem] font-bold uppercase tracking-[0.08em] text-muted">
                  <tr><th scope="col" className="px-4 py-3">{T.colBuyer}</th><th scope="col" className="px-4 py-3">Up to {lim}</th><th scope="col" className="px-4 py-3">Above {lim}</th></tr>
                </thead>
                <tbody>
                  {LTV.map(([b, lo, hi]) => <tr key={b}><th scope="row" className="px-4 py-3.5 text-left font-semibold">{b}</th><td className="px-4 py-3.5">{lo}</td><td className="px-4 py-3.5">{hi}</td></tr>)}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[0.8rem] text-muted">Source: <a href="https://www.centralbank.ae" target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-forest">Central Bank of the UAE</a> mortgage regulations (first home); fees per <a href="https://dubailand.gov.ae" target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-forest">Dubai Land Department</a>. {T.reviewed}</p>
          </div>
        </div>
      </section>

      <div className="wrap max-w-[880px] py-[clamp(48px,7vw,96px)]">
        <FaqBlock id="mortgage-faq" faqs={M.faqs.map(x => ({ q: fill(x.q), a: fill(x.a) }))} title={T.faqTitle} />
      </div>
    </>
  );
}
