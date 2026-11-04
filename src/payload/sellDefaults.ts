/** Default wording for the Sell page and its valuation form (CMS: Sell page). Blank fields fall back to these. */
export const SELL_TEXT_DEFAULTS = {
  whyEyebrow: 'Why list with us', whyTitle: 'Sold faster.', whyItalic: 'Sold for more.',
  stepsEyebrow: 'The process', stepsTitle: 'How selling works', stepsItalic: 'in Dubai',
  faqTitle: 'Selling in Dubai: questions & answers',
  // Valuation form
  step1: 'Property', step2: 'Details', step3: 'Contact',
  step1Title: 'About your property', step2Title: 'Property details', step3Title: 'Your contact details',
  intentLabel: 'I want to', communityLabel: 'Community', communityPlaceholder: 'Select community',
  buildingLabel: 'Building / villa no.', buildingHint: 'e.g. Marina Gate 1, unit 2104',
  typeLabel: 'Type', bedsLabel: 'Bedrooms', sizeLabel: 'Size (sq ft)', priceLabel: 'Expected price (AED)', priceHint: 'Optional',
  continueCta: 'Continue', backCta: 'Back', submitCta: 'Get my valuation', successTitle: 'Valuation requested',
};
export type SellText = typeof SELL_TEXT_DEFAULTS;

export const SELL_INTENTS = ['Sell', 'Let', 'Sell or let: advise me'];

export const SELL_WHY = [
  { title: 'Free valuation', text: 'A data-led price using recent Dubai Land Department transactions for your building and area.' },
  { title: 'Premium marketing', text: 'Professional photography, video and featured placement on the major property portals.' },
  { title: 'Wide reach', text: 'Exposure to our buyer and tenant database and international partner network.' },
  { title: 'End-to-end handling', text: 'Viewings, negotiation, developer NOC and transfer at a DLD trustee office.' },
];

export const SELL_STEPS = [
  { title: 'Valuation', text: 'We price the property against recent comparable sales.' },
  { title: 'Listing agreement (Form A)', text: 'You sign the RERA Form A agency agreement, which lets us apply for the advertising permit.' },
  { title: 'Marketing', text: 'The listing goes live under a DLD (Trakheesi) advertising permit.' },
  { title: 'Offer and MOU (Form F)', text: 'Buyer and seller sign the Form F memorandum of understanding and the buyer pays the agreed deposit.' },
  { title: 'NOC and transfer', text: 'The developer issues a no-objection certificate and ownership transfers at a DLD trustee office.' },
];

/** Answers may use fee tokens such as {sellerAgency} and {dld} (see fillFees). */
export const SELL_FAQS = [
  { q: 'How much does it cost to sell a property in Dubai?', a: 'The main seller cost is agency commission, typically {sellerAgency} of the price plus VAT. Sellers also pay the developer’s NOC fee and settle any outstanding service charges or mortgage. The {dld} DLD transfer fee is customarily paid by the buyer.' },
  { q: 'How long does it take to sell a property in Dubai?', a: 'Well-priced homes in popular areas often find a buyer within one to three months. Once the MOU is signed, transfer usually takes two to four weeks for cash sales and longer when a mortgage is involved.' },
  { q: 'What documents do I need to sell?', a: 'Your title deed, passport and Emirates ID (or passport only if non-resident), the signed Form A, and a service charge clearance. If the property is mortgaged, you also need a liability letter from your bank.' },
  { q: 'Can I sell a property that still has a mortgage?', a: 'Yes. The outstanding loan is paid off at transfer, usually from the buyer’s funds, and the bank releases the mortgage on the same day.' },
  { q: 'Is the valuation really free?', a: 'Yes. We provide a written valuation within 24 hours with no obligation to list with us.' },
];
