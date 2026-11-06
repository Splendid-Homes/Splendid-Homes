'use client';

import { useAuth, useConfig } from '@payloadcms/ui';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

const Ico = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg>;
const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 6e4);
  return m < 60 ? `${Math.max(1, m)} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`;
};

/* ---------- Global search ---------- */
const SOURCES: { slug: string; label: string; title: string; sub?: string; fields: string[] }[] = [
  { slug: 'leads', label: 'Leads', title: 'name', sub: 'subject', fields: ['name', 'email', 'phone', 'subject'] },
  { slug: 'properties', label: 'Listings', title: 'title', sub: 'ref', fields: ['title', 'ref', 'building', 'permitNo'] },
  { slug: 'projects', label: 'Off-plan projects', title: 'name', fields: ['name'] },
  { slug: 'communities', label: 'Communities', title: 'name', fields: ['name'] },
  { slug: 'developers', label: 'Developers', title: 'name', fields: ['name'] },
  { slug: 'agents', label: 'Team', title: 'name', sub: 'title', fields: ['name'] },
  { slug: 'posts', label: 'Articles', title: 'title', fields: ['title'] },
  { slug: 'services', label: 'Services', title: 'name', fields: ['name'] },
  { slug: 'careers', label: 'Careers', title: 'title', fields: ['title'] },
];
type Hit = { group: string; title: string; sub?: string; href: string };

function SearchDialog({ onClose }: { onClose: () => void }) {
  const { config } = useConfig();
  const isAdmin = (useAuth().user as { role?: string } | null)?.role === 'admin';
  const router = useRouter();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [busy, setBusy] = useState(false);
  const [cursor, setCursor] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      setBusy(true);
      const pages: Hit[] = (config.globals ?? [])
        .filter(g => g.slug !== 'adminDashboard' || isAdmin)
        .map(g => ({ group: 'Settings & pages', title: String(g.label ?? g.slug), href: `/admin/globals/${g.slug}` }))
        .filter(h => h.title.toLowerCase().includes(term.toLowerCase()))
        .slice(0, 5);
      // Each search uses the signed-in user's own access: anything they cannot see simply returns nothing.
      const groups = await Promise.all(SOURCES.map(async s => {
        const p = new URLSearchParams({ limit: '4', depth: '0' });
        s.fields.forEach((f, i) => p.set(`where[or][${i}][${f}][like]`, term));
        const r = await fetch(`/api/${s.slug}?${p}`, { credentials: 'include', signal: ctl.signal }).catch(() => null);
        if (!r?.ok) return [];
        const j = await r.json() as { docs?: Record<string, unknown>[] };
        return (j.docs ?? []).map(d => ({
          group: s.label, title: String(d[s.title] ?? ''), sub: s.sub && d[s.sub] ? String(d[s.sub]) : undefined, href: `/admin/collections/${s.slug}/${d.id}`,
        }));
      }));
      if (ctl.signal.aborted) return;
      setHits([...groups.flat(), ...pages]);
      setCursor(0);
      setBusy(false);
    }, 220);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [q, config.globals, isAdmin]);

  const shown = q.trim().length < 2 ? [] : hits;
  const go = (h?: Hit) => { if (h) { onClose(); router.push(h.href); } };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, shown.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(shown[cursor]); }
  };
  return createPortal(
    <div className="sh-s" role="dialog" aria-modal="true" aria-label="Search the admin" onKeyDown={onKey}>
      <button type="button" className="sh-q-scrim" aria-label="Close search" tabIndex={-1} onClick={onClose} />
      <div className="sh-s-box">
        <label className="sh-s-input">
          <Ico d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm9 2-4-4" />
          <span className="sr-only">Search</span>
          <input ref={input} value={q} onChange={e => setQ(e.target.value)} placeholder="Search listings, leads, projects, articles, settings…" />
          <kbd>Esc</kbd>
        </label>
        <div className="sh-s-list" role="listbox" aria-label="Results">
          {q.trim().length < 2 && <p className="sh-s-hint">Type at least two letters. Try a name, a phone number or a listing reference.</p>}
          {q.trim().length >= 2 && !busy && !shown.length && <p className="sh-s-hint">Nothing found for “{q.trim()}”.</p>}
          {q.trim().length >= 2 && busy && !shown.length && <p className="sh-s-hint">Searching…</p>}
          {shown.map((h, i) => (
            <div key={h.href}>
              {(i === 0 || shown[i - 1].group !== h.group) && <p className="sh-s-group">{h.group}</p>}
              <Link href={h.href} role="option" aria-selected={i === cursor} className={i === cursor ? 'on' : ''} onClick={onClose} onMouseEnter={() => setCursor(i)}>
                <b>{h.title}</b>{h.sub && <small>{h.sub}</small>}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.querySelector('.sh-fonts') ?? document.body,
  );
}

function GlobalSearch() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(true); } };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);
  return (
    <>
      <button type="button" className="sh-tool sh-tool--search" onClick={() => setOpen(true)} aria-label="Search the admin (Ctrl K)">
        <Ico d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm9 2-4-4" /><span>Search</span><kbd>Ctrl K</kbd>
      </button>
      {open && <SearchDialog onClose={() => setOpen(false)} />}
    </>
  );
}

/* ---------- New-lead bell ---------- */
type NewLead = { id: number | string; name: string; subject?: string | null; createdAt: string };

function LeadBell() {
  const [data, setData] = useState<{ total: number; docs: NewLead[] } | null>(null);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const path = usePathname(); // re-check when moving between pages
  const load = useCallback(() => {
    if (document.hidden) return;
    fetch('/api/leads?where[status][equals]=new&sort=-createdAt&limit=5&depth=0', { credentials: 'include' })
      .then(r => (r.ok ? (r.json() as Promise<{ totalDocs: number; docs: NewLead[] }>) : null))
      .then(j => { if (j) setData({ total: j.totalDocs, docs: j.docs }); })
      .catch(() => {});
  }, []);
  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    addEventListener('sh:leads-changed', load);
    return () => { clearInterval(t); removeEventListener('sh:leads-changed', load); };
  }, [load, path]);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('mousedown', away); addEventListener('keydown', esc);
    return () => { removeEventListener('mousedown', away); removeEventListener('keydown', esc); };
  }, [open]);
  const total = data?.total ?? 0;
  return (
    <div className="sh-bell" ref={box}>
      <button type="button" className="sh-tool sh-tool--icon" aria-expanded={open} aria-haspopup="true"
        aria-label={total ? `${total} new ${total === 1 ? 'lead' : 'leads'}` : 'No new leads'} onClick={() => setOpen(o => !o)}>
        <Ico d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16zM10 21h4" />
        {total > 0 && <em>{total > 99 ? '99+' : total}</em>}
      </button>
      {open && (
        <div className="sh-bell-menu">
          <p className="sh-bell-head">New leads <b>{total}</b></p>
          {data?.docs.length ? data.docs.map(l => (
            <Link key={l.id} href={`/admin/collections/leads/${l.id}`} onClick={() => setOpen(false)}>
              <b>{l.name}</b><small>{l.subject ? `${l.subject} · ` : ''}{ago(l.createdAt)}</small>
            </Link>
          )) : <p className="sh-empty">You’re all caught up.</p>}
          <Link className="sh-bell-all" href="/admin/lead-board" onClick={() => setOpen(false)}>Open lead board →</Link>
        </div>
      )}
    </div>
  );
}

/* ---------- Light / dark (saved per browser; applied before first paint by AdminFonts) ---------- */
const MODE_KEY = 'sh_admin_mode';
const modeListeners = new Set<() => void>();
const subscribeMode = (fn: () => void) => { modeListeners.add(fn); return () => { modeListeners.delete(fn); }; };
const readMode = () => (document.documentElement.dataset.shMode === 'light' ? 'light' : 'dark');

function ModeSwitch() {
  const mode = useSyncExternalStore(subscribeMode, readMode, () => 'dark');
  const flip = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    if (next === 'light') document.documentElement.dataset.shMode = 'light';
    else delete document.documentElement.dataset.shMode;
    try { localStorage.setItem(MODE_KEY, next); } catch { /* storage unavailable */ }
    modeListeners.forEach(fn => fn());
  };
  return (
    <button type="button" className="sh-tool sh-tool--icon" onClick={flip} aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
      {mode === 'light' ? <Ico d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /> : <Ico d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" />}
    </button>
  );
}

/** Top-right tools. The bell only shows for roles that work with leads. */
export function HeaderTools() {
  const { user } = useAuth();
  const role = (user as { role?: string } | null)?.role;
  return (
    <span className="sh-actions">
      <GlobalSearch />
      {(role === 'admin' || role === 'agent') && <LeadBell />}
      <ModeSwitch />
      <a className="sh-view" href="/" target="_blank" rel="noopener">View site ↗</a>
    </span>
  );
}
