'use client';

import { Icon, type IconName } from '@/components/icons';
import { openMedia, type MediaKind } from './mediaStore';

const META: Record<MediaKind, { icon: IconName; label: string }> = {
  video: { icon: 'play', label: 'Video' },
  tour: { icon: 'cube', label: '360° Tour' },
  floor: { icon: 'layers', label: 'Floor plan' },
};

type Media = { video?: string; tour?: string; floor?: string };
let preloaded = false;
const preload = () => { if (!preloaded) { preloaded = true; void import('./MediaModal'); } };

/**
 * Video / 360° tour / floor plan triggers for a listing. `icons`: small round buttons on cards;
 * `chips`: labelled pills on the property gallery. Only the media a listing has are shown.
 */
export function MediaButtons({ title, media, variant, className = '' }: { title: string; media: Media; variant: 'icons' | 'chips'; className?: string }) {
  const items = (['video', 'tour', 'floor'] as const).flatMap(kind => (media[kind] ? [{ kind, src: media[kind] }] : []));
  if (!items.length) return null;
  return (
    <span className={`flex gap-1.5 ${className}`}>
      {items.map(({ kind, src }) => (
        <button key={kind} type="button" aria-haspopup="dialog" aria-label={`${META[kind].label}: ${title}`} title={META[kind].label}
          onPointerEnter={preload} onFocus={preload}
          onClick={e => { e.preventDefault(); e.stopPropagation(); openMedia({ kind, src, title }); }}
          className={variant === 'icons'
            ? 'grid size-8 place-items-center rounded-full bg-white/92 text-ink shadow-fav transition-colors hover:bg-white hover:text-forest'
            : 'inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-[0.84rem] font-bold text-ink shadow-float transition-colors hover:text-forest'}>
          <Icon name={META[kind].icon} className="size-4" />{variant === 'chips' && META[kind].label}
        </button>
      ))}
    </span>
  );
}
