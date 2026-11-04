import type { Property, PropertyType, Purpose } from '@/data/types';
import { bedsLabel, type Db, latestFirst } from './data';

/** Listing filters live in the URL (shareable, bookmarkable; F04). Empty values are dropped. */
export type Filters = {
  q?: string;
  community?: string;
  type?: PropertyType;
  beds?: string; // '0'…'4' or '5+'
  min?: number;
  max?: number;
  status?: Property['status'];
  furnishing?: Property['furnishing'];
  sort?: SortKey;
  page?: number;
};

export const TYPES: PropertyType[] = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Office'];
export const BEDS = ['0', '1', '2', '3', '4', '5+'] as const;
export const FURNISHING: Property['furnishing'][] = ['Furnished', 'Unfurnished', 'Fitted'];
export const STATUS: Property['status'][] = ['Ready', 'Off-plan'];
export const SORTS = {
  featured: 'Featured',
  newest: 'Newest',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  size: 'Largest first',
} as const;
export type SortKey = keyof typeof SORTS;

type Raw = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const pick = <T extends string>(v: string | undefined, list: readonly T[]) => (v && (list as readonly string[]).includes(v) ? (v as T) : undefined);
const int = (v: string | undefined) => { const n = Number(v); return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined; };

/** Parses and whitelists query params; anything unknown is ignored. */
export function parseFilters(sp: Raw, communitySlugs: string[]): Filters {
  return {
    q: one(sp.q)?.slice(0, 80),
    community: pick(one(sp.community), communitySlugs),
    type: pick(one(sp.type), TYPES),
    beds: pick(one(sp.beds), BEDS),
    min: int(one(sp.min)),
    max: int(one(sp.max)),
    status: pick(one(sp.status), STATUS),
    furnishing: pick(one(sp.furnishing), FURNISHING),
    sort: pick(one(sp.sort), Object.keys(SORTS) as SortKey[]),
    page: int(one(sp.page)),
  };
}

const SORTERS: Record<Exclude<SortKey, 'featured'>, (a: Property, b: Property) => number> = {
  newest: (a, b) => b.created.localeCompare(a.created),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  size: (a, b) => b.size - a.size,
};

/** `defaultSort` applies when the URL has no sort (Buy & Rent pages > Results in the CMS). */
export function filterListings(d: Db, purpose: Purpose, f: Filters, defaultSort: SortKey = 'featured') {
  const sort = f.sort ?? defaultSort;
  const kw = f.q?.toLowerCase();
  const list = d.publishedProperties().filter(p =>
    p.purpose === purpose
    && (!f.community || p.community === f.community)
    && (!f.type || p.type === f.type)
    && (!f.beds || (f.beds === '5+' ? p.beds >= 5 : p.beds === Number(f.beds)))
    && (!f.min || p.price >= f.min)
    && (!f.max || p.price <= f.max)
    && (!f.status || p.status === f.status)
    && (!f.furnishing || p.furnishing === f.furnishing)
    && (!kw || `${p.title} ${p.ref} ${p.building} ${d.communityName(p.community)}`.toLowerCase().includes(kw)));
  return sort === 'featured' ? latestFirst(list) : [...list].sort(SORTERS[sort]);
}

/** Builds a listing URL from filters, dropping empty values and page 1. */
export function listingHref(purpose: Purpose, f: Filters, patch: Partial<Filters> = {}) {
  const next = { ...f, ...patch };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) {
    if (v === undefined || v === '' || (k === 'page' && v === 1)) continue;
    qs.set(k, String(v));
  }
  const s = qs.toString();
  return `/${purpose}${s ? `?${s}` : ''}`;
}

export const shortAed = (n: number) => (n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : `${Math.round(n / 1e3)}K`);

/** Human-readable chips for the active filters, each with the URL that removes it. */
export function activeChips(d: Db, purpose: Purpose, f: Filters) {
  const chips: { label: string; href: string }[] = [];
  const drop = (patch: Partial<Filters>) => listingHref(purpose, f, { ...patch, page: undefined });
  if (f.q) chips.push({ label: `“${f.q}”`, href: drop({ q: undefined }) });
  if (f.community) chips.push({ label: d.communityName(f.community), href: drop({ community: undefined }) });
  if (f.type) chips.push({ label: f.type, href: drop({ type: undefined }) });
  if (f.beds) chips.push({ label: f.beds === '5+' ? '5+ Beds' : bedsLabel(Number(f.beds)), href: drop({ beds: undefined }) });
  if (f.min) chips.push({ label: `From AED ${shortAed(f.min)}`, href: drop({ min: undefined }) });
  if (f.max) chips.push({ label: `Up to AED ${shortAed(f.max)}`, href: drop({ max: undefined }) });
  if (f.status) chips.push({ label: f.status, href: drop({ status: undefined }) });
  if (f.furnishing) chips.push({ label: f.furnishing, href: drop({ furnishing: undefined }) });
  return chips;
}
