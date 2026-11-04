'use client';

import { useState } from 'react';
import { Icon } from '@/components/icons';

/**
 * Click-to-load map. The Google Maps embed (~1 MB of third-party JS) is only requested
 * when the visitor asks for it, so it never costs LCP/INP on page load.
 */
export function MapFacade({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const [on, setOn] = useState(false);
  const q = `${lat},${lng}`;
  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-card soft-inset max-sm:aspect-[4/3]">
      {on ? (
        <iframe title={`Map of ${label}`} src={`https://www.google.com/maps?q=${q}&z=14&output=embed`} loading="lazy"
          referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 size-full border-0" />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_45%,var(--color-mint),var(--color-mist)_70%)]">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-forest text-white shadow-btn"><Icon name="pin" className="size-6" /></span>
            <p className="font-bold">{label}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => setOn(true)} className="rounded-full bg-white px-5 py-2.5 text-[0.88rem] font-bold text-forest shadow-float transition-colors hover:bg-forest hover:text-white">
                Show map
              </button>
              <a href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener"
                className="rounded-full border border-line-strong bg-white/70 px-5 py-2.5 text-[0.88rem] font-bold transition-colors hover:border-forest hover:text-forest">
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
