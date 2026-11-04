import { DefaultTemplate } from '@payloadcms/next/templates';
import { redirect } from 'next/navigation';
import type { AdminViewServerProps } from 'payload';
import { LEAD_STATUSES, LEAD_TYPES } from '../collections/system';
import { LeadBoardClient, type BoardLead } from './LeadBoardClient';

const isoDaysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString();

/**
 * F32 lead board (New / Contacted / Qualified / Closed). Loaded with the signed-in user's
 * access, so sales agents only ever see the leads assigned to them. Closed leads older than
 * 30 days drop off the board (they stay in the list view).
 */
export async function LeadBoard({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult;
  const { payload, user, i18n } = req;
  if (!user) redirect('/admin/login');
  const role = (user as { role?: string }).role;
  const allowed = role === 'admin' || role === 'agent';

  let leads: BoardLead[] = [];
  if (allowed) {
    const since = isoDaysAgo(30);
    const res = await payload.find({
      collection: 'leads', user, overrideAccess: false, depth: 1, limit: 500, sort: '-createdAt',
      where: { or: [{ status: { not_equals: 'closed' } }, { updatedAt: { greater_than: since } }] },
    });
    leads = res.docs.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      status: d.status,
      subject: d.subject ?? '',
      phone: d.phone ?? '',
      email: d.email ?? '',
      agent: d.assignedAgent && typeof d.assignedAgent === 'object' ? d.assignedAgent.name : '',
      createdAt: d.createdAt,
    }));
  }

  return (
    <DefaultTemplate i18n={i18n} locale={locale} params={params} payload={payload} permissions={permissions}
      searchParams={searchParams} user={user} visibleEntities={visibleEntities} viewActions={payload.config.admin.components.actions}>
      <div className="gutter--left gutter--right sh-board" style={{ paddingTop: 8, paddingBottom: 48 }}>
        <h1>Lead board</h1>
        <p className="sh-board-sub">
          Drag a card to change its status, or use the status menu on the card. {role === 'agent' ? 'Showing leads assigned to you.' : ''}
        </p>
        {allowed
          ? <LeadBoardClient leads={leads} statuses={LEAD_STATUSES} types={LEAD_TYPES.map(t => ({ label: t.label, value: t.value }))} />
          : <p>Your role does not include access to leads.</p>}
      </div>
    </DefaultTemplate>
  );
}
