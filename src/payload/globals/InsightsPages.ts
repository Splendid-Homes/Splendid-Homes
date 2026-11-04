import type { Field, GlobalConfig } from 'payload';
import { isEditor } from '../access';
import { revalidateGlobal } from '../hooks';
import { INSIGHTS_DEFAULTS as D } from '../insightsDefaults';

const t = (name: keyof typeof D, label: string, area = false): Field =>
  ({ name, label, type: area ? 'textarea' : 'text', admin: { placeholder: D[name] } }) as Field;
const row = (...fields: Field[]): Field => ({ type: 'row', fields });

/** Insights list and article pages: categories, list layout, newsletter box and article wording. Own table (D1: under 50 columns). */
export const InsightsPages: GlobalConfig = {
  slug: 'insightsPages',
  label: 'Insights pages',
  admin: { group: 'Admin', description: 'Articles themselves are under Content > Articles; the hero is under Site settings > Page heroes. Blank fields keep the current wording.' },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [{
    type: 'tabs',
    tabs: [
      { label: 'Categories', fields: [
        {
          name: 'categories', label: 'Categories', type: 'array', labels: { singular: 'Category', plural: 'Categories' },
          admin: {
            initCollapsed: true,
            description: 'The order here is the order of the filter chips. Each article picks one of these. Renaming a category does not move existing articles: re-pick it on those articles. Leave empty for Market Reports, Guides, Investing, Lifestyle, Finance, News.',
            components: { RowLabel: { path: '/payload/components/OptionRowLabel#OptionRowLabel', clientProps: { field: 'name', options: [], fallback: 'Category', textField: 'name' } } },
          },
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'intro', label: 'Intro (shown when this category is selected)', type: 'textarea' },
          ],
        },
        t('allLabel', '"All" chip label'),
      ] },
      { label: 'List page', fields: [
        row(
          { name: 'featured', label: 'Featured article (large card)', type: 'select', defaultValue: 'newest',
            options: [{ value: 'newest', label: 'Newest article' }, { value: 'pick', label: 'Pick an article' }, { value: 'none', label: 'No featured article' }] },
          { name: 'featuredPost', label: 'Article to feature', type: 'relationship', relationTo: 'posts',
            admin: { condition: (_, s) => s?.featured === 'pick', description: 'Shown first on "All" and in its own category.' } },
        ),
        row({ name: 'perPage', label: 'Articles per page', type: 'number', min: 3, max: 60, admin: { placeholder: '12' } }, t('prevLabel', 'Newer-page link'), t('nextLabel', 'Older-page link')),
        row(t('readMore', '"Read article" link'), t('minRead', '"min read" label')),
        t('emptyText', 'Message when a category has no articles'),
      ] },
      { label: 'Newsletter box', fields: [
        row({ name: 'nlShow', label: 'Show on the Insights list', type: 'checkbox', defaultValue: true },
          { name: 'nlOnArticles', label: 'Also show at the end of each article', type: 'checkbox', defaultValue: false }),
        t('nlTitle', 'Title'),
        t('nlText', 'Text', true),
      ] },
      { label: 'Article page', fields: [
        row(t('published', '"Published" label'), t('updated', '"Updated" label'), t('inShort', '"In short" heading')),
        row(t('takeaways', '"Key takeaways" heading'), t('steps', '"Step by step" heading'), t('faqTitle', 'FAQ heading')),
        row(t('compared', 'Comparison table heading'), t('comparedCaption', 'Comparison table caption')),
        { name: 'communityCols', label: 'Community table columns', type: 'text', hasMany: true, maxRows: 5,
          admin: { description: 'Five headings, in order: community, best for, price / sq ft, annual rent, yield. Leave empty for the standard ones.' } },
        row(t('sources', '"Sources" heading'), t('sourcesNote', 'Sources note ({date})')),
        row(t('aboutAuthor', '"About the author" heading'), t('viewProfile', '"View profile" link')),
        { name: 'formShow', label: 'Show the call-back form beside the article', type: 'checkbox', defaultValue: true },
        row(t('formTitle', 'Form title ({first} = author first name)'), t('formCta', 'Form button')),
        t('formMessage', 'Pre-filled message ({title} = article title)'),
        row(t('relatedEyebrow', 'Related: small heading'), t('relatedTitle', 'Related: title'), t('relatedItalic', 'Title (italic part)')),
        row(t('relatedAll', '"All articles" link'), { name: 'relatedCount', label: 'Related articles to show', type: 'number', min: 0, max: 9, admin: { placeholder: '3', description: '0 hides the section.' } }),
      ] },
    ],
  }],
};
