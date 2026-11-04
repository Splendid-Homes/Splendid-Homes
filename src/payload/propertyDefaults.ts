/**
 * Default wording and options for the single property page. Edited in the CMS under "Property page";
 * a blank field falls back to these. Tokens: {title}, {ref}, {area}, {agent} (+ fee tokens such as {dld}).
 */
export const PROPERTY_PAGE_DEFAULTS = {
  // Section headings
  aboutTitle: 'About this property',
  aboutNote: 'Contact our team for the full brochure, title-deed details and to arrange a private viewing.',
  detailsTitle: 'Property details',
  amenitiesTitle: 'Amenities & features',
  costsBuyTitle: 'What it costs to buy',
  costsBuyNote: 'One-off costs on top of the price for a cash purchase.',
  costsRentTitle: 'What it costs to rent',
  costsRentNote: 'Paid when you sign, on top of the first rent cheque.',
  costsFootnote: 'Estimates based on standard Dubai fees; your advisor confirms the exact figures.',
  locationTitle: 'Location',
  regulatoryTitle: 'Regulatory information',
  regulatoryNote: 'Advertised under a Dubai Land Department (Trakheesi) permit. Verify it on the DLD app with the permit number above.',
  faqTitle: '{title}: questions & answers',
  similarEyebrow: 'Picked for this home',
  similarTitle: 'Homes like',
  similarItalic: 'this one',
  // Sticky tab labels
  tabOverview: 'Overview', tabDetails: 'Details', tabAmenities: 'Amenities', tabCosts: 'Costs',
  tabLocation: 'Location', tabPermit: 'Permit', tabQa: 'Q&A',
  // Contact box
  viewingCta: 'Book a viewing',
  whatsappCta: 'WhatsApp',
  callCta: 'Call',
  enquiryTitle: 'Enquire about this property',
  enquiryCta: 'Send enquiry',
  enquiryMessage: 'I’m interested in {ref}. Please send me more details.',
  waMessage: 'Hi, I am interested in {ref}: {title}',
  // Regulatory box labels
  regPermit: 'DLD Permit No.', regRef: 'Reference', regBrn: 'Agent BRN', regOrn: 'Company ORN',
  // Rental "Payment" detail
  rentPayment: 'Up to 4 cheques',
};
export type PropertyPageText = typeof PROPERTY_PAGE_DEFAULTS;

/** Similar homes and Q&A options. */
export const PROPERTY_OPTIONS_DEFAULTS = { similarCount: 3, matchMin: 50, showReasons: true, showAutoFaqs: true };

/** Replaces {title}, {ref}, {area} and {agent} in property page text. */
export const fillProperty = (t: string, v: { title: string; ref: string; area: string; agent: string }) =>
  t.replaceAll('{title}', v.title).replaceAll('{ref}', v.ref).replaceAll('{area}', v.area).replaceAll('{agent}', v.agent);

/** Facts a property page can show (tiles at the top and rows in "Property details"). */
export const FACT_OPTIONS = [
  { value: 'type', label: 'Property type' }, { value: 'beds', label: 'Bedrooms' }, { value: 'baths', label: 'Bathrooms' },
  { value: 'size', label: 'Built-up area' }, { value: 'psf', label: 'Price per sq ft' }, { value: 'furnishing', label: 'Furnishing' },
  { value: 'status', label: 'Ready / off-plan' }, { value: 'completion', label: 'Year built / handover' }, { value: 'view', label: 'View' },
  { value: 'parking', label: 'Parking' }, { value: 'developer', label: 'Developer' }, { value: 'serviceCharge', label: 'Service charge (sale)' },
  { value: 'payment', label: 'Payment (rent)' },
] as const;
export type FactKey = (typeof FACT_OPTIONS)[number]['value'];
export const KEY_FACT_DEFAULTS: FactKey[] = ['beds', 'baths', 'size', 'parking'];
export const DETAIL_ROW_DEFAULTS: FactKey[] = ['type', 'beds', 'baths', 'size', 'psf', 'furnishing', 'status', 'completion', 'view', 'parking', 'developer', 'serviceCharge', 'payment'];
