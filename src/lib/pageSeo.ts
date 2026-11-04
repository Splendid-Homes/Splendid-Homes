import type { Metadata } from 'next';
import { data } from '@/lib/cms';
import { pageMetadata } from '@/lib/seo';
import type { SeoPageKey } from '@/payload/seoDefaults';

/** pageMetadata with the Google title / description from CMS > Page SEO when set (otherwise the page's automatic text). */
export async function cmsPageMetadata(key: SeoPageKey, meta: Parameters<typeof pageMetadata>[0]): Promise<Metadata> {
  const o = (await data()).site.seo[key];
  return pageMetadata({ ...meta, title: o?.title || meta.title, description: o?.description || meta.description });
}
