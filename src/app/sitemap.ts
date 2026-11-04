import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';
import { data } from '@/lib/cms';

/** One sitemap per content type: /sitemap/pages.xml, /sitemap/properties.xml, … */
export const SITEMAP_IDS = ['pages', 'properties', 'projects', 'communities', 'developers', 'insights', 'team'] as const;
type SitemapId = (typeof SITEMAP_IDS)[number];

const STATIC_PAGES = ['/', '/buy', '/rent', '/commercial', '/off-plan', '/communities', '/developers', '/sell', '/services', '/mortgage', '/team', '/insights', '/about', '/careers', '/contact'];

export async function generateSitemaps() {
  return SITEMAP_IDS.map(id => ({ id }));
}

export default async function sitemap({ id }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const type = (await id) as SitemapId;
  const { agents, communities, developers, posts, projects, properties } = (await data()).c;
  const entry = (path: string, lastModified?: string, priority = 0.6): MetadataRoute.Sitemap[number] =>
    ({ url: absoluteUrl(path), lastModified: lastModified ? new Date(lastModified) : undefined, priority });

  switch (type) {
    case 'pages': return STATIC_PAGES.map(p => entry(p, undefined, p === '/' ? 1 : 0.8));
    case 'properties': return properties.filter(p => p.published).map(p => entry(`/property/${p.slug}`, p.created, 0.9));
    case 'projects': return projects.filter(p => p.published).map(p => entry(`/off-plan/${p.slug}`, undefined, 0.8));
    case 'communities': return communities.map(c => entry(`/community/${c.slug}`, undefined, 0.8));
    case 'developers': return developers.map(d => entry(`/developer/${d.slug}`));
    case 'insights': return posts.map(p => entry(`/insights/${p.slug}`, p.date, 0.7));
    case 'team': return agents.map(a => entry(`/team/${a.slug}`, undefined, 0.5));
    default: return [];
  }
}
