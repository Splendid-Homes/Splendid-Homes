/**
 * Default wording and options for the Communities list and each community page. Edited in the CMS
 * under "Community pages"; blank fields fall back to these. Tokens: {name} {yield} {price} {rent}
 * {avgYield} {count} {aboveBelow} {rankedBy}.
 */
export const COMMUNITY_TEXT_DEFAULTS = {
  // List page
  allAreas: 'All areas',
  listCompareEyebrow: 'At a glance', listCompareTitle: 'Dubai communities', listCompareItalic: 'compared',
  listCompareIntro: 'Average sale price per sq ft, annual rent and gross rental yield for each area, ranked by {rankedBy}.',
  // Community page
  kpiPrice: 'Avg. sale price / sq ft', kpiRent: 'Avg. annual rent', kpiYield: 'Gross rental yield', kpiListings: 'Homes listed with us',
  availableEyebrow: 'Available now', availableTitle: 'Available in',
  tabSale: 'For sale', tabRent: 'For rent', tabOffplan: 'Off-plan',
  linkSale: 'All homes for sale in {name}', linkRent: 'All homes for rent in {name}', linkOffplan: 'Browse every off-plan project',
  guideEyebrow: 'Area guide', guideTitle: 'About',
  prosTitle: 'Pros &', prosItalic: 'cons', prosLabel: 'Pros', consLabel: 'Cons',
  fitTitle: 'Is {name}', fitItalic: 'right for you?', suitsLabel: 'Suits you if', notForLabel: 'Think twice if',
  nearbyTitle: 'Compare with', nearbyItalic: 'nearby communities',
  tocPros: 'Pros & cons', tocFit: 'Is it right for you?', tocNearby: 'Nearby communities',
  compareEyebrow: 'Compare areas', compareTitle: 'How {name}', compareItalic: 'compares',
  compareIntro: '{name}’s {yield}% gross yield is {aboveBelow} the {avgYield}% average of the {count} communities we cover, ranked here by {rankedBy}.',
  faqTitle: '{name}: frequently asked questions',
  // Compare table columns
  colCommunity: 'Community', colPrice: 'Avg. price / sq ft', colRent: 'Avg. annual rent', colYield: 'Gross yield', colListings: 'Our listings',
};
export type CommunityText = typeof COMMUNITY_TEXT_DEFAULTS;

/** Lifestyle chips on the Communities list. `limit`: schools ≥, yield ≥ %, AED/sq ft ≥ (luxury) or < (value), minutes to Downtown ≤. */
export type LifeKey = 'beach' | 'metro' | 'family' | 'yield' | 'luxury' | 'central' | 'value';
export const LIFE_OPTIONS: { value: LifeKey; label: string; limit: number | null }[] = [
  { value: 'beach', label: 'Beach', limit: null }, { value: 'metro', label: 'Metro', limit: null },
  { value: 'family', label: 'Family & schools', limit: 4 }, { value: 'yield', label: 'High yield', limit: 6 },
  { value: 'luxury', label: 'Luxury', limit: 3000 }, { value: 'central', label: 'Near Downtown', limit: 15 },
  { value: 'value', label: 'Good value', limit: 2000 },
];
export const LIFE_DEFAULTS: LifeKey[] = ['beach', 'metro', 'family', 'yield', 'luxury'];

export const RANK_OPTIONS = [
  { value: 'yield', label: 'Gross yield (highest first)', words: 'yield' },
  { value: 'price', label: 'Price per sq ft (highest first)', words: 'price per sq ft' },
  { value: 'rent', label: 'Annual rent (highest first)', words: 'annual rent' },
  { value: 'name', label: 'Name (A to Z)', words: 'name' },
] as const;
export type RankKey = (typeof RANK_OPTIONS)[number]['value'];

/** Figures a community card can show on the Communities list (up to 3). */
export const CARD_FIGURES = [
  { value: 'yield', label: 'Gross yield' }, { value: 'price', label: 'Price per sq ft' }, { value: 'rent', label: 'Average rent' },
  { value: 'listings', label: 'Listings with us' }, { value: 'downtown', label: 'Minutes to Downtown' }, { value: 'airport', label: 'Minutes to DXB' },
  { value: 'schools', label: 'Schools nearby' },
] as const;
export type CardFigure = (typeof CARD_FIGURES)[number]['value'];

export const COMMUNITY_OPTIONS_DEFAULTS = {
  perTab: 3, nearbyCount: 4, rankBy: 'yield' as RankKey, showAutoFaqs: true,
  cardFigures: ['yield', 'price', 'rent'] as CardFigure[], showCardChips: true, showMap: true,
};

export const fillTokens = (t: string, v: Record<string, string>) => Object.entries(v).reduce((s, [k, x]) => s.replaceAll(`{${k}}`, x), t);
