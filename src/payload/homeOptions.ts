/**
 * Homepage building blocks shared by the CMS (Site settings > Homepage) and the site. Defaults are
 * the approved wording; a blank CMS field falls back to them.
 */

export type HomeSectionKey = 'marquee' | 'budget' | 'featured' | 'offplan' | 'communities' | 'map' | 'services' | 'why' | 'testimonials' | 'sell' | 'team' | 'insights';

export type SectionCopy = { eyebrow: string; title: string; titleItalic: string; titleEnd: string; intro: string };

/** Sections below the hero, in the default order. `intro: null` = the section has no intro text. */
export const HOME_SECTIONS: { key: HomeSectionKey; label: string; copy: Omit<SectionCopy, 'intro'> & { intro: string | null } }[] = [
  { key: 'marquee', label: 'Developer logos strip', copy: { eyebrow: 'Projects from Dubai’s leading developers', title: '', titleItalic: '', titleEnd: '', intro: null } },
  { key: 'budget', label: 'Browse by budget', copy: { eyebrow: 'Browse by budget', title: 'Pick your', titleItalic: 'price range', titleEnd: '', intro: null } },
  { key: 'featured', label: 'Featured properties', copy: { eyebrow: 'Handpicked for you', title: 'Featured', titleItalic: 'properties', titleEnd: '', intro: null } },
  { key: 'offplan', label: 'Off-plan band', copy: { eyebrow: 'New launches', title: 'Off-plan with', titleItalic: 'flexible', titleEnd: 'payment plans', intro: '{count} live projects from Dubai’s leading developers, with payment plans and handover dates side by side.' } },
  { key: 'communities', label: 'Popular communities', copy: { eyebrow: 'Where to live', title: 'Popular', titleItalic: 'communities', titleEnd: '', intro: null } },
  { key: 'map', label: 'Dubai, mapped (area finder)', copy: { eyebrow: 'Dubai, mapped', title: 'Which area', titleItalic: 'fits your life?', titleEnd: '', intro: 'Tap what matters to you. Matching areas light up on the map.' } },
  { key: 'services', label: 'Services', copy: { eyebrow: 'What we do', title: 'Services that go', titleItalic: 'beyond', titleEnd: 'the sale', intro: 'From the first viewing to managing your portfolio for decades: one team, under one roof.' } },
  { key: 'why', label: 'Why Splendid Homes', copy: { eyebrow: 'Why Splendid Homes', title: 'What makes us', titleItalic: 'different', titleEnd: '', intro: 'Local specialists who treat your move or investment like their own. Here is how that compares.' } },
  { key: 'testimonials', label: 'Testimonials', copy: { eyebrow: 'Testimonials', title: 'Loved by', titleItalic: 'buyers, sellers', titleEnd: '& tenants', intro: null } },
  { key: 'sell', label: 'Free valuation', copy: { eyebrow: 'Free valuation', title: 'Thinking of selling or', titleItalic: 'letting?', titleEnd: '', intro: 'Three quick taps and a data-led valuation from a local specialist, no long forms.' } },
  { key: 'team', label: 'Meet the experts', copy: { eyebrow: 'Meet the experts', title: 'Your Splendid', titleItalic: 'team', titleEnd: '', intro: null } },
  { key: 'insights', label: 'Insights', copy: { eyebrow: 'Insights', title: 'Latest news &', titleItalic: 'guides', titleEnd: '', intro: null } },
];

/** Icons offered for budget cards. */
export const BUDGET_ICONS = ['sofa', 'tower', 'townhouse', 'villa', 'home', 'building', 'key', 'wallet', 'star', 'crane'] as const;

/** Default "Browse by budget" ranges (AED, inclusive), as in the listing filters. */
export const BUDGET_BANDS = [
  { label: 'Under AED 1M', icon: 'sofa', min: undefined, max: 999_999, blurb: 'Studios and first homes in fast-growing communities, ideal for yield.' },
  { label: 'AED 1M to 3M', icon: 'tower', min: 1_000_000, max: 2_999_999, blurb: 'Family apartments and townhouses in established neighbourhoods.' },
  { label: 'AED 3M to 5M', icon: 'townhouse', min: 3_000_000, max: 4_999_999, blurb: 'Larger homes with views, from Downtown to Dubai Hills.' },
  { label: 'Above AED 5M', icon: 'villa', min: 5_000_000, max: undefined, blurb: 'Space, privacy and grounds: villas, penthouses and waterfront homes.' },
] as const;
export const LAUNCHES_BLURB = 'New off-plan projects with payment plans, from Dubai’s leading developers.';

/**
 * "Dubai, mapped" chips. `limit` is the number each one tests against (none for yes/no facts).
 * Tests: schools ≥ limit, yield ≥ limit %, minutes to Downtown ≤ limit, price per sq ft < limit.
 */
export type FinderKey = 'beach' | 'metro' | 'schools' | 'yield' | 'central' | 'value';
export const FINDER_WANTS: { key: FinderKey; label: string; icon: string; limit: number | null; limitLabel?: string; on?: boolean }[] = [
  { key: 'beach', label: 'A beach nearby', icon: 'sun', limit: null, on: true },
  { key: 'metro', label: 'Metro access', icon: 'metro', limit: null },
  { key: 'schools', label: 'Lots of schools', icon: 'school', limit: 4, limitLabel: 'At least this many schools nearby' },
  { key: 'yield', label: 'High rental yield', icon: 'trend', limit: 6, limitLabel: 'Gross yield of at least (%)' },
  { key: 'central', label: '15 min to Downtown', icon: 'tower', limit: 15, limitLabel: 'At most this many minutes to Downtown' },
  { key: 'value', label: 'Under AED 2,000/sqft', icon: 'wallet', limit: 2000, limitLabel: 'Average price per sq ft below (AED)' },
];

/** Floating cards over the hero photo. Values left blank use the live figures. */
export const HERO_CARDS = {
  badge: 'Rated 4.9 by 1,200+ clients',
  priceLabel: 'Avg price / sq ft',
  yieldLabel: 'Avg rental yield',
  expertsTitle: '{agents}+ property experts',
  expertsStatus: 'Online now · {clients} clients',
};
