'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { QuickViewButton } from './QuickView';

export type BoardLead = {
  id: number | string; name: string; type: string; status: string; subject: string;
  phone: string; email: string; agent: string; createdAt: string;
};
type Opt = { label: string; value: string };

const tel = (p: string) => `tel:${p.replace(/\s/g, '')}`;
const wa = (p: string) => `https://wa.me/${p.replace(/\D/g, '')}`;

/** Kanban board: HTML5 drag and drop plus a status menu per card (keyboard accessible). */
export function LeadBoardClient({ leads: initial, statuses, types }: { leads: BoardLead[]; statuses: Opt[]; types: Opt[] }) {
  const router = useRouter();
  const [leads, setLeads] = useState(initial);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState('');
  const [over, setOver] = useState<string | null>(null);
  const typeLabel = useMemo(() => Object.fromEntries(types.map(t => [t.value, t.label])), [types]);

  const move = async (id: BoardLead['id'], status: string) => {
    const prev = leads;
    setLeads(ls => ls.map(l => (l.id === id ? { ...l, status } : l)));
    setError('');
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    }).catch(() => null);
    if (!res?.ok) { setLeads(prev); setError('Could not update the lead. Check your connection and try again.'); return; }
    // Sidebar count and the bell follow at once.
    window.dispatchEvent(new Event('sh:leads-changed'));
    router.refresh();
  };

  const shown = leads.filter(l => (!type || l.type === type)
    && (!q || `${l.name} ${l.email} ${l.phone} ${l.subject}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div>
      <div className="sh-board-tools">
        <label>Search
          <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Name, email, phone or property" style={{ minWidth: 260 }} />
        </label>
        <label>Lead type
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="">All types</option>
            {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
      </div>
      {error && <p role="alert" style={{ color: 'var(--theme-error-500)', marginBottom: 12 }}>{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${statuses.length}, minmax(240px, 1fr))`, gap: 12, overflowX: 'auto' }}>
        {statuses.map(col => {
          const items = shown.filter(l => l.status === col.value);
          return (
            <section key={col.value} aria-label={`${col.label} leads`}
              onDragOver={e => { e.preventDefault(); setOver(col.value); }}
              onDragLeave={() => setOver(null)}
              onDrop={e => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData('text/plain'); const lead = leads.find(l => String(l.id) === id); if (lead && lead.status !== col.value) void move(lead.id, col.value); }}
              className={`sh-col sh-col--${col.value}${over === col.value ? ' is-over' : ''}`}>
              <h2><i />{col.label}<span>{items.length}</span></h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
                {items.map(l => (
                  <li key={l.id} draggable onDragStart={e => e.dataTransfer.setData('text/plain', String(l.id))}
                    className="sh-lc">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <a href={`/admin/collections/leads/${l.id}`} style={{ fontWeight: 700 }}>{l.name}</a>
                      <QuickViewButton collection="leads" id={l.id} label={`Quick view: ${l.name}`} />
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.75, margin: '2px 0 6px' }}>
                      {typeLabel[l.type] ?? l.type} · {new Date(l.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}{l.agent ? ` · ${l.agent}` : ''}
                    </div>
                    {l.subject && <div style={{ fontSize: 13, marginBottom: 8 }}>{l.subject}</div>}
                    <div style={{ display: 'flex', gap: 8, fontSize: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                      {l.phone && <a href={tel(l.phone)}>Call</a>}
                      {l.phone && <a href={wa(l.phone)} target="_blank" rel="noopener">WhatsApp</a>}
                      {l.email && <a href={`mailto:${l.email}`}>Email</a>}
                    </div>
                    <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>Status
                      <select value={l.status} onChange={e => void move(l.id, e.target.value)}>
                        {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
