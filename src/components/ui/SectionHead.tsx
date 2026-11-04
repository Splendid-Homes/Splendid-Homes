import Link from 'next/link';
import { Icon } from '@/components/icons';
import { SplitHeading, type Segment } from '@/components/motion/SplitHeading';

/** Eyebrow + masked-reveal H2 + optional "view all" link, as in the prototype's sec-head. */
export function SectionHead({ eyebrow, title, link, linkLabel = 'View all', id, invert, children }: {
  eyebrow: string; title: Segment[]; link?: string; linkLabel?: string; id?: string; invert?: boolean; children?: React.ReactNode;
}) {
  return (
    <div className="mb-[clamp(24px,3vw,40px)] flex flex-wrap items-end justify-between gap-5">
      <div>
        <span className={`eyebrow mb-3 ${invert ? 'text-[#B9DBC2]' : ''}`}>{eyebrow}</span>
        <SplitHeading id={id} segments={title} className={`m-0 text-[clamp(1.7rem,3vw,2.6rem)] ${invert ? 'text-white [&_em]:text-[#B9DBC2]' : ''}`} />
      </div>
      {children}
      {link && (
        <Link href={link} className={`group inline-flex items-center gap-2.5 text-[0.92rem] font-bold ${invert ? 'text-white' : 'text-forest'}`}>
          {linkLabel}
          <span className={`grid size-8 place-items-center rounded-full transition-transform duration-300 group-hover:translate-x-1 ${invert ? 'soft-dark-raised' : 'soft-raised-sm'}`}>
            <Icon name="arrow" className="size-4" />
          </span>
        </Link>
      )}
    </div>
  );
}
