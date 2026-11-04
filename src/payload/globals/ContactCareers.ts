import type { Field, GlobalConfig } from 'payload';
import { isEditor } from '../access';
import { CONTACT_CAREERS_DEFAULTS as D, CONTACT_ROW_ICONS, PERK_ICONS } from '../contactCareersDefaults';
import { revalidateGlobal } from '../hooks';

const t = (name: keyof typeof D, label: string, area = false): Field =>
  ({ name, label, type: area ? 'textarea' : 'text', admin: { placeholder: D[name] } }) as Field;
const row = (...fields: Field[]): Field => ({ type: 'row', fields });
const rowLabel = (field: string, fallback: string) => ({ path: '/payload/components/OptionRowLabel#OptionRowLabel', clientProps: { field, options: [], fallback, textField: field } });

/** Contact and Careers pages: contact panel, form wording, perks, roles and apply form. Own table (D1: under 50 columns). */
export const ContactCareers: GlobalConfig = {
  slug: 'contactCareers',
  label: 'Contact & Careers pages',
  admin: { group: 'Admin', description: 'Phone, WhatsApp, email, address and hours are under Site settings > Company; jobs under Careers. Blank fields keep the current wording.' },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [{
    type: 'tabs',
    tabs: [
      { label: 'Contact details', fields: [
        row(t('callLabel', '"Call us" label'), t('waLabel', 'WhatsApp label'), t('waValue', 'WhatsApp text')),
        row(t('emailLabel', 'Email label'), t('visitLabel', 'Address label'), t('hoursLabel', 'Hours label')),
        {
          name: 'extraRows', label: 'Extra contact rows', type: 'array', labels: { singular: 'Row', plural: 'Rows' },
          admin: { initCollapsed: true, description: 'e.g. a second office or a leasing line. Link: tel:+971…, mailto:…, https://… or leave empty for plain text.', components: { RowLabel: rowLabel('label', 'Row') } },
          fields: [
            row({ name: 'label', type: 'text', required: true }, { name: 'value', label: 'Text', type: 'text', required: true },
              { name: 'icon', type: 'select', defaultValue: 'building', options: CONTACT_ROW_ICONS.map(i => ({ value: i, label: i })) }),
            { name: 'href', label: 'Link (optional)', type: 'text',
              validate: (v: unknown) => !v || (typeof v === 'string' && /^(tel:|mailto:|https?:\/\/|\/)/.test(v)) ? true : 'Start with tel:, mailto:, https:// or /' },
          ],
        },
        { name: 'showMap', label: 'Show the map', type: 'checkbox', defaultValue: true },
      ] },
      { label: 'Contact form', fields: [
        row(t('formTitle', 'Form title'), t('formCta', 'Form button'), t('interestLabel', '"Interested in" label')),
        t('formMessage', 'Pre-filled message'),
        { name: 'interests', label: '"Interested in" choices', type: 'text', hasMany: true, admin: { description: 'Leave empty for Buying, Renting, Selling, Off-plan investment, Property management, Mortgage, Other.' } },
      ] },
      { label: 'Careers', fields: [
        row(t('perksTitle', 'Perks: title'), t('perksItalic', 'Title (italic part)')),
        {
          name: 'perks', label: 'Perk cards', type: 'array', labels: { singular: 'Card', plural: 'Cards' },
          admin: { initCollapsed: true, description: 'Leave empty for the standard four.', components: { RowLabel: rowLabel('title', 'Card') } },
          fields: [
            row({ name: 'title', type: 'text', required: true }, { name: 'icon', type: 'select', defaultValue: 'star', options: PERK_ICONS.map(i => ({ value: i, label: i })) }),
            { name: 'text', type: 'textarea', required: true },
          ],
        },
        row(t('rolesTitle', 'Roles: title'), t('rolesItalic', 'Title (italic part)')),
        t('noRoles', 'Message when there are no open roles', true),
        row(t('specText', 'Speculative line'), t('specSubject', 'Speculative email subject'),
          { name: 'careersEmail', label: 'Careers email (optional)', type: 'email', admin: { description: 'Leave empty to use the main email.' } }),
      ] },
      { label: 'Apply form', fields: [
        row(t('applyCta', 'Apply button'), t('applyTitle', 'Form title ({role})'), t('applySend', 'Send button')),
        row(t('applyHint', 'Message hint'), t('cvLabel', 'CV label')),
        row({ name: 'showSalary', label: 'Show the salary on each job (when set)', type: 'checkbox', defaultValue: true }, t('salaryLabel', 'Salary label')),
      ] },
    ],
  }],
};
