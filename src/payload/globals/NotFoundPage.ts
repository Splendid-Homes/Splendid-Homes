import type { Field, GlobalConfig } from 'payload';
import { isEditor } from '../access';
import { revalidateGlobal } from '../hooks';
import { NOT_FOUND_DEFAULTS as D } from '../notFoundDefaults';

const t = (name: keyof typeof D, label: string, area = false): Field =>
  ({ name, label, type: area ? 'textarea' : 'text', admin: { placeholder: D[name] } }) as Field;
const row = (...fields: Field[]): Field => ({ type: 'row', fields });

/** The branded "page not found" page shown for missing pages and unknown addresses. */
export const NotFoundPage: GlobalConfig = {
  slug: 'notFoundPage',
  label: 'Not found page',
  admin: { group: 'Admin', description: 'Shown when a page doesn’t exist (an old link, or a listing that was removed). Blank fields keep the current wording.' },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    row(t('eyebrow', 'Small label'), t('title', 'Title'), t('titleItalic', 'Title (italic part)')),
    t('text', 'Text', true),
    row(t('searchPlaceholder', 'Search box hint'), t('searchCta', 'Search button'), t('whatsappCta', 'WhatsApp button')),
    {
      name: 'links', label: 'Quick links', type: 'array', labels: { singular: 'Link', plural: 'Links' },
      admin: { initCollapsed: true, description: 'Leave empty for Homes for sale, Homes for rent, Off-plan, Communities and Contact us.',
        components: { RowLabel: { path: '/payload/components/OptionRowLabel#OptionRowLabel', clientProps: { field: 'label', options: [], fallback: 'Link', textField: 'label' } } } },
      fields: [row(
        { name: 'label', type: 'text', required: true },
        { name: 'href', label: 'Link (starts with /)', type: 'text', required: true,
          validate: (v: unknown) => typeof v === 'string' && v.startsWith('/') ? true : 'Use a link on this site, starting with /' },
      )],
    },
    { name: 'showContact', label: 'Show the WhatsApp and phone buttons', type: 'checkbox', defaultValue: true },
  ],
};
