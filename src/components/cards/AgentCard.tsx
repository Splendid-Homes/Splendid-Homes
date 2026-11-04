import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/icons';
import type { Agent } from '@/data/types';
import { waHref } from '@/lib/site';
import { data } from '@/lib/cms';

/**
 * Team member tile (team page, about page, homepage strip). No star ratings until real reviews exist.
 * Hover reveal (homepage round 3, item 12): on desktop pointers the photo starts slightly muted,
 * turns full colour and lifts on hover, and a panel slides up with languages, specialties, BRN and
 * a WhatsApp button. On touch screens the photo is full colour and the panel always shows.
 * The name is a stretched link, so the WhatsApp button can sit inside the card without nesting links.
 */
export async function AgentCard({ a, heading: H = 'h3' }: { a: Agent; heading?: 'h2' | 'h3' }) {
  const T = (await data()).site.aboutTeam.text;
  return (
    <div data-cursor="View" className="group relative rounded-[26px] soft-raised p-2.5 pb-4 text-center">
      <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-[19px] bg-mint">
        <Image src={a.img} alt={`${a.name}, ${a.title}`} fill sizes="(min-width:1024px) 25vw, 50vw" data-reveal-img=""
          className="object-cover zoom-slow transition-[filter] duration-700 group-hover:scale-[1.07] pointer-fine:grayscale-[45%] pointer-fine:group-hover:grayscale-0 pointer-fine:group-focus-within:grayscale-0" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-deep/90 via-deep/60 to-transparent px-4 pb-4 pt-12 text-left text-white transition-[translate,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)] pointer-fine:translate-y-full pointer-fine:opacity-0 pointer-fine:group-hover:translate-y-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-within:translate-y-0 pointer-fine:group-focus-within:opacity-100">
          <p className="mb-2 flex flex-wrap gap-1">
            {a.specialties.slice(0, 2).map(s => <span key={s} className="rounded-full bg-white/15 px-2 py-0.5 text-[0.7rem] font-semibold backdrop-blur-sm">{s}</span>)}
          </p>
          <p className="text-[0.76rem] text-white/80"><Icon name="globe" className="mr-1 inline size-3.5 align-[-2px]" />{a.languages.join(' · ')}</p>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <span className="text-[0.72rem] text-white/70">BRN {a.brn}</span>
            <a href={waHref(a.phone, T.cardMessage.replaceAll('{first}', a.name.split(' ')[0]))} target="_blank" rel="noopener"
              aria-label={`WhatsApp ${a.name}`} data-cursor-off=""
              className="pointer-events-auto relative z-[3] inline-flex items-center gap-1.5 rounded-full bg-[#1FA855] px-3 py-1.5 text-[0.74rem] font-bold text-white transition-[filter] hover:brightness-110">
              <Icon name="wa" className="size-3.5" />{T.cardWhatsapp}
            </a>
          </div>
        </div>
      </div>
      <H className="mb-0.5 text-[1.2rem] transition-colors group-hover:text-forest">
        <Link href={`/team/${a.slug}`} className="after:absolute after:inset-0 after:z-[1] after:content-['']">{a.name}</Link>
      </H>
      <p className="text-[0.88rem] text-muted">{a.title}</p>
      <small className="mt-1 block text-[0.78rem] text-muted">{a.languages.join(' · ')} · BRN {a.brn}</small>
    </div>
  );
}
