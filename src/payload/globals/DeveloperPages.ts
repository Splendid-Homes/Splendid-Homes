import type { Field, GlobalConfig } from 'payload';
import { isEditor } from '../access';
import { DEV_ORDER_OPTIONS, DEVELOPER_OPTIONS_DEFAULTS as O, DEVELOPER_TEXT_DEFAULTS as D } from '../developerDefaults';
import { revalidateGlobal } from '../hooks';

const t = (name: keyof typeof D, label: string): Field => ({ name, label, type: 'text', admin: { placeholder: D[name] } });
const row = (...fields: Field[]): Field => ({ type: 'row', fields });

/** Developers list and developer pages: order, cards, headings, sections. Own table (D1: under 50 columns). */
export const DeveloperPages: GlobalConfig = {
  slug: 'developerPages',
  label: 'Developer pages',
  admin: { group: 'Admin', description: 'Blank fields keep the current wording (shown in grey). {name}, {founded}, {launches} and {delivered} are replaced with the developer’s details. Each developer’s own text, photo, website and questions are on the developer.' },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [{
    type: 'tabs',
    tabs: [
      { label: 'Developers list', fields: [
        row(
          { name: 'listOrder', label: 'Order of the list', type: 'select', defaultValue: O.listOrder, options: DEV_ORDER_OPTIONS.map(({ value, label }) => ({ value, label })) },
          { name: 'showLogos', label: 'Show uploaded logos instead of the name', type: 'checkbox', defaultValue: O.showLogos,
            admin: { description: 'Only for developers with a logo uploaded (with their permission).' } },
        ),
        t('cardLine', 'Line under each card'),
      ] },
      { label: 'Developer page', fields: [
        row(t('heroEyebrow', 'Banner: small label'), t('aboutEyebrow', 'About: small label'), t('aboutTitle', 'About: title (before the name)')),
        row(t('factFounded', 'Fact: founded'), t('factDelivered', 'Fact: delivered'), t('factLaunches', 'Fact: launches'), t('factReady', 'Fact: ready homes')),
        row(t('knownForLabel', '"Known for" label'), t('websiteCta', 'Website button')),
        row(t('projectsEyebrow', 'Projects: small label'), t('projectsTitle', 'Projects: title (before the name)'), t('projectsLink', 'Projects: link')),
        row(t('emptyText', 'No launches: text'), t('emptyLink', 'No launches: link')),
        row(t('resaleEyebrow', 'Ready homes: small label'), t('resaleItalic', 'Ready homes: title (after the name)')),
        t('faqTitle', 'Q&A title'),
      ] },
      { label: 'Show / hide', fields: [
        row(
          { name: 'showFacts', label: 'Show the facts box', type: 'checkbox', defaultValue: O.showFacts },
          { name: 'showKnownFor', label: 'Show "Known for"', type: 'checkbox', defaultValue: O.showKnownFor },
          { name: 'showResale', label: 'Show ready homes', type: 'checkbox', defaultValue: O.showResale },
        ),
        { name: 'resaleCount', label: 'Ready homes shown', type: 'number', min: 1, max: 24, defaultValue: O.resaleCount },
      ] },
    ],
  }],
};
