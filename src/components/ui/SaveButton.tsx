'use client';

import { Icon } from '@/components/icons';
import { toggleFav, useFavs } from '@/lib/clientStores';

/** Heart toggle for the shortlist (saved on this device, no account needed). CSS-only press feedback. */
export function SaveButton({ id, title, className = '' }: { id: string; title: string; className?: string }) {
  const saved = useFavs().includes(id);
  return (
    <button
      type="button"
      onClick={e => { e.preventDefault(); toggleFav(id); }}
      aria-pressed={saved} aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      className={`grid size-10 place-items-center rounded-full bg-white shadow-fav transition-[color,transform,box-shadow] duration-200 active:scale-[0.9] active:soft-pressed ${saved ? 'text-[#e0485a] shadow-[inset_2px_2px_5px_rgba(18,38,26,0.22),inset_-2px_-2px_5px_#fff]' : 'text-ink hover:text-forest'} ${className}`}
    >
      <Icon name="heart" className={`size-[18px] transition-transform duration-300 ${saved ? 'scale-110 fill-current' : ''}`} />
    </button>
  );
}

export function SavedCount() {
  const n = useFavs().length;
  if (!n) return null;
  return (
    <i className="absolute -right-[3px] -top-[3px] min-w-[18px] rounded-[9px] bg-on-dark px-1 text-center text-[10px] font-bold not-italic leading-[18px] text-deep" aria-hidden="true">{n}</i>
  );
}
