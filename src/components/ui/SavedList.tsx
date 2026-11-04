'use client';

import Link from 'next/link';
import { useFavs } from '@/lib/clientStores';
import type { CompareSavedText } from '@/payload/compareSavedDefaults';

/**
 * Shortlist saved on this device. The server renders every published card; this shows only the
 * saved ones (favourites live in localStorage, so the server cannot know them).
 */
export function SavedList({ cards, text: T, buttons: [b1, b2] }: { cards: { id: string; card: React.ReactNode }[]; text: CompareSavedText; buttons: [boolean, boolean] }) {
  const favs = useFavs();
  const saved = cards.filter(c => favs.includes(c.id));
  if (!saved.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-line-strong bg-mist px-6 py-14 text-center">
        <p className="mb-1 text-[1.2rem] font-bold">{T.savedEmptyTitle}</p>
        <p className="mb-6 text-ink-2">{T.savedEmptyText}</p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {b1 && <Link href={T.savedBtn1Href} className="rounded-full bg-forest px-6 py-3 font-bold text-white">{T.savedBtn1}</Link>}
          {b2 && <Link href={T.savedBtn2Href} className="rounded-full soft-raised active:soft-pressed px-6 py-3 font-bold">{T.savedBtn2}</Link>}
        </div>
      </div>
    );
  }
  return (
    <>
      <h2 className="mb-6 text-[clamp(1.2rem,2vw,1.5rem)]" aria-live="polite">{(saved.length === 1 ? T.savedOne : T.savedMany).replaceAll('{n}', String(saved.length))}</h2>
      <div className="grid gap-[clamp(18px,2.4vw,30px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr))]">
        {saved.map(c => <div key={c.id} className="contents">{c.card}</div>)}
      </div>
    </>
  );
}
