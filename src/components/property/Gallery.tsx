import Image from 'next/image';
import { Fragment, ViewTransition } from 'react';
import { Icon } from '@/components/icons';
import { GalleryButton } from './ModalTriggers';
import { MediaButtons } from '@/components/media/MediaButtons';

/**
 * Listing gallery. Phones: one large photo. From md: a bento of 5. The first photo
 * is the LCP element (preloaded, never animated on load); each tile opens the lightbox.
 */
export function Gallery({ images, title, location, preloadFirst = true, morphName, media }: {
  images: string[]; title: string; location: string; preloadFirst?: boolean;
  /** Video, 360° tour and floor plan links, shown as chips beside the photo count. */
  media?: { video?: string; tour?: string; floor?: string };
  /** View transition name shared with the listing card, so its photo morphs into the first tile. */
  morphName?: string;
}) {
  const n = images.length;
  const tiles = images.slice(0, 5);
  return (
    <div className="relative grid gap-2.5 md:h-[min(62vh,560px)] md:grid-cols-4 md:grid-rows-2">
      {tiles.map((src, i) => {
        const tile = (
          <GalleryButton key={src} index={i} label={`Open photo ${i + 1} of ${n}`}
            className={`group relative overflow-hidden bg-mint ${i === 0
              ? 'aspect-[4/3] rounded-[22px] md:col-span-2 md:row-span-2 md:aspect-auto md:rounded-[28px_10px_10px_28px]'
              : `max-md:hidden rounded-[10px] ${i === 2 ? 'md:rounded-tr-[28px]' : ''} ${i === 4 ? 'md:rounded-br-[28px]' : ''}`}`}>
            <Image src={src} alt={i === 0 ? `${title} in ${location}` : `${title}, photo ${i + 1}`} fill preload={preloadFirst && i === 0} fetchPriority={preloadFirst && i === 0 ? 'high' : undefined}
              sizes={i === 0 ? '(min-width: 768px) 50vw, 80vw' : '(min-width: 768px) 25vw, 1px'}
              className="object-cover zoom-slow group-hover:scale-[1.04]" />
          </GalleryButton>
        );
        return i === 0 && morphName
          ? <ViewTransition key={src} name={morphName} share="morph" default="none">{tile}</ViewTransition>
          : <Fragment key={src}>{tile}</Fragment>;
      })}
      <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center gap-2 md:right-auto">
        <GalleryButton index={0} label={`View all ${n} photos`}
          className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-[0.84rem] font-bold text-ink shadow-float transition-colors hover:text-forest">
          <Icon name="image" className="size-4" /> {n} Photos
        </GalleryButton>
        {media && <MediaButtons title={title} media={media} variant="chips" className="flex-wrap" />}
      </div>
    </div>
  );
}
