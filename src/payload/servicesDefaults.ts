/** Default wording for the Services page (CMS: Services page). Blank fields fall back to these. {service} = the service name. */
export const SERVICES_TEXT_DEFAULTS = {
  talkCta: 'Talk to a specialist',
  formTitle: 'Talk to a {service} specialist',
  formCta: 'Request a call',
  formHint: 'What would you like help with?',
  whatsappCta: 'WhatsApp',
  waMessage: 'Hi, I’d like to talk to a specialist about {service}.',
  faqTitle: 'Our services: questions & answers',
  ctaEyebrow: 'Not sure where to start?',
  ctaTitle: 'Tell us what you need,',
  ctaItalic: 'we’ll point the way',
  ctaText: 'One call with a specialist covers buying, selling, renting, finance and visas, with no obligation.',
  ctaPrimary: 'Contact us', ctaPrimaryHref: '/contact',
  ctaSecondary: 'WhatsApp us',
};
export type ServicesText = typeof SERVICES_TEXT_DEFAULTS;
