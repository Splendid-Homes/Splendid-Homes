'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/icons';
import { useSiteInfo } from '@/components/layout/SiteContext';
import { clearCompare, COMPARE_MAX, removeCompare, useCompare } from '@/lib/clientStores';

/**
 * Bottom tray listing the properties picked for comparison (limit set in the CMS, saved on this device).
 * Hidden on /compare itself. Shows a short notice when a fourth pick is refused.
 */
export function CompareTray() {
  const items = useCompare();
  const T = useSiteInfo().compare ?? { button: 'Compare', full: 'You can compare up to {max} properties', clearAll: 'Clear all', addSlot: 'Add a property' };
  const path = usePathname();
  const [full, setFull] = useState(false);
  useEffect(() => {
    let t = 0;
    const on = () => { setFull(true); window.clearTimeout(t); t = window.setTimeout(() => setFull(false), 3200); };
    window.addEventListener('compare:full', on);
    return () => { window.removeEventListener('compare:full', on); window.clearTimeout(t); };
  }, []);
  if (!items.length || path === '/compare') return null;

  return (
    <aside aria-label="Compare properties"
      className="compare-tray fixed inset-x-3 bottom-3 z-[96] mx-auto max-w-[680px] rounded-[20px] bg-deep p-3 text-white shadow-menu motion-safe:animate-[sh-tray-in_0.45s_cubic-bezier(.16,1,.3,1)] sm:bottom-5">
      <p aria-live="polite" className={`absolute inset-x-0 -top-10 mx-auto w-max rounded-full bg-gold px-4 py-1.5 text-[0.8rem] font-bold text-deep transition-opacity duration-300 ${full ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        {full ? T.full.replaceAll('{max}', String(COMPARE_MAX)) : ''}
      </p>
      <div className="flex items-center gap-3">
        <ul className="flex min-w-0 flex-1 gap-2">
          {Array.from({ length: COMPARE_MAX }, (_, i) => items[i]).map((it, i) => it ? (
            <li key={it.id} className="group relative flex min-w-0 flex-1 items-center gap-2 rounded-[12px] bg-white/[0.04] soft-dark-inset p-1.5 pr-7">
              <Image src={it.img} alt="" width={44} height={44} className="size-11 shrink-0 rounded-[9px] object-cover" />
              <span className="line-clamp-2 text-[0.74rem] font-semibold leading-tight max-sm:hidden">{it.title}</span>
              <button type="button" onClick={() => removeCompare(it.id)} aria-label={`Remove ${it.title} from compare`}
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white">
                <Icon name="close" className="size-3.5" />
              </button>
            </li>
          ) : (
            <li key={`empty-${i}`} className="grid min-w-0 flex-1 place-items-center rounded-[12px] border border-dashed border-white/20 p-1.5 text-[0.72rem] text-white/50 max-sm:hidden">
              {T.addSlot}
            </li>
          ))}
        </ul>
        <div className="flex shrink-0 flex-col items-stretch gap-1">
          <Link href="/compare"
            className={`btn-sweep inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[0.85rem] font-bold hover:text-deep ${items.length < 2 ? 'bg-white/15 text-white/80' : 'bg-on-dark text-deep shadow-[-3px_-3px_8px_rgba(255,255,255,0.07),4px_4px_10px_rgba(0,0,0,0.5),inset_1px_1px_0_rgba(255,255,255,0.55)] active:soft-dark-pressed'}`}>
            <Icon name="compare" className="size-4" />{T.button} ({items.length})
          </Link>
          <button type="button" onClick={clearCompare} className="text-[0.72rem] font-semibold text-white/60 transition-colors hover:text-white">{T.clearAll}</button>
        </div>
      </div>
    </aside>
  );
}
