import type { Field, GlobalConfig } from 'payload';
import { isEditor } from '../access';
import { revalidateGlobal } from '../hooks';
import { LISTING_TEXT_DEFAULTS as T, RESULTS_DEFAULTS as R, SORT_OPTIONS } from '../listingDefaults';

const TYPES = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Office'];
const BEDS = [['0', 'Studio'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5+', '5+']];
const rowLabel = { path: '/payload/components/OptionRowLabel#OptionRowLabel', clientProps: { field: 'label', options: [], fallback: 'Item', textField: 'label' } };
const qLabel = { path: '/payload/components/OptionRowLabel#OptionRowLabel', clientProps: { field: 'q', options: [], fallback: 'Question', textField: 'q' } };

const chips = (name: string, label: string): Field => ({
  name, label, type: 'array', labels: { singular: 'Chip', plural: 'Chips' },
  admin: { initCollapsed: true, components: { RowLabel: rowLabel },
    description: 'The quick-search chips above the results. Set one or more filters per chip; tapping it again removes them. Drag to reorder.' },
  fields: [
    { name: 'label', type: 'text', required: true },
    { type: 'row', fields: [
      { name: 'type', label: 'Property type', type: 'select', options: TYPES },
      { name: 'beds', label: 'Bedrooms', type: 'select', options: BEDS.map(([value, label]) => ({ value, label })) },
      { name: 'status', label: 'Ready / off-plan', type: 'select', options: ['Ready', 'Off-plan'] },
      { name: 'furnishing', type: 'select', options: ['Furnished', 'Unfurnished', 'Fitted'] },
    ] },
    { type: 'row', fields: [
      { name: 'min', label: 'Min price (AED)', type: 'number', min: 0 },
      { name: 'max', label: 'Max price (AED)', type: 'number', min: 0 },
    ] },
  ],
});

const good = (prefix: 'buy' | 'rent', label: string): Field[] => [
  { type: 'row', fields: [
    { name: `${prefix}GoodTitle`, label: `${label}: "Good to know" title`, type: 'text' },
    { name: `${prefix}GoodItalic`, label: 'Title (italic part)', type: 'text' },
  ] },
  {
    name: `${prefix}Good`, label: `${label}: questions and answers`, type: 'array', labels: { singular: 'Question', plural: 'Questions' },
    admin: { initCollapsed: true, components: { RowLabel: qLabel },
      description: 'The first one opens by default. In answers, {dld}, {agency}, {rentAgency}, {deposit}, {depositFurnished}, {goldenVisa}, {buyCosts} and {vat} show the current value from Fees & costs.' },
    fields: [{ name: 'q', label: 'Question', type: 'text', required: true }, { name: 'a', label: 'Answer', type: 'textarea', required: true }],
  },
];

/** Buy and Rent listing pages: quick chips, "Good to know", community tiles and small texts. Own table (D1 column limit). */
export const ListingPages: GlobalConfig = {
  slug: 'listingPages',
  label: 'Buy & Rent pages',
  admin: { group: 'Admin', description: 'The page banner is under Site settings > Page heroes. Blank text fields keep the current wording.' },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [{
    type: 'tabs',
    tabs: [
      { label: 'Quick searches', fields: [chips('buyChips', 'Buy page chips'), chips('rentChips', 'Rent page chips')] },
      { label: 'Good to know', fields: [
        { name: 'goodEyebrow', label: 'Small label', type: 'text', admin: { placeholder: T.goodEyebrow } },
        ...good('buy', 'Buy'), ...good('rent', 'Rent'),
        { name: 'tilesTitle', label: 'Community tiles: heading', type: 'text', admin: { placeholder: T.tilesTitle } },
        { name: 'tiles', label: 'Community tiles: which communities', type: 'relationship', relationTo: 'communities', hasMany: true,
          admin: { description: 'Pick and order the tiles. Leave empty to show every community.' } },
      ] },
      { label: 'Results', fields: [
        { type: 'row', fields: [
          { name: 'pageSize', label: 'Homes per page', type: 'number', min: 3, max: 48, defaultValue: R.pageSize },
          { name: 'buySort', label: 'Buy: default sort', type: 'select', options: SORT_OPTIONS, defaultValue: R.sort.buy },
          { name: 'rentSort', label: 'Rent: default sort', type: 'select', options: SORT_OPTIONS, defaultValue: R.sort.rent },
        ] },
        { name: 'buySteps', label: 'Buy: price filter steps (AED)', type: 'number', hasMany: true, min: 0,
          admin: { description: 'The choices in the Min and Max price menus, e.g. 500000, 1000000, 2000000. Leave empty for the defaults.' } },
        { name: 'rentSteps', label: 'Rent: price filter steps (AED per year)', type: 'number', hasMany: true, min: 0 },
      ] },
      { label: 'Other text', fields: [
        { type: 'row', fields: [
          { name: 'showMarket', label: 'Show the market strip above the results', type: 'checkbox', defaultValue: true },
          { name: 'marketLabel', label: 'Market strip title', type: 'text', admin: { placeholder: T.marketLabel, description: '{area} = the community searched, or Dubai.' } },
          { name: 'alertCta', label: 'Alert button', type: 'text', admin: { placeholder: T.alertCta } },
        ] },
        { type: 'row', fields: [
          { name: 'emptyTitle', label: 'No results: title', type: 'text', admin: { placeholder: T.emptyTitle } },
          { name: 'emptyClear', label: 'No results: clear button', type: 'text', admin: { placeholder: T.emptyClear } },
          { name: 'emptyAsk', label: 'No results: WhatsApp button', type: 'text', admin: { placeholder: T.emptyAsk } },
        ] },
        { name: 'emptyText', label: 'No results: text', type: 'textarea', admin: { placeholder: T.emptyText } },
        { name: 'callbackCta', label: 'No results: call button', type: 'text', admin: { placeholder: T.callbackCta } },
      ] },
    ],
  }],
};
