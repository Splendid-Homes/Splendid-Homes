import Image from 'next/image';
import Link from 'next/link';
import { ViewTransition } from 'react';
import { Icon } from '@/components/icons';
import { Price } from '@/components/ui/Price';
import { MediaButtons } from '@/components/media/MediaButtons';
import { CompareButton } from '@/components/ui/CompareButton';
import { EnquireButton } from '@/components/ui/EnquireButton';
import { SaveButton } from '@/components/ui/SaveButton';
import type { Property } from '@/data/types';
import { data } from '@/lib/cms';
import { agentFirst, agentHref, bedsLabel, num } from '@/lib/data';
import type { Match } from '@/lib/similar';
import { waHref } from '@/lib/site';

const badge = 'rounded-full bg-mist/93 px-2.5 py-1 text-[0.72rem] font-extrabold text-forest shadow-[2px_3px_8px_rgba(18,38,26,.2)] backdrop-blur-sm';

/**
 * Property card (soft UI): the photo sits in a raised mist frame; price with a price-per-sq-ft
 * (or per-month for rentals) chip, pressed-in spec chips, and a raised agent strip with a
 * Enquire button (opens the enquiry form) and a WhatsApp button. `wide` lays it out sideways across two columns (featured result on /buy, /rent).
 * The title is a stretched link; the save, compare, media and WhatsApp buttons sit above it.
 * `match` (similar homes on the property page) adds green/gold reason chips, plus a match % badge
 * when the match is 50% or better (a low % would put people off rather than help).
 */
export async function PropertyCard({ p, preload, wide, match }: { p: Property; preload?: boolean; wide?: boolean; match?: Match }) {
  const d = await data();
  const agent = d.agentById(p.agent);
  const href = `/property/${p.slug}`;
  const rent = p.purpose === 'rent';
  const unit = rent ? `≈ AED ${num(Math.round(p.price / 12))} / mo` : p.size ? `AED ${num(Math.round(p.price / p.size))} / sqft` : '';
  return (
    <article data-cursor="View"
      className={`group/card relative flex flex-col rounded-[24px] soft-raised p-2.5 transition-[translate] duration-500 ease-[cubic-bezier(.16,1,.3,1)] pointer-fine:hover:-translate-y-1 ${wide ? 'md:col-span-2 md:grid md:grid-cols-[1.25fr_1fr] md:gap-2' : ''}`}>
      <div className="relative">
        {/* Same name as the detail page's main photo: the photo morphs from card to page (item 16). */}
        <ViewTransition name={`property-photo-${p.id}`} share="morph" default="none">
          <Link href={href} className={`relative block overflow-hidden rounded-[17px] bg-mint ${wide ? 'aspect-[16/11] md:aspect-auto md:h-full md:min-h-[300px]' : 'aspect-[16/11]'}`} tabIndex={-1} aria-hidden="true">
            <Image src={p.images[0]} alt="" fill preload={preload} fetchPriority={preload ? 'high' : undefined} sizes={wide ? '(min-width: 1024px) 560px, (min-width: 768px) 100vw, 75vw' : '(min-width: 1240px) 400px, (min-width: 768px) 50vw, 75vw'}
              data-reveal-img="" className="object-cover zoom-slow group-hover/card:scale-[1.07]" />
            {p.images[1] && (
              // Second photo wipes up on hover. Hidden (so never fetched) on touch screens.
              <Image src={p.images[1]} alt="" fill sizes="(min-width: 1240px) 400px, 50vw" className="card-photo2 object-cover" />
            )}
            <span className="absolute left-3 top-3 flex gap-1.5">
              {match && match.pct >= d.site.propertyPage.matchMin && <span className={`${badge} bg-forest! text-white!`}>{match.pct}% match</span>}
              {p.featured && <span className={badge}>Featured</span>}
              <span className={badge}>{p.status}</span>
            </span>
          </Link>
        </ViewTransition>
        <CompareButton id={p.id} title={p.title} img={p.images[0]} className="absolute bottom-3 left-3 z-[2]" />
        <MediaButtons title={p.title} media={{ video: p.videoUrl, tour: p.tourUrl, floor: p.floorPlan }} variant="icons" className="absolute bottom-3 right-3 z-[2]" />
        <SaveButton id={p.id} title={p.title} className="absolute right-3 top-3 z-[2]" />
      </div>

      <div className={`flex flex-1 flex-col gap-2 px-2 pb-1 pt-3.5 ${wide ? 'md:justify-center md:px-4 md:py-4' : ''}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
          <Price aed={p.price} perYear={rent} className={`${wide ? 'text-[1.55rem]' : 'text-[1.3rem]'} font-extrabold tracking-[-0.02em] text-forest`} />
          {unit && <span className="rounded-full soft-inset-sm px-2.5 py-0.5 text-[0.72rem] font-bold text-muted">{unit}</span>}
        </div>
        <h3 className={`${wide ? 'text-[1.2rem]' : 'text-[1.04rem]'} font-bold leading-[1.35] tracking-[-0.01em]`}>
          <Link href={href} className="transition-colors hover:text-leaf after:absolute after:inset-0 after:content-['']">{p.title}</Link>
        </h3>
        <p className="flex items-center gap-1.5 text-[0.84rem] text-muted"><Icon name="pin" className="size-4 shrink-0" /><span className="truncate">{p.building}, {d.communityName(p.community)}</span></p>
        <ul className="flex flex-wrap gap-1.5 text-[0.78rem] font-bold text-ink-2">
          {p.type !== 'Office' && <li className="flex items-center gap-1.5 rounded-[10px] soft-inset-sm px-2.5 py-1"><Icon name="bed" className="size-4" />{bedsLabel(p.beds)}</li>}
          <li className="flex items-center gap-1.5 rounded-[10px] soft-inset-sm px-2.5 py-1"><Icon name="bath" className="size-4" />{p.baths} Bath{p.baths > 1 ? 's' : ''}</li>
          <li className="flex items-center gap-1.5 rounded-[10px] soft-inset-sm px-2.5 py-1"><Icon name="area" className="size-4" />{num(p.size)} sqft</li>
        </ul>
        {match && d.site.propertyPage.showReasons && match.reasons.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Why it's similar">
            {match.reasons.map(r => (
              <li key={r.text} className="flex items-center gap-1.5 rounded-full soft-inset-sm px-2.5 py-1 text-[0.74rem] font-bold text-ink-2">
                <span aria-hidden="true" className={`size-1.5 rounded-full ${r.diff ? 'bg-gold' : 'bg-leaf'}`} />{r.text}
              </li>
            ))}
          </ul>
        )}
        {wide && p.amenities.length > 0 && (
          <ul className="mt-1 hidden flex-wrap gap-1.5 md:flex" aria-label="Highlights">
            {p.amenities.slice(0, 5).map(a => (
              <li key={a} className="flex items-center gap-1.5 rounded-full soft-raised-sm px-3 py-1.5 text-[0.76rem] font-bold text-forest"><Icon name="check" className="size-3.5 text-gold" />{a}</li>
            ))}
          </ul>
        )}
        <div className="relative z-[2] mt-auto flex items-center justify-between gap-2 rounded-[14px] soft-raised-sm p-2 pt-2">
          <Link href={agentHref(agent)} className="flex min-w-0 items-center gap-2 text-[0.8rem] font-bold hover:text-forest">
            <Image src={agent.img} alt="" width={28} height={28} className="size-7 shrink-0 rounded-full object-cover" /><span className="truncate">{agent.name}</span>
          </Link>
          <EnquireButton info={{ propertyId: p.id, title: p.title, ref: p.ref, agentName: agent.name }} className="ml-auto" />
          <a href={waHref(agent.phone, `Hi ${agentFirst(agent)}, I'm interested in ${p.title} (ref ${p.ref}).`)} target="_blank" rel="noopener"
            aria-label={`WhatsApp ${agent.name} about ${p.title}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#127A3F] px-3 py-1.5 text-[0.74rem] font-bold text-white shadow-btn transition hover:brightness-110">
            <Icon name="wa" className="size-3.5" />WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
