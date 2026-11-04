/**
 * Default wording and quick-search chips for the Buy and Rent pages. Edited in the CMS under
 * "Buy & Rent pages"; used as fallbacks when a list there is empty. Answers may use fee tokens
 * such as {dld} (see fillFees).
 */
export type Chip = { label: string; type?: string; beds?: string; min?: number; max?: number; status?: string; furnishing?: string };
export type Qa = { q: string; a: string };

export const CHIP_DEFAULTS: Record<'buy' | 'rent', Chip[]> = {
  buy: [
    { label: 'Villas', type: 'Villa' }, { label: 'Apartments', type: 'Apartment' }, { label: 'Penthouses', type: 'Penthouse' },
    { label: 'Townhouses', type: 'Townhouse' }, { label: 'Under AED 2M', max: 2_000_000 }, { label: 'Golden Visa (AED 2M+)', min: 2_000_000 },
    { label: 'Ready to move in', status: 'Ready' }, { label: 'Off-plan resale', status: 'Off-plan' },
  ],
  rent: [
    { label: 'Apartments', type: 'Apartment' }, { label: 'Villas', type: 'Villa' }, { label: 'Townhouses', type: 'Townhouse' },
    { label: 'Under AED 80k / yr', max: 80_000 }, { label: 'Furnished', furnishing: 'Furnished' }, { label: 'Unfurnished', furnishing: 'Unfurnished' },
  ],
};

export const GOOD_DEFAULTS: Record<'buy' | 'rent', { title: string; titleItalic: string; items: Qa[] }> = {
  buy: { title: 'Buying property', titleItalic: 'in Dubai', items: [
    { q: 'Who can buy property in Dubai?', a: 'Foreign nationals can buy freehold property outright in designated areas such as Dubai Marina, Downtown Dubai and Palm Jumeirah.' },
    { q: 'What does buying cost on top of the price?', a: 'Budget {buyCosts} on top of the price: the {dld} Dubai Land Department transfer fee, registration and trustee fees, and agency commission (typically {agency} + VAT).' },
    { q: 'Can buying property give me residency?', a: 'Property worth {goldenVisa} or more can make the owner eligible for a 10-year UAE Golden Visa, subject to current rules.' },
  ] },
  rent: { title: 'Renting property', titleItalic: 'in Dubai', items: [
    { q: 'How are tenancy contracts registered?', a: 'Every tenancy in Dubai must be registered with Ejari; we prepare and register it for you.' },
    { q: 'How is rent paid?', a: 'Rent is quoted per year and usually paid in 1 to 4 cheques; more cheques can mean a slightly higher rent.' },
    { q: 'How much is the security deposit?', a: 'Landlords typically ask for a refundable security deposit of about {deposit} of the annual rent ({depositFurnished} for furnished homes).' },
  ] },
};

export const LISTING_TEXT_DEFAULTS = {
  goodEyebrow: 'Good to know',
  tilesTitle: 'Explore by community',
  marketLabel: '{area} right now',
  alertCta: 'Alert me to new listings',
  emptyTitle: 'No properties match these filters',
  emptyText: 'Try fewer filters, or tell us what you need: many homes reach us before they are listed.',
  emptyClear: 'Clear filters',
  emptyAsk: 'Ask us to find it',
  callbackCta: 'Request a callback',
};

/** Results defaults: homes per page, sort when none is picked, and the min/max price filter steps (AED). */
export const RESULTS_DEFAULTS = {
  pageSize: 12,
  sort: { buy: 'featured', rent: 'featured' } as Record<'buy' | 'rent', string>,
  steps: {
    buy: [500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000, 20_000_000, 50_000_000],
    rent: [50_000, 80_000, 150_000, 250_000, 400_000, 1_000_000],
  } as Record<'buy' | 'rent', number[]>,
};
export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' }, { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' }, { value: 'price-desc', label: 'Price: high to low' }, { value: 'size', label: 'Largest first' },
];
