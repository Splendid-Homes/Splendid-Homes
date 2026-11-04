'use client';

import { openModal } from './modalStore';

type Props = { className?: string; children: React.ReactNode };

/** Opens the "Book a viewing" dialog. Preloads the dialog code on hover/focus. */
export function ViewingButton({ className, children }: Props) {
  return (
    <button type="button" aria-haspopup="dialog" className={className}
      onPointerEnter={preloadModals} onFocus={preloadModals}
      onClick={() => openModal({ kind: 'viewing' })}>
      {children}
    </button>
  );
}

/** Opens the photo lightbox at a given image. */
export function GalleryButton({ index, label, className, children }: Props & { index: number; label: string }) {
  return (
    <button type="button" aria-haspopup="dialog" aria-label={label} className={className}
      onPointerEnter={preloadModals} onFocus={preloadModals}
      onClick={() => openModal({ kind: 'gallery', index })}>
      {children}
    </button>
  );
}

let preloaded = false;
/** Warm the lazily loaded dialog chunks before the click lands. */
export function preloadModals() {
  if (preloaded) return;
  preloaded = true;
  void import('./ViewingModal');
  void import('./GalleryModal');
}
