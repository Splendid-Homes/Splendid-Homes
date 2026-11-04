import type { MetadataRoute } from 'next';
import { absoluteUrl, IS_PRODUCTION } from '@/lib/seo';
import { SITEMAP_IDS } from './sitemap';

const AI_CRAWLERS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'];

export default function robots(): MetadataRoute.Robots {
  // Staging / test deployments are never indexed.
  if (!IS_PRODUCTION) return { rules: [{ userAgent: '*', disallow: '/' }] };

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
      // Answer engines and AI search are explicitly welcome on public pages (GEO).
      { userAgent: AI_CRAWLERS, allow: '/', disallow: ['/admin', '/api/'] },
    ],
    sitemap: SITEMAP_IDS.map(id => absoluteUrl(`/sitemap/${id}.xml`)),
    host: absoluteUrl('/'),
  };
}
