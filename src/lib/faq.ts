import type { Agent, Community, Project, Property } from '@/data/types';
import { bedsLabel, num } from './data';
import type { Faq } from './schema';
import { aOrAn } from './offplan';
import { FEE_DEFAULTS, type Fees } from '@/payload/feeDefaults';

/**
 * Designated freehold areas (foreign nationals may own outright) among the communities we list.
 * Kept explicit so an answer is only given when it is true for that community.
 */
const FREEHOLD = new Set(['palm-jumeirah', 'downtown-dubai', 'dubai-marina', 'dubai-hills-estate', 'business-bay',
  'jumeirah-village-circle', 'arabian-ranches', 'dubai-creek-harbour', 'emirates-hills']);

const aed = (n: number) => `AED ${num(Math.round(n))}`;

/**
 * Listing FAQ (AEO). Every answer is built from this listing's own data or from
 * standing Dubai rules (DLD 4% transfer fee, AED 2M Golden Visa threshold, Ejari),
 * and opens with the direct answer.
 */
export function propertyFaqs(p: Property, c: Community | undefined, agent: Agent, f: Fees = FEE_DEFAULTS): Faq[] {
  const GOLDEN_VISA_AED = f.goldenVisaAed;
  const area = c?.name ?? 'Dubai';
  const rent = p.purpose === 'rent';
  const perSqft = aed(p.price / p.size);
  const rooms = p.type === 'Office' ? `${p.baths} bathroom${p.baths > 1 ? 's' : ''}` : `${bedsLabel(p.beds).toLowerCase()} and ${p.baths} bathroom${p.baths > 1 ? 's' : ''}`;
  const faqs: Faq[] = [
    {
      q: `How much is ${p.title}?`,
      a: rent
        ? `${p.title} is available to rent for ${aed(p.price)} per year (about ${aed(p.price / 12)} a month). That works out at ${perSqft} per sq ft a year for ${num(p.size)} sq ft in ${p.building}, ${area}.`
        : `${p.title} is listed for sale at ${aed(p.price)}, which is ${perSqft} per sq ft for ${num(p.size)} sq ft in ${p.building}, ${area}.`,
    },
    {
      q: `How big is this ${p.type.toLowerCase()} and how many rooms does it have?`,
      a: `It has ${num(p.size)} sq ft of built-up area with ${rooms}. It is ${p.furnishing.toLowerCase()}, has ${p.parking} parking space${p.parking === 1 ? '' : 's'} and ${p.view} views.`,
    },
  ];

  if (rent) {
    faqs.push({
      q: 'How is the rent paid and what else do tenants need?',
      a: 'Rent can be paid in up to 4 cheques across the year. Every tenancy contract in Dubai must be registered with Ejari, and landlords usually ask for a refundable security deposit; our team handles the paperwork for you.',
    });
  } else {
    faqs.push({
      q: 'What is the service charge?',
      a: `The service charge is AED ${p.serviceCharge} per sq ft a year, roughly ${aed(p.serviceCharge * p.size)} annually for this ${p.type.toLowerCase()}. It covers building or community maintenance, security and shared facilities.`,
    });
    if (c && FREEHOLD.has(c.slug)) {
      faqs.push({
        q: `Can foreigners buy property in ${area}?`,
        a: `Yes. ${area} is a designated freehold area, so foreign nationals can buy and own property there outright, with the title deed registered with the Dubai Land Department.`,
      });
    }
    faqs.push({
      q: 'Does this property qualify for a UAE Golden Visa?',
      a: p.price >= GOLDEN_VISA_AED
        ? `Yes, it can. Owning property worth ${aed(GOLDEN_VISA_AED)} or more can make the owner eligible for a 10-year UAE Golden Visa, subject to the rules in force when you apply.`
        : `Not on its own. The property route to a 10-year UAE Golden Visa starts at ${aed(GOLDEN_VISA_AED)} in property value; our team can explain other options.`,
    });
    faqs.push({
      q: 'What are the costs of buying on top of the price?',
      a: `Plan for ${f.buyCostsLabel} on top of the price. The main item is the Dubai Land Department transfer fee of ${f.dldPct}% (${aed(p.price * f.dldPct / 100)} here), plus trustee and title-deed registration fees and agency commission, typically ${f.buyerAgencyPct}% plus VAT.`,
    });
  }

  faqs.push(
    {
      q: 'How do I book a viewing?',
      a: `Use "Book a viewing" on this page to pick a day and time, or message ${agent.brn ? `${agent.name} (BRN ${agent.brn})` : agent.name} on WhatsApp. Viewings run Monday to Saturday and we confirm by phone.`,
    },
    {
      q: 'Is this listing verified?',
      a: `Yes. It is advertised under Dubai Land Department permit ${p.permit} with reference ${p.ref}, and handled by ${agent.brn ? `RERA-registered broker ${agent.name} (BRN ${agent.brn})` : agent.name}.`,
    },
  );
  return faqs;
}

/**
 * Community FAQ (AEO): 6 questions answered from the community's own figures (with the
 * same source as the stats block), our live listing counts and the freehold allow-list.
 */
export function communityFaqs(c: Community, counts: { sale: number; rent: number; projects: number }, dubaiAvgYield: number, communityCount: number): Faq[] {
  const above = c.roi >= dubaiAvgYield;
  const faqs: Faq[] = [
    {
      q: `Is ${c.name} good for investment?`,
      a: `${c.name} offers an average gross rental yield of about ${c.roi}%, ${above ? 'above' : 'below'} the ${dubaiAvgYield.toFixed(1)}% average across the ${communityCount} Dubai communities we cover. Homes sell for around AED ${num(c.avgSale)} per sq ft, so returns depend on the building, view and purchase price.`,
    },
    {
      q: `What is the average rent in ${c.name}?`,
      a: `The average annual rent in ${c.name} is about AED ${num(c.avgRent)}, or roughly AED ${num(Math.round(c.avgRent / 12))} a month. Rents vary with size, view and furnishing, and are usually paid in 1 to 4 cheques.`,
    },
    {
      q: `How much does property cost in ${c.name}?`,
      a: `Property in ${c.name} sells for an average of AED ${num(c.avgSale)} per sq ft, which puts a 1,000 sq ft home at about AED ${num(c.avgSale * 1000)}. Prime units with the best views and finishes sell for more.`,
    },
  ];
  if (FREEHOLD.has(c.slug)) {
    faqs.push({
      q: `Can foreigners buy property in ${c.name}?`,
      a: `Yes. ${c.name} is a designated freehold area, so foreign nationals can buy and own property there outright, with the title deed registered with the Dubai Land Department.`,
    });
  }
  faqs.push(
    {
      q: `What is ${c.name} known for?`,
      a: `${c.desc} Highlights include ${c.highlights.join(', ').replace(/, ([^,]*)$/, ' and $1')}.`,
    },
    {
      q: `How many properties are available in ${c.name}?`,
      a: `We currently list ${counts.sale} ${counts.sale === 1 ? 'property' : 'properties'} for sale and ${counts.rent} for rent in ${c.name}${counts.projects ? `, plus ${counts.projects} off-plan ${counts.projects === 1 ? 'project' : 'projects'}` : ''}. Many homes reach us before they are advertised, so ask our team for off-market options.`,
    },
  );
  return faqs;
}

/**
 * Off-plan project FAQ (AEO): price, payment plan, handover, units, ownership, Golden Visa and
 * buyer protection. Built from the project record plus standing rules (escrow under Dubai
 * Law No. 8 of 2007, AED 2M Golden Visa threshold, freehold allow-list).
 */
export function projectFaqs(p: Project, c: Community | undefined, developer: string, f: Fees = FEE_DEFAULTS): Faq[] {
  const GOLDEN_VISA_AED = f.goldenVisaAed;
  const area = c?.name ?? 'Dubai';
  const plan = p.plan.map(m => `${m.pct}% ${m.label.toLowerCase()}`).join(', ').replace(/, ([^,]*)$/, ' and $1');
  const types = p.units.map(u => u.type).join(', ').replace(/, ([^,]*)$/, ' and $1');
  const faqs: Faq[] = [
    { q: `How much does ${p.name} cost?`, a: `Prices at ${p.name} start from AED ${num(p.startPrice)}. ${p.units.map(u => `${u.type} units (${u.size} sq ft) start from AED ${num(u.from)}`).join('; ')}.` },
    { q: `What is the payment plan for ${p.name}?`, a: `${p.name} has ${aOrAn(p.paymentPlan)} ${p.paymentPlan} payment plan: ${plan}. On the starting price that is AED ${num(Math.round(p.startPrice * p.plan[0].pct / 100))} to secure a unit.` },
    { q: `When is the handover of ${p.name}?`, a: `Handover is scheduled for ${p.handover}. Dates are set by ${developer} and can move with construction progress; we keep buyers updated at each milestone.` },
    { q: `What unit types are available?`, a: `${p.name} offers ${types}, subject to availability at the time of booking. Ask us for the latest price list and floor plans.` },
  ];
  if (c && FREEHOLD.has(c.slug)) faqs.push({ q: `Can foreigners buy at ${p.name}?`, a: `Yes. ${area} is a freehold area, so foreign nationals can buy off-plan there and own the unit outright once it is registered with the Dubai Land Department.` });
  faqs.push(
    { q: 'Is my money protected when buying off-plan?', a: 'Yes. Payments for registered off-plan projects in Dubai go into an escrow account regulated under Law No. 8 of 2007, and are released to the developer against verified construction progress.' },
    {
      q: 'Does an off-plan purchase qualify for the Golden Visa?',
      a: p.startPrice >= GOLDEN_VISA_AED
        ? `It can. Off-plan property worth ${aed(GOLDEN_VISA_AED)} or more from an approved developer can make the buyer eligible for a 10-year UAE Golden Visa, subject to the rules in force when you apply.`
        : `Larger units can. Off-plan property worth ${aed(GOLDEN_VISA_AED)} or more from an approved developer can qualify for a 10-year UAE Golden Visa; units below that threshold do not on their own.`,
    },
  );
  return faqs;
}
