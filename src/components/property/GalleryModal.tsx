'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/icons';
import { Modal } from '@/components/ui/Modal';

/** Full-screen photo lightbox: arrows, ←/→ keys, swipe (native scroll-snap on the thumbnails). */
export default function GalleryModal({ open, start, onClose, images, title }: { open: boolean; start: number; onClose: () => void; images: string[]; title: string }) {
  const [i, setI] = useState(start);
  const [prevStart, setPrevStart] = useState(start);
  if (start !== prevStart) { setPrevStart(start); setI(start); }
  const n = images.length;
  const go = (to: number) => setI(((to % n) + n) % n);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setI(v => (v + 1) % n);
      if (e.key === 'ArrowLeft') setI(v => (v - 1 + n) % n);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, n]);

  const arrow = 'absolute top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition-colors hover:bg-white/25';
  return (
    <Modal open={open} onClose={onClose} label={`${title} photos`} variant="full">
      <div className="flex h-svh flex-col gap-4 p-4 pt-[72px] sm:p-8 sm:pt-[76px]">
        <p className="absolute left-5 top-6 text-[0.9rem] font-semibold text-white/80" aria-live="polite">{i + 1} / {n}</p>
        <div className="relative min-h-0 flex-1">
          <Image key={images[i]} src={images[i]} alt={`${title}, photo ${i + 1} of ${n}`} fill sizes="100vw" className="object-contain" />
          <button type="button" onClick={() => go(i - 1)} aria-label="Previous photo" className={`${arrow} left-1 sm:left-3`}><Icon name="arrow" className="size-5 rotate-180" /></button>
          <button type="button" onClick={() => go(i + 1)} aria-label="Next photo" className={`${arrow} right-1 sm:right-3`}><Icon name="arrow" className="size-5" /></button>
        </div>
        <ul className="flex shrink-0 snap-x gap-2 overflow-x-auto pb-1">
          {images.map((src, k) => (
            <li key={src} className="snap-start">
              <button type="button" onClick={() => go(k)} aria-label={`Show photo ${k + 1}`} aria-current={k === i ? 'true' : undefined}
                className={`relative block h-16 w-24 overflow-hidden rounded-[10px] ring-2 transition ${k === i ? 'ring-white' : 'opacity-55 ring-transparent hover:opacity-90'}`}>
                <Image src={src} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
