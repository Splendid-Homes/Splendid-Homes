/**
 * Default wording for the off-plan list and project pages. Edited in the CMS under "Off-plan pages";
 * blank fields fall back to these. Project tokens: {name} {developer} {area} {plan} {price} {status}
 * {handover}; fee tokens such as {dld} and {goldenVisa} also work.
 */
export const OFFPLAN_TEXT_DEFAULTS = {
  // List page
  whyEyebrow: 'Why off-plan',
  whyTitle: 'Buying off-plan',
  whyItalic: 'in Dubai',
  fDeveloper: 'Developer', fCommunity: 'Community', fYear: 'Handover year', fBudget: 'Budget',
  clearFilters: 'Clear filters',
  emptyTitle: 'No projects match these filters',
  emptyText: 'New launches arrive every month; register with us to hear first.',
  emptyCta: 'Show all projects',
  // Project page
  aboutTitle: 'About {name}',
  aboutNote: 'Set in {area}, {name} is a {status} development by {developer}. Units are allocated on a first-come basis; register to receive the price list, floor plans and availability.',
  whyTitleP: 'Why {name}',
  planTitle: 'Payment plan: {plan}',
  planIntro: 'How the starting price of {price} is paid, milestone by milestone.',
  planColMilestone: 'Milestone', planColShare: 'Share',
  planNote: 'Indicative, based on the developer’s published plan. The {dld} DLD registration fee is usually payable when the sale is registered; exact dates follow the sales agreement.',
  unitsTitle: 'Unit types & prices',
  unitColType: 'Unit type', unitColSize: 'Size (sq ft)', unitColFrom: 'Starting from',
  galleryTitle: 'Gallery',
  amenitiesTitle: 'Amenities',
  locationTitle: 'Location',
  devTitle: 'About {developer}',
  faqTitle: '{name}: questions & answers',
  moreEyebrow: 'More launches', moreTitle: 'Other off-plan', moreItalic: 'projects',
  // Contact box
  contactIntro: 'Get the price list, floor plans and availability first. Our off-plan desk replies within the hour in office hours.',
  whatsappCta: 'WhatsApp', callCta: 'Call',
  interestTitle: 'Register your interest', interestCta: 'Register interest',
  interestMessage: 'I’m interested in {name}. Preferred unit type and budget: ',
  waMessage: 'Hi, I’m interested in {name} by {developer}. Please send the price list and floor plans.',
  brochureTitle: 'Get the brochure', brochureCta: 'Send me the brochure',
};
export type OffplanText = typeof OFFPLAN_TEXT_DEFAULTS;

export const WHY_ICONS = ['trend', 'cal', 'shield', 'star', 'key', 'wallet', 'crane', 'building', 'chart', 'check', 'globe', 'bank'] as const;

export const WHY_OFFPLAN_DEFAULTS = [
  { icon: 'trend', title: 'Launch pricing', text: 'Buy at launch prices and benefit from any appreciation before handover.' },
  { icon: 'cal', title: 'Staged payments', text: 'Pay in instalments during construction; some plans continue after handover.' },
  { icon: 'shield', title: 'Escrow protected', text: 'Payments for registered projects are held in regulated escrow accounts (Dubai Law No. 8 of 2007).' },
  { icon: 'star', title: 'Golden Visa eligible', text: 'Off-plan homes worth {goldenVisa}+ from approved developers can qualify for 10-year residency.' },
];

export const OFFPLAN_OPTIONS_DEFAULTS = {
  budgets: [1_000_000, 2_000_000, 5_000_000, 10_000_000, 50_000_000],
  moreCount: 3,
  showAutoFaqs: true,
};

/** Replaces project tokens in off-plan text. */
export const fillProject = (t: string, v: Record<'name' | 'developer' | 'area' | 'plan' | 'price' | 'status' | 'handover', string>) =>
  Object.entries(v).reduce((s, [k, x]) => s.replaceAll(`{${k}}`, x), t);
