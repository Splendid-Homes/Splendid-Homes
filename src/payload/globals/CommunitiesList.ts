import type { Field, GlobalConfig } from 'payload';
import { isEditor } from '../access';
import { CARD_FIGURES, COMMUNITY_OPTIONS_DEFAULTS as O, COMMUNITY_TEXT_DEFAULTS as D, LIFE_OPTIONS, RANK_OPTIONS } from '../communityDefaults';
import { revalidateGlobal } from '../hooks';

const t = (name: keyof typeof D, label: string, area = false): Field =>
  ({ name, label, type: area ? 'textarea' : 'text', admin: { placeholder: D[name] } }) as Field;
const row = (...fields: Field[]): Field => ({ type: 'row', fields });

/**
 * The Communities list page (lifestyle filter, card figures) and the compare table it shares with
 * every community page. Split from "Community page": D1 binds every column twice when saving and
 * allows 100 values per query, so one global must stay under 50 columns.
 */
export const CommunitiesList: GlobalConfig = {
  slug: 'communitiesList',
  label: 'Communities list',
  admin: { group: 'Admin', description: 'Blank fields keep the current wording (shown in grey). {rankedBy} = what the table is ranked by.' },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [{
    type: 'tabs',
    tabs: [
      { label: 'Lifestyle filter & cards', fields: [
        t('allAreas', '"All" chip'),
        {
          name: 'lifeFilters', label: 'Lifestyle chips', type: 'array', labels: { singular: 'Chip', plural: 'Chips' },
          admin: { initCollapsed: true, description: 'Drag to reorder. Limit: Family = at least this many schools; High yield = at least this %; Luxury = at least this AED/sq ft; Good value = below this AED/sq ft; Near Downtown = at most this many minutes. Leave the list empty for Beach, Metro, Family & schools, High yield and Luxury.',
            components: { RowLabel: { path: '/payload/components/OptionRowLabel#OptionRowLabel', clientProps: { field: 'want', options: [], fallback: 'Chip', textField: 'label' } } } },
          fields: [row(
            { name: 'want', label: 'Matches', type: 'select', required: true, options: LIFE_OPTIONS.map(({ value, label }) => ({ value, label })) },
            { name: 'label', label: 'Chip text', type: 'text', required: true },
            { name: 'limit', type: 'number' },
          )],
        },
        { name: 'cardFigures', label: 'Figures on each community card', type: 'select', hasMany: true, options: [...CARD_FIGURES], defaultValue: O.cardFigures,
          admin: { description: 'Pick up to 3, in the order you want. Leave empty for yield, price per sq ft and average rent.' },
          validate: (v: unknown) => !Array.isArray(v) || v.length <= 3 ? true : 'Pick at most 3.' },
        { name: 'showCardChips', label: 'Show the lifestyle chips on each card', type: 'checkbox', defaultValue: O.showCardChips },
      ] },
      { label: 'Compare table', fields: [
        { name: 'rankBy', label: 'Rank communities by', type: 'select', defaultValue: O.rankBy, options: RANK_OPTIONS.map(({ value, label }) => ({ value, label })),
          admin: { description: 'Used on the Communities list and on every community page.' } },
        row(t('listCompareEyebrow', 'List page: small label'), t('listCompareTitle', 'List page: title'), t('listCompareItalic', 'Title (italic part)')),
        t('listCompareIntro', 'List page: intro', true),
        row(t('colCommunity', 'Column: community'), t('colPrice', 'Column: price'), t('colRent', 'Column: rent'), t('colYield', 'Column: yield'), t('colListings', 'Column: listings')),
      ] },
    ],
  }],
};
