import type { Field, GlobalConfig } from 'payload';
import { isEditor } from '../access';
import { revalidateGlobal } from '../hooks';
import { SELL_TEXT_DEFAULTS as D } from '../sellDefaults';

const t = (name: keyof typeof D, label: string): Field => ({ name, label, type: 'text', admin: { placeholder: D[name] } });
const row = (...fields: Field[]): Field => ({ type: 'row', fields });
const list = (name: string, label: string, title: string, text: string, description: string): Field => ({
  name, label, type: 'array', labels: { singular: 'Item', plural: 'Items' },
  admin: { initCollapsed: true, description,
    components: { RowLabel: { path: '/payload/components/OptionRowLabel#OptionRowLabel', clientProps: { field: title, options: [], fallback: 'Item', textField: title } } } },
  fields: [{ name: title, label: title === 'q' ? 'Question' : 'Title', type: 'text', required: true }, { name: text, label: text === 'a' ? 'Answer' : 'Text', type: 'textarea', required: true }],
});

/** Sell page: "Why list with us", process steps, Q&A and the valuation form wording. Own table (D1: under 50 columns). */
export const SellPage: GlobalConfig = {
  slug: 'sellPage',
  label: 'Sell page',
  admin: { group: 'Admin', description: 'The banner is under Site settings > Page heroes. Blank fields keep the current wording (shown in grey); empty lists keep the current items.' },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [{
    type: 'tabs',
    tabs: [
      { label: 'Why list with us', fields: [
        row(t('whyEyebrow', 'Small label'), t('whyTitle', 'Title'), t('whyItalic', 'Title (italic part)')),
        list('whyPoints', 'Numbered points', 'title', 'text', 'Drag to reorder.'),
        { name: 'showStats', label: 'Show the key numbers under the points (Site settings > Company > Key numbers)', type: 'checkbox', defaultValue: true },
      ] },
      { label: 'Process steps', fields: [
        row(t('stepsEyebrow', 'Small label'), t('stepsTitle', 'Title'), t('stepsItalic', 'Title (italic part)')),
        list('steps', 'Steps', 'title', 'text', 'Drag to reorder; they are numbered automatically.'),
      ] },
      { label: 'Q&A', fields: [
        t('faqTitle', 'Title'),
        list('faqs', 'Questions', 'q', 'a', 'Answers can use {sellerAgency}, {dld}, {vat} and other fee tokens so they follow Fees & costs.'),
      ] },
      { label: 'Valuation form', fields: [
        row(t('step1', 'Step 1 name'), t('step2', 'Step 2 name'), t('step3', 'Step 3 name')),
        row(t('step1Title', 'Step 1 heading'), t('step2Title', 'Step 2 heading'), t('step3Title', 'Step 3 heading')),
        row(t('intentLabel', '"I want to" label'), { name: 'intents', label: '"I want to" choices', type: 'text', hasMany: true, admin: { description: 'Leave empty for Sell, Let, Sell or let: advise me.' } }),
        row(t('communityLabel', 'Community label'), t('communityPlaceholder', 'Community placeholder')),
        row(t('buildingLabel', 'Building label'), t('buildingHint', 'Building hint')),
        row(t('typeLabel', 'Type label'), t('bedsLabel', 'Bedrooms label'), t('sizeLabel', 'Size label')),
        row(t('priceLabel', 'Price label'), t('priceHint', 'Price hint')),
        row(t('continueCta', 'Continue button'), t('backCta', 'Back button'), t('submitCta', 'Send button'), t('successTitle', 'Thank-you heading')),
      ] },
    ],
  }],
};
