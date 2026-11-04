'use client';

import { useId, useMemo, useState } from 'react';
import type { Fees } from '@/payload/feeDefaults';
import { minDepositFor, type MortgageRules, type MortgageText } from '@/payload/mortgageDefaults';

type Residency = 'expat' | 'national' | 'nonresident';

const aed = (n: number) => `AED ${Math.round(n).toLocaleString('en-US')}`;

/**
 * Mortgage calculator (F18 / GEO "original tool"). Works out the monthly repayment and the
 * full cash needed upfront. The server HTML shows the default scenario's numbers, so the page
 * is meaningful before hydration and to crawlers.
 */
export function MortgageCalculator({ fees: f, rules: R, text: T }: { fees: Fees; rules: MortgageRules; text: MortgageText }) {
  // Lending rules, starting values and ranges come from the CMS (Mortgage page).
  const RES: [Residency, string][] = [['expat', T.expatLabel], ['national', T.nationalLabel], ['nonresident', T.nonResLabel]];
  const id = useId();
  const [res, setRes] = useState<Residency>('expat');
  const [price, setPrice] = useState(R.defaultPrice);
  const [dep, setDep] = useState(R.defaultDeposit);
  const [years, setYears] = useState(R.maxTerm);
  const [rate, setRate] = useState(R.defaultRate);

  const min = minDepositFor(R, res, price);
  const deposit = Math.max(dep, min);
  const r = useMemo(() => {
    const loan = price * (1 - deposit / 100);
    const i = rate / 1200, n = years * 12;
    const monthly = i ? (loan * i) / (1 - Math.pow(1 + i, -n)) : loan / n;
    const vat = 1 + f.vatPct / 100, pc = (n: number) => `${+n.toFixed(2)}%`;
    const costs: [string, number][] = [
      [`Deposit (${deposit}%)`, (price * deposit) / 100],
      [`DLD transfer fee (${pc(f.dldPct)} + admin)`, price * f.dldPct / 100 + f.dldAdmin],
      ['Trustee office fee (+ VAT)', (price >= f.trusteeThreshold ? f.trusteeHigh : f.trusteeLow) * vat],
      [`Mortgage registration (${pc(f.mortgageRegPct)} + AED ${f.mortgageRegFee})`, loan * f.mortgageRegPct / 100 + f.mortgageRegFee],
      [`Agency fee (${pc(f.buyerAgencyPct)} + VAT)`, price * f.buyerAgencyPct / 100 * vat],
      [`Bank arrangement fee (up to ${pc(f.bankFeePct)} + VAT)`, loan * f.bankFeePct / 100 * vat],
      ['Valuation fee (approx.)', R.valuationFee],
    ];
    return { loan, monthly, interest: monthly * n - loan, costs, upfront: costs.reduce((s, c) => s + c[1], 0) };
  }, [price, deposit, years, rate, f, R.valuationFee]);

  const input = 'w-full rounded-field border-0 soft-inset px-3.5 py-3 text-base text-ink outline-none transition-shadow focus:outline-solid focus:outline-2 focus:outline-gold/60';
  const lab = 'mb-1.5 flex justify-between text-[0.8rem] font-semibold tracking-[0.03em] text-muted';
  return (
    <div className="grid gap-[clamp(20px,3vw,32px)] lg:grid-cols-[1fr_1.1fr]">
      <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-5 rounded-[28px] soft-raised p-[clamp(22px,3vw,32px)]" aria-label="Mortgage details">
        <fieldset>
          <legend className={lab}>Buyer type</legend>
          <div className="grid grid-cols-3 gap-1.5 rounded-[16px] soft-inset p-1.5">
            {RES.map(([k, l]) => (
              <label key={k} className="cursor-pointer rounded-[10px] px-2 py-2.5 text-center text-[0.84rem] font-bold leading-tight transition-[color,background-color,box-shadow] has-[:checked]:bg-forest has-[:checked]:text-white has-[:checked]:shadow-btn has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-forest">
                <input type="radio" name="res" value={k} checked={res === k} onChange={() => setRes(k)} className="sr-only" />{l}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor={`${id}-price`} className={lab}>Property price (AED)</label>
          <input id={`${id}-price`} type="number" inputMode="numeric" min={100000} step={50000} value={price} onChange={e => setPrice(Math.max(0, Number(e.target.value) || 0))} className={input} />
        </div>
        <div>
          <label htmlFor={`${id}-dep`} className={lab}><span>Deposit</span><b className="text-ink">{deposit}% · {aed((price * deposit) / 100)}</b></label>
          <input id={`${id}-dep`} type="range" min={min} max={Math.max(min, R.maxDeposit)} value={deposit} onChange={e => setDep(Number(e.target.value))} className="w-full accent-forest" />
          <p className="mt-1 text-[0.8rem] text-muted">Minimum for this buyer and price: <b>{min}%</b>{res === 'nonresident' ? ' (varies by bank)' : ''}</p>
        </div>
        <div>
          <label htmlFor={`${id}-yrs`} className={lab}><span>Loan term</span><b className="text-ink">{years} years</b></label>
          <input id={`${id}-yrs`} type="range" min={R.minTerm} max={R.maxTerm} value={Math.min(years, R.maxTerm)} onChange={e => setYears(Number(e.target.value))} className="w-full accent-forest" />
        </div>
        <div>
          <label htmlFor={`${id}-rate`} className={lab}>Interest rate (% per year)</label>
          <input id={`${id}-rate`} type="number" inputMode="decimal" min={0} max={R.maxRate} step={0.05} value={rate} onChange={e => setRate(Math.max(0, Number(e.target.value) || 0))} className={input} />
        </div>
      </form>

      <div className="flex flex-col gap-5 rounded-3xl bg-forest p-[clamp(22px,3vw,32px)] text-white" aria-live="polite">
        <div>
          <p className="text-[0.85rem] font-semibold uppercase tracking-[0.1em] text-[#B9DBC2]">Monthly repayment</p>
          <p className="text-[clamp(2.2rem,5vw,3.2rem)] font-extrabold tracking-[-0.03em]">{aed(r.monthly)}</p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-[0.9rem]">
            <div><dt className="text-[#B9DBC2]">Loan amount</dt><dd className="font-bold">{aed(r.loan)}</dd></div>
            <div><dt className="text-[#B9DBC2]">Total interest</dt><dd className="font-bold">{aed(r.interest)}</dd></div>
          </dl>
        </div>
        <div className="rounded-[18px] bg-mist p-5 text-ink shadow-[inset_2px_2px_6px_rgba(18,38,26,.12)]">
          <p className="mb-3 font-bold">Cash needed upfront</p>
          <table className="w-full text-[0.9rem]">
            <caption className="sr-only">Upfront costs of buying with a mortgage</caption>
            <tbody>
              {r.costs.map(([k, v]) => <tr key={k} className="border-b border-dashed border-line last:border-0"><th scope="row" className="py-2 pr-3 text-left font-normal text-ink-2">{k}</th><td className="py-2 text-right font-semibold tabular-nums">{aed(v)}</td></tr>)}
            </tbody>
            <tfoot><tr><th scope="row" className="pt-3 text-left">Total upfront</th><td className="pt-3 text-right text-[1.1rem] font-extrabold text-forest tabular-nums">{aed(r.upfront)}</td></tr></tfoot>
          </table>
        </div>
        {T.calcNote && <p className="text-[0.8rem] text-[#D5E7DA]">{T.calcNote}</p>}
      </div>
    </div>
  );
}
