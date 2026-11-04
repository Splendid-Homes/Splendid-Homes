import type { Faq } from '@/lib/schema';

/**
 * Editorial extras per article (AEO/GEO): answer-first summary, takeaways, steps, comparison
 * tables, FAQs and sources. Lives beside the ported posts until the CMS has these fields.
 *
 * Guides only state standing rules (DLD fees, Central Bank mortgage limits, Golden Visa
 * thresholds, escrow law) and cite the official source. Articles marked `sample` still carry
 * prototype figures and say so on the page until real data replaces them.
 */
export type Source = { label: string; url: string };
export type PostExtras = {
  summary: string;
  updated: string;
  takeaways?: string[];
  steps?: { title: string; text: string }[];
  table?: { title: string; caption: string; head: string[]; rows: string[][] };
  communityTable?: boolean;
  /** Rows filled from community data at render (keeps figures in sync with the area guides). */
  communityRows?: { title: string; caption: string; rows: { slug: string; bestFor: string }[] };
  faqs: Faq[];
  sources: Source[];
  sample?: string;
};

const DLD: Source = { label: 'Dubai Land Department (DLD)', url: 'https://dubailand.gov.ae' };
const CBUAE: Source = { label: 'Central Bank of the UAE: mortgage regulations', url: 'https://www.centralbank.ae' };
const UAE_GOV: Source = { label: 'UAE Government portal (u.ae): Golden Visa', url: 'https://u.ae' };
const ICP: Source = { label: 'Federal Authority for Identity, Citizenship, Customs & Port Security (ICP)', url: 'https://icp.gov.ae' };
const KHDA: Source = { label: 'Knowledge and Human Development Authority (KHDA): school ratings', url: 'https://www.khda.gov.ae' };

export const POST_EXTRAS: Record<string, PostExtras> = {
  'dubai-property-market-report-q3-2026': {
    sample: 'Sample report: the figures below are the prototype’s sample values and will be replaced with Q3 2026 Dubai Land Department data before publication.',
    updated: '2026-10-05',
    summary: 'Dubai’s residential market stayed active in Q3 2026. Prime areas such as Palm Jumeirah and Emirates Hills led on price, while Jumeirah Village Circle and Business Bay led on rental yield.',
    takeaways: [
      'Demand came from both international investors and end-users.',
      'Prime communities led price growth; mid-market areas led rental yields.',
      'Off-plan sales stayed significant, helped by staged payment plans.',
    ],
    communityTable: true,
    faqs: [
      { q: 'Where can I check official Dubai property transaction data?', a: 'The Dubai Land Department publishes registered sales and rental data through its website and the Dubai REST app. Our reports start from that data and add what we see in our own listings and enquiries.' },
      { q: 'Which Dubai areas have the highest rental yields?', a: 'In our current figures, Jumeirah Village Circle (about 7.8%) and Business Bay (about 6.9%) lead on gross rental yield. Yields depend on the exact building, unit size and purchase price.' },
      { q: 'Which areas are the most expensive per square foot?', a: 'Emirates Hills and Palm Jumeirah are the most expensive communities we cover, at roughly AED 4,200 and AED 3,450 per sq ft on average.' },
      { q: 'Is now a good time to buy in Dubai?', a: 'It depends more on your plans than on market timing. Buyers holding for five years or more, and choosing the right building at the right price, are less exposed to short-term swings.' },
      { q: 'How often is this report published?', a: 'Quarterly, once the Dubai Land Department has published the quarter’s registered transactions.' },
    ],
    sources: [DLD, { label: 'Splendid Homes listings and enquiries', url: '/buy' }],
  },

  'golden-visa-through-property-the-2026-guide': {
    updated: '2026-10-21',
    summary: 'Buying Dubai property worth at least AED 2 million can make you eligible for a 10-year, renewable UAE Golden Visa. Off-plan homes from approved developers and mortgaged homes can also qualify, subject to the current rules.',
    takeaways: [
      'The property threshold is AED 2 million, and several properties can be combined to reach it.',
      'The visa runs for 10 years and is renewable while you keep the qualifying property.',
      'Holders can sponsor their spouse and children, and there is no minimum stay in the UAE to keep the visa valid.',
    ],
    steps: [
      { title: 'Buy and register', text: 'Complete the purchase and register the title deed (or Oqood for off-plan) with the Dubai Land Department.' },
      { title: 'Get the property certificate', text: 'Request the Golden Visa property assessment from the DLD to confirm the value meets the threshold.' },
      { title: 'Apply for residency', text: 'Submit the application with the residency authority, then complete the medical test and Emirates ID biometrics.' },
    ],
    faqs: [
      { q: 'How much do I need to invest in property for a Golden Visa?', a: 'At least AED 2 million in Dubai property. You can reach the threshold with one property or several combined.' },
      { q: 'Does off-plan property qualify for the Golden Visa?', a: 'Yes, off-plan property bought from an approved developer can qualify once it meets the AED 2 million threshold, subject to the rules in force when you apply.' },
      { q: 'Can I get a Golden Visa on a mortgaged property?', a: 'Yes, mortgaged property can qualify, subject to the lender’s no-objection letter and the conditions set by the authorities at the time of application.' },
      { q: 'How long is the property Golden Visa valid?', a: 'Ten years, and it can be renewed as long as you still own qualifying property.' },
      { q: 'Can I sponsor my family on a Golden Visa?', a: 'Yes. Golden Visa holders can sponsor their spouse and children for residency.' },
      { q: 'Do I need to live in the UAE to keep the Golden Visa?', a: 'No. Unlike standard residence visas, the Golden Visa stays valid even if you spend more than six months outside the UAE.' },
    ],
    sources: [UAE_GOV, ICP, DLD],
  },

  'off-plan-vs-ready-which-is-right-for-you': {
    updated: '2026-10-21',
    summary: 'Off-plan suits buyers who want a lower entry price and staged payments and can wait for handover. Ready property suits buyers who want to move in or earn rent immediately. Both pay the same 4% Dubai Land Department fee.',
    table: {
      title: 'Off-plan vs ready at a glance',
      caption: 'Comparison of off-plan and ready property in Dubai',
      head: ['', 'Off-plan', 'Ready'],
      rows: [
        ['How you pay', 'Instalments during construction, sometimes after handover', 'Full price at transfer (cash or mortgage)'],
        ['Rental income', 'Only after handover', 'From the day you let it'],
        ['Mortgage', 'Banks lend up to 50% of the value', 'Up to 80% for a first home under AED 5M (expats)'],
        ['Buyer protection', 'Payments held in project escrow accounts', 'You inspect the actual unit before buying'],
        ['Main risk', 'Handover delays; finish differs from renders', 'Higher upfront cost; older stock may need upgrades'],
        ['DLD fee', '4% (Oqood registration)', '4% (title deed transfer)'],
      ],
    },
    faqs: [
      { q: 'Is off-plan cheaper than ready property in Dubai?', a: 'Usually at entry. Launch prices and staged payments mean less cash up front, but the total price is not always lower than a comparable ready home.' },
      { q: 'Can I get a mortgage on an off-plan property?', a: 'Yes, but banks lend up to 50% of an off-plan property’s value, compared with up to 80% on a ready first home under AED 5 million for expats.' },
      { q: 'Is my money safe when buying off-plan?', a: 'Payments for registered off-plan projects go into an escrow account regulated under Dubai Law No. 8 of 2007, and are released to the developer against construction progress.' },
      { q: 'Can I sell an off-plan property before handover?', a: 'Often yes, once you have paid the minimum share the developer sets in the sales agreement. Check the resale clause before you buy.' },
      { q: 'Which is better for rental income?', a: 'Ready property. It can be let straight away, while off-plan earns nothing until handover.' },
    ],
    sources: [DLD, CBUAE],
  },

  'top-5-communities-for-families-in-dubai': {
    sample: 'Sample article: prices, rents and yields are the prototype’s sample values until real Dubai Land Department data is loaded.',
    updated: '2026-09-12',
    summary: 'For families, Dubai Hills Estate and Arabian Ranches stand out for villas, parks and space, Emirates Hills for prime estates, and Jumeirah Village Circle for value. Dubai Creek Harbour suits families who prefer waterfront apartments.',
    communityRows: {
      title: 'Five family communities compared',
      caption: 'Five Dubai family communities by home type, price per square foot, annual rent and yield',
      rows: [
        { slug: 'dubai-hills-estate', bestFor: 'Villas and townhouses around a central park' },
        { slug: 'arabian-ranches', bestFor: 'Established villa community with space' },
        { slug: 'jumeirah-village-circle', bestFor: 'Value for growing families' },
        { slug: 'emirates-hills', bestFor: 'Prime estates with golf views' },
        { slug: 'dubai-creek-harbour', bestFor: 'Waterfront apartments near Downtown' },
      ],
    },
    faqs: [
      { q: 'Which Dubai community is best for families?', a: 'It depends on budget and home type. Dubai Hills Estate and Arabian Ranches suit families who want villas and green space; Jumeirah Village Circle offers the most space for the money.' },
      { q: 'What is the most affordable family community in Dubai?', a: 'Jumeirah Village Circle is the most affordable of the five, with average rents around AED 72,000 a year in our figures.' },
      { q: 'Which communities have villas with gardens?', a: 'Arabian Ranches, Dubai Hills Estate and Emirates Hills are villa-led communities, most homes with private gardens.' },
      { q: 'How do I check schools near a community?', a: 'Use the Knowledge and Human Development Authority (KHDA) website, which publishes inspection ratings for every private school in Dubai.' },
      { q: 'Are family communities a good investment?', a: 'They can be: villa communities attract long-term tenants, while Jumeirah Village Circle has the highest gross yield of the five in our figures.' },
    ],
    sources: [DLD, KHDA],
  },

  'understanding-service-charges-in-dubai': {
    updated: '2026-10-21',
    summary: 'Service charges are yearly fees, charged per square foot, that owners pay for the upkeep of their building and community. Budgets are approved by RERA and published in the Dubai Land Department’s Service Charge Index, so you can check a building’s rate before you buy.',
    takeaways: [
      'The owner pays service charges, not the tenant.',
      'Rates are set per sq ft of your unit and can change each year with the approved budget.',
      'Always deduct them when you work out net rental yield.',
    ],
    steps: [
      { title: 'Find the rate', text: 'Look up the building in the DLD Service Charge Index for the approved rate per sq ft.' },
      { title: 'Multiply by size', text: 'Rate × unit size (sq ft) gives the yearly charge, for example AED 15 × 1,000 sq ft = AED 15,000.' },
      { title: 'Deduct from rent', text: 'Net yield = (annual rent − service charge − other costs) ÷ price. On AED 1.5M with AED 100,000 rent: (100,000 − 15,000) ÷ 1,500,000 ≈ 5.7%.' },
    ],
    faqs: [
      { q: 'Who pays service charges in Dubai, the owner or the tenant?', a: 'The owner. Tenants pay rent (and utilities); building service charges stay with the landlord.' },
      { q: 'How are service charges calculated?', a: 'Each building’s owners’ association sets a yearly budget, RERA approves it, and it is divided by the total floor area to give a rate per sq ft. Your bill is that rate times your unit’s size.' },
      { q: 'Where can I check a building’s service charges?', a: 'In the Dubai Land Department’s Service Charge Index, available on the DLD website and the Dubai REST app.' },
      { q: 'What do service charges cover?', a: 'Maintenance of common areas and facilities, security, cleaning, shared utilities, insurance of the building and a reserve fund for major repairs.' },
      { q: 'Can service charges go up?', a: 'Yes. The budget is set each year, so the rate can rise or fall, but every change must be approved by RERA.' },
    ],
    sources: [DLD],
  },

  'mortgage-guide-for-expats-buying-in-dubai': {
    updated: '2026-10-21',
    summary: 'Expats can usually borrow up to 80% of the value of a first home under AED 5 million, so they need a 20% deposit, and up to 70% above that. Loans run for up to 25 years, and monthly debt repayments must stay within half of your income.',
    table: {
      title: 'Maximum loan-to-value for expat buyers',
      caption: 'Central Bank of the UAE maximum loan-to-value limits for expatriate buyers',
      head: ['Property', 'Max. loan', 'Minimum deposit'],
      rows: [
        ['First home, value up to AED 5M', '80%', '20%'],
        ['First home, value above AED 5M', '70%', '30%'],
        ['Second and further homes', '60%', '40%'],
        ['Off-plan property', '50%', '50%'],
      ],
    },
    steps: [
      { title: 'Pre-approval', text: 'A bank or broker checks your income and debts and issues a pre-approval, usually valid for 60 to 90 days.' },
      { title: 'Offer and valuation', text: 'Once your offer is accepted, the bank values the property; the loan is based on the lower of price and valuation.' },
      { title: 'Final offer', text: 'The bank issues the final offer letter and you sign the mortgage documents.' },
      { title: 'Transfer', text: 'The sale and the mortgage are registered together at a DLD trustee office on transfer day.' },
    ],
    faqs: [
      { q: 'How much deposit do expats need to buy in Dubai?', a: 'At least 20% for a first home worth up to AED 5 million, and 30% above that. Budget a further 6 to 7% for fees.' },
      { q: 'What is the maximum mortgage term in the UAE?', a: '25 years. Most banks also require the loan to end by around age 65 for salaried borrowers.' },
      { q: 'How much can I borrow on my salary?', a: 'Your total monthly debt repayments, including the new mortgage, must stay within 50% of your monthly income under Central Bank rules.' },
      { q: 'What fees come with a mortgage in Dubai?', a: 'The DLD mortgage registration fee of 0.25% of the loan plus an admin fee, the bank’s arrangement fee (capped at 1% of the loan), and a valuation fee, on top of the 4% transfer fee on the purchase.' },
      { q: 'Can I get a mortgage on an off-plan property?', a: 'Yes, but the maximum is 50% of the value, so you need to fund at least half yourself.' },
    ],
    sources: [CBUAE, DLD],
  },
};
