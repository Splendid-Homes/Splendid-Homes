'use client';

import { useSyncExternalStore } from 'react';

/** The listing a card's "Enquire" button opened the enquiry dialog for (one dialog for the whole site). */
export type EnquiryInfo = { propertyId: string; title: string; ref: string; agentName: string };

let state: EnquiryInfo | null = null;
let returnFocus: HTMLElement | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

export function openEnquiry(info: EnquiryInfo) {
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  state = info;
  emit();
}

export function closeEnquiry() {
  state = null;
  emit();
  requestAnimationFrame(() => returnFocus?.focus({ preventScroll: true }));
}

export const useEnquiry = () => useSyncExternalStore(
  cb => { listeners.add(cb); return () => listeners.delete(cb); },
  () => state,
  () => null,
);
