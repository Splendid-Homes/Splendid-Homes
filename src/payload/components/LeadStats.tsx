import Link from 'next/link';
import type { ServerProps } from 'payload';
import { LEAD_STATUSES, LEAD_TYPES } from '../collections/system';
import { LEAD_SOURCES } from '../leadSources';
import { hasText } from '../legalDefaults';
import { DashInsights, type LeadPoint } from './DashInsights';

/** Date helpers kept outside render (React purity rule); the dashboard is rendered per request. */
const nowMs = () => Date.now();
const dubaiHour = () => Number(new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dubai', hour: '2-digit', hour12: false }));
const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 6e4);
  return m < 60 ? `${Math.max(1, m)} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : m < 2880 ? 'yesterday' : `${Math.round(m / 1440)} days ago`;
};
const typeLabel = (v: string) => LEAD_TYPES.find(t => t.value === v)?.label ?? v;
const initials = (s: string) => s.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const DAY = 864e5;

type Lead = { id: number | string; name: string; subject?: string | null; type: string; status: string; source?: string | null; createdAt: string };
type Listing = { views?: number; status?: string; createdAt: string; images?: { url?: string | null; image?: unknown }[] };

/** "+18% vs the previous 30 days"; nothing to compare is said plainly rather than shown as a fake percentage. */
function Trend({ now, prev, unit = 'percent' }: { now: number; prev: number; unit?: 'percent' | 'count' }) {
  const text = unit === 'count' ? (now ? `+${now} in 30 days` : 'none new in 30 days')
    : now === prev ? 'same as previous 30 days'
    : prev === 0 ? `+${now} vs previous 30 days`
    : `${now > prev ? '+' : '−'}${Math.abs(Math.round(((now - prev) / prev) * 100))}% vs previous 30 days`;
  const dir = unit === 'count' ? (now ? 'up' : 'flat') : now > prev ? 'up' : now < prev ? 'down' : 'flat';
  return <i className={`sh-trend sh-trend--${dir}`}>{text}</i>;
}

function GoalRing({ done, goal, daysLeft }: { done: number; goal: number; daysLeft: number }) {
  const pct = Math.min(100, Math.round((done / goal) * 100));
  const r = 42, c = 2 * Math.PI * r;
  const need = Math.max(0, goal - done);
  return (
    <div className="sh-panel sh-goal">
      <h3>Monthly goal <Link href="/admin/globals/adminDashboard" aria-label="Change the monthly goal">Edit</Link></h3>
      <div className="sh-goal-row">
        <svg viewBox="0 0 100 100" role="img" aria-label={`${done} of ${goal} leads this month`}>
          <circle cx="50" cy="50" r={r} className="t" />
          <circle cx="50" cy="50" r={r} className="v" strokeDasharray={`${(pct / 100) * c} ${c}`} transform="rotate(-90 50 50)" />
          <text x="50" y="49" textAnchor="middle">{pct}%</text>
          <text x="50" y="63" textAnchor="middle" className="s">of {goal}</text>
        </svg>
        <dl>
          <div><dt>This month</dt><dd>{done}</dd></div>
          <div><dt>Still needed</dt><dd>{need}</dd></div>
          <div><dt>Days left</dt><dd>{daysLeft}</dd></div>
        </dl>
      </div>
    </div>
  );
}

/**
 * F32 dashboard: greeting, key numbers with trends, the leads chart with a date-range switch, monthly goal,
 * items needing attention, latest leads and breakdowns, above Payload's collection tiles. Runs on the server
 * with the signed-in user's access, so sales agents see only their own leads and editors see no lead data.
 */
export async function LeadStats({ payload, user }: ServerProps) {
  if (!user) return null;
  const role = (user as { role?: string }).role;
  const first = String((user as { name?: string }).name ?? '').trim();
  const now = nowMs();
  const within = (iso: string, from: number, to = 0) => { const age = now - new Date(iso).getTime(); return age <= from * DAY && age > to * DAY; };

  const [propRes, projRes, settings] = await Promise.all([
    payload.find({ collection: 'properties', limit: 0, pagination: false, depth: 0, select: { views: true, status: true, createdAt: true, images: true } }),
    payload.find({ collection: 'projects', limit: 0, pagination: false, depth: 0, select: { status: true, createdAt: true } }),
    payload.findGlobal({ slug: 'adminDashboard', depth: 0, overrideAccess: true }),
  ]);
  const props = propRes.docs as unknown as Listing[];
  const projs = projRes.docs as unknown as Listing[];
  const live = props.filter(p => p.status === 'published');
  const liveProjects = projs.filter(p => p.status === 'published');
  const totalViews = props.reduce((s, d) => s + (Number(d.views) || 0), 0);

  const sees = role === 'admin' || role === 'agent';
  let leads: Lead[] = [];
  if (sees) {
    const res = await payload.find({
      collection: 'leads', user, overrideAccess: false, limit: 0, pagination: false, depth: 0, sort: '-createdAt',
      where: { createdAt: { greater_than: new Date(now - 366 * DAY).toISOString() } },
      select: { name: true, subject: true, type: true, status: true, source: true, createdAt: true },
    });
    leads = res.docs as unknown as Lead[];
  }
  const last30 = leads.filter(l => within(l.createdAt, 30));
  const prev30 = leads.filter(l => within(l.createdAt, 60, 30));
  const newLeads = last30.filter(l => l.status === 'new').length;
  const today = leads.filter(l => within(l.createdAt, 1)).length;
  const points: LeadPoint[] = leads.map(l => ({ at: l.createdAt, type: l.type, source: l.source ?? '' }));

  // Monthly goal (main admin): newsletter and alert sign-ups are not enquiries.
  const d = new Date(now);
  const ym = d.toISOString().slice(0, 7);
  const monthDone = leads.filter(l => l.createdAt.startsWith(ym) && l.type !== 'newsletter' && l.type !== 'alert').length;
  const daysLeft = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate() - d.getUTCDate();

  // Needs attention: only what this role can act on.
  const attention: { text: string; href: string }[] = [];
  if (sees) {
    const hours = settings.replyHours || 24;
    const late = leads.filter(l => l.status === 'new' && now - new Date(l.createdAt).getTime() > hours * 36e5).length;
    if (late) attention.push({ text: `${late} new ${late === 1 ? 'lead has' : 'leads have'} had no reply for over ${hours} hours`, href: '/admin/collections/leads?where[status][equals]=new' });
  }
  if (role === 'admin' || role === 'editor') {
    const noPhoto = live.filter(p => !p.images?.some(i => i.url || i.image)).length;
    if (noPhoto) attention.push({ text: `${noPhoto} live ${noPhoto === 1 ? 'listing has' : 'listings have'} no photo`, href: '/admin/collections/properties?where[status][equals]=published' });
    const drafts = props.length - live.length;
    if (drafts) attention.push({ text: `${drafts} ${drafts === 1 ? 'listing is' : 'listings are'} still in draft`, href: '/admin/collections/properties?where[status][equals]=draft' });
    const [site, legal] = await Promise.all([
      payload.findGlobal({ slug: 'settings', depth: 0, overrideAccess: true }),
      payload.findGlobal({ slug: 'legalPages', depth: 0, overrideAccess: true }),
    ]);
    if (/^0+$/.test(String(site.orn ?? ''))) attention.push({ text: 'RERA ORN is still a placeholder', href: '/admin/globals/settings' });
    const emptyLegal = (legal.pages ?? []).filter(p => !hasText(p.body)).length || (legal.pages?.length ? 0 : 2);
    if (emptyLegal) attention.push({ text: `${emptyLegal} legal ${emptyLegal === 1 ? 'page has' : 'pages have'} no text yet`, href: '/admin/globals/legalPages' });
  }

  const h = dubaiHour();
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <section className="sh-dash" aria-label="Overview">
      <div className="sh-hello">
        <h1>{greet}{first ? `, ${first}` : ''}</h1>
        <p><i />{sees ? `${today} new ${today === 1 ? 'lead' : 'leads'} in the last 24 hours · ` : ''}{live.length} active listings · {liveProjects.length} off-plan projects</p>
      </div>
      <div className="sh-kpis">
        <div className="sh-kpi"><span>Active listings</span><b>{live.length}</b><Trend unit="count" now={props.filter(p => within(p.createdAt, 30)).length} prev={0} /></div>
        <div className="sh-kpi"><span>Off-plan projects</span><b>{liveProjects.length}</b><Trend unit="count" now={projs.filter(p => within(p.createdAt, 30)).length} prev={0} /></div>
        <div className="sh-kpi"><span>Listing views</span><b>{totalViews.toLocaleString('en-US')}</b><i className="sh-trend sh-trend--flat">all time</i></div>
        {sees && <>
          <div className="sh-kpi"><span>New leads (30 days)</span><b>{newLeads}</b><i className="sh-trend sh-trend--flat">waiting for a reply</i></div>
          <div className="sh-kpi"><span>All leads (30 days)</span><b>{last30.length}</b><Trend now={last30.length} prev={prev30.length} /></div>
        </>}
      </div>

      <div className={sees ? 'sh-split' : ''}>
        {sees && (
          <div className="sh-split-main">
            <DashInsights now={now} points={points} types={[...LEAD_TYPES]} sources={[...LEAD_SOURCES]} />
          </div>
        )}
        <div className="sh-split-side">
          {role === 'admin' && <GoalRing done={monthDone} goal={settings.monthlyLeadGoal || 30} daysLeft={daysLeft} />}
          <div className="sh-panel">
            <h3>Needs attention <small>{attention.length || ''}</small></h3>
            {attention.length ? attention.map(a => <Link key={a.text} className="sh-attn" href={a.href}><i />{a.text}<span>→</span></Link>)
              : <p className="sh-empty">All clear, nothing needs you right now.</p>}
          </div>
          {sees && (
            <div className="sh-panel">
              <h3>Latest leads <Link href="/admin/lead-board">Open lead board →</Link></h3>
              {leads.length ? leads.slice(0, 4).map(l => (
                <Link key={l.id} href={`/admin/collections/leads/${l.id}`} className="sh-lead">
                  <span className="av">{initials(l.name)}</span>
                  <span><b>{l.name}</b><span>{typeLabel(l.type)}{l.subject ? ` · ${l.subject}` : ''} · {ago(l.createdAt)}</span></span>
                  <span className={`sh-chip sh-chip--${l.status}`}>{LEAD_STATUSES.find(s => s.value === l.status)?.label ?? l.status}</span>
                </Link>
              )) : <p className="sh-empty">No leads yet.</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
