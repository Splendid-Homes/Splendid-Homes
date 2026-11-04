import type { Segment } from '@/components/motion/SplitHeading';
import type { HomeSectionKey, SectionCopy } from '@/payload/homeOptions';
import { data } from './cms';

/** Heading copy for a homepage section (CMS wording merged over the defaults). */
export async function sectionCopy(key: HomeSectionKey): Promise<SectionCopy> {
  const { site } = await data();
  return site.home.sections.find(s => s.key === key)!.copy;
}

/** Title as SplitHeading segments: plain start, italic middle, plain end. */
export function titleSegments(c: SectionCopy): Segment[] {
  return [
    ...(c.title ? [{ text: c.titleItalic || c.titleEnd ? `${c.title} ` : c.title }] : []),
    ...(c.titleItalic ? [{ text: c.titleItalic, em: true }] : []),
    ...(c.titleEnd ? [{ text: ` ${c.titleEnd}` }] : []),
  ];
}

/** The same title inside a plain <h2>, with the italic part in <em>. */
export function TitleText({ c, emClassName }: { c: SectionCopy; emClassName?: string }) {
  return <>{titleSegments(c).map((s, i) => (s.em ? <em key={i} className={emClassName}>{s.text}</em> : s.text))}</>;
}
