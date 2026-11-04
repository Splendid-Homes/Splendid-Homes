'use client';

import { useId, useState } from 'react';

/**
 * Sale / Rent tabs. Both panels are always server-rendered (crawlable); the inactive
 * one is hidden with the `hidden` attribute. A sliding pill marks the active tab and
 * only a user-initiated switch fades the new panel in (CSS only, no animation library).
 */
export function FeaturedTabs({ sale, rent, heading }: { sale: React.ReactNode; rent: React.ReactNode; heading: React.ReactNode }) {
  const [tab, setTab] = useState<'sale' | 'rent'>('sale');
  const [switched, setSwitched] = useState(false);
  const id = useId();
  const tabs = [['sale', 'For sale'], ['rent', 'For rent']] as const;

  return (
    <>
      <div className="mb-[clamp(24px,3vw,40px)] flex flex-wrap items-end justify-between gap-5">
        {heading}
        <div role="tablist" aria-label="Listing type" className="relative grid grid-cols-2 rounded-full soft-inset p-1.5">
          <span aria-hidden="true"
            className={`absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] rounded-full bg-forest shadow-btn transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${tab === 'rent' ? 'translate-x-full' : ''}`} />
          {tabs.map(([k, label]) => (
            <button key={k} role="tab" type="button" id={`${id}-${k}-tab`} aria-controls={`${id}-${k}`} aria-selected={tab === k}
              onClick={() => { setTab(k); setSwitched(true); }}
              className={`relative rounded-full px-5 py-2.5 text-[0.88rem] font-bold transition-colors duration-300 ${tab === k ? 'text-white' : 'text-muted hover:text-forest'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {tabs.map(([k]) => (
        <div key={k} role="tabpanel" id={`${id}-${k}`} aria-labelledby={`${id}-${k}-tab`} hidden={tab !== k}
          className={switched && tab === k ? 'motion-safe:animate-[sh-fade-up_.45s_cubic-bezier(.16,1,.3,1)]' : undefined}>
          {k === 'sale' ? sale : rent}
        </div>
      ))}
    </>
  );
}
