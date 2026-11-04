import type { Field, GlobalConfig } from 'payload';
import { isEditor } from '../access';
import { revalidateGlobal } from '../hooks';
import { SERVICES_TEXT_DEFAULTS as D } from '../servicesDefaults';

const t = (name: keyof typeof D, label: string, area = false): Field =>
  ({ name, label, type: area ? 'textarea' : 'text', admin: { placeholder: D[name] } }) as Field;
const row = (...fields: Field[]): Field => ({ type: 'row', fields });

/** Services page: shared button and form wording, page Q&A and closing call-to-action. Each service is edited under Services. */
export const ServicesPage: GlobalConfig = {
  slug: 'servicesPage',
  label: 'Services page',
  admin: { group: 'Admin', description: 'Add, remove and reorder services under Content > Services. Blank fields keep the current wording (shown in grey); {service} = the service name.' },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [{
    type: 'tabs',
    tabs: [
      { label: 'Buttons & form', fields: [
        row(t('talkCta', '"Talk to a specialist" button'), t('whatsappCta', 'WhatsApp button')),
        t('waMessage', 'Pre-filled WhatsApp message'),
        row(t('formTitle', 'Form title'), t('formCta', 'Form button'), t('formHint', 'Message hint')),
      ] },
      { label: 'Q&A', fields: [
        t('faqTitle', 'Title'),
        {
          name: 'faqs', label: 'Questions on the Services page', type: 'array', labels: { singular: 'Question', plural: 'Questions' },
          admin: { initCollapsed: true, description: 'Shown at the bottom of the page, after each service’s own questions. Fee tokens like {dld} work in answers.',
            components: { RowLabel: { path: '/payload/components/OptionRowLabel#OptionRowLabel', clientProps: { field: 'q', options: [], fallback: 'Question', textField: 'q' } } } },
          fields: [{ name: 'q', label: 'Question', type: 'text', required: true }, { name: 'a', label: 'Answer', type: 'textarea', required: true }],
        },
      ] },
      { label: 'Closing call-to-action', fields: [
        { name: 'showCta', label: 'Show the closing band', type: 'checkbox', defaultValue: true },
        row(t('ctaEyebrow', 'Small label'), t('ctaTitle', 'Title'), t('ctaItalic', 'Title (italic part)')),
        t('ctaText', 'Text', true),
        row(t('ctaPrimary', 'Main button'), t('ctaPrimaryHref', 'Main button link'), t('ctaSecondary', 'WhatsApp button')),
      ] },
    ],
  }],
};
