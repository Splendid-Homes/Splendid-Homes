import Image from 'next/image';
import Link from 'next/link';
import { Icon, type IconName } from '@/components/icons';
import { Price } from '@/components/ui/Price';
import type { Project } from '@/data/types';
import { data } from '@/lib/cms';

const glass = 'rounded-full bg-mist/93 px-3 py-1.5 text-[0.74rem] font-extrabold text-forest shadow-[2px_3px_8px_rgba(18,38,26,.2)] backdrop-blur-sm';

/**
 * Off-plan project card (soft UI): same layout as before, with the photo in a raised mist frame,
 * frosted status / payment-plan chips and pressed-in price and handover wells.
 * `onDark` swaps the light soft shadow for a drop shadow (homepage off-plan band).
 */
export async function ProjectCard({ p, onDark }: { p: Project; onDark?: boolean }) {
  const d = await data();
  return (
    <Link href={`/off-plan/${p.slug}`} data-cursor="View"
      className={`group/card flex flex-col rounded-[24px] p-2.5 text-ink transition-[translate] duration-500 ease-[cubic-bezier(.16,1,.3,1)] pointer-fine:hover:-translate-y-1 ${onDark ? 'bg-mist shadow-[0_22px_44px_-18px_rgba(0,0,0,.6)]' : 'soft-raised'}`}>
      <div className="relative aspect-[16/11] overflow-hidden rounded-[17px] bg-mint">
        <Image src={p.img} alt="" fill sizes="(min-width: 1240px) 400px, (min-width: 640px) 50vw, 100vw"
          data-reveal-img="" className="object-cover zoom-slow group-hover/card:scale-[1.07]" />
        <span className={`absolute left-3 top-3 ${glass}`}>{p.status}</span>
        <span className="absolute right-3 top-3 rounded-full bg-forest px-3 py-1.5 text-[0.74rem] font-extrabold text-white shadow-btn">{p.paymentPlan}</span>
        {p.highlights.length > 0 && (
          // Desktop pointers: this project's highlights drop down as a frosted panel on hover/focus.
          <ul aria-label="Highlights" className="hl-drop">
            {p.highlights.map((h, i) => (
              <li key={h.id} style={{ '--i': i } as React.CSSProperties}><Icon name={h.icon as IconName} className="size-4 shrink-0 text-gold" />{h.label}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex flex-1 flex-col px-2.5 pb-1.5 pt-4">
        <span className="text-[0.8rem] font-bold uppercase tracking-[0.06em] text-muted">{d.developerName(p.developer)}</span>
        <h3 className="mb-1.5 mt-0.5 text-[1.25rem]">{p.name}</h3>
        <p className="mb-3 flex items-center gap-1.5 text-[0.86rem] text-muted"><Icon name="pin" className="size-4" />{d.communityName(p.community)}</p>
        {p.highlights.length > 0 && (
          // Touch screens (no hover): up to 3 chips, then "+n".
          <ul aria-label="Highlights" className="mb-3 flex flex-wrap gap-1.5 pointer-fine:hidden">
            {p.highlights.slice(0, 3).map(h => (
              <li key={h.id} title={h.label} className="inline-flex items-center gap-1.5 rounded-full soft-inset-sm px-2.5 py-1 text-[0.74rem] font-bold text-forest">
                <Icon name={h.icon as IconName} className="size-3.5" />{h.short}
              </li>
            ))}
            {p.highlights.length > 3 && (
              <li title={p.highlights.slice(3).map(h => h.label).join(', ')} className="rounded-full soft-inset-sm px-2.5 py-1 text-[0.74rem] font-bold text-muted">+{p.highlights.length - 3}</li>
            )}
          </ul>
        )}
        <div className="mt-auto grid grid-cols-2 gap-2">
          <div className="rounded-[14px] soft-inset-sm px-3.5 py-2.5"><small className="block text-[0.7rem] font-extrabold uppercase tracking-[0.05em] text-muted">Starting from</small><Price aed={p.startPrice} className="text-[0.98rem] font-extrabold text-forest" /></div>
          <div className="rounded-[14px] soft-inset-sm px-3.5 py-2.5"><small className="block text-[0.7rem] font-extrabold uppercase tracking-[0.05em] text-muted">Handover</small><b className="text-[0.98rem] font-extrabold text-forest">{p.handover}</b></div>
        </div>
      </div>
    </Link>
  );
}
