import type { GlobalConfig } from 'payload';
import { isAdmin, isStaff } from '../access';

/** Settings for the admin dashboard only; nothing here shows on the website. */
export const AdminDashboard: GlobalConfig = {
  slug: 'adminDashboard',
  label: 'Dashboard settings',
  admin: { group: 'Admin', hidden: ({ user }) => (user as { role?: string } | null)?.role !== 'admin' },
  access: { read: isStaff, update: isAdmin },
  fields: [
    { name: 'monthlyLeadGoal', label: 'Monthly lead goal', type: 'number', min: 1, defaultValue: 30, required: true,
      admin: { description: 'The target shown in the goal ring on the dashboard. Newsletter sign-ups do not count.' } },
    { name: 'replyHours', label: 'Flag new leads after (hours)', type: 'number', min: 1, defaultValue: 24, required: true,
      admin: { description: 'A new lead with no reply after this long appears under "Needs attention".' } },
  ],
};
