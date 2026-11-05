import type { Agent, Community, Project, Property } from '@/data/types';
import type { Content } from './cms';

/**
 * Lookups over a content snapshot from the CMS (see lib/cms.ts → `data()`).
 * Pure functions: safe to import from client components (no Payload code is pulled in).
 */
/** Where an agent's name links: their profile, or the contact page for the company itself. */
export const agentHref = (a: Agent) => (a.slug ? `/team/${a.slug}` : '/contact');
/** How to greet them in a message: first name, or the whole company name. */
export const agentFirst = (a: Agent) => (a.slug ? a.name.split(' ')[0] : a.name);

export function db(c: Content) {
  /** Stands in on listings and articles while no agent is published (no profile, BRN or photo of a person). */
  const company: Agent = {
    slug: '', id: 'company', name: c.site.name, title: 'Property advisors', img: '/icon.svg', languages: [], brn: '',
    phone: c.site.phone, email: c.site.email, specialties: [], deals: 0, bio: '', linkedin: '', instagram: '',
  };
  const communityBySlug = (slug: string): Community | undefined => c.communities.find(x => x.slug === slug);
  const developerBySlug = (slug: string) => c.developers.find(d => d.slug === slug);
  const agentById = (id: string): Agent => c.agents.find(a => a.id === id) ?? c.agents[0] ?? company;
  const publishedProperties = () => c.properties;
  const liveProjects = () => c.projects;
  const allPosts = () => [...c.posts].sort((a, b) => b.date.localeCompare(a.date));
  const communityCounts = (slug: string) => ({
    sale: c.properties.filter(p => p.community === slug && p.purpose === 'buy').length,
    rent: c.properties.filter(p => p.community === slug && p.purpose === 'rent').length,
    projects: c.projects.filter(p => p.community === slug).length,
  });

  return {
    communityBySlug,
    /** Community photo for page heroes (by position, wraps around); alt text comes from its name. */
    heroCommunity: (i: number) => c.communities[i % Math.max(1, c.communities.length)],
    communityName: (slug: string) => communityBySlug(slug)?.name ?? slug,
    developerBySlug,
    developerName: (slug: string) => developerBySlug(slug)?.name ?? slug,
    agentById,
    agentBySlug: (slug: string) => c.agents.find(a => a.slug === slug),
    publishedProperties,
    propertyBySlug: (slug: string) => c.properties.find(p => p.slug === slug),
    listingsFor: (purpose: Property['purpose']) => latestFirst(c.properties.filter(p => p.purpose === purpose)),
    countByType: (type: Property['type']) => c.properties.filter(p => p.type === type).length,
    listingsInCommunity: (slug: string) => c.properties.filter(p => p.community === slug).length,
    // Off-plan
    liveProjects,
    featuredProjects: () => c.projects.filter(p => p.featured),
    projectBySlug: (slug: string) => c.projects.find(p => p.slug === slug),
    handoverYears: () => [...new Set(c.projects.map(p => p.handover.match(/\d{4}/)?.[0]).filter(Boolean) as string[])].sort(),
    // Insights
    allPosts,
    latestPosts: (n: number) => allPosts().slice(0, n),
    postBySlug: (slug: string) => c.posts.find(p => p.slug === slug),
    categories: () => [...new Set(allPosts().map(p => p.cat))],
    // Market figures
    avgYield: () => (c.communities.length ? c.communities.reduce((s, x) => s + x.roi, 0) / c.communities.length : 0),
    byYield: () => [...c.communities].sort((a, b) => b.roi - a.roi),
    /** Communities in the order chosen in the CMS (Community pages > Compare table). */
    ranked: (by: 'yield' | 'price' | 'rent' | 'name') => [...c.communities].sort((a, b) =>
      by === 'price' ? b.avgSale - a.avgSale : by === 'rent' ? b.avgRent - a.avgRent : by === 'name' ? a.name.localeCompare(b.name) : b.roi - a.roi),
    communityCounts,
    /** Highlights used by at least one live project, with how many projects have each: most common first, ties in CMS order. */
    projectHighlightCounts: () => {
      const seen = new Map<string, { h: Project['highlights'][number]; n: number }>();
      for (const p of c.projects) for (const h of p.highlights) seen.set(h.id, { h, n: (seen.get(h.id)?.n ?? 0) + 1 });
      return [...seen.values()].sort((a, b) => b.n - a.n || a.h.order - b.h.order);
    },
    /** Service photo: its own image, else prototype photography (until the client's media is uploaded). */
    serviceImg: (i: number) => {
      const own = c.services[i]?.img;
      if (own) return own;
      const photos = [...new Set(c.properties.flatMap(p => p.images.slice(1)))];
      return photos[(i * 3 + 1) % Math.max(1, photos.length)];
    },
  };
}
export type Db = ReturnType<typeof db>;

export const latestFirst = (list: Property[]) => [...list].sort((a, b) => (Number(b.featured) - Number(a.featured)) || b.created.localeCompare(a.created));
export const bedsLabel = (beds: number) => (beds === 0 ? 'Studio' : `${beds} Bed${beds > 1 ? 's' : ''}`);
export const num = (n: number) => n.toLocaleString('en-US');
