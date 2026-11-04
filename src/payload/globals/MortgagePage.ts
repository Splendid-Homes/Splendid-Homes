import type { Field, GlobalConfig } from 'payload';
import { isEditor } from '../access';
import { revalidateGlobal } from '../hooks';
import { MORTGAGE_RULE_DEFAULTS as R, MORTGAGE_TEXT_DEFAULTS as D } from '../mortgageDefaults';

const t = (name: keyof typeof D, label: string, area = false): Field =>
  ({ name, label, type: area ? 'textarea' : 'text', admin: { placeholder: D[name] } }) as Field;
const n = (name: keyof typeof R, label: string, step?: number): Field =>
  ({ name, label, type: 'number', min: 0, defaultValue: R[name], admin: step ? { step } : undefined }) as Field;
const row = (...fields: Field[]): Field => ({ type: 'row', fields });

/**
 * Mortgage page: lending rules and calculator defaults (all numbers editable), pre-approval box,
 * "Minimum deposits" explainer and Q&A. Fees are under Fees & costs. Own table (D1: under 50 columns).
 */
export const MortgagePage: GlobalConfig = {
  slug: 'mortgagePage',
  label: 'Mortgage page',
  admin: { group: 'Admin', description: 'Change a rule here and the calculator, deposit table and answers all follow it. Fees (DLD, trustee, registration…) are under Fees & costs. Blank text fields keep the current wording.' },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [{
    type: 'tabs',
    tabs: [
      { label: 'Lending rules', description: 'Minimum deposits (%) for a first home, below and above the price threshold.', fields: [
        row(n('expatDep', 'Expat: minimum deposit (%)'), n('expatDepHigh', 'Expat: above threshold (%)')),
        row(n('nationalDep', 'UAE national: minimum deposit (%)'), n('nationalDepHigh', 'UAE national: above threshold (%)')),
        row(n('nonResDep', 'Non-resident: minimum deposit (%)'), n('threshold', 'Price threshold (AED)', 100000)),
        row(n('dbrPct', 'Max debt repayments (% of income)'), n('maxAge', 'Loan must end by age')),
        row(t('expatLabel', 'Buyer type 1 name'), t('nationalLabel', 'Buyer type 2 name'), t('nonResLabel', 'Buyer type 3 name')),
        t('nonResNote', 'Non-resident note in the table'),
      ] },
      { label: 'Calculator', fields: [
        row(n('defaultPrice', 'Starting price (AED)', 50000), n('defaultDeposit', 'Starting deposit (%)'), n('defaultRate', 'Starting interest rate (%)', 0.05)),
        row(n('minTerm', 'Shortest term (years)'), n('maxTerm', 'Longest term (years)'), n('maxDeposit', 'Largest deposit (%)'), n('maxRate', 'Highest interest rate (%)', 0.5)),
        n('valuationFee', 'Valuation fee (AED)'),
        t('calcNote', 'Note under the results', true),
      ] },
      { label: 'Pre-approval box', fields: [
        row(t('preTitle', 'Title'), t('preItalic', 'Title (italic part)')),
        t('preText', 'Text', true),
        row(t('preCta', 'Button'), t('budgetLabel', 'Budget label'), t('budgetHint', 'Budget hint')),
      ] },
      { label: 'Minimum deposits', fields: [
        row(t('ltvEyebrow', 'Small label'), t('ltvTitle', 'Title'), t('ltvItalic', 'Title (italic part)')),
        t('ltvText1', 'First paragraph', true),
        t('ltvText2', 'Second paragraph', true),
        row(t('guideLabel', 'Guide link text'), t('guideHref', 'Guide link')),
        row(t('colBuyer', 'Table: first column'), t('reviewed', 'Source note: last reviewed')),
      ] },
      { label: 'Q&A', fields: [
        t('faqTitle', 'Title'),
        {
          name: 'faqs', label: 'Questions', type: 'array', labels: { singular: 'Question', plural: 'Questions' },
          admin: { initCollapsed: true, description: 'Leave empty for the standard five. Use {expat}, {national}, {threshold}, {maxTerm}, {maxAge}, {dbr} and fee tokens ({dld}, {mortgageReg}, {bankFee}…) so answers follow your rules.',
            components: { RowLabel: { path: '/payload/components/OptionRowLabel#OptionRowLabel', clientProps: { field: 'q', options: [], fallback: 'Question', textField: 'q' } } } },
          fields: [{ name: 'q', label: 'Question', type: 'text', required: true }, { name: 'a', label: 'Answer', type: 'textarea', required: true }],
        },
      ] },
    ],
  }],
};
