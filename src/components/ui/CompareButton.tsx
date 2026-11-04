'use client';

import { Icon } from '@/components/icons';
import { toggleCompare, useCompare } from '@/lib/clientStores';

/** Adds a property to the compare tray (limit set in the CMS, saved on this device). */
export function CompareButton({ id, title, img, variant = 'card', className = '' }: {
  id: string; title: string; img: string; variant?: 'card' | 'page'; className?: string;
}) {
  const on = useCompare().some(x => x.id === id);
  const look = variant === 'card'
    ? `h-8 px-3 text-[0.74rem] shadow-fav ${on ? 'bg-forest text-white' : 'bg-white/92 text-ink hover:bg-white hover:text-forest'}`
    : `h-10 border px-4 text-[0.85rem] ${on ? 'border-transparent bg-forest text-white shadow-btn' : 'soft-raised text-ink hover:text-forest active:soft-pressed'}`;
  return (
    <button type="button" onClick={e => { e.preventDefault(); toggleCompare({ id, title, img }); }}
      aria-pressed={on} aria-label={on ? `Remove ${title} from compare` : `Add ${title} to compare`}
      className={`inline-flex items-center gap-1.5 rounded-full font-bold transition-colors duration-200 ${look} ${className}`}>
      <Icon name={on ? 'check' : 'compare'} className="size-[15px]" />{on ? 'Comparing' : 'Compare'}
    </button>
  );
}
