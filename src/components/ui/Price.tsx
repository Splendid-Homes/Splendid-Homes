'use client';

import { useCurrency } from '@/components/layout/CurrencySelect';
import { useSiteInfo } from '@/components/layout/SiteContext';

/**
 * Price in the visitor's chosen currency. Server HTML (and crawlers) always get AED,
 * the official listed price; the switcher only changes the display.
 */
export function Price({ aed, perYear, compact, className }: { aed: number; perYear?: boolean; compact?: boolean; className?: string }) {
  const cur = useCurrency();
  const { rates } = useSiteInfo();
  const rate = rates[cur] ?? 1;
  const v = Math.round(aed * rate);
  const amount = compact && v >= 1e6
    ? `${(v / 1e6).toFixed(v >= 1e7 ? 1 : 2).replace(/\.?0+$/, '')}M`
    : v.toLocaleString('en-US');
  return (
    <span className={className}>
      {cur} {amount}
      {perYear && <small className="ml-0.5 text-[0.62em] font-semibold opacity-70">/yr</small>}
    </span>
  );
}
