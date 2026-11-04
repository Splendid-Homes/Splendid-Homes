'use client';

import { useEffect } from 'react';
import { detectSource, SOURCE_KEY } from '@/payload/leadSources';

/** Remembers where this visit started, so a lead sent from a later page still credits the right source. */
export function LeadSourceTracker() {
  useEffect(() => {
    try {
      if (!sessionStorage.getItem(SOURCE_KEY)) sessionStorage.setItem(SOURCE_KEY, detectSource(location.search, document.referrer, location.hostname));
    } catch { /* storage unavailable */ }
  }, []);
  return null;
}
