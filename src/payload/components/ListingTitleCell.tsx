'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Row = { id?: string | number; title?: string; images?: { url?: string | null; image?: unknown }[] };

/** Listings table: the title with a small photo. Uploaded photos are looked up by ID; sample photos are plain URLs. */
export function ListingTitleCell({ rowData, cellData, onClick, collectionSlug }: {
  rowData?: Row; cellData?: string; collectionSlug?: string;
  onClick?: (args: { cellData: unknown; collectionSlug?: string; rowData?: Row }) => void;
}) {
  const first = rowData?.images?.[0];
  const direct = first?.url || (first?.image && typeof first.image === 'object' ? (first.image as { url?: string }).url : '') || '';
  const mediaId = !direct && (typeof first?.image === 'number' || typeof first?.image === 'string') ? first.image : null;
  const [fetched, setFetched] = useState('');
  useEffect(() => {
    if (mediaId == null) return;
    const ctl = new AbortController();
    fetch(`/api/media/${mediaId}?depth=0`, { credentials: 'include', signal: ctl.signal })
      .then(r => (r.ok ? (r.json() as Promise<{ url?: string }>) : null))
      .then(m => { if (m?.url) setFetched(m.url); })
      .catch(() => {});
    return () => ctl.abort();
  }, [mediaId]);
  const src = direct || fetched;
  const body = <>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {src ? <img src={src} alt="" loading="lazy" /> : <span className="sh-title-none" aria-hidden="true" />}
    <span>{cellData || rowData?.title}</span>
  </>;
  // Inside a "choose a listing" drawer the click must select the row, not leave the page.
  if (onClick) return <button type="button" className="sh-title-cell" onClick={() => onClick({ cellData, collectionSlug, rowData })}>{body}</button>;
  return <Link href={`/admin/collections/properties/${rowData?.id}`} className="sh-title-cell">{body}</Link>;
}

/** Listings table: prices with thousands separators. */
export function PriceCell({ cellData }: { cellData?: number | null }) {
  return <>{cellData == null ? '—' : Number(cellData).toLocaleString('en-US')}</>;
}

/** Yes/No instead of true/false in tables. */
export function YesNoCell({ cellData }: { cellData?: boolean | null }) {
  return <>{cellData ? 'Yes' : 'No'}</>;
}
