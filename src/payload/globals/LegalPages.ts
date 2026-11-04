import type { Field, GlobalConfig } from 'payload';
import { isEditor } from '../access';
import { revalidateGlobal } from '../hooks';
import { LEGAL_DEFAULTS as D } from '../legalDefaults';

const t = (name: keyof typeof D, label: string, area = false): Field =>
  ({ name, label, type: area ? 'textarea' : 'text', admin: { placeholder: D[name] } }) as Field;
const row = (...fields: Field[]): Field => ({ type: 'row', fields });

/** Privacy, Terms and any other legal pages (/legal/<address>), plus the consent line on every form. */
export const LegalPages: GlobalConfig = {
  slug: 'legalPages',
  label: 'Legal pages',
  admin: { group: 'Admin', description: 'A page shows a "being prepared" notice and stays hidden from Google until its text is filled in.' },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [{
    type: 'tabs',
    tabs: [
      { label: 'Pages', fields: [
        {
          name: 'pages', label: 'Legal pages', type: 'array', labels: { singular: 'Page', plural: 'Pages' },
          admin: {
            initCollapsed: true,
            description: 'Each page lives at /legal/<address>. Keep "privacy" and "terms": forms and the footer link to them. Leave empty for Privacy Policy and Terms of Use.',
            components: { RowLabel: { path: '/payload/components/OptionRowLabel#OptionRowLabel', clientProps: { field: 'title', options: [], fallback: 'Page', textField: 'title' } } },
          },
          fields: [
            row(
              { name: 'title', type: 'text', required: true },
              { name: 'slug', label: 'Address (/legal/…)', type: 'text', required: true,
                validate: (v: unknown) => (typeof v === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(v)) || 'Lowercase letters, numbers and dashes, e.g. cookie-policy' },
              { name: 'updated', label: 'Last updated', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
            ),
            { name: 'about', label: 'What the page covers', type: 'text', admin: { description: 'One line, used for Google and in the "being prepared" notice, e.g. "how we use cookies on this website".' } },
            row({ name: 'inFooter', label: 'Link in the footer', type: 'checkbox', defaultValue: true },
              { name: 'footerLabel', label: 'Footer link text (optional)', type: 'text', admin: { description: 'Leave empty to use the title.' } }),
            { name: 'body', label: 'Text', type: 'richText' },
          ],
        },
      ] },
      { label: 'Wording', fields: [
        t('notice', 'Notice while text is missing ({about}, {company})', true),
        row({ name: 'showRera', label: 'Show the RERA line', type: 'checkbox', defaultValue: true }, t('reraLine', 'RERA line ({legalName}, {orn})')),
        row({ name: 'showContact', label: 'Show the contact line', type: 'checkbox', defaultValue: true }, t('contactLine', 'Contact line ({contact}, {email})'), t('contactLink', '{contact} link text')),
        t('updatedLabel', '"Last updated" label'),
      ] },
      { label: 'Form consent', fields: [
        t('consentText', 'Consent sentence on every form ({link}, {company})', true),
        row(t('consentLink', '{link} text'), t('consentPage', 'Links to /legal/…')),
      ] },
    ],
  }],
};
