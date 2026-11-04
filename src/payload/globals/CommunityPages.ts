import type { Field, GlobalConfig } from 'payload';
import { isEditor } from '../access';
import { COMMUNITY_OPTIONS_DEFAULTS as O, COMMUNITY_TEXT_DEFAULTS as D } from '../communityDefaults';

import { revalidateGlobal } from '../hooks';

const t = (name: keyof typeof D, label: string, area = false): Field =>
  ({ name, label, type: area ? 'textarea' : 'text', admin: { placeholder: D[name] } }) as Field;
const row = (...fields: Field[]): Field => ({ type: 'row', fields });
const qLabel = { path: '/payload/components/OptionRowLabel#OptionRowLabel', clientProps: { field: 'q', options: [], fallback: 'Question', textField: 'q' } };

/** Each community page: headings, tabs, guide labels, compare intro and Q&A. The list page and compare table are in CommunitiesList (D1: under 50 columns per table). */
export const CommunityPages: GlobalConfig = {
  slug: 'communityPages',
  label: 'Community page',
  admin: { group: 'Admin', description: 'Blank fields keep the current wording (shown in grey). Tokens: {name}, {yield}, {price}, {rent}, {avgYield}, {count}, {aboveBelow} (above / below) and {rankedBy}.' },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [{
    type: 'tabs',
    tabs: [
      { label: 'Community page', fields: [
        row(t('kpiPrice', 'Figure label: price'), t('kpiRent', 'Figure label: rent'), t('kpiYield', 'Figure label: yield'), t('kpiListings', 'Figure label: listings')),
        row(t('availableEyebrow', 'Listings: small label'), t('availableTitle', 'Listings: title (before the name)')),
        row(t('tabSale', 'Tab: for sale'), t('tabRent', 'Tab: for rent'), t('tabOffplan', 'Tab: off-plan')),
        row(t('linkSale', 'Link: for sale'), t('linkRent', 'Link: for rent'), t('linkOffplan', 'Link: off-plan')),
        row(
          { name: 'perTab', label: 'Homes per tab', type: 'number', min: 1, max: 12, defaultValue: O.perTab },
          { name: 'nearbyCount', label: 'Nearby communities shown', type: 'number', min: 0, max: 12, defaultValue: O.nearbyCount, admin: { description: 'When none are hand-picked on the community.' } },
        ),
        row(t('guideEyebrow', 'Guide: small label'), t('guideTitle', 'Guide: title (before the name)')),
        { name: 'showMap', label: 'Show the map in the area guide', type: 'checkbox', defaultValue: O.showMap },
        row(t('prosTitle', 'Pros & cons title'), t('prosItalic', 'Title (italic part)'), t('prosLabel', '"Pros" box'), t('consLabel', '"Cons" box')),
        row(t('fitTitle', '"Right for you" title'), t('fitItalic', 'Title (italic part)'), t('suitsLabel', '"Suits you if" box'), t('notForLabel', '"Think twice if" box')),
        row(t('nearbyTitle', 'Nearby title'), t('nearbyItalic', 'Title (italic part)')),
        row(t('tocPros', 'Side menu: pros & cons'), t('tocFit', 'Side menu: right for you'), t('tocNearby', 'Side menu: nearby')),
        row(t('compareEyebrow', 'Compare: small label'), t('compareTitle', 'Compare: title'), t('compareItalic', 'Title (italic part)')),
        t('compareIntro', 'Compare: intro', true),
        t('faqTitle', 'Q&A title'),
      ] },
      { label: 'Q&A', fields: [
        { name: 'showAutoFaqs', label: 'Show the automatic questions (prices, yield, listings…)', type: 'checkbox', defaultValue: O.showAutoFaqs },
        {
          name: 'extraFaqs', label: 'Extra questions on every community', type: 'array', labels: { singular: 'Question', plural: 'Questions' },
          admin: { initCollapsed: true, description: 'Added after the automatic ones and each community\u2019s own questions (set on the community, under Area guide); tokens like {name} and {yield} work here.', components: { RowLabel: qLabel } },
          fields: [{ name: 'q', label: 'Question', type: 'text', required: true }, { name: 'a', label: 'Answer', type: 'textarea', required: true }],
        },
      ] },
    ],
  }],
};
