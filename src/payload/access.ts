import type { Access, FieldAccess, PayloadRequest, Where } from 'payload';

/**
 * Roles from Document 5 ("Who can see what"):
 * - admin  (Main admin): everything, including leads export/delete, staff accounts, activity log
 * - editor (Editor):     all content, SEO and homepage settings; no leads
 * - agent  (Sales agent): published content, own draft listings, leads assigned to them
 */
export type Role = 'admin' | 'editor' | 'agent';
type StaffUser = { id: number | string; role?: Role; agent?: number | string | { id: number | string } | null; active?: boolean };

/** The signed-in staff user. A deactivated account counts as signed out everywhere (admin, REST and GraphQL). */
export const userOf = (req: PayloadRequest) => {
  const u = req.user as StaffUser | null | undefined;
  return u && u.active !== false ? u : null;
};
export const agentIdOf = (u?: StaffUser | null) => (u?.agent && typeof u.agent === 'object' ? u.agent.id : u?.agent) ?? null;

export const isAdmin: Access = ({ req }) => userOf(req)?.role === 'admin';
export const isEditor: Access = ({ req }) => ['admin', 'editor'].includes(userOf(req)?.role ?? '');
export const isStaff: Access = ({ req }) => Boolean(userOf(req));
export const fieldIsAdmin: FieldAccess = ({ req }) => userOf(req)?.role === 'admin';
export const fieldIsEditor: FieldAccess = ({ req }) => ['admin', 'editor'].includes(userOf(req)?.role ?? '');

/** Public sees published only; staff see everything. */
export const publishedOrStaff: Access = ({ req }) => (userOf(req) ? true : { status: { equals: 'published' } });

/** Listings: public = published; agents = published + their own drafts; editors/admin = all. */
export const listingRead: Access = ({ req }) => {
  const u = userOf(req);
  if (!u) return { status: { equals: 'published' } };
  if (u.role === 'agent') return { or: [{ status: { equals: 'published' } }, { agent: { equals: agentIdOf(u) } }] } as Where;
  return true;
};

/** Leads: admin = all; agent = leads assigned to them; editor and public = none. */
export const leadRead: Access = ({ req }) => {
  const u = userOf(req);
  if (u?.role === 'admin') return true;
  if (u?.role === 'agent' && agentIdOf(u)) return { assignedAgent: { equals: agentIdOf(u) } };
  return false;
};

/** Users: admin manages everyone; staff can read and update their own account. */
export const selfOrAdmin: Access = ({ req }) => {
  const u = userOf(req);
  if (!u) return false;
  return u.role === 'admin' ? true : { id: { equals: u.id } };
};
