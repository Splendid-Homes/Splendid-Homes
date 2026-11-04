import type { Field, GlobalConfig } from 'payload';
import { isEditor } from '../access';
import { revalidateGlobal } from '../hooks';
import { MENU_DEFAULTS as D, MENU_ICONS } from '../menuDefaults';

const t = (name: keyof typeof D, label: string, area = false): Field =>
  ({ name, label, type: area ? 'textarea' : 'text', admin: { placeholder: D[name] } }) as Field;
const row = (...fields: Field[]): Field => ({ type: 'row', fields });
const rowLabel = (field: string, fallback: string) =>
  ({ RowLabel: { path: '/payload/components/OptionRowLabel#OptionRowLabel', clientProps: { field, options: [], fallback, textField: field } } });
const hrefField: Field = {
  name: 'href', label: 'Link', type: 'text', required: true,
  validate: (v: unknown) => (typeof v === 'string' && /^(\/|https?:\/\/|tel:|mailto:|\{whatsapp\}|\{phone\})/.test(v)) || 'Start with /, https://, tel: or mailto:',
};
const links = (name: string, label: string, description: string, extra: Partial<Field> = {}): Field => ({
  name, label, type: 'array', labels: { singular: 'Link', plural: 'Links' },
  admin: { initCollapsed: true, description, components: rowLabel('label', 'Link') },
  fields: [row({ name: 'label', type: 'text', required: true }, hrefField)],
  ...extra,
} as Field);
const icon = (defaultValue: string): Field => ({ name: 'icon', type: 'select', defaultValue, options: MENU_ICONS.map(i => ({ value: i, label: i })) });

/** Header menus, phone menu, footer link columns and the footer call to action. */
export const Menus: GlobalConfig = {
  slug: 'menus',
  label: 'Menus & footer',
  admin: { group: 'Admin', description: 'Links start with / for pages on this site (e.g. /buy), or https:// for other sites. Empty lists keep the current menus.' },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [{
    type: 'tabs',
    tabs: [
      { label: 'Header', fields: [
        links('mainNav', 'Main menu', 'The links in the header bar, in order. Keep it to about 6 so it fits on laptops.'),
        row(t('ctaLabel', 'Header button text'), t('ctaHref', 'Header button link')),
        t('moreLabel', '"More" menu label'),
        {
          name: 'moreCols', label: '"More" menu columns', type: 'array', labels: { singular: 'Column', plural: 'Columns' }, maxRows: 4,
          admin: { initCollapsed: true, description: 'Up to 4 columns. A column can list your services or latest guides automatically, or your own links.', components: rowLabel('title', 'Column') },
          fields: [
            row({ name: 'title', type: 'text', required: true }, icon('key'),
              { name: 'source', label: 'Shows', type: 'select', defaultValue: 'links', options: [
                { value: 'links', label: 'My links (below)' }, { value: 'services', label: 'All services (automatic)' }, { value: 'guides', label: 'Latest guides (automatic)' }] }),
            links('links', 'Links', 'Used when "Shows" is "My links".', { admin: { initCollapsed: true, condition: (_: unknown, s: { source?: string }) => s?.source === 'links' } } as Partial<Field>),
            row({ name: 'allLabel', label: '"See all" link text (optional)', type: 'text' }, { name: 'allHref', label: '"See all" link', type: 'text' }),
          ],
        },
        row(t('helpBold', 'Help strip: bold part'), t('helpText', 'Help strip: text')),
        links('mobileExtra', 'Phone menu: extra links', 'Shown after the main menu on phones (the "More" menu is desktop only).'),
      ] },
      { label: 'Footer links', fields: [
        {
          name: 'footerCols', label: 'Footer link columns', type: 'array', labels: { singular: 'Column', plural: 'Columns' }, maxRows: 4,
          admin: { initCollapsed: true, description: 'Legal links (Privacy, Terms) are set in Legal pages.', components: rowLabel('title', 'Column') },
          fields: [{ name: 'title', type: 'text', required: true }, links('links', 'Links', '')],
        },
        row(t('directions', '"Directions" button'), t('callLabel', '"Call" button'), t('emailLabel', '"Email" button')),
      ] },
      { label: 'Footer call to action', fields: [
        row(t('ctaTitle', 'Headline'), t('ctaItalic', 'Headline (italic word)')),
        { name: 'ctaWords', label: 'Rotating last words', type: 'text', hasMany: true, admin: { description: 'They take turns at the end of the headline. Leave empty for: home?, penthouse?, sea view?, villa?, first key?' } },
        row(t('ctaOpen', 'Status: open'), t('ctaClosed', 'Status: closed'), t('ctaDefault', 'Status: before it loads')),
        t('ctaTrust', 'Proof line ({clients}, {sold} from Site settings)'),
        {
          name: 'ways', label: 'Contact cards', type: 'array', labels: { singular: 'Card', plural: 'Cards' }, maxRows: 3,
          admin: { initCollapsed: true, description: 'Link: {whatsapp} opens WhatsApp, {phone} calls you; or any /page or https:// link. Note: {phone} shows your number.', components: rowLabel('title', 'Card') },
          fields: [
            row({ name: 'title', type: 'text', required: true }, { name: 'note', type: 'text' }),
            row(hrefField, icon('phone'), { name: 'tone', label: 'Colour', type: 'select', defaultValue: 'forest', options: [
              { value: 'green', label: 'WhatsApp green' }, { value: 'forest', label: 'Forest' }, { value: 'gold', label: 'Gold' }] }),
          ],
        },
      ] },
    ],
  }],
};
