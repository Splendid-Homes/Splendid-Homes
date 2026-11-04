import type { Field, GlobalConfig } from 'payload';
import { isEditor } from '../access';
import { revalidateGlobal } from '../hooks';
import { FACT_OPTIONS, KEY_FACT_DEFAULTS, PROPERTY_OPTIONS_DEFAULTS as O, PROPERTY_PAGE_DEFAULTS as D } from '../propertyDefaults';

/** A text field whose placeholder shows the current default wording. */
const t = (name: keyof typeof D, label: string, area = false): Field =>
  ({ name, label, type: area ? 'textarea' : 'text', admin: { placeholder: D[name] } }) as Field;
const row = (...fields: Field[]): Field => ({ type: 'row', fields });

/**
 * Wording and options shared by every property page (each listing's own details live on the
 * listing). Own table, so `settings` stays under D1's 100-column limit.
 */
export const PropertyPage: GlobalConfig = {
  slug: 'propertyPage',
  label: 'Property page',
  admin: { group: 'Admin', description: 'Text and options on every property page. Blank fields keep the current wording (shown in grey). {title}, {ref}, {area} and {agent} are replaced with the listing’s details.' },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [{
    type: 'tabs',
    tabs: [
      { label: 'Headings', fields: [
        row(t('aboutTitle', 'About section title'), t('detailsTitle', 'Details section title'), t('amenitiesTitle', 'Amenities section title')),
        t('aboutNote', 'Line under the description', true),
        row(t('costsBuyTitle', 'Costs title (for sale)'), t('costsBuyNote', 'Costs intro (for sale)')),
        row(t('costsRentTitle', 'Costs title (for rent)'), t('costsRentNote', 'Costs intro (for rent)')),
        t('costsFootnote', 'Note under the cost table'),
        row(t('locationTitle', 'Location section title'), t('regulatoryTitle', 'Regulatory section title')),
        t('regulatoryNote', 'Permit note', true),
        row(t('regPermit', 'Permit label'), t('regRef', 'Reference label'), t('regBrn', 'Agent BRN label'), t('regOrn', 'Company ORN label')),
        t('faqTitle', 'Q&A title'),
        row(t('similarEyebrow', 'Similar homes: small label'), t('similarTitle', 'Similar homes: title'), t('similarItalic', 'Title (italic part)')),
      ] },
      { label: 'Tab labels', description: 'The sticky row of links that jumps to each section.', fields: [
        row(t('tabOverview', 'Overview'), t('tabDetails', 'Details'), t('tabAmenities', 'Amenities'), t('tabCosts', 'Costs')),
        row(t('tabLocation', 'Location'), t('tabPermit', 'Permit'), t('tabQa', 'Q&A')),
      ] },
      { label: 'Facts', fields: [
        { name: 'keyFacts', label: 'Tiles at the top', type: 'select', hasMany: true, options: [...FACT_OPTIONS], defaultValue: KEY_FACT_DEFAULTS,
          admin: { description: 'Pick up to 4 in the order you want; a fact a listing doesn’t have (e.g. bedrooms on an office) is skipped. Leave empty for bedrooms, bathrooms, size and parking.' },
          validate: (v: unknown) => !Array.isArray(v) || v.length <= 4 ? true : 'Pick at most 4.' },
        {
          name: 'detailRows', label: '"Property details" rows', type: 'array', labels: { singular: 'Row', plural: 'Rows' },
          admin: { initCollapsed: true, description: 'Drag to reorder, untick Show to hide a row, or give it your own label. Leave the list empty to show every row.',
            components: { RowLabel: { path: '/payload/components/OptionRowLabel#OptionRowLabel', clientProps: { field: 'fact', options: [...FACT_OPTIONS], fallback: 'Row' } } } },
          fields: [{ type: 'row', fields: [
            { name: 'fact', type: 'select', required: true, options: [...FACT_OPTIONS] },
            { name: 'label', label: 'Own label (optional)', type: 'text' },
            { name: 'show', type: 'checkbox', defaultValue: true },
          ] }],
        },
        t('rentPayment', 'Rentals: "Payment" value'),
      ] },
      { label: 'Contact box', fields: [
        row(t('viewingCta', 'Viewing button'), t('whatsappCta', 'WhatsApp button'), t('callCta', 'Call button')),
        row(t('enquiryTitle', 'Enquiry form title'), t('enquiryCta', 'Enquiry form button')),
        t('enquiryMessage', 'Enquiry form: pre-filled message'),
        t('waMessage', 'Pre-filled WhatsApp message'),
      ] },
      { label: 'Similar homes & Q&A', fields: [
        row(
          { name: 'similarCount', label: 'Similar homes shown', type: 'number', min: 0, max: 12, defaultValue: O.similarCount, admin: { description: '0 hides the section.' } },
          { name: 'matchMin', label: 'Show the match % badge from (%)', type: 'number', min: 0, max: 100, defaultValue: O.matchMin },
          { name: 'showReasons', label: 'Show the reason chips', type: 'checkbox', defaultValue: O.showReasons },
        ),
        { name: 'showAutoFaqs', label: 'Show the automatic questions (price, costs, Golden Visa, agent…)', type: 'checkbox', defaultValue: O.showAutoFaqs },
        {
          name: 'extraFaqs', label: 'Extra questions on every property', type: 'array', labels: { singular: 'Question', plural: 'Questions' },
          admin: { initCollapsed: true, description: 'Added after the automatic ones. Use {title}, {ref}, {area}, {agent} and fee tokens like {dld}.',
            components: { RowLabel: { path: '/payload/components/OptionRowLabel#OptionRowLabel', clientProps: { field: 'q', options: [], fallback: 'Question', textField: 'q' } } } },
          fields: [{ name: 'q', label: 'Question', type: 'text', required: true }, { name: 'a', label: 'Answer', type: 'textarea', required: true }],
        },
      ] },
    ],
  }],
};
