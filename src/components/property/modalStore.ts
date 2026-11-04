'use client';

import { useSyncExternalStore } from 'react';

/** Which property-page modal is open. Shared by the sidebar, sticky bar and gallery triggers. */
export type ModalState = { kind: 'viewing' } | { kind: 'gallery'; index: number } | null;

let state: ModalState = null;
let returnFocus: HTMLElement | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

export function openModal(next: Exclude<ModalState, null>) {
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  state = next;
  emit();
}

export function closeModal() {
  state = null;
  emit();
  // Give focus back to the control that opened the dialog.
  requestAnimationFrame(() => returnFocus?.focus({ preventScroll: true }));
}

export const useModal = () => useSyncExternalStore(
  cb => { listeners.add(cb); return () => listeners.delete(cb); },
  () => state,
  () => null,
);
