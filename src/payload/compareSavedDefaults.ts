/** Default wording for the Compare and Saved pages (CMS: Compare & Saved pages). Blank fields fall back to these. */
export const COMPARE_SAVED_DEFAULTS = {
  // Compare table
  comparing: 'Comparing {n} of {max}', clearAll: 'Clear all', propertyHead: 'Property', addSlot: 'Add a property', bestLabel: 'Best',
  mixedNote: 'You are comparing sale and rental listings, so prices are not ranked against each other.',
  saleWord: 'Sale', rentWord: 'Rent', landlordPays: 'Paid by landlord',
  emptyTitle: 'Nothing to compare yet', emptyText: 'Pick up to {max} properties below, or tap “Compare” on any listing.',
  // Picker
  pickerTitle: 'Add properties', pickerText: 'Narrow by location, developer and price, then add up to {max}.',
  buyTab: 'Buy', rentTab: 'Rent', locationLabel: 'Location', allLocations: 'All locations', developerLabel: 'Developer', allDevelopers: 'All developers',
  priceLabel: 'Price', anyPrice: 'Any price', matchOne: '{n} property match', matchMany: '{n} properties match',
  noMatch: 'No listings match these filters. Try a wider price range or another location.',
  // Bottom tray
  trayButton: 'Compare', trayFull: 'You can compare up to {max} properties',
  // Saved page
  savedEmptyTitle: 'No saved properties yet', savedEmptyText: 'Tap the heart on any listing to keep it here. Your shortlist stays on this device.',
  savedBtn1: 'Properties for sale', savedBtn1Href: '/buy', savedBtn2: 'Properties for rent', savedBtn2Href: '/rent',
  savedOne: '{n} saved property', savedMany: '{n} saved properties',
};
export type CompareSavedText = typeof COMPARE_SAVED_DEFAULTS;

/** Compare table rows, in their standard order. */
export const COMPARE_ROWS = [
  ['price', 'Price'], ['ppsf', 'Price per sq ft'], ['location', 'Location'], ['developer', 'Developer'], ['purpose', 'For'], ['type', 'Type'],
  ['beds', 'Bedrooms'], ['baths', 'Bathrooms'], ['size', 'Size'], ['status', 'Status'], ['completion', 'Handover / built'],
  ['serviceCharge', 'Service charge'], ['furnishing', 'Furnishing'], ['view', 'View'], ['parking', 'Parking'],
] as const;
export type CompareRowKey = (typeof COMPARE_ROWS)[number][0];

export type PriceBand = { label: string; min: number | null; max: number | null };
export const BUY_BANDS: PriceBand[] = [
  { label: 'Under AED 2M', min: null, max: 2000000 }, { label: 'AED 2M – 5M', min: 2000000, max: 5000000 },
  { label: 'AED 5M – 10M', min: 5000000, max: 10000000 }, { label: 'AED 10M+', min: 10000000, max: null },
];
export const RENT_BANDS: PriceBand[] = [
  { label: 'Under AED 150k / yr', min: null, max: 150000 }, { label: 'AED 150k – 300k / yr', min: 150000, max: 300000 }, { label: 'AED 300k+ / yr', min: 300000, max: null },
];

export type CompareConfig = {
  text: CompareSavedText; rows: { key: CompareRowKey; label: string }[]; buyBands: PriceBand[]; rentBands: PriceBand[]; showBest: boolean; max: number; savedButtons: [boolean, boolean];
};
