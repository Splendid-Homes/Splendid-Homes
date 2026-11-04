/** Default wording for the legal pages (CMS: Legal pages). Blank fields fall back to these. */
export const LEGAL_DEFAULTS = {
  notice: 'This page will set out {about}. The final text is being prepared by {company}’s legal advisers and will be published here before launch.',
  reraLine: '{legalName} is regulated by the Real Estate Regulatory Agency (RERA) of the Dubai Land Department, ORN {orn}.',
  contactLine: 'Questions in the meantime: {contact} or email {email}.', contactLink: 'contact us',
  updatedLabel: 'Last updated',
  consentText: 'I agree to the {link} and to be contacted by {company}.', consentLink: 'privacy policy', consentPage: 'privacy',
};
export type LegalText = typeof LEGAL_DEFAULTS;

export type LegalPageDef = { slug: string; title: string; about: string; footerLabel: string; inFooter: boolean; updated: string; body: unknown };
export const LEGAL_PAGES: LegalPageDef[] = [
  { slug: 'privacy', title: 'Privacy Policy', about: 'how Splendid Homes collects, uses and protects personal data submitted through this website', footerLabel: 'Privacy', inFooter: true, updated: '', body: null },
  { slug: 'terms', title: 'Terms of Use', about: 'the terms that apply to using this website and its listings', footerLabel: 'Terms', inFooter: true, updated: '', body: null },
];

/** True when a rich-text value has any visible text (an empty editor still stores a paragraph). */
export function hasText(body: unknown): boolean {
  const walk = (n: unknown): boolean => {
    if (!n || typeof n !== 'object') return false;
    const o = n as { text?: string; children?: unknown[]; root?: unknown };
    if (typeof o.text === 'string' && o.text.trim()) return true;
    if (o.root) return walk(o.root);
    return (o.children ?? []).some(walk);
  };
  return walk(body);
}
