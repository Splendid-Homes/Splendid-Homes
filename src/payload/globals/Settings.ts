import type { GlobalConfig } from 'payload';
import { fieldIsAdmin, isAdmin, isEditor } from '../access';
import { imageFields } from '../fields';
import { revalidateGlobal } from '../hooks';
import { HERO_PAGES } from '../heroPages';
import { BUDGET_ICONS, FINDER_WANTS, HOME_SECTIONS } from '../homeOptions';

const SECTION_OPTIONS = HOME_SECTIONS.map(s => ({ value: s.key, label: s.label }));
const FINDER_OPTIONS = FINDER_WANTS.map(w => ({ value: w.key, label: w.label }));
const rowLabel = (field: string, options: { value: string; label: string }[], fallback: string, textField?: string) =>
  ({ path: '/payload/components/OptionRowLabel#OptionRowLabel', clientProps: { field, options, fallback, textField } });

const WHY_ICONS = ['shield', 'chart', 'users', 'clock', 'globe', 'key', 'bank', 'star', 'doc', 'home', 'building', 'trend', 'cal', 'check', 'pin', 'wallet', 'phone'];

/**
 * F31 + F33 — company details (single source for NAP), homepage editor, SEO/market data,
 * currency rates and lead notifications (legal pages: Admin > Legal pages). Read on the server only.
 */
export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Site settings',
  admin: { group: 'Admin' },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Company',
          description: 'Name, address and phone must match the Google Business Profile exactly (NAP consistency).',
          fields: [
            { type: 'row', fields: [{ name: 'company', label: 'Legal name', type: 'text', required: true, access: { update: fieldIsAdmin } }, { name: 'orn', label: 'RERA ORN', type: 'text', required: true, access: { update: fieldIsAdmin } }] },
            { name: 'tagline', type: 'text', required: true },
            { type: 'row', fields: [{ name: 'phone', type: 'text', required: true }, { name: 'whatsapp', label: 'WhatsApp (digits only)', type: 'text', required: true }, { name: 'email', type: 'email', required: true }] },
            { type: 'row', fields: [{ name: 'street', label: 'Street address', type: 'text', required: true }, { name: 'address', label: 'Full address (one line)', type: 'text', required: true }] },
            { type: 'row', fields: [{ name: 'hours', label: 'Office hours', type: 'text', required: true }, { name: 'lat', label: 'Office latitude', type: 'number', required: true }, { name: 'lng', label: 'Office longitude', type: 'number', required: true }] },
            { name: 'googleBusinessProfile', label: 'Google Business Profile URL', type: 'text' },
            { name: 'socials', type: 'group', fields: [{ type: 'row', fields: ['instagram', 'linkedin', 'youtube', 'tiktok', 'facebook'].map(n => ({ name: n, type: 'text' as const })) }] },
            { name: 'stats', label: 'Key numbers', type: 'group', fields: [{ type: 'row', fields: [
              { name: 'years', label: 'Years in Dubai', type: 'number', required: true },
              { name: 'sold', label: 'Property sold', type: 'text', required: true },
              { name: 'clients', label: 'Happy clients', type: 'text', required: true },
              { name: 'agents', label: 'Expert agents', type: 'number', required: true },
            ] }] },
          ],
        },
        {
          label: 'Homepage',
          fields: [
            { name: 'heroTitle', type: 'text', required: true },
            { name: 'heroSubtitle', type: 'textarea', required: true },
            ...imageFields('heroImage', 'Hero image', true),
            {
              name: 'heroVideo', label: 'Hero video (optional)', type: 'upload', relationTo: 'media',
              admin: { description: 'Muted, looping property video shown over the hero photo on tablets and desktops. Best: 8–15 seconds, MP4 (H.264) or WebM, 1280–1920 px wide, under 5 MB. The photo is always shown first and stays on phones.' },
            },
            {
              name: 'heroPicks', label: 'Popular searches under the hero search', type: 'array', maxRows: 6, labels: { singular: 'Search', plural: 'Searches' },
              admin: { description: 'One-tap searches, e.g. "Villas in Dubai Hills" linking to /buy?community=dubai-hills-estate&type=Villa. Drag to reorder.', initCollapsed: true },
              fields: [{ type: 'row', fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'href', label: 'Link (starts with /)', type: 'text', required: true,
                  validate: (v: unknown) => typeof v === 'string' && v.startsWith('/') ? true : 'Use a link on this site, starting with /' },
              ] }],
            },
            {
              name: 'heroCards', label: 'Cards over the hero photo', type: 'group',
              admin: { description: 'Leave a value blank to show the live figure. In the experts card, {agents} and {clients} are replaced with your key numbers.' },
              fields: [
                { name: 'badge', label: 'Badge above the title', type: 'text', admin: { description: 'e.g. "Rated 4.9 by 1,200+ clients". Leave blank to hide it.' } },
                { type: 'row', fields: [
                  { name: 'showMarket', label: 'Show the price and yield cards', type: 'checkbox', defaultValue: true },
                  { name: 'showExperts', label: 'Show the experts card', type: 'checkbox', defaultValue: true },
                ] },
                { type: 'row', fields: [
                  { name: 'priceValue', label: 'Price card: figure', type: 'text', admin: { placeholder: 'Live, e.g. AED 2,344' } },
                  { name: 'priceLabel', label: 'Price card: label', type: 'text' },
                  { name: 'yieldValue', label: 'Yield card: figure', type: 'text', admin: { placeholder: 'Live, e.g. 5.9%' } },
                  { name: 'yieldLabel', label: 'Yield card: label', type: 'text' },
                ] },
                { type: 'row', fields: [
                  { name: 'expertsTitle', label: 'Experts card: title', type: 'text' },
                  { name: 'expertsStatus', label: 'Experts card: status line', type: 'text' },
                ] },
              ],
            },
            {
              name: 'homeSections', label: 'Sections (order, show/hide and headings)', type: 'array', labels: { singular: 'Section', plural: 'Sections' },
              admin: {
                description: 'Drag to change the order. Untick "Show" to hide a section. Blank heading fields keep the current wording. Intro text shows on Off-plan ({count} = number of projects), Dubai mapped, Services, Why Splendid Homes and Free valuation.',
                initCollapsed: true, components: { RowLabel: rowLabel('section', SECTION_OPTIONS, 'Section') },
              },
              fields: [
                { type: 'row', fields: [
                  { name: 'section', type: 'select', required: true, options: SECTION_OPTIONS, admin: { width: '70%' } },
                  { name: 'show', type: 'checkbox', defaultValue: true, admin: { width: '30%' } },
                ] },
                { type: 'row', fields: [
                  { name: 'eyebrow', label: 'Small label', type: 'text' },
                  { name: 'title', label: 'Title', type: 'text' },
                  { name: 'titleItalic', label: 'Title (italic part)', type: 'text' },
                  { name: 'titleEnd', label: 'Title (after italics)', type: 'text' },
                ] },
                { name: 'intro', label: 'Intro text', type: 'textarea' },
              ],
            },
            {
              name: 'budgetBands', label: '"Browse by budget" price ranges', type: 'array', labels: { singular: 'Range', plural: 'Ranges' },
              admin: { description: 'Each card links to homes for sale in its range, cheapest first. Leave Min or Max blank for an open-ended range.', initCollapsed: true,
                components: { RowLabel: rowLabel('label', [], 'Range', 'label') } },
              fields: [
                { type: 'row', fields: [
                  { name: 'label', type: 'text', required: true, admin: { placeholder: 'AED 1M to 3M' } },
                  { name: 'min', label: 'Min price (AED)', type: 'number', min: 0 },
                  { name: 'max', label: 'Max price (AED)', type: 'number', min: 0 },
                  { name: 'icon', type: 'select', defaultValue: 'home', options: BUDGET_ICONS.map(i => ({ value: i, label: i })) },
                ] },
                { name: 'blurb', label: 'Short text', type: 'text' },
              ],
            },
            { type: 'row', fields: [
              { name: 'showLaunches', label: 'Show the "Latest launches" card after the ranges', type: 'checkbox', defaultValue: true },
              { name: 'launchesBlurb', label: '"Latest launches" card text', type: 'text' },
            ] },
            {
              name: 'finderWants', label: '"Dubai, mapped" options', type: 'array', labels: { singular: 'Option', plural: 'Options' },
              admin: { description: 'The "I want…" chips. Limit: schools = at least this many; yield = at least this %; Downtown = at most this many minutes; price = below this AED per sq ft. Beach and metro use each community’s yes/no setting.', initCollapsed: true,
                components: { RowLabel: rowLabel('want', [], 'Option', 'label') } },
              fields: [
                { type: 'row', fields: [
                  { name: 'want', label: 'Matches', type: 'select', required: true, options: FINDER_OPTIONS },
                  { name: 'label', label: 'Chip text', type: 'text', required: true },
                  { name: 'limit', type: 'number' },
                  { name: 'startOn', label: 'Selected at first', type: 'checkbox' },
                ] },
              ],
            },
            { name: 'whyThem', label: '"Why Splendid Homes": comparison column', type: 'text', defaultValue: 'Typical agent',
              admin: { description: 'Heading of the column we compare ourselves with.' } },
            {
              name: 'whyRows', label: '"Why Splendid Homes": comparison rows', type: 'array', labels: { singular: 'Row', plural: 'Rows' },
              admin: { description: 'Each row compares what we do with what buyers usually get. Drag to reorder.', initCollapsed: true },
              fields: [
                { type: 'row', fields: [
                  { name: 'topic', type: 'text', required: true, admin: { width: '50%' } },
                  { name: 'icon', type: 'select', required: true, defaultValue: 'check', options: WHY_ICONS, admin: { width: '50%' } },
                ] },
                { type: 'row', fields: [
                  { name: 'us', label: 'Splendid Homes', type: 'text', required: true },
                  { name: 'them', label: 'Typical agent', type: 'text', required: true },
                ] },
              ],
            },
          ],
        },
        {
          label: 'Page heroes',
          description: 'The banner at the top of each page. Leave a field blank to keep the current text or photo.',
          // An array (its own table) rather than one group per page: D1 caps a table at 100 columns.
          fields: [{
            name: 'pageHeroes', label: 'Page heroes', type: 'array', labels: { singular: 'Page', plural: 'Pages' },
            admin: { initCollapsed: true, components: { RowLabel: '/payload/components/HeroRowLabel#HeroRowLabel' } },
            fields: [
              { name: 'page', type: 'select', required: true, options: HERO_PAGES.map(([value, label]) => ({ value, label })) },
              { type: 'row', fields: [
                { name: 'eyebrow', label: 'Small label above the title', type: 'text' },
                { name: 'title', label: 'Title', type: 'text' },
                { name: 'titleItalic', label: 'Title ending (in italics)', type: 'text' },
              ] },
              { name: 'sub', label: 'Text under the title', type: 'textarea',
                admin: { description: 'On Communities, Off-plan, Services and Our team, leave blank to show the live figures (counts and yields).' } },
              { name: 'image', label: 'Photo', type: 'upload', relationTo: 'media' },
            ],
          }],
        },
        {
          label: 'Market data',
          description: 'Source and date shown next to every community figure.',
          fields: [
            { name: 'marketSource', label: 'Source', type: 'text', required: true },
            { type: 'row', fields: [{ name: 'marketSourceUrl', label: 'Source link', type: 'text' }, { name: 'marketUpdated', label: 'Last updated', type: 'date', required: true }] },
            { type: 'row', fields: [
              { name: 'priceChange', label: 'Price per sq ft change vs last quarter (%)', type: 'number',
                admin: { description: 'Shown on the homepage market pulse, e.g. 4.2 or -1.5. Leave empty to hide.' } },
              { name: 'yieldChange', label: 'Rental yield change vs last quarter (points)', type: 'number',
                admin: { description: 'e.g. 0.3 or -0.2. Leave empty to hide.' } },
            ] },
          ],
        },
        {
          label: 'Currency',
          fields: [{ name: 'rates', label: 'Rates (1 AED = …)', type: 'array', fields: [{ type: 'row', fields: [{ name: 'code', type: 'text', required: true }, { name: 'rate', type: 'number', required: true }] }] }],
        },
        {
          label: 'Lead alerts',
          description: 'Who is emailed about new leads, and the Google Sheet they are copied to.',
          fields: [
            {
              name: 'leadEmails', label: 'Send new-lead emails to', type: 'text', hasMany: true, access: { read: fieldIsAdmin, update: fieldIsAdmin },
              validate: (v: unknown) => {
                const bad = ((v as string[] | null) ?? []).filter(e => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
                return bad.length ? `Not a valid email: ${bad.join(', ')}` : true;
              },
            },
            { name: 'sheetsEnabled', label: 'Copy leads to Google Sheets', type: 'checkbox', defaultValue: false, access: { read: fieldIsAdmin, update: fieldIsAdmin },
              admin: { description: 'Needs GOOGLE_SHEETS_ID and service account credentials in the environment.' } },
          ],
        },
      ],
    },
  ],
};

export const settingsAdminOnly = isAdmin;
