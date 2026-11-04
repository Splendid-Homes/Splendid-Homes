import type { Field, GlobalConfig } from 'payload';
import { isEditor } from '../access';
import { revalidateGlobal } from '../hooks';
import { OFFPLAN_OPTIONS_DEFAULTS as O, OFFPLAN_TEXT_DEFAULTS as D, WHY_ICONS } from '../offplanDefaults';

const t = (name: keyof typeof D, label: string, area = false): Field =>
  ({ name, label, type: area ? 'textarea' : 'text', admin: { placeholder: D[name] } }) as Field;
const row = (...fields: Field[]): Field => ({ type: 'row', fields });

/** Off-plan list and project pages: wording, cards, filter budgets, contact box and Q&A. Own table (D1 column limit). */
export const OffplanPages: GlobalConfig = {
  slug: 'offplanPages',
  label: 'Off-plan pages',
  admin: { group: 'Admin', description: 'Blank fields keep the current wording (shown in grey). On project pages {name}, {developer}, {area}, {plan}, {price}, {status} and {handover} are replaced with the project’s details; fee tokens like {dld} also work.' },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [{
    type: 'tabs',
    tabs: [
      { label: 'List page', fields: [
        row(t('whyEyebrow', '"Why off-plan": small label'), t('whyTitle', 'Title'), t('whyItalic', 'Title (italic part)')),
        {
          name: 'whyCards', label: '"Why off-plan" cards', type: 'array', labels: { singular: 'Card', plural: 'Cards' },
          admin: { initCollapsed: true, description: 'Drag to reorder. Leave empty for the four standard cards.',
            components: { RowLabel: { path: '/payload/components/OptionRowLabel#OptionRowLabel', clientProps: { field: 'title', options: [], fallback: 'Card', textField: 'title' } } } },
          fields: [
            row({ name: 'title', type: 'text', required: true }, { name: 'icon', type: 'select', defaultValue: 'star', options: WHY_ICONS.map(i => ({ value: i, label: i })) }),
            { name: 'text', type: 'textarea', required: true },
          ],
        },
        { name: 'budgets', label: 'Budget filter choices (AED)', type: 'number', hasMany: true, min: 0,
          admin: { description: 'Shown as "From under AED …". Leave empty for 1M, 2M, 5M, 10M and 50M.' } },
        row(t('fDeveloper', 'Filter label: developer'), t('fCommunity', 'Filter label: community'), t('fYear', 'Filter label: handover'), t('fBudget', 'Filter label: budget')),
        row(t('clearFilters', 'Clear filters button'), t('emptyTitle', 'No results: title'), t('emptyCta', 'No results: button')),
        t('emptyText', 'No results: text'),
      ] },
      { label: 'Project page', fields: [
        row(t('aboutTitle', 'About title'), t('whyTitleP', 'Highlights title')),
        t('aboutNote', 'Line under the description', true),
        row(t('planTitle', 'Payment plan title'), t('planColMilestone', 'Plan column: milestone'), t('planColShare', 'Plan column: share')),
        t('planIntro', 'Payment plan intro'),
        t('planNote', 'Note under the payment plan', true),
        row(t('unitsTitle', 'Units title'), t('unitColType', 'Units column: type'), t('unitColSize', 'Units column: size'), t('unitColFrom', 'Units column: price')),
        row(t('galleryTitle', 'Gallery title'), t('amenitiesTitle', 'Amenities title'), t('locationTitle', 'Location title'), t('devTitle', 'Developer title')),
        t('faqTitle', 'Q&A title'),
        row(t('moreEyebrow', 'Other projects: small label'), t('moreTitle', 'Other projects: title'), t('moreItalic', 'Title (italic part)'),
          { name: 'moreCount', label: 'Other projects shown', type: 'number', min: 0, max: 9, defaultValue: O.moreCount, admin: { description: '0 hides the section.' } }),
      ] },
      { label: 'Contact & Q&A', fields: [
        { name: 'deskAgent', label: 'Off-plan desk contact', type: 'relationship', relationTo: 'agents',
          admin: { description: 'Whose phone the Call button rings and who confirms viewings on project pages.' } },
        t('contactIntro', 'Intro line', true),
        row(t('whatsappCta', 'WhatsApp button'), t('callCta', 'Call button')),
        row(t('interestTitle', 'Interest form title'), t('interestCta', 'Interest form button')),
        t('interestMessage', 'Interest form: pre-filled message'),
        t('waMessage', 'Pre-filled WhatsApp message'),
        row(t('brochureTitle', 'Brochure form title'), t('brochureCta', 'Brochure form button')),
        { name: 'showAutoFaqs', label: 'Show the automatic questions (escrow, Golden Visa, payment plan…)', type: 'checkbox', defaultValue: O.showAutoFaqs },
        {
          name: 'extraFaqs', label: 'Extra questions on every project', type: 'array', labels: { singular: 'Question', plural: 'Questions' },
          admin: { initCollapsed: true, description: 'Added after the automatic ones; project and fee tokens work here.',
            components: { RowLabel: { path: '/payload/components/OptionRowLabel#OptionRowLabel', clientProps: { field: 'q', options: [], fallback: 'Question', textField: 'q' } } } },
          fields: [{ name: 'q', label: 'Question', type: 'text', required: true }, { name: 'a', label: 'Answer', type: 'textarea', required: true }],
        },
      ] },
    ],
  }],
};
