'use client';

import { useSyncExternalStore } from 'react';
import { Icon } from '@/components/icons';
import { SoftSelect } from '@/components/ui/SoftSelect';
import { useSiteInfo } from './SiteContext';

const KEY = 'sh_currency';
const listeners = new Set<() => void>();
const read = () => { try { return localStorage.getItem(KEY) ?? 'AED'; } catch { return 'AED'; } };

export function setCurrency(c: string) {
  try { localStorage.setItem(KEY, c); } catch { /* storage unavailable */ }
  listeners.forEach(l => l());
}
/** Visitor's chosen display currency (AED on the server and first paint). */
export function useCurrency() {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, read, () => 'AED');
}

export function CurrencySelect({ className = '' }: { className?: string }) {
  const cur = useCurrency();
  const { rates } = useSiteInfo();
  return (
    <span className={`inline-flex items-center gap-1 text-[0.82rem] ${className}`}>
      <Icon name="globe" className="size-4" />
      <SoftSelect variant="dark" label="Currency" value={cur} onChange={setCurrency} align="right"
        options={Object.keys(rates).map(c => ({ value: c, label: c }))} />
    </span>
  );
}
