'use client';

import { useRowLabel } from '@payloadcms/ui';
import { HERO_PAGES } from '../heroPages';

/** Names each Page heroes row after its page ("Buy", "Contact"…) instead of "Page 01". */
export function HeroRowLabel() {
  const { data, rowNumber } = useRowLabel<{ page?: string }>();
  return <span>{HERO_PAGES.find(([k]) => k === data?.page)?.[1] ?? `Page ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`}</span>;
}
