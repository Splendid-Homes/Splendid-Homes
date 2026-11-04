import type { Field, GlobalConfig } from 'payload';
import { isEditor } from '../access';
import { ABOUT_TEAM_DEFAULTS as D, VALUE_ICONS } from '../aboutTeamDefaults';
import { revalidateGlobal } from '../hooks';

const t = (name: keyof typeof D, label: string, area = false): Field =>
  ({ name, label, type: area ? 'textarea' : 'text', admin: { placeholder: D[name] } }) as Field;
const row = (...fields: Field[]): Field => ({ type: 'row', fields });

/** About page, Team page and agent profiles: wording, value cards, leadership picks and options. Own table (D1: under 50 columns). */
export const AboutTeam: GlobalConfig = {
  slug: 'aboutTeam',
  label: 'About & Team pages',
  admin: { group: 'Admin', description: 'Banners are under Site settings > Page heroes; key numbers under Site settings > Company. Each person is edited under Team (order, photo, bio, links). Blank fields keep the current wording.' },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [{
    type: 'tabs',
    tabs: [
      { label: 'About page', fields: [
        row(t('storyEyebrow', 'Story: small label'), t('storyTitle', 'Story: title'), t('storyItalic', 'Title (italic part)')),
        t('storyText1', 'Story: first paragraph ({company}, {orn})', true),
        t('storyText2', 'Story: second paragraph', true),
        { name: 'storyImage', label: 'Story photo', type: 'upload', relationTo: 'media', admin: { description: 'Leave empty to use a community photo.' } },
        { name: 'showStats', label: 'Show the key numbers strip', type: 'checkbox', defaultValue: true },
        row(t('valuesTitle', 'Values: title'), t('valuesItalic', 'Title (italic part)')),
        {
          name: 'values', label: 'Value cards', type: 'array', labels: { singular: 'Card', plural: 'Cards' },
          admin: { initCollapsed: true, description: 'Leave empty for Integrity, Excellence, Partnership and Insight.',
            components: { RowLabel: { path: '/payload/components/OptionRowLabel#OptionRowLabel', clientProps: { field: 'title', options: [], fallback: 'Card', textField: 'title' } } } },
          fields: [
            row({ name: 'title', type: 'text', required: true }, { name: 'icon', type: 'select', defaultValue: 'star', options: VALUE_ICONS.map(i => ({ value: i, label: i })) }),
            { name: 'text', type: 'textarea', required: true },
          ],
        },
        row(t('leadEyebrow', 'Leadership: small label'), t('leadTitle', 'Leadership: title'), t('leadItalic', 'Title (italic part)'), t('leadLink', 'Leadership: link')),
        { name: 'leaders', label: 'Leadership: who to show', type: 'relationship', relationTo: 'agents', hasMany: true,
          admin: { description: 'Pick and order the people. Leave empty to show the first four in the team order.' } },
      ] },
      { label: 'Team page & cards', fields: [
        row(t('allLanguages', '"All languages" filter'), t('cardWhatsapp', 'Card WhatsApp button')),
        t('cardMessage', 'Card: pre-filled WhatsApp message ({first})'),
      ] },
      { label: 'Agent profile', fields: [
        row(t('labelBrn', 'Label: BRN'), t('labelLanguages', 'Label: languages'), t('labelAreas', 'Label: specialist areas'), t('labelDeals', 'Label: closed deals')),
        { name: 'showDeals', label: 'Show closed deals', type: 'checkbox', defaultValue: true },
        row(
          { name: 'waTo', label: 'Profile WhatsApp goes to', type: 'select', defaultValue: 'company', options: [{ value: 'company', label: 'The company number' }, { value: 'agent', label: 'The agent’s own number' }] },
          t('profileWhatsapp', 'WhatsApp button'), t('profileEmail', 'Email button'),
        ),
        row(t('listingsEyebrow', 'Listings: small label'), t('listingsTitle', 'Listings: title ({first})'), t('listingsItalic', 'Title (italic part)')),
        row(t('articlesEyebrow', 'Articles: small label'), t('articlesTitle', 'Articles: title (before the name)')),
      ] },
    ],
  }],
};
