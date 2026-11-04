/**
 * Dubai purchase and rental costs used across the site (cost breakdowns, mortgage calculator,
 * FAQs, "Good to know"). Edited in the CMS under Fees & costs; these are the fallbacks.
 */
export type Fees = {
  dldPct: number; dldAdmin: number; trusteeHigh: number; trusteeLow: number; trusteeThreshold: number; vatPct: number;
  buyerAgencyPct: number; sellerAgencyPct: number; rentAgencyPct: number; mortgageRegPct: number; mortgageRegFee: number;
  bankFeePct: number; depositPct: number; depositFurnishedPct: number; goldenVisaAed: number; buyCostsLabel: string;
  ejariFee: number; dewaApartment: number; dewaVilla: number;
};

export const FEE_DEFAULTS: Fees = {
  dldPct: 4, dldAdmin: 580, trusteeHigh: 4000, trusteeLow: 2000, trusteeThreshold: 500_000, vatPct: 5,
  buyerAgencyPct: 2, sellerAgencyPct: 2, rentAgencyPct: 5, mortgageRegPct: 0.25, mortgageRegFee: 290,
  bankFeePct: 1, depositPct: 5, depositFurnishedPct: 10, goldenVisaAed: 2_000_000, buyCostsLabel: 'about 7%',
  ejariFee: 220, dewaApartment: 2000, dewaVilla: 4000,
};

/**
 * Replaces fee tokens in CMS text, so wording stays right when a fee changes:
 * {dld} → 4%, {agency} → 2%, {rentAgency} → 5%, {deposit} → 5%, {depositFurnished} → 10%,
 * {goldenVisa} → AED 2 million, {buyCosts} → about 7%, {vat} → 5%, {mortgageReg} → 0.25%,
 * {mortgageRegFee} → AED 290, {bankFee} → 1%.
 */
export function fillFees(text: string, f: Fees) {
  const pct = (n: number) => `${+n.toFixed(2)}%`;
  const aed = (n: number) => (n >= 1_000_000 ? `AED ${+(n / 1_000_000).toFixed(2)} million` : `AED ${n.toLocaleString('en-US')}`);
  return text
    .replaceAll('{dld}', pct(f.dldPct)).replaceAll('{agency}', pct(f.buyerAgencyPct)).replaceAll('{sellerAgency}', pct(f.sellerAgencyPct))
    .replaceAll('{rentAgency}', pct(f.rentAgencyPct)).replaceAll('{deposit}', pct(f.depositPct)).replaceAll('{depositFurnished}', pct(f.depositFurnishedPct))
    .replaceAll('{goldenVisa}', aed(f.goldenVisaAed)).replaceAll('{mortgageRegFee}', aed(f.mortgageRegFee)).replaceAll('{mortgageReg}', pct(f.mortgageRegPct)).replaceAll('{bankFee}', pct(f.bankFeePct)).replaceAll('{buyCosts}', f.buyCostsLabel).replaceAll('{vat}', pct(f.vatPct));
}
