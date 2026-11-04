import type { GlobalConfig } from 'payload';
import { isEditor } from '../access';
import { FEE_DEFAULTS } from '../feeDefaults';
import { revalidateGlobal } from '../hooks';

const num = (name: keyof typeof FEE_DEFAULTS, label: string, description?: string) =>
  ({ name, label, type: 'number' as const, required: true, min: 0, defaultValue: FEE_DEFAULTS[name] as number, admin: description ? { description } : undefined });

/**
 * Dubai purchase and rental costs, used by the property cost breakdown, the mortgage calculator,
 * FAQs and the Buy / Rent "Good to know" answers. A separate global keeps `settings` well under
 * D1's 100-column limit.
 */
export const Fees: GlobalConfig = {
  slug: 'fees',
  label: 'Fees & costs',
  admin: { group: 'Admin', description: 'Change a fee here and every cost breakdown, calculator and answer on the site updates.' },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    { type: 'row', fields: [
      num('dldPct', 'DLD transfer fee (%)'), num('dldAdmin', 'DLD admin fee (AED)'), num('vatPct', 'VAT (%)'),
    ] },
    { type: 'row', fields: [
      num('trusteeHigh', 'Trustee fee (AED, before VAT)'), num('trusteeLow', 'Trustee fee, lower band (AED)'), num('trusteeThreshold', 'Lower band applies below (AED)'),
    ] },
    { type: 'row', fields: [
      num('buyerAgencyPct', 'Buyer agency fee (%)'), num('sellerAgencyPct', 'Seller agency fee (%)'), num('rentAgencyPct', 'Rental agency fee (%)'),
    ] },
    { type: 'row', fields: [
      num('mortgageRegPct', 'Mortgage registration (%)'), num('mortgageRegFee', 'Mortgage registration admin (AED)'), num('bankFeePct', 'Bank arrangement fee, up to (%)'),
    ] },
    { type: 'row', fields: [
      num('depositPct', 'Rental deposit, unfurnished (%)'), num('depositFurnishedPct', 'Rental deposit, furnished (%)'), num('goldenVisaAed', 'Golden Visa threshold (AED)'),
    ] },
    { type: 'row', fields: [
      num('ejariFee', 'Ejari registration (AED)'), num('dewaApartment', 'DEWA deposit, apartment (AED)'), num('dewaVilla', 'DEWA deposit, villa / townhouse (AED)'),
    ] },
    { name: 'buyCostsLabel', label: 'Total buying costs (wording)', type: 'text', required: true, defaultValue: FEE_DEFAULTS.buyCostsLabel,
      admin: { description: 'Used in sentences like "Budget about 7% on top of the price".' } },
  ],
};
