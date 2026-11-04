import type { Field, GlobalConfig } from 'payload';
import { isEditor } from '../access';
import { revalidateGlobal } from '../hooks';
import { SEO_PAGES } from '../seoDefaults';

/** Google title and description for the main pages. One group per page; blank fields keep the automatic text. */
export const PageSeo: GlobalConfig = {
  slug: 'pageSeo',
  label: 'Page SEO',
  admin: {
    group: 'Admin',
    description: 'What Google shows for each page. Leave a field empty to keep the automatic text (it updates itself, e.g. with your number of communities). " | Splendid Homes" is added to every title automatically, so leave it out. Titles: about 40–55 characters; descriptions: about 140–160. Listings, communities, developers and articles have their own SEO boxes.',
  },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: SEO_PAGES.map(([key, label]): Field => ({
    name: key, label, type: 'group', admin: { hideGutter: true },
    fields: [{ type: 'row', fields: [
      { name: 'title', label: 'Google title', type: 'text', maxLength: 70, admin: { width: '40%' } },
      { name: 'description', label: 'Google description', type: 'textarea', maxLength: 170, admin: { width: '60%', rows: 2 } },
    ] }],
  })),
};
