import type { Agent, Community, Project, Property } from '@/data/types';
import { absoluteUrl } from './seo';
import { BRAND, SITE_URL } from './site';

/** Structured-data builders (JSON-LD). Every type here is validated in docs/schema-notes.md. */

export type Crumb = { name: string; href: string };
export type Faq = { q: string; a: string };

const ORG_ID = `${SITE_URL}/#organization`;

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: absoluteUrl(c.href) })),
  };
}

export function faqJsonLd(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

/** schema.org type for the dwelling being offered. */
const ACCOMMODATION: Record<Property['type'], string> = {
  Apartment: 'Apartment',
  Penthouse: 'Apartment',
  Villa: 'SingleFamilyResidence',
  Townhouse: 'House',
  Office: 'Place',
};

/**
 * Property page: RealEstateListing (the page) whose mainEntity is the home itself
 * (floorSize, rooms, address, geo) and whose Offer carries the AED price.
 * Rentals are priced per year (UnitPriceSpecification, unitCode ANN).
 * Geo is the community's coordinates until the CMS stores exact listing pins.
 */
export function listingJsonLd(p: Property, c: Community | undefined, agent: Agent) {
  const url = absoluteUrl(`/property/${p.slug}`);
  const isHome = p.type !== 'Office';
  const place = {
    '@type': ACCOMMODATION[p.type],
    '@id': `${url}#property`,
    name: p.title,
    address: {
      '@type': 'PostalAddress',
      streetAddress: p.building,
      addressLocality: c?.name ?? 'Dubai',
      addressRegion: 'Dubai',
      addressCountry: 'AE',
    },
    ...(c ? { geo: { '@type': 'GeoCoordinates', latitude: c.coords[0], longitude: c.coords[1] } } : {}),
    ...(isHome ? {
      floorSize: { '@type': 'QuantitativeValue', value: p.size, unitCode: 'FTK', unitText: 'sq ft' },
      numberOfRooms: p.beds + p.baths,
      numberOfBedrooms: p.beds,
      numberOfBathroomsTotal: p.baths,
      amenityFeature: p.amenities.map(a => ({ '@type': 'LocationFeatureSpecification', name: a, value: true })),
      ...(p.completion && /^\d{4}$/.test(p.completion) ? { yearBuilt: Number(p.completion) } : {}),
    } : {}),
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': `${url}#listing`,
    url,
    name: p.title,
    description: p.desc,
    image: p.images,
    datePosted: p.created,
    inLanguage: 'en-AE',
    identifier: [
      { '@type': 'PropertyValue', propertyID: 'Reference', value: p.ref },
      ...(p.permit ? [{ '@type': 'PropertyValue', propertyID: `${p.authority?.trim() || 'DLD'} Permit No.`, value: p.permit }] : []),
    ],
    mainEntity: place,
    offers: {
      '@type': 'Offer',
      url,
      price: p.price,
      priceCurrency: 'AED',
      businessFunction: p.purpose === 'rent' ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell',
      ...(p.purpose === 'rent' ? {
        priceSpecification: { '@type': 'UnitPriceSpecification', price: p.price, priceCurrency: 'AED', unitCode: 'ANN', referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'ANN' } },
      } : {}),
      itemOffered: { '@id': `${url}#property` },
      offeredBy: { '@id': ORG_ID },
    },
    provider: { '@id': ORG_ID },
    author: !agent.slug ? { '@id': ORG_ID } : {
      '@type': 'Person',
      name: agent.name,
      jobTitle: agent.title,
      telephone: agent.phone,
      url: absoluteUrl(`/team/${agent.slug}`),
      identifier: { '@type': 'PropertyValue', propertyID: 'RERA BRN', value: agent.brn },
      worksFor: { '@id': ORG_ID, name: BRAND.name },
    },
  };
}

/** Community page: the area as a Place inside Dubai, with its headline market figures. */
export function placeJsonLd(c: Community, figures: { source: string; updated: string }) {
  const url = absoluteUrl(`/community/${c.slug}`);
  const stat = (name: string, value: number, unitText: string) => ({ '@type': 'PropertyValue', name, value, unitText, description: `${figures.source}, updated ${figures.updated}` });
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    '@id': `${url}#place`,
    url,
    name: c.name,
    description: c.desc,
    image: c.img,
    slogan: c.tag,
    geo: { '@type': 'GeoCoordinates', latitude: c.coords[0], longitude: c.coords[1] },
    address: { '@type': 'PostalAddress', addressLocality: c.name, addressRegion: 'Dubai', addressCountry: 'AE' },
    containedInPlace: { '@type': 'City', name: 'Dubai', sameAs: 'https://en.wikipedia.org/wiki/Dubai' },
    amenityFeature: c.highlights.map(h => ({ '@type': 'LocationFeatureSpecification', name: h, value: true })),
    additionalProperty: [
      stat('Average sale price per sq ft', c.avgSale, 'AED per sq ft'),
      stat('Average annual rent', c.avgRent, 'AED per year'),
      stat('Average gross rental yield', c.roi, 'percent'),
    ],
  };
}

/** Index pages: an ItemList of links (communities, listings). */
export function itemListJsonLd(name: string, items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: absoluteUrl(it.href) })),
  };
}

/**
 * Off-plan project page: RealEstateListing whose mainEntity is the development
 * (ApartmentComplex or Residence) and whose AggregateOffer spans the unit prices.
 */
export function projectJsonLd(p: Project, c: Community | undefined, developerName: string, range: { low: number; high: number }) {
  const url = absoluteUrl(`/off-plan/${p.slug}`);
  const apartments = p.units.some(u => /bed|studio/i.test(u.type)) && !/villa|mansion|townhouse/i.test(p.name + p.units.map(u => u.type).join(' '));
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': `${url}#listing`,
    url,
    name: p.name,
    description: p.desc,
    image: p.images,
    inLanguage: 'en-AE',
    mainEntity: {
      '@type': apartments ? 'ApartmentComplex' : 'Residence',
      '@id': `${url}#project`,
      name: p.name,
      address: { '@type': 'PostalAddress', addressLocality: c?.name ?? 'Dubai', addressRegion: 'Dubai', addressCountry: 'AE' },
      ...(c ? { geo: { '@type': 'GeoCoordinates', latitude: c.coords[0], longitude: c.coords[1] } } : {}),
      amenityFeature: p.amenities.map(a => ({ '@type': 'LocationFeatureSpecification', name: a, value: true })),
    },
    about: { '@type': 'Organization', name: developerName, description: 'Developer' },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'AED',
      lowPrice: range.low,
      highPrice: range.high,
      offerCount: p.units.length,
      businessFunction: 'http://purl.org/goodrelations/v1#Sell',
      itemOffered: { '@id': `${url}#project` },
      offeredBy: { '@id': ORG_ID },
    },
    provider: { '@id': ORG_ID },
  };
}

/** Insights article: BlogPosting with a credentialed author (Person + RERA BRN) and cited sources. */
export function blogPostingJsonLd(a: {
  slug: string; title: string; excerpt: string; summary?: string; img: string; cat: string; date: string; modified: string;
  words: number; author: Agent; sources: { label: string; url: string }[];
}) {
  const url = absoluteUrl(`/insights/${a.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: a.title,
    description: a.excerpt,
    ...(a.summary ? { abstract: a.summary } : {}),
    image: [a.img],
    datePublished: a.date,
    dateModified: a.modified,
    articleSection: a.cat,
    wordCount: a.words,
    inLanguage: 'en-AE',
    isAccessibleForFree: true,
    author: !a.author.slug ? { '@id': ORG_ID } : {
      '@type': 'Person',
      name: a.author.name,
      jobTitle: a.author.title,
      image: a.author.img,
      url: absoluteUrl(`/team/${a.author.slug}`),
      knowsLanguage: a.author.languages,
      identifier: { '@type': 'PropertyValue', propertyID: 'RERA BRN', value: a.author.brn },
      worksFor: { '@id': ORG_ID, name: BRAND.name },
    },
    publisher: { '@id': ORG_ID },
    citation: a.sources.map(s => ({ '@type': 'CreativeWork', name: s.label, url: s.url.startsWith('/') ? absoluteUrl(s.url) : s.url })),
  };
}

/** Team member profile: ProfilePage whose mainEntity is the agent (Person + RERA BRN). */
export function profileJsonLd(a: Agent) {
  const url = absoluteUrl(`/team/${a.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    mainEntity: {
      '@type': 'Person',
      '@id': `${url}#person`,
      name: a.name,
      jobTitle: a.title,
      description: a.bio,
      image: a.img,
      url,
      telephone: a.phone,
      email: a.email,
      knowsLanguage: a.languages,
      knowsAbout: a.specialties,
      identifier: { '@type': 'PropertyValue', propertyID: 'RERA BRN', value: a.brn },
      worksFor: { '@id': ORG_ID, name: BRAND.name },
    },
  };
}

/** Developer page: the developer as an Organization (founding year, description). */
export function developerJsonLd(d: { slug: string; name: string; desc: string; founded: number }) {
  const url = absoluteUrl(`/developer/${d.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${url}#organization`,
    url,
    name: d.name,
    description: d.desc,
    foundingDate: String(d.founded),
    areaServed: { '@type': 'City', name: 'Dubai' },
  };
}
