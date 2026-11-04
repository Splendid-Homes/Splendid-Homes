'use client';

import { useSyncExternalStore } from 'react';

/** The media pop-up (video, 360° tour or floor plan) that is open, from any card or page. */
export type MediaKind = 'video' | 'tour' | 'floor';
export type MediaState = { kind: MediaKind; src: string; title: string } | null;

let state: MediaState = null;
let returnFocus: HTMLElement | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

export function openMedia(next: Exclude<MediaState, null>) {
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  state = next;
  emit();
}

export function closeMedia() {
  state = null;
  emit();
  requestAnimationFrame(() => returnFocus?.focus({ preventScroll: true }));
}

export const useMedia = () => useSyncExternalStore(
  cb => { listeners.add(cb); return () => listeners.delete(cb); },
  () => state,
  () => null,
);
