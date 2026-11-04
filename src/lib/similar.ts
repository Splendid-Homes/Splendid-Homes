import type { Community, Property } from '@/data/types';
import { num } from '@/lib/data';

/** One reason shown on a similar-home card; `diff` marks a difference (gold) rather than a match (green). */
export interface MatchReason { text: string; diff?: boolean }
export interface Match { pct: number; reasons: MatchReason[] }

/** Straight-line distance in km between two [lat, lng] points. */
export const km = ([a1, o1]: [number, number], [a2, o2]: [number, number]) => {
  const r = Math.PI / 180;
  const h = Math.sin(((a2 - a1) * r) / 2) ** 2 + Math.cos(a1 * r) * Math.cos(a2 * r) * Math.sin(((o2 - o1) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};

/**
 * Scores every other listing of the same purpose against `p` (out of 100): price (30), bedrooms (20),
 * location (20: same community, or by distance between community centres), size (10), type (10),
 * ready/off-plan (5) and shared amenities (5). Returns the best `limit` with a match % and up to
 * three plain reasons, best match first.
 */
export function similarHomes(p: Property, all: Property[], community: (slug: string) => Community | undefined, limit = 3) {
  const home = community(p.community);
  return all
    .filter(x => x.id !== p.id && x.purpose === p.purpose && (p.type === 'Office') === (x.type === 'Office'))
    .map(x => {
      const priceGap = (x.price - p.price) / p.price;
      const sizeGap = p.size ? (x.size - p.size) / p.size : 0;
      const sameArea = x.community === p.community;
      const c = community(x.community);
      const dist = sameArea ? 0 : home && c ? km(home.coords, c.coords) : 99;
      const shared = x.amenities.filter(a => p.amenities.includes(a));

      const score =
        30 * Math.max(0, 1 - Math.abs(priceGap) / 0.3) +
        (x.beds === p.beds ? 20 : Math.abs(x.beds - p.beds) === 1 ? 10 : 0) +
        (sameArea ? 20 : dist <= 5 ? 14 : dist <= 10 ? 8 : 0) +
        10 * Math.max(0, 1 - Math.abs(sizeGap) / 0.4) +
        (x.type === p.type ? 10 : 0) +
        (x.status === p.status ? 5 : 0) +
        (p.amenities.length ? (5 * shared.length) / p.amenities.length : 5);

      const reasons: MatchReason[] = [];
      if (sameArea) reasons.push({ text: 'Same community' });
      else if (dist <= 10 && c) reasons.push({ text: `${c.name}, ${Math.max(1, Math.round(dist))} km away` });
      if (x.type !== 'Office' && x.beds === p.beds) reasons.push({ text: `${x.beds ? `${x.beds} beds` : 'Studio'}, like this one` });
      if (Math.abs(priceGap) < 0.03) reasons.push({ text: 'Same price range' });
      else if (priceGap <= -0.5) reasons.push({ text: 'Lower budget', diff: true });
      else if (priceGap < 0) reasons.push({ text: `${Math.round(-priceGap * 100)}% cheaper` });
      else if (priceGap >= 0.5) reasons.push({ text: 'Higher budget', diff: true });
      else reasons.push({ text: `${Math.round(priceGap * 100)}% more`, diff: true });
      if (Math.abs(x.size - p.size) >= 50) reasons.push({ text: `${num(Math.abs(x.size - p.size))} sq ft ${x.size > p.size ? 'bigger' : 'smaller'}`, diff: true });
      if (x.view && x.view === p.view) reasons.push({ text: `${/view/i.test(x.view) ? x.view : `${x.view} view`} too` });
      if (shared.length) reasons.push({ text: shared.slice(0, 2).join(' & ') });
      if (x.status !== p.status) reasons.push({ text: x.status === 'Ready' ? 'Ready to move in' : 'Off-plan', diff: true });

      // Matches first, then at most one difference, so the card leads with why it fits.
      const top = [...reasons.filter(r => !r.diff).slice(0, 2), ...reasons.filter(r => r.diff).slice(0, 1)];
      const fill = reasons.filter(r => !top.includes(r) && !r.diff);
      return { p: x, match: { pct: Math.min(99, Math.round(score)), reasons: [...top, ...fill].slice(0, 3) } as Match };
    })
    .sort((a, b) => b.match.pct - a.match.pct)
    .slice(0, limit);
}
