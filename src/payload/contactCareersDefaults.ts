/** Default wording for the Contact and Careers pages (CMS: Contact & Careers pages). Blank fields fall back to these. */
export const CONTACT_CAREERS_DEFAULTS = {
  // Contact details panel
  callLabel: 'Call us', waLabel: 'WhatsApp', waValue: 'Chat with us now', emailLabel: 'Email', visitLabel: 'Visit', hoursLabel: 'Office hours',
  // Contact form
  formTitle: 'Send us a message', formCta: 'Send message', formMessage: 'I’m interested in (buying / renting / selling / off-plan / mortgage): ',
  interestLabel: 'I’m interested in',
  // Careers
  perksTitle: 'Why join', perksItalic: 'us', rolesTitle: 'Open', rolesItalic: 'positions',
  specText: 'Don’t see your role? Send your CV to', specSubject: 'Speculative application',
  noRoles: 'There are no open roles right now. We are always happy to hear from great people: send us your CV.',
  applyCta: 'Apply now', applyTitle: 'Apply: {role}', applySend: 'Send application', applyHint: 'A few lines about you (optional)',
  cvLabel: 'CV (PDF or Word, up to 5 MB)', salaryLabel: 'Salary',
};
export type ContactCareersText = typeof CONTACT_CAREERS_DEFAULTS;

export const CONTACT_INTERESTS = ['Buying', 'Renting', 'Selling', 'Off-plan investment', 'Property management', 'Mortgage', 'Other'];

export const PERK_ICONS = ['trend', 'users', 'star', 'globe', 'shield', 'wallet', 'key', 'chart', 'clock', 'home'] as const;
export const CAREER_PERKS = [
  { icon: 'trend', title: 'Competitive commission', text: 'Clear, competitive splits with uncapped earnings.' },
  { icon: 'users', title: 'Lead support', text: 'Qualified enquiries from our marketing and referral network.' },
  { icon: 'star', title: 'Training', text: 'RERA certification support and mentoring from senior consultants.' },
  { icon: 'globe', title: 'Visa & benefits', text: 'Employment visa and health insurance for full-time roles.' },
];

export const CONTACT_ROW_ICONS = ['phone', 'wa', 'mail', 'pin', 'cal', 'building', 'globe', 'clock'] as const;
