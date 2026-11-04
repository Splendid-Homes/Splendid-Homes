/** Where a lead came from: worked out in the visitor's browser on their first page of the visit. */
export const LEAD_SOURCES = [
  { value: 'google', label: 'Google search' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'bing', label: 'Bing search' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'portal', label: 'Property portal' },
  { value: 'email', label: 'Email' },
  { value: 'referral', label: 'Other website' },
  { value: 'direct', label: 'Direct visit' },
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number]['value'];

const RULES: [RegExp, LeadSource][] = [
  [/instagram/, 'instagram'], [/facebook|fb\.|^fb$|^meta$/, 'facebook'], [/tiktok/, 'tiktok'], [/linkedin|lnkd/, 'linkedin'],
  [/youtube|youtu\.be/, 'youtube'], [/whatsapp|wa\.me/, 'whatsapp'], [/propertyfinder|bayut|dubizzle/, 'portal'],
  [/mail|newsletter/, 'email'], [/google/, 'google'], [/bing/, 'bing'],
];

/** Campaign tags win over the referring site; visits with neither are direct. Holds no personal data. */
export function detectSource(search: string, referrer: string, host: string): LeadSource {
  const q = new URLSearchParams(search);
  const medium = (q.get('utm_medium') ?? '').toLowerCase();
  const tag = (q.get('utm_source') ?? '').toLowerCase();
  if (q.has('gclid') || (tag.includes('google') && /cpc|ppc|paid/.test(medium))) return 'google_ads';
  if (q.has('fbclid') && !tag) return 'facebook';
  let from = tag;
  if (!from && referrer) {
    try { const h = new URL(referrer).hostname; if (h !== host) from = h; } catch { /* unreadable referrer */ }
  }
  if (!from) return 'direct';
  return RULES.find(([re]) => re.test(from))?.[1] ?? 'referral';
}

export const SOURCE_KEY = 'sh_src';
export const isLeadSource = (v: unknown): v is LeadSource => LEAD_SOURCES.some(s => s.value === v);
