/**
 * Mortgage page: lending rules and calculator defaults (numbers), plus wording. Edited in the CMS under
 * "Mortgage page"; blank fields fall back to these. Text can use rule tokens ({expat}, {expatHigh},
 * {national}, {nationalHigh}, {nonResident}, {threshold}, {maxTerm}, {dbr}, {maxAge}) and fee tokens ({dld}…).
 */
export type MortgageRules = {
  expatDep: number; expatDepHigh: number; nationalDep: number; nationalDepHigh: number; nonResDep: number;
  threshold: number; minTerm: number; maxTerm: number; maxDeposit: number; defaultPrice: number; defaultDeposit: number;
  defaultRate: number; maxRate: number; valuationFee: number; dbrPct: number; maxAge: number;
};

export const MORTGAGE_RULE_DEFAULTS: MortgageRules = {
  expatDep: 20, expatDepHigh: 30, nationalDep: 15, nationalDepHigh: 25, nonResDep: 40,
  threshold: 5_000_000, minTerm: 5, maxTerm: 25, maxDeposit: 80, defaultPrice: 3_000_000, defaultDeposit: 20,
  defaultRate: 4.25, maxRate: 15, valuationFee: 3150, dbrPct: 50, maxAge: 65,
};

export const MORTGAGE_TEXT_DEFAULTS = {
  expatLabel: 'UAE resident expat', nationalLabel: 'UAE national', nonResLabel: 'Non-resident',
  nonResNote: 'Usually {nonResident}–50% (bank policy)',
  calcNote: 'Estimates only. Fees follow Dubai Land Department and Central Bank of the UAE rules; your bank confirms the final figures.',
  preTitle: 'Get', preItalic: 'pre-approved',
  preText: 'Our mortgage advisor compares offers from UAE banks and can arrange pre-approval, usually within 48 hours.',
  preCta: 'Get pre-approved in 48h', budgetLabel: 'Property budget (AED)', budgetHint: 'e.g. 3,000,000',
  ltvEyebrow: 'How it works', ltvTitle: 'Minimum deposits', ltvItalic: 'in the UAE',
  ltvText1: 'The Central Bank of the UAE caps how much banks can lend against a home (the loan-to-value ratio). The cap depends on who is buying, the price and whether it is your first home; second homes and off-plan property need larger deposits.',
  ltvText2: 'Your monthly debt repayments, including the new mortgage, must also stay within {dbr} of your monthly income.',
  guideLabel: 'Read our mortgage guide for expats', guideHref: '/insights/mortgage-guide-for-expats-buying-in-dubai',
  colBuyer: 'Buyer', reviewed: 'Last reviewed 21 October 2026.',
  faqTitle: 'Mortgages in Dubai: questions & answers',
};
export type MortgageText = typeof MORTGAGE_TEXT_DEFAULTS;

export const MORTGAGE_FAQS = [
  { q: 'How is a mortgage repayment calculated?', a: 'It uses the standard amortisation formula: the loan amount, the monthly interest rate and the number of monthly payments give a fixed repayment that covers interest and principal. Our calculator does this for you.' },
  { q: 'How much deposit do I need for a mortgage in Dubai?', a: 'For a first home up to {threshold}, at least {expat} for expats and {national} for UAE nationals; above {threshold}, {expatHigh} and {nationalHigh}. Non-residents usually need {nonResident}–50%, depending on the bank.' },
  { q: 'What upfront costs come on top of the deposit?', a: 'Budget around 6–7% of the price: the {dld} DLD transfer fee, trustee and admin fees, mortgage registration ({mortgageReg} of the loan plus {mortgageRegFee}), agency commission (typically {agency} + VAT), the bank arrangement fee (up to {bankFee} of the loan) and a valuation fee.' },
  { q: 'What is the longest mortgage term in the UAE?', a: '{maxTerm} years. Banks also cap the loan so that it ends by around age {maxAge} for salaried borrowers.' },
  { q: 'Can fees be added to the mortgage?', a: 'No. Under Central Bank rules the deposit and purchase fees must be paid from your own funds; only the property price is financed.' },
];

const short = (n: number) => (n >= 1_000_000 ? `AED ${+(n / 1_000_000).toFixed(2)}M` : `AED ${n.toLocaleString('en-US')}`);

/** Replaces lending-rule tokens in Mortgage page text. */
export const fillRules = (t: string, r: MortgageRules) => t
  .replaceAll('{expatHigh}', `${r.expatDepHigh}%`).replaceAll('{expat}', `${r.expatDep}%`)
  .replaceAll('{nationalHigh}', `${r.nationalDepHigh}%`).replaceAll('{national}', `${r.nationalDep}%`)
  .replaceAll('{nonResident}', `${r.nonResDep}`).replaceAll('{threshold}', short(r.threshold))
  .replaceAll('{maxTerm}', String(r.maxTerm)).replaceAll('{dbr}', `${r.dbrPct}%`).replaceAll('{maxAge}', String(r.maxAge));

/** Minimum deposit (%) for a buyer type and price under these rules. */
export const minDepositFor = (r: MortgageRules, res: 'expat' | 'national' | 'nonresident', price: number) =>
  res === 'national' ? (price > r.threshold ? r.nationalDepHigh : r.nationalDep)
    : res === 'expat' ? (price > r.threshold ? r.expatDepHigh : r.expatDep)
    : r.nonResDep;
