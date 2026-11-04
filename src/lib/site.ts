/** Canonical site origin. Set NEXT_PUBLIC_SITE_URL in each environment. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://splendidhomes.ae').replace(/\/$/, '');

/**
 * Fixed brand facts. Everything editable (NAP, ORN, hours, socials, numbers) lives in the CMS
 * "Site settings" global and reaches pages as `site` (lib/cms.ts), so the header, footer,
 * JSON-LD and llms.txt always show identical entity data (GEO).
 */
export const BRAND = {
  name: 'Splendid Homes',
  description:
    'Splendid Homes is a RERA-regulated real estate agency in Dubai helping clients buy, rent, sell and invest in apartments, villas, penthouses, commercial space and off-plan projects.',
} as const;

export const telHref = (phone: string) => `tel:${phone.replace(/\s/g, '')}`;
export const waHref = (whatsapp: string, text?: string) =>
  `https://wa.me/${whatsapp.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

