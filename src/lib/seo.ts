import type { Metadata } from 'next';
import type { Site } from '@/data/types';
import { BRAND, SITE_URL } from './site';

/** True only on the live production deployment. Staging/test sites stay out of search indexes. */
export const IS_PRODUCTION = process.env.NEXT_PUBLIC_ENV === 'production';

export const absoluteUrl = (path = '/') => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

/** Builds page metadata with a canonical URL and matching Open Graph / Twitter tags. */
export function pageMetadata({ title, description, path, image }: { title: string; description: string; path: string; image?: string }): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', url, title, description, siteName: BRAND.name, locale: 'en_AE', images: image ? [{ url: image }] : undefined },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : undefined },
  };
}

const ORG_ID = `${SITE_URL}/#organization`;

/** Site-wide entity graph: Organization + RealEstateAgent, and WebSite. */
export function organizationJsonLd(SITE: Site) {
  const sameAs = [...Object.values(SITE.socials), SITE.googleBusinessProfile].filter(u => u && u !== '#');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['RealEstateAgent', 'Organization'],
        '@id': ORG_ID,
        name: SITE.name,
        legalName: SITE.legalName,
        description: SITE.description,
        url: SITE_URL,
        logo: absoluteUrl('/brand/logo-forest-green.svg'),
        image: absoluteUrl('/brand/logo-forest-green.svg'),
        telephone: SITE.phone,
        email: SITE.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: SITE.address.street,
          addressLocality: SITE.address.locality,
          addressCountry: SITE.address.country,
        },
        geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
        areaServed: { '@type': 'City', name: 'Dubai' },
        identifier: { '@type': 'PropertyValue', propertyID: 'RERA ORN', value: SITE.orn },
        openingHours: 'Mo-Sa 09:00-19:00',
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE.name,
        publisher: { '@id': ORG_ID },
        inLanguage: 'en-AE',
      },
    ],
  };
}
