import Image from 'next/image';
import Link from 'next/link';
import { Icon, type IconName } from '@/components/icons';

export type TypeRow = {
  label: string; href: string; meta: string; blurb: string; img: string; icon: IconName; count: number;
  caption: { title: string; place: string } | null;
};

/**
 * Vivid deck for "Browse by budget" in soft UI: each card is a raised ivory frame holding a
 * full-colour photo (with a raised icon badge), then the band name on a raised label and its
 * count in a pressed-in chip beside a raised arrow button. Hover lifts the card higher, zooms the photo and turns the arrow green; pressing pushes
 * the card in. Phones and tablets: a swipe row. Styles: .vdeck-* in globals.css.
 */
export function TypeShowcase({ rows }: { rows: TypeRow[] }) {
  return (
    <ul className="vdeck">
      {rows.map(r => (
        <li key={r.label}>
          <Link href={r.href} data-cursor="View" aria-label={`${r.label}: ${r.meta}`} className="vdeck-card group">
            <span className="vdeck-photo">
              <Image src={r.img} alt="" fill sizes="(min-width:1024px) 240px, 70vw" className="vdeck-img object-cover" />
              <span aria-hidden="true" className="vdeck-badge"><Icon name={r.icon} className="size-5" /></span>
            </span>
            <span className="mx-1 mt-3.5 block truncate rounded-[14px] soft-raised-sm px-3.5 py-2.5 text-[1.05rem] font-extrabold leading-tight text-ink">{r.label}</span>
            <span className="flex items-center justify-between gap-3 px-1 pb-1 pt-3">
              <span className="rounded-full soft-inset-sm px-3.5 py-1.5 text-[0.8rem] font-semibold text-ink-2">{r.meta}</span>
              <span className="grid size-10 shrink-0 place-items-center rounded-full soft-raised-sm text-forest transition-[background-color,color,box-shadow,rotate] duration-300 group-hover:-rotate-45 group-hover:bg-forest group-hover:text-white group-hover:shadow-btn">
                <Icon name="arrow" className="size-4" />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
