'use client';

import { SoftSelect } from '@/components/ui/SoftSelect';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export type FilterField = { name: string; label: string; any: string; options: [string, string][] };

/**
 * Small GET filter bar (works without JS). With JS each change replaces the URL in place
 * and the server re-renders the results passed as children, which dim while loading.
 * Controlled selects keep keyboard focus; state follows the URL (chips, back button).
 */
export function AutoFilterForm({ action, label, fields, values, children }: {
  action: string; label: string; fields: FilterField[]; values: Record<string, string>; children: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [v, setV] = useState(values);
  const [prev, setPrev] = useState(values);
  if (prev !== values) { setPrev(values); setV(values); }

  const apply = (next: Record<string, string>) => {
    const qs = new URLSearchParams();
    for (const [k, val] of Object.entries(next)) if (val) qs.set(k, val);
    start(() => router.replace(`${action}${qs.size ? `?${qs}` : ''}`, { scroll: false }));
  };

  return (
    <>
      <form method="get" action={action} role="search" aria-label={label} onSubmit={e => { e.preventDefault(); apply(v); }}
        className="grid grid-cols-2 gap-2.5 rounded-[24px] soft-card bg-white p-3 sm:p-4 lg:grid-cols-[repeat(4,1fr)_auto]">
        {fields.map(f => (
          <SoftSelect key={f.name} variant="filter" label={f.label} name={f.name} value={v[f.name] ?? ''}
            onChange={val => { const next = { ...v, [f.name]: val }; setV(next); apply(next); }}
            options={[{ value: '', label: f.any }, ...f.options.map(([val, text]) => ({ value: val, label: text }))]} />
        ))}
        <noscript><button className="rounded-field bg-forest px-5 py-3 font-bold text-white">Apply</button></noscript>
      </form>
      <div aria-busy={pending} className={`transition-opacity duration-300 ${pending ? 'pointer-events-none opacity-55' : ''}`}>{children}</div>
    </>
  );
}
