import type { ComponentProps } from 'react';
import { data } from '@/lib/cms';
import { PageHero } from './PageHero';

/**
 * PageHero with the CMS on top: anything filled in under Site settings > Page heroes for `page`
 * replaces the page's own eyebrow, title, text or photo; blank fields keep what the page passes.
 * If either title field is filled, both CMS title fields are used together.
 */
export async function CmsPageHero({ page, ...props }: { page: string } & ComponentProps<typeof PageHero>) {
  const h = (await data()).site.heroes[page];
  if (!h) return <PageHero {...props} />;
  const title = h.title || h.titleItalic
    ? [...(h.title ? [{ text: h.titleItalic ? `${h.title.trimEnd()} ` : h.title }] : []), ...(h.titleItalic ? [{ text: h.titleItalic, em: true }] : [])]
    : props.title;
  return (
    <PageHero {...props} eyebrow={h.eyebrow || props.eyebrow} title={title} sub={h.sub || props.sub}
      img={h.img || props.img} alt={h.img ? h.alt || title.map(t => t.text).join('') : props.alt} />
  );
}
