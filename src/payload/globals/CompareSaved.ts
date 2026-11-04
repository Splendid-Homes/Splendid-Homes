import type { Field, GlobalConfig } from 'payload';
import { isEditor } from '../access';
import { COMPARE_ROWS, COMPARE_SAVED_DEFAULTS as D } from '../compareSavedDefaults';
import { revalidateGlobal } from '../hooks';

const t = (name: keyof typeof D, label: string, area = false): Field =>
  ({ name, label, type: area ? 'textarea' : 'text', admin: { placeholder: D[name] } }) as Field;
const row = (...fields: Field[]): Field => ({ type: 'row', fields });
const rowLabel = (field: string, fallback: string, options: { value: string; label: string }[] = []) =>
  ({ path: '/payload/components/OptionRowLabel#OptionRowLabel', clientProps: { field, options, fallback, textField: 'label' } });
const ROW_OPTIONS = COMPARE_ROWS.map(([value, label]) => ({ value, label }));

const bands = (name: string, label: string, hint: string): Field => ({
  name, label, type: 'array', labels: { singular: 'Range', plural: 'Ranges' },
  admin: { initCollapsed: true, description: `Shown after "Any price", in this order. Leave empty for ${hint}.`, components: { RowLabel: rowLabel('label', 'Range') } },
  fields: [row(
    { name: 'label', type: 'text', required: true },
    { name: 'min', label: 'From (AED)', type: 'number', min: 0, admin: { description: 'Empty = no minimum' } },
    { name: 'max', label: 'Up to (AED)', type: 'number', min: 0, admin: { description: 'Empty = no maximum' } },
  )],
});

/** Compare and Saved pages: table rows, picker, messages and the Saved empty state. Own table (D1: under 50 columns). */
export const CompareSaved: GlobalConfig = {
  slug: 'compareSaved',
  label: 'Compare & Saved pages',
  admin: { group: 'Admin', description: 'Heroes are under Site settings > Page heroes. Blank fields keep the current wording. {n} = a number, {max} = the compare limit.' },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [{
    type: 'tabs',
    tabs: [
      { label: 'Compare table', fields: [
        {
          name: 'rows', label: 'Table rows', type: 'array', labels: { singular: 'Row', plural: 'Rows' },
          admin: {
            initCollapsed: true,
            description: 'Rows appear in this order; drag to reorder, delete a row to hide it. Leave empty for all 15 in the standard order.',
            components: { RowLabel: rowLabel('key', 'Row', ROW_OPTIONS) },
          },
          fields: [row(
            { name: 'key', label: 'Shows', type: 'select', required: true, options: ROW_OPTIONS },
            { name: 'label', label: 'Label (optional)', type: 'text', admin: { description: 'Leave empty for the standard label.' } },
          )],
        },
        row({ name: 'showBest', label: 'Highlight the best value in each row', type: 'checkbox', defaultValue: true }, t('bestLabel', '"Best" badge')),
        row({ name: 'compareMax', label: 'Properties that can be compared', type: 'number', min: 2, max: 4, admin: { placeholder: '3' } },
          t('comparing', 'Heading ({n} of {max})'), t('clearAll', '"Clear all" link')),
        row(t('propertyHead', 'First column heading'), t('addSlot', 'Empty slot text')),
        row(t('saleWord', '"Sale" word'), t('rentWord', '"Rent" word'), t('landlordPays', 'Service charge on rentals')),
      ] },
      { label: 'Picker', fields: [
        row(t('pickerTitle', 'Title'), t('pickerText', 'Text ({max})')),
        row(t('buyTab', 'Buy tab'), t('rentTab', 'Rent tab')),
        row(t('locationLabel', 'Location label'), t('allLocations', '"All locations"')),
        row(t('developerLabel', 'Developer label'), t('allDevelopers', '"All developers"')),
        row(t('priceLabel', 'Price label'), t('anyPrice', '"Any price"')),
        bands('buyBands', 'Price ranges: buy', 'Under AED 2M, 2M – 5M, 5M – 10M, 10M+'),
        bands('rentBands', 'Price ranges: rent', 'Under AED 150k, 150k – 300k, 300k+ a year'),
        row(t('matchOne', 'Count, one ({n})'), t('matchMany', 'Count, several ({n})')),
      ] },
      { label: 'Messages', fields: [
        row(t('emptyTitle', 'Nothing picked: title'), t('emptyText', 'Nothing picked: text ({max})')),
        t('mixedNote', 'Sale + rental mixed warning', true),
        t('noMatch', 'No listings match the filters', true),
        row(t('trayButton', 'Bottom tray button'), t('trayFull', 'Limit reached notice ({max})')),
      ] },
      { label: 'Saved page', fields: [
        row(t('savedEmptyTitle', 'Empty: title'), t('savedEmptyText', 'Empty: text')),
        row({ name: 'savedShowBtn1', label: 'Show button 1', type: 'checkbox', defaultValue: true }, t('savedBtn1', 'Button 1 text'), t('savedBtn1Href', 'Button 1 link')),
        row({ name: 'savedShowBtn2', label: 'Show button 2', type: 'checkbox', defaultValue: true }, t('savedBtn2', 'Button 2 text'), t('savedBtn2Href', 'Button 2 link')),
        row(t('savedOne', 'Heading, one ({n})'), t('savedMany', 'Heading, several ({n})')),
      ] },
    ],
  }],
};
