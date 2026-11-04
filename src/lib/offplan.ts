import type { Project } from '@/data/types';
import type { Db } from './data';

/** Off-plan list filters (URL params; unknown values ignored). */
export type ProjectFilters = { developer?: string; community?: string; year?: string; max?: number };

type Raw = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

/** `budgets`: the budget choices from the CMS (Off-plan pages); other values in the URL are ignored. */
export function parseProjectFilters(sp: Raw, d: Db & { c: { developers: { slug: string }[]; communities: { slug: string }[] } }, budgets: number[]): ProjectFilters {
  const developer = one(sp.developer), community = one(sp.community), year = one(sp.year), max = Number(one(sp.max));
  return {
    developer: d.c.developers.some(x => x.slug === developer) ? developer : undefined,
    community: d.c.communities.some(x => x.slug === community) ? community : undefined,
    year: year && d.handoverYears().includes(year) ? year : undefined,
    max: budgets.includes(max) ? max : undefined,
  };
}

export function filterProjects(d: Db, f: ProjectFilters) {
  return d.liveProjects()
    .filter(p => (!f.developer || p.developer === f.developer) && (!f.community || p.community === f.community)
      && (!f.year || p.handover.includes(f.year)) && (!f.max || p.startPrice <= f.max))
    .sort((a, b) => Number(b.featured) - Number(a.featured));
}

/** AED amount due at each payment-plan milestone for a given price. */
export const planSchedule = (p: Project, price = p.startPrice) => p.plan.map(m => ({ ...m, amount: Math.round((price * m.pct) / 100) }));

/** Highest "from" price across unit types (for AggregateOffer.highPrice). */
export const priceRange = (p: Project) => ({ low: Math.min(p.startPrice, ...p.units.map(u => u.from)), high: Math.max(p.startPrice, ...p.units.map(u => u.from)) });

/** "an 80/20 plan" vs "a 60/40 plan": numbers read aloud as eighty / eleven / eighteen take "an". */
export const aOrAn = (plan: string) => (/^(8|11|18)/.test(plan) ? 'an' : 'a');
