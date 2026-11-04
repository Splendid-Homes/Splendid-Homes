/** Pages whose Google title and description can be set in CMS > Page SEO. Blank = the automatic text in the page code. */
export const SEO_PAGES = [
  ['home', 'Homepage'], ['buy', 'Buy'], ['rent', 'Rent'], ['offPlan', 'Off-plan'], ['commercial', 'Commercial'], ['communities', 'Communities'],
  ['developers', 'Developers'], ['sell', 'Sell'], ['services', 'Services'], ['mortgage', 'Mortgage calculator'], ['insights', 'Insights'],
  ['about', 'About us'], ['team', 'Our team'], ['careers', 'Careers'], ['contact', 'Contact'], ['compare', 'Compare'], ['saved', 'Saved properties'],
] as const;
export type SeoPageKey = (typeof SEO_PAGES)[number][0];
export type SeoOverrides = Partial<Record<SeoPageKey, { title: string; description: string }>>;
