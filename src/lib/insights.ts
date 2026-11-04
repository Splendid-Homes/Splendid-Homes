import type { Post } from '@/data/types';

/** Editorial extras are fields on the post itself (edited in the CMS). */
export const extrasFor = (p: Post) => p;
export const modifiedDate = (p: Post) => p.updated ?? p.date;

type LexNode = { text?: string; children?: LexNode[] };
/** Plain text of a Lexical rich-text value (or a legacy string[] body). */
export function richText(value: unknown): string {
  if (Array.isArray(value)) return value.join(' ');
  const walk = (n?: LexNode): string => (n ? [n.text ?? '', ...(n.children ?? []).map(walk)].join(' ') : '');
  return walk((value as { root?: LexNode } | null)?.root).replace(/\s+/g, ' ').trim();
}

/** All visible article text, for wordCount and reading time. */
export function articleText(p: Post) {
  return [p.excerpt, p.summary, richText(p.body), ...(p.takeaways ?? []), ...(p.steps ?? []).map(s => `${s.title} ${s.text}`),
    ...(p.table?.rows.flat() ?? []), ...(p.faqs ?? []).flatMap(f => [f.q, f.a])].filter(Boolean).join(' ');
}
export const wordCount = (p: Post) => articleText(p).split(/\s+/).filter(Boolean).length;
export const readingMinutes = (p: Post) => Math.max(1, Math.round(wordCount(p) / 220));
