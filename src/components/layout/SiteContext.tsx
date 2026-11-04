'use client';

import { createContext, useContext } from 'react';
import { setCompareMax } from '@/lib/clientStores';

type SiteInfo = {
  rates: Record<string, number>; phone: string; whatsapp: string;
  compare?: { max: number; button: string; full: string; clearAll: string; addSlot: string };
  consent?: { text: string; link: string; href: string };
  menu?: { label: string; href: string }[];
};
const Ctx = createContext<SiteInfo>({ rates: { AED: 1 }, phone: '', whatsapp: '' });

/** Small slice of CMS settings that client components need (currency rates, phone, WhatsApp). */
export function SiteProvider({ value, children }: { value: SiteInfo; children: React.ReactNode }) {
  // The compare store is module state (used outside React), so the CMS limit is applied here before any child renders.
  if (value.compare) setCompareMax(value.compare.max);
  return <Ctx value={value}>{children}</Ctx>;
}
export const useSiteInfo = () => useContext(Ctx);
