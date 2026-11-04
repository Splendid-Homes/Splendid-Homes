import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/data/types';
import { fmtDate } from '@/lib/market';

/** Article card (homepage, insights list, related articles). Whole card is the link. */
export function PostCard({ p, heading: H = 'h3' }: { p: Post; heading?: 'h2' | 'h3' }) {
  return (
    <article data-cursor="Read" className="group relative flex flex-col rounded-[26px] soft-raised p-2.5 pb-5 transition-[translate] duration-500 ease-[cubic-bezier(.16,1,.3,1)] pointer-fine:hover:-translate-y-1">
      <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-[19px] bg-mint">
        <Image src={p.img} alt="" fill sizes="(min-width:1024px) 33vw, 100vw" data-reveal-img=""
          className="object-cover zoom-slow group-hover:scale-[1.07]" />
      </div>
      <span className="eyebrow mb-2 px-2.5 !text-[0.7rem]">{p.cat} · <time dateTime={p.date}>{fmtDate(p.date)}</time></span>
      <H className="mb-1.5 px-2.5 text-[1.25rem]">
        <Link href={`/insights/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] hover:text-forest">{p.title}</Link>
      </H>
      <p className="px-2.5 text-[0.92rem] text-muted">{p.excerpt}</p>
    </article>
  );
}
