'use client';

import { SoftSelect } from '@/components/ui/SoftSelect';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Icon } from '@/components/icons';
import { Price } from '@/components/ui/Price';
import type { Property } from '@/data/types';
import { clearCompare, COMPARE_MAX, removeCompare, toggleCompare, useCompare } from '@/lib/clientStores';
import { bedsLabel, num } from '@/lib/data';
import type { CompareConfig, CompareRowKey } from '@/payload/compareSavedDefaults';

export type CompareRow = Pick<Property, 'id' | 'slug' | 'title' | 'purpose' | 'type' | 'price' | 'beds' | 'baths' | 'size' | 'building' | 'community' | 'developer' | 'status' | 'completion' | 'serviceCharge' | 'furnishing' | 'view' | 'parking'>
  & { img: string; communityName: string; developerName: string };

const label = 'mb-1.5 block text-[0.78rem] font-semibold tracking-[0.04em] text-muted';

const ppsf = (r: CompareRow) => Math.round(r.price / r.size);
/** Index of the best value in a row (lowest or highest), or -1 when there is nothing to choose between. */
function best(values: number[], want: 'min' | 'max') {
  if (values.length < 2 || values.every(v => v === values[0])) return -1;
  const target = want === 'min' ? Math.min(...values) : Math.max(...values);
  return values.indexOf(target);
}

/**
 * Side-by-side comparison of up to COMPARE_MAX listings (picked on cards, the detail page or here).
 * The picker narrows listings by purpose, location, developer and price band.
 */
export function CompareView({ rows, cfg }: { rows: CompareRow[]; cfg: CompareConfig }) {
  const T = cfg.text;
  const fill = (s: string, n?: number) => s.replaceAll('{max}', String(COMPARE_MAX)).replaceAll('{n}', String(n ?? ''));
  const picked = useCompare();
  const chosen = picked.map(x => rows.find(r => r.id === x.id)).filter((r): r is CompareRow => Boolean(r));
  const [purpose, setPurpose] = useState<'buy' | 'rent'>(chosen[0]?.purpose ?? 'buy');
  const [community, setCommunity] = useState('');
  const [developer, setDeveloper] = useState('');
  const [band, setBand] = useState('');

  const pool = rows.filter(r => r.purpose === purpose);
  const communities = [...new Map(pool.map(r => [r.community, r.communityName])).entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const developers = [...new Map(pool.filter(r => r.developer).map(r => [r.developer, r.developerName])).entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const bands = purpose === 'buy' ? cfg.buyBands : cfg.rentBands;
  const range = band ? bands[Number(band)] : undefined;
  const [min, max] = [range?.min ?? 0, range?.max ?? Infinity];
  const matches = pool.filter(r => (!community || r.community === community) && (!developer || r.developer === developer) && r.price >= min && r.price < max);
  const full = chosen.length >= COMPARE_MAX;
  const mixed = new Set(chosen.map(r => r.purpose)).size > 1;

  const cells: Record<CompareRowKey, { cells: React.ReactNode[]; bestAt?: number }> = {
    price: { cells: chosen.map(r => <Price key={r.id} aed={r.price} perYear={r.purpose === 'rent'} className="font-extrabold text-forest" />), bestAt: mixed ? -1 : best(chosen.map(r => r.price), 'min') },
    ppsf: { cells: chosen.map(r => <span key={r.id}><Price aed={ppsf(r)} /><small className="text-muted"> / sq ft</small></span>), bestAt: mixed ? -1 : best(chosen.map(ppsf), 'min') },
    location: { cells: chosen.map(r => <span key={r.id}>{r.building}, <Link href={`/community/${r.community}`} className="font-semibold text-forest hover:underline">{r.communityName}</Link></span>) },
    developer: { cells: chosen.map(r => (r.developer
      ? <Link key={r.id} href={`/developer/${r.developer}`} className="font-semibold text-forest hover:underline">{r.developerName}</Link>
      : <span key={r.id} className="text-muted">—</span>)) },
    purpose: { cells: chosen.map(r => (r.purpose === 'rent' ? T.rentWord : T.saleWord)) },
    type: { cells: chosen.map(r => r.type) },
    beds: { cells: chosen.map(r => (r.type === 'Office' ? '—' : bedsLabel(r.beds))), bestAt: best(chosen.map(r => r.beds), 'max') },
    baths: { cells: chosen.map(r => String(r.baths)) },
    size: { cells: chosen.map(r => `${num(r.size)} sq ft`), bestAt: best(chosen.map(r => r.size), 'max') },
    status: { cells: chosen.map(r => r.status) },
    completion: { cells: chosen.map(r => r.completion || '—') },
    serviceCharge: { cells: chosen.map(r => (r.purpose === 'rent' ? T.landlordPays : `AED ${r.serviceCharge} / sq ft / yr`)), bestAt: chosen.some(r => r.purpose === 'rent') ? -1 : best(chosen.map(r => r.serviceCharge), 'min') },
    furnishing: { cells: chosen.map(r => r.furnishing) },
    view: { cells: chosen.map(r => r.view || '—') },
    parking: { cells: chosen.map(r => (r.parking ? `${r.parking} space${r.parking > 1 ? 's' : ''}` : '—')) },
  };
  // Rows, their order and labels come from CMS > Compare & Saved pages.
  const specs = chosen.length
    ? cfg.rows.filter(r => cells[r.key]).map(r => ({ label: r.label, cells: cells[r.key].cells, bestAt: cfg.showBest ? cells[r.key].bestAt : -1 }))
    : [];

  return (
    <>
      {chosen.length > 0 ? (
        <div className="mb-[clamp(40px,6vw,72px)]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[clamp(1.3rem,2.2vw,1.7rem)]" aria-live="polite">{fill(T.comparing, chosen.length)}</h2>
            <button type="button" onClick={clearCompare} className="text-[0.88rem] font-semibold text-muted transition-colors hover:text-forest">{T.clearAll}</button>
          </div>
          {mixed && <p className="mb-4 rounded-field soft-inset-sm px-4 py-3 text-[0.88rem] text-ink-2">{T.mixedNote}</p>}
          <div className="overflow-x-auto rounded-[26px] soft-raised p-2">
            <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-[0.92rem]">
              <caption className="sr-only">Selected properties compared side by side</caption>
              <thead>
                <tr>
                  <td className="sticky left-0 z-[1] w-[170px] bg-mist p-4 align-bottom text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-muted">{T.propertyHead}</td>
                  {chosen.map(r => (
                    <th key={r.id} scope="col" className="p-4 align-top font-normal">
                      <div className="relative mb-3 aspect-[16/11] overflow-hidden rounded-[12px] bg-mint">
                        <Image src={r.img} alt="" fill sizes="300px" className="object-cover" />
                        <button type="button" onClick={() => removeCompare(r.id)} aria-label={`Remove ${r.title} from compare`}
                          className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/92 text-ink shadow-fav transition-colors hover:text-forest">
                          <Icon name="close" className="size-4" />
                        </button>
                      </div>
                      <Link href={`/property/${r.slug}`} className="font-bold leading-snug transition-colors hover:text-leaf">{r.title}</Link>
                    </th>
                  ))}
                  {Array.from({ length: COMPARE_MAX - chosen.length }, (_, i) => (
                    <td key={i} className="p-4 align-top">
                      <a href="#compare-picker" className="grid aspect-[16/11] place-items-center rounded-[12px] soft-inset text-center text-[0.85rem] font-semibold text-muted transition-colors hover:border-forest hover:text-forest">
                        <span><Icon name="compare" className="mx-auto mb-1 size-5" />{T.addSlot}</span>
                      </a>
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specs.map(s => (
                  <tr key={s.label} className="border-t border-dashed border-line">
                    <th scope="row" className="sticky left-0 z-[1] bg-mist/95 p-4 text-[0.84rem] font-semibold text-ink-2">{s.label}</th>
                    {s.cells.map((c, i) => (
                      <td key={chosen[i].id} className={`p-4 ${s.bestAt === i ? 'bg-gold/12' : ''}`}>
                        {c}
                        {s.bestAt === i && <span className="ml-2 rounded-full bg-gold px-2 py-0.5 align-middle text-[0.68rem] font-bold text-deep">{T.bestLabel}</span>}
                      </td>
                    ))}
                    {Array.from({ length: COMPARE_MAX - chosen.length }, (_, i) => <td key={i} />)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mb-10 rounded-[26px] soft-inset px-6 py-12 text-center">
          <p className="mb-1 text-[1.2rem] font-bold">{T.emptyTitle}</p>
          <p className="text-ink-2">{fill(T.emptyText)}</p>
        </div>
      )}

      <div id="compare-picker" className="scroll-mt-28">
        <h2 className="mb-1.5 text-[clamp(1.3rem,2.2vw,1.7rem)]">{T.pickerTitle}</h2>
        <p className="mb-5 text-ink-2">{fill(T.pickerText)}</p>
        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1fr] lg:items-end">
          <fieldset className="inline-flex self-end rounded-[16px] soft-inset p-1.5">
            <legend className="sr-only">Listing type</legend>
            {(['buy', 'rent'] as const).map(v => (
              <label key={v} className="cursor-pointer">
                <input type="radio" name="cmp-purpose" value={v} checked={purpose === v} className="peer sr-only"
                  onChange={() => { setPurpose(v); setCommunity(''); setDeveloper(''); setBand(''); }} />
                <span className="block rounded-[10px] px-[1.3em] py-[0.6em] text-[0.88rem] font-semibold text-muted transition-all peer-checked:soft-raised-sm peer-checked:text-forest peer-focus-visible:ring-2 peer-focus-visible:ring-forest">
                  {v === 'buy' ? T.buyTab : T.rentTab}
                </span>
              </label>
            ))}
          </fieldset>
          <SoftSelect variant="field" label={T.locationLabel} labelClassName={label} value={community} onChange={setCommunity}
            options={[{ value: '', label: T.allLocations }, ...communities.map(([v, l]) => ({ value: v, label: l }))]} />
          <SoftSelect variant="field" label={T.developerLabel} labelClassName={label} value={developer} onChange={setDeveloper}
            options={[{ value: '', label: T.allDevelopers }, ...developers.map(([v, l]) => ({ value: v, label: l }))]} />
          <SoftSelect variant="field" label={T.priceLabel} labelClassName={label} value={band} onChange={setBand}
            options={[{ value: '', label: T.anyPrice }, ...bands.map((b, i) => ({ value: String(i), label: b.label }))]} />
        </div>

        <p className="mb-3 text-[0.85rem] text-muted" aria-live="polite">{fill(matches.length === 1 ? T.matchOne : T.matchMany, matches.length)}</p>
        {matches.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map(r => {
              const on = picked.some(x => x.id === r.id);
              return (
                <li key={r.id} className={`flex items-center gap-3 rounded-[16px] border p-2.5 transition-colors ${on ? 'border-transparent soft-inset-sm' : 'border-transparent soft-raised-sm'}`}>
                  <Image src={r.img} alt="" width={76} height={60} className="h-[60px] w-[76px] shrink-0 rounded-[10px] object-cover" />
                  <div className="min-w-0 flex-1">
                    <Price aed={r.price} perYear={r.purpose === 'rent'} compact className="text-[0.95rem] font-extrabold text-forest" />
                    <p className="truncate text-[0.84rem] font-semibold">{r.title}</p>
                    <p className="truncate text-[0.76rem] text-muted">{r.communityName}{r.developerName ? ` · ${r.developerName}` : ''}</p>
                  </div>
                  <button type="button" onClick={() => toggleCompare({ id: r.id, title: r.title, img: r.img })}
                    disabled={!on && full} aria-pressed={on} aria-label={on ? `Remove ${r.title} from compare` : `Add ${r.title} to compare`}
                    className={`grid size-9 shrink-0 place-items-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${on ? 'border-forest bg-forest text-white' : 'border-line-strong hover:border-forest hover:text-forest'}`}>
                    <Icon name={on ? 'check' : 'compare'} className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-field soft-inset-sm px-4 py-6 text-center text-ink-2">{T.noMatch}</p>
        )}
      </div>
    </>
  );
}
