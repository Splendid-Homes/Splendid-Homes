/**
 * Default wording and options for the Developers list and each developer page. Edited in the CMS
 * under "Developer pages"; blank fields fall back to these. Tokens: {name} {founded} {launches}
 * {delivered} (and on the list card {launches} reads "1 launch" / "3 launches").
 */
export const DEVELOPER_TEXT_DEFAULTS = {
  cardLine: 'Est. {founded} · {launches} with us',
  heroEyebrow: 'Developer · Est. {founded}',
  aboutEyebrow: 'About the developer', aboutTitle: 'About',
  factFounded: 'Founded', factDelivered: 'Projects delivered', factLaunches: 'Launches with us', factReady: 'Ready homes with us',
  knownForLabel: 'Known for',
  websiteCta: 'Visit the developer’s website',
  projectsEyebrow: 'Off-plan', projectsTitle: 'Projects by', projectsLink: 'All off-plan',
  emptyText: 'No {name} launches are listed right now.', emptyLink: 'Ask us about upcoming releases',
  resaleEyebrow: 'Ready homes', resaleItalic: 'resale',
  faqTitle: '{name}: questions & answers',
};
export type DeveloperText = typeof DEVELOPER_TEXT_DEFAULTS;

export const DEV_ORDER_OPTIONS = [
  { value: 'manual', label: 'My order (the Order number on each developer)' }, { value: 'name', label: 'Name (A to Z)' },
  { value: 'founded', label: 'Oldest first' }, { value: 'launches', label: 'Most launches first' },
] as const;
export type DevOrder = (typeof DEV_ORDER_OPTIONS)[number]['value'];

export const DEVELOPER_OPTIONS_DEFAULTS = { listOrder: 'manual' as DevOrder, showLogos: false, showFacts: true, showKnownFor: true, showResale: true, resaleCount: 6 };
