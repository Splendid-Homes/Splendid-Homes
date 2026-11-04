import Link from 'next/link';
import type { Property } from '@/data/types';
import { num } from '@/lib/data';
import type { Fees } from '@/payload/feeDefaults';

const aed = (n: number) => `AED ${num(Math.round(n))}`;

/**
 * "What it costs to buy / rent" (soft UI): the usual one-off costs worked out from the listing.
 * Figures follow common Dubai practice and are labelled as estimates; fees can change.
 */
export function CostBreakdown({ p, fees: f, text }: { p: Property; fees: Fees; text: { title: string; note: string; footnote: string } }) {
  const VAT = f.vatPct / 100, pct = (n: number) => `${+n.toFixed(2)}%`;
  const dep = p.furnishing === 'Furnished' ? f.depositFurnishedPct : f.depositPct;
  const rent = p.purpose === 'rent';
  const villa = p.type === 'Villa' || p.type === 'Townhouse';
  const rows: [string, number, string?][] = rent
    ? [
      ['Annual rent', p.price],
      [`Security deposit (${pct(dep)}, refundable)`, p.price * dep / 100],
      [`Agency fee (${pct(f.rentAgencyPct)} + VAT)`, p.price * f.rentAgencyPct / 100 * (1 + VAT)],
      ['Ejari registration', f.ejariFee],
      ['DEWA connection deposit (refundable)', villa ? f.dewaVilla : f.dewaApartment],
    ]
    : [
      ['Price', p.price],
      [`DLD transfer fee (${pct(f.dldPct)})`, p.price * f.dldPct / 100],
      ['DLD admin fee', f.dldAdmin],
      ['Trustee office fee (incl. VAT)', (p.price >= f.trusteeThreshold ? f.trusteeHigh : f.trusteeLow) * (1 + VAT)],
      [`Agency fee (${pct(f.buyerAgencyPct)} + VAT)`, p.price * f.buyerAgencyPct / 100 * (1 + VAT)],
    ];
  const total = rows.reduce((a, [, v]) => a + v, 0);
  return (
    <section id="costs" aria-labelledby="costs-title" className="scroll-mt-[170px] rounded-[28px] soft-inset p-[clamp(14px,2vw,20px)]">
      <h2 id="costs-title" className="mb-1 px-2 pt-1 text-[clamp(1.3rem,2.2vw,1.65rem)]">{text.title}</h2>
      {text.note && <p className="mb-4 px-2 text-[0.88rem] text-muted">{text.note}</p>}
      <dl className="grid gap-1.5">
        {rows.map(([k, v], i) => (
          <div key={k} className={`flex items-center justify-between gap-4 rounded-[14px] px-4 py-3 text-[0.93rem] ${i % 2 ? '' : 'soft-inset-sm'}`}>
            <dt className="text-ink-2">{k}</dt><dd className="font-bold tabular-nums">{aed(v)}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 rounded-[16px] soft-raised px-4 py-3.5">
          <dt className="font-extrabold">{rent ? 'Total to move in' : 'Total to budget'}</dt>
          <dd className="text-[1.1rem] font-extrabold tabular-nums text-forest">{aed(total)}</dd>
        </div>
      </dl>
      <p className="mt-3 px-2 text-[0.8rem] text-muted">
        {text.footnote}
        {!rent && <> Buying with a mortgage adds about {pct(f.mortgageRegPct)} registration plus bank fees: <Link href="/mortgage" className="font-bold text-forest underline underline-offset-2">try the mortgage calculator</Link>.</>}
      </p>
    </section>
  );
}
