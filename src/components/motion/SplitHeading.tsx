import { SplitHeadingAnimator } from './SplitHeadingAnimator';

export type Segment = { text: string; em?: boolean };

type Props = {
  segments: Segment[];
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  /** 'load' animates immediately (hero); 'scroll' when the heading enters the viewport. */
  trigger?: 'load' | 'scroll';
  delay?: number;
  id?: string;
};

/**
 * Masked word-by-word headline reveal. Rendered on the server as normal,
 * fully readable text (one word per mask). Italic <em> accents are preserved.
 * Words are only pushed below their mask by the pre-paint `motion-ok` class.
 */
export function SplitHeading({ segments, as: Tag = 'h2', className, trigger = 'scroll', delay = 0, id }: Props) {
  const words = (text: string) =>
    text.split(/(\s+)/).map((w, i) =>
      /^\s+$/.test(w) ? w : (
        <span key={i} className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-top">
          <span data-split-line className="inline-block">{w}</span>
        </span>
      ));

  return (
    <SplitHeadingAnimator trigger={trigger} delay={delay}>
      <Tag id={id} className={className}>
        {segments.map((s, i) => (s.em ? <em key={i}>{words(s.text)}</em> : <span key={i}>{words(s.text)}</span>))}
      </Tag>
    </SplitHeadingAnimator>
  );
}
