'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LEAD_SOURCES } from '../leadSources';

type Doc = Record<string, unknown>;
type Slug = 'leads' | 'properties';

const nameOf = (v: unknown, key = 'name') => (v && typeof v === 'object' ? String((v as Doc)[key] ?? '') : '');
const when = (v: unknown) => (v ? new Date(String(v)).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');
const cap = (v: unknown) => { const s = String(v ?? ''); return s.charAt(0).toUpperCase() + s.slice(1); };
const words = (k: string) => cap(k.replace(/([A-Z])/g, ' $1').toLowerCase());

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  children ? <div className="sh-q-row"><span>{label}</span><b>{children}</b></div> : null
);

function LeadBody({ d }: { d: Doc }) {
  const phone = String(d.phone ?? ''), email = String(d.email ?? '');
  const details = d.details && typeof d.details === 'object' ? Object.entries(d.details as Doc) : [];
  return (
    <>
      <div className="sh-q-acts">
        {phone && <a href={`tel:${phone.replace(/\s/g, '')}`}>Call</a>}
        {phone && <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noopener">WhatsApp</a>}
        {email && <a href={`mailto:${email}`}>Email</a>}
      </div>
      <Row label="Phone">{phone}</Row>
      <Row label="Email">{email}</Row>
      <Row label="Type">{cap(d.type)}</Row>
      <Row label="About">{String(d.subject ?? '')}</Row>
      <Row label="Agent">{nameOf(d.assignedAgent)}</Row>
      <Row label="Came from">{LEAD_SOURCES.find(s => s.value === d.source)?.label ?? ''}</Row>
      <Row label="Sent from page">{String(d.sourcePage ?? '')}</Row>
      <Row label="Received">{when(d.createdAt)}</Row>
      {details.map(([k, v]) => <Row key={k} label={words(k)}>{String(v)}</Row>)}
      {!!d.message && <><h4>Message</h4><p className="sh-q-msg">{String(d.message)}</p></>}
    </>
  );
}

function PropertyBody({ d }: { d: Doc }) {
  const first = (d.images as { url?: string; image?: unknown }[] | undefined)?.[0];
  const img = first?.url || nameOf(first?.image, 'url');
  const price = Number(d.price);
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {img && <img className="sh-q-img" src={img} alt="" />}
      <p className="sh-q-price">AED {Number.isFinite(price) ? price.toLocaleString('en-US') : '—'}{d.purpose === 'rent' ? ' / year' : ''}</p>
      <Row label="Reference">{String(d.ref ?? '')}</Row>
      <Row label={`${String(d.authority || 'DLD')} permit`}>{String(d.permitNo || 'None')}</Row>
      <Row label="For">{d.purpose === 'rent' ? 'Rent' : 'Sale'}</Row>
      <Row label="Type">{String(d.type ?? '')}</Row>
      <Row label="Size">{`${d.beds ?? '—'} beds · ${d.baths ?? '—'} baths · ${Number(d.size ?? 0).toLocaleString('en-US')} sq ft`}</Row>
      <Row label="Location">{[d.building, nameOf(d.community)].filter(Boolean).join(', ')}</Row>
      <Row label="Agent">{nameOf(d.agent)}</Row>
      <Row label="Views">{String(d.views ?? 0)}</Row>
      {!!d.slug && <p className="sh-q-link"><a href={`/property/${String(d.slug)}`} target="_blank" rel="noopener">Open on website ↗</a></p>}
    </>
  );
}

/** Side panel with the main details of a lead or listing, loaded with the signed-in user's own access. */
function Panel({ collection, id, onClose }: { collection: Slug; id: string | number; onClose: () => void }) {
  const [doc, setDoc] = useState<Doc | null>(null);
  const [failed, setFailed] = useState(false);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const ctl = new AbortController();
    fetch(`/api/${collection}/${id}?depth=1`, { credentials: 'include', signal: ctl.signal })
      .then(r => (r.ok ? (r.json() as Promise<Doc>) : Promise.reject(new Error(String(r.status)))))
      .then(setDoc)
      .catch(e => { if ((e as Error).name !== 'AbortError') setFailed(true); });
    close.current?.focus();
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', esc);
    return () => { ctl.abort(); removeEventListener('keydown', esc); };
  }, [collection, id, onClose]);
  const title = doc ? String(collection === 'leads' ? doc.name : doc.title) : 'Loading…';
  const status = doc?.status ? String(doc.status) : '';
  return createPortal(
    <div className="sh-q" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="sh-q-scrim" aria-label="Close" tabIndex={-1} onClick={onClose} />
      <aside className="sh-q-panel">
        <header>
          <div><h3>{title}</h3>{status && <span className={`sh-chip sh-chip--${status}`}>{cap(status)}</span>}</div>
          <button ref={close} type="button" className="sh-round" aria-label="Close" onClick={onClose}>×</button>
        </header>
        <div className="sh-q-body">
          {failed && <p className="sh-empty">This record could not be loaded. You may not have access to it.</p>}
          {!failed && !doc && <p className="sh-empty">Loading…</p>}
          {doc && (collection === 'leads' ? <LeadBody d={doc} /> : <PropertyBody d={doc} />)}
        </div>
        <footer><Link className="sh-primary" href={`/admin/collections/${collection}/${id}`}>Open full record</Link></footer>
      </aside>
    </div>,
    document.querySelector('.sh-fonts') ?? document.body,
  );
}

/** The eye button: opens the panel without leaving the list or board. */
export function QuickViewButton({ collection, id, label }: { collection: Slug; id: string | number; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="sh-quick" aria-label={label ?? 'Quick view'} title="Quick view" onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
      </button>
      {open && <Panel collection={collection} id={id} onClose={() => setOpen(false)} />}
    </>
  );
}

/** List column (a UI field, so it stores nothing). */
export function QuickViewCell({ rowData, collectionSlug }: { rowData?: { id?: string | number; title?: string; name?: string }; collectionSlug?: string }) {
  if (!rowData?.id || (collectionSlug !== 'leads' && collectionSlug !== 'properties')) return null;
  return <QuickViewButton collection={collectionSlug} id={rowData.id} label={`Quick view: ${rowData.title ?? rowData.name ?? ''}`} />;
}
