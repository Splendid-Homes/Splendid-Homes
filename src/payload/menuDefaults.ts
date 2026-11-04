/** Default header menus, footer links and footer call-to-action (CMS: Menus & footer). Empty lists fall back to these. */
export type MenuLink = { label: string; href: string };
export type MoreColumn = { title: string; icon: string; source: 'links' | 'services' | 'guides'; links: MenuLink[]; allLabel: string; allHref: string };
export type FooterColumn = { title: string; links: MenuLink[] };
export type ContactWay = { title: string; note: string; icon: string; href: string; tone: 'green' | 'forest' | 'gold' };

export const MAIN_NAV: MenuLink[] = [
  { label: 'Buy', href: '/buy' }, { label: 'Rent', href: '/rent' }, { label: 'Off-Plan', href: '/off-plan' },
  { label: 'Commercial', href: '/commercial' }, { label: 'Communities', href: '/communities' }, { label: 'Sell', href: '/sell' },
];

export const MORE_COLUMNS: MoreColumn[] = [
  { title: 'Services', icon: 'key', source: 'services', links: [], allLabel: 'All services', allHref: '/services' },
  { title: 'Guides', icon: 'doc', source: 'guides', links: [], allLabel: 'All guides', allHref: '/insights?cat=Guides' },
  { title: 'Tools & insights', icon: 'chart', source: 'links', allLabel: '', allHref: '', links: [
    { label: 'News & insights', href: '/insights' }, { label: 'Market reports', href: '/insights?cat=Market%20Reports' },
    { label: 'Mortgage calculator', href: '/mortgage' }, { label: 'Compare properties', href: '/compare' },
    { label: 'Free valuation', href: '/sell' }, { label: 'Saved properties', href: '/saved' },
  ] },
  { title: 'About', icon: 'users', source: 'links', allLabel: '', allHref: '', links: [
    { label: 'About us', href: '/about' }, { label: 'Our team', href: '/team' }, { label: 'Developers', href: '/developers' },
    { label: 'Careers', href: '/careers' }, { label: 'Contact', href: '/contact' },
  ] },
];

/** Phone menu: shown after the main links (on desktop these live in the "More" menu). */
export const MOBILE_EXTRA: MenuLink[] = [
  { label: 'Services', href: '/services' }, { label: 'Insights', href: '/insights' }, { label: 'Developers', href: '/developers' },
  { label: 'Mortgage Calculator', href: '/mortgage' }, { label: 'Our Team', href: '/team' }, { label: 'About Us', href: '/about' },
  { label: 'Careers', href: '/careers' }, { label: 'Contact', href: '/contact' }, { label: 'Saved Properties', href: '/saved' },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  { title: 'Properties', links: [{ label: 'For sale', href: '/buy' }, { label: 'For rent', href: '/rent' }, { label: 'Off-plan', href: '/off-plan' }, { label: 'Commercial', href: '/commercial' }, { label: 'Saved', href: '/saved' }] },
  { title: 'Explore', links: [{ label: 'Communities', href: '/communities' }, { label: 'Developers', href: '/developers' }, { label: 'Insights', href: '/insights' }, { label: 'Mortgage calculator', href: '/mortgage' }, { label: 'Services', href: '/services' }] },
  { title: 'Company', links: [{ label: 'About us', href: '/about' }, { label: 'Our team', href: '/team' }, { label: 'Careers', href: '/careers' }, { label: 'Sell with us', href: '/sell' }, { label: 'Contact', href: '/contact' }] },
];

/** {whatsapp} and {phone} in a link become the WhatsApp chat and phone call links; {phone} in a note is the number. */
export const CONTACT_WAYS: ContactWay[] = [
  { title: 'WhatsApp us', note: 'Fastest, under 15 min', icon: 'wa', href: '{whatsapp}', tone: 'green' },
  { title: 'Call now', note: '{phone}', icon: 'phone', href: '{phone}', tone: 'forest' },
  { title: 'Book a meeting', note: 'Pick a time that suits you', icon: 'cal', href: '/contact', tone: 'gold' },
];

export const CTA_WORDS = ['home?', 'penthouse?', 'sea view?', 'villa?', 'first key?'];

export const MENU_DEFAULTS = {
  moreLabel: 'More', helpBold: 'Not sure where to start?', helpText: 'Talk to a local specialist, we reply within 15 minutes.',
  ctaLabel: 'List your property', ctaHref: '/sell',
  ctaTitle: 'Ready to find your', ctaItalic: 'splendid',
  ctaOpen: 'Online now · replies in under 15 min', ctaClosed: 'Closed now · we reply as soon as we open', ctaDefault: 'We reply within 15 minutes',
  ctaTrust: 'Trusted by {clients} clients · {sold} in property sold',
  directions: 'Directions', callLabel: 'Call', emailLabel: 'Email',
};
export type MenuText = typeof MENU_DEFAULTS;

export const MENU_ICONS = ['key', 'doc', 'chart', 'users', 'home', 'building', 'star', 'globe', 'wallet', 'cal', 'phone', 'wa', 'mail', 'pin', 'shield', 'briefcase'] as const;
