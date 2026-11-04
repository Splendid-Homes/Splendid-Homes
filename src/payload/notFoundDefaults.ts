/** Default wording for the "page not found" page (CMS: Not found page). Blank fields fall back to these. */
export const NOT_FOUND_DEFAULTS = {
  eyebrow: 'Page not found',
  title: 'This address',
  titleItalic: 'isn’t on our map',
  text: 'The page may have moved, or the listing may have been sold or let. Try a search, or jump straight in:',
  searchPlaceholder: 'Area, building or reference (e.g. SH-S-1021)',
  searchCta: 'Search',
  whatsappCta: 'WhatsApp us',
};
export type NotFoundText = typeof NOT_FOUND_DEFAULTS;

export const NOT_FOUND_LINKS = [
  { label: 'Homes for sale', href: '/buy' }, { label: 'Homes for rent', href: '/rent' }, { label: 'Off-plan', href: '/off-plan' },
  { label: 'Communities', href: '/communities' }, { label: 'Contact us', href: '/contact' },
];
