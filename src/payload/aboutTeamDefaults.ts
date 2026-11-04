/**
 * Default wording for the About page, Team page and agent profiles (CMS: About & Team). Blank fields fall
 * back to these. Tokens: {company} {orn} on About; {first} (agent's first name) on cards and profiles.
 */
export const ABOUT_TEAM_DEFAULTS = {
  // About
  storyEyebrow: 'Our story', storyTitle: 'Built on trust,', storyItalic: 'driven by results',
  storyText1: '{company} is a RERA-regulated real estate agency in Dubai (ORN {orn}), founded to bring a boutique, client-first approach to one of the world’s most dynamic property markets.',
  storyText2: 'Our multilingual team of RERA-registered consultants combines local knowledge with international service standards, whether you are buying your first apartment, building a portfolio or selling a landmark villa.',
  valuesTitle: 'What we', valuesItalic: 'stand for',
  leadEyebrow: 'Leadership', leadTitle: 'The people behind', leadItalic: 'Splendid', leadLink: 'Meet the full team',
  // Team page and cards
  allLanguages: 'All languages', cardWhatsapp: 'WhatsApp', cardMessage: 'Hi {first}, I found you on the Splendid Homes website.',
  // Agent profile
  labelBrn: 'RERA BRN', labelLanguages: 'Languages', labelAreas: 'Specialist areas', labelDeals: 'Closed deals',
  profileWhatsapp: 'WhatsApp', profileEmail: 'Email',
  listingsEyebrow: 'Listings', listingsTitle: '{first}’s', listingsItalic: 'properties',
  articlesEyebrow: 'Insights', articlesTitle: 'Written by',
};
export type AboutTeamText = typeof ABOUT_TEAM_DEFAULTS;

export const VALUE_ICONS = ['shield', 'star', 'users', 'trend', 'key', 'globe', 'check', 'chart', 'home', 'wallet', 'clock', 'bank'] as const;
export const ABOUT_VALUES = [
  { icon: 'shield', title: 'Integrity', text: 'Honest advice, transparent fees and full RERA compliance on every deal.' },
  { icon: 'star', title: 'Excellence', text: 'Premium marketing and service standards in every interaction.' },
  { icon: 'users', title: 'Partnership', text: 'Long-term relationships over one-off transactions.' },
  { icon: 'trend', title: 'Insight', text: 'Decisions backed by Dubai Land Department data and our own research.' },
];
