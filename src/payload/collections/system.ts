import { APIError, type CollectionBeforeChangeHook, type CollectionBeforeLoginHook, type CollectionConfig, type FieldHook } from 'payload';
import { agentIdOf, fieldIsAdmin, isAdmin, isEditor, isStaff, leadRead, selfOrAdmin, userOf } from '../access';
import { logChange, logDelete } from '../hooks';
import { LEAD_SOURCES } from '../leadSources';

/** Deactivated accounts cannot sign in (the admin screen and the API both refuse them). */
const refuseInactive: CollectionBeforeLoginHook = ({ user }) => {
  if ((user as { active?: boolean }).active === false) throw new APIError('This account has been deactivated. Ask the main admin to reactivate it.', 403);
  return user;
};

/** F28 — staff accounts. Only named accounts can sign in; inactive accounts are locked out. */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Staff account', plural: 'Staff accounts' },
  auth: { tokenExpiration: 60 * 60 * 8, maxLoginAttempts: 5, lockTime: 15 * 60 * 1000 },
  admin: { group: 'Admin', useAsTitle: 'name', defaultColumns: ['name', 'email', 'role', 'active'] },
  access: {
    read: selfOrAdmin,
    create: isAdmin,
    update: selfOrAdmin,
    delete: isAdmin,
    admin: ({ req }) => Boolean(userOf(req)), // userOf treats deactivated accounts as signed out
    unlock: isAdmin,
  },
  hooks: { beforeLogin: [refuseInactive], afterChange: [logChange], afterDelete: [logDelete] },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'agent',
      access: { create: fieldIsAdmin, update: fieldIsAdmin },
      options: [{ label: 'Main admin', value: 'admin' }, { label: 'Editor', value: 'editor' }, { label: 'Sales agent', value: 'agent' }],
      admin: { position: 'sidebar' },
    },
    {
      name: 'agent',
      label: 'Agent profile',
      type: 'relationship',
      relationTo: 'agents',
      access: { create: fieldIsAdmin, update: fieldIsAdmin },
      admin: { position: 'sidebar', description: 'For sales agents: links the account to their profile and their leads.', condition: d => d?.role === 'agent' },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      access: { create: fieldIsAdmin, update: fieldIsAdmin },
      admin: { position: 'sidebar', description: 'Switch off to block sign-in immediately (history is kept).', components: { Cell: '/payload/components/ListingTitleCell#YesNoCell' } },
    },
  ],
};

/** Public media library (photos, floor plans, brochures). Stored in Cloudflare R2. */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Admin' },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isEditor },
  hooks: { afterChange: [logChange], afterDelete: [logDelete] },
  upload: { mimeTypes: ['image/*', 'application/pdf', 'video/mp4', 'video/webm'] },
  fields: [{ name: 'alt', label: 'Alt text', type: 'text', required: true, admin: { description: 'Describe the image for screen readers and search engines.' } }],
};

/** CVs from career applications: private, main admin only (Document 5; kept 12 months). */
export const Resumes: CollectionConfig = {
  slug: 'resumes',
  labels: { singular: 'CV', plural: 'CVs' },
  admin: { group: 'Leads', hidden: ({ user }) => (user as { role?: string } | null)?.role !== 'admin' },
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  upload: {
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  fields: [{ name: 'applicant', type: 'text' }],
};

export const LEAD_TYPES = [
  { label: 'Property inquiry', value: 'property' },
  { label: 'Viewing request', value: 'viewing' },
  { label: 'Callback', value: 'callback' },
  { label: 'Service enquiry', value: 'service' },
  { label: 'Valuation request', value: 'valuation' },
  { label: 'Register interest', value: 'interest' },
  { label: 'Brochure download', value: 'brochure' },
  { label: 'Mortgage request', value: 'mortgage' },
  { label: 'Property alert', value: 'alert' },
  { label: 'Newsletter', value: 'newsletter' },
  { label: 'Career application', value: 'career' },
  { label: 'Contact form', value: 'contact' },
] as const;
export type LeadType = (typeof LEAD_TYPES)[number]['value'];

export const LEAD_STATUSES = [
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Closed', value: 'closed' },
];

/** Status history: every status change is appended with who changed it and when. */
const trackStatus: CollectionBeforeChangeHook = ({ data, originalDoc, operation, req }) => {
  if (operation === 'update' && originalDoc && data.status && data.status !== originalDoc.status) {
    data.statusHistory = [
      ...(originalDoc.statusHistory ?? []),
      { from: originalDoc.status, to: data.status, by: req.user?.id ?? null, at: new Date().toISOString() },
    ];
  }
  return data;
};

/** New notes are stamped with author and time; existing notes cannot be rewritten by agents. */
const stampNotes: FieldHook = ({ value, previousValue, req }) => {
  const prev = new Map(((previousValue ?? []) as { id?: string }[]).map(n => [n.id, n]));
  return ((value ?? []) as { id?: string; text?: string; author?: unknown; at?: string }[]).map(n => {
    const old = n.id ? (prev.get(n.id) as typeof n | undefined) : undefined;
    if (old) return req.user && userOf(req)?.role !== 'admin' ? old : { ...n, author: old.author, at: old.at };
    return { ...n, author: req.user?.id ?? null, at: new Date().toISOString() };
  });
};

const staffEditable = { update: ({ req }: { req: Parameters<typeof userOf>[0] }) => ['admin', 'agent'].includes(userOf(req)?.role ?? '') };

/** F32 — lead inbox (Document 5: leads + lead_notes). Created by the website forms or manually by the main admin. */
export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    group: 'Leads',
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'status', 'assignedAgent', 'subject', 'createdAt', 'quickView'],
    components: { beforeListTable: ['/payload/components/StatusPills#StatusPills'] },
    listSearchableFields: ['name', 'email', 'phone', 'subject'],
    description: 'Every enquiry from the website. Sales agents see only the leads assigned to them.',
    hidden: ({ user }) => !['admin', 'agent'].includes((user as { role?: string } | null)?.role ?? ''),
  },
  access: {
    read: leadRead,
    create: isAdmin,
    update: ({ req }) => {
      const u = userOf(req);
      if (u?.role === 'admin') return true;
      if (u?.role === 'agent' && agentIdOf(u)) return { assignedAgent: { equals: agentIdOf(u) } };
      return false;
    },
    delete: isAdmin,
  },
  defaultSort: '-createdAt',
  hooks: { beforeChange: [trackStatus], afterChange: [logChange], afterDelete: [logDelete] },
  fields: [
    { name: 'quickView', label: 'Quick view', type: 'ui', admin: { components: { Cell: '/payload/components/QuickView#QuickViewCell' } } },
    { type: 'row', fields: [
      { name: 'type', type: 'select', required: true, options: [...LEAD_TYPES], access: { update: fieldIsAdmin } },
      { name: 'status', type: 'select', required: true, defaultValue: 'new', options: LEAD_STATUSES, access: staffEditable },
    ] },
    { type: 'row', fields: [
      { name: 'name', type: 'text', required: true, access: { update: fieldIsAdmin } },
      { name: 'phone', type: 'text', access: { update: fieldIsAdmin } },
      { name: 'email', type: 'email', access: { update: fieldIsAdmin } },
    ] },
    { name: 'subject', label: 'About', type: 'text', admin: { description: 'Property, project, service or role the lead is about.' }, access: { update: fieldIsAdmin } },
    { name: 'message', type: 'textarea', access: { update: fieldIsAdmin } },
    {
      name: 'details',
      type: 'json',
      admin: { description: 'Form-specific details (viewing slot, valuation property, budget…).' },
      access: { update: fieldIsAdmin },
    },
    { name: 'cv', label: 'CV', type: 'upload', relationTo: 'resumes', access: { read: fieldIsAdmin, update: fieldIsAdmin }, admin: { condition: d => d?.type === 'career' } },
    {
      name: 'notes',
      type: 'array',
      labels: { singular: 'Note', plural: 'Notes' },
      access: staffEditable,
      hooks: { beforeChange: [stampNotes] },
      fields: [
        { name: 'text', type: 'textarea', required: true },
        { type: 'row', fields: [
          { name: 'author', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
          { name: 'at', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
        ] },
      ],
    },
    {
      name: 'statusHistory',
      type: 'array',
      admin: { readOnly: true, initCollapsed: true },
      fields: [{ type: 'row', fields: [
        { name: 'from', type: 'text' }, { name: 'to', type: 'text' },
        { name: 'by', type: 'relationship', relationTo: 'users' },
        { name: 'at', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
      ] }],
    },
    // Sidebar
    { name: 'assignedAgent', type: 'relationship', relationTo: 'agents', admin: { position: 'sidebar' }, access: { update: fieldIsAdmin } },
    { name: 'property', type: 'relationship', relationTo: 'properties', admin: { position: 'sidebar' }, access: { update: fieldIsAdmin } },
    { name: 'project', type: 'relationship', relationTo: 'projects', admin: { position: 'sidebar' }, access: { update: fieldIsAdmin } },
    { name: 'job', type: 'relationship', relationTo: 'careers', admin: { position: 'sidebar', condition: d => d?.type === 'career' }, access: { update: fieldIsAdmin } },
    { name: 'source', label: 'Came from', type: 'select', options: [...LEAD_SOURCES], admin: { position: 'sidebar', readOnly: true } },
    { name: 'sourcePage', type: 'text', admin: { position: 'sidebar', readOnly: true } },
    { name: 'consentAt', label: 'Privacy consent given', type: 'date', admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    {
      name: 'delivery',
      type: 'group',
      admin: { position: 'sidebar', readOnly: true },
      fields: [
        { name: 'emailSent', type: 'checkbox' },
        { name: 'emailError', type: 'text' },
        { name: 'sheetsSent', label: 'Google Sheets row added', type: 'checkbox' },
        { name: 'sheetsError', type: 'text' },
      ],
    },
  ],
};

/** Activity log (Document 5): read-only, main admin only. */
export const Activity: CollectionConfig = {
  slug: 'activity',
  labels: { singular: 'Activity', plural: 'Activity log' },
  admin: {
    group: 'Admin',
    useAsTitle: 'title',
    defaultColumns: ['createdAt', 'user', 'action', 'collectionSlug', 'title'],
    hidden: ({ user }) => (user as { role?: string } | null)?.role !== 'admin',
  },
  access: { read: isAdmin, create: () => false, update: () => false, delete: () => false },
  defaultSort: '-createdAt',
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users' },
    { name: 'action', type: 'text' },
    { name: 'collectionSlug', label: 'Section', type: 'text' },
    { name: 'docId', type: 'text' },
    { name: 'title', label: 'Record', type: 'text' },
  ],
};

export const staffOnly = isStaff;
