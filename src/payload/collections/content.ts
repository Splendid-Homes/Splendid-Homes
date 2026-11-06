import type { CollectionConfig } from 'payload';
import { isEditor, listingRead, publishedOrStaff } from '../access';
import { galleryField, imageFields, latLngGroup, orderField, seoGroup, slugField, statusField } from '../fields';
import { contentHooks } from '../hooks';

const editorWrite = { create: isEditor, update: isEditor, delete: isEditor };
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Office'];
const ICONS = ['key', 'bank', 'star', 'sun', 'doc', 'sofa', 'home', 'building', 'shield', 'chart', 'users', 'briefcase', 'trend', 'cal'];
export const TESTIMONIAL_KINDS = [
  { label: 'Buyer', value: 'buyer' }, { label: 'Seller', value: 'seller' }, { label: 'Investor', value: 'investor' },
  { label: 'Tenant', value: 'tenant' }, { label: 'Landlord', value: 'landlord' },
];
const HIGHLIGHT_ICONS = [...ICONS, 'check', 'globe', 'pin', 'layers', 'tower', 'townhouse', 'villa', 'crane', 'area'];

/** F29 — listings for sale, rent and commercial (Document 5: properties). */
export const Properties: CollectionConfig = {
  slug: 'properties',
  labels: { singular: 'Listing', plural: 'Listings' },
  admin: {
    group: 'Listings',
    useAsTitle: 'title',
    defaultColumns: ['title', 'ref', 'purpose', 'type', 'price', 'community', 'status', 'featured', 'quickView'],
    components: { beforeListTable: ['/payload/components/StatusPills#StatusPills'] },
    listSearchableFields: ['title', 'ref', 'building', 'permitNo'],
  },
  access: { read: listingRead, ...editorWrite },
  hooks: contentHooks,
  defaultSort: '-listedAt',
  fields: [
    { name: 'title', admin: { components: { Cell: '/payload/components/ListingTitleCell#ListingTitleCell' } }, type: 'text', required: true },
    { name: 'quickView', label: 'Quick view', type: 'ui', admin: { components: { Cell: '/payload/components/QuickView#QuickViewCell' } } },
    {
      type: 'row',
      fields: [
        { name: 'ref', label: 'Reference', type: 'text', required: true, unique: true, admin: { placeholder: 'SH-S-1021' } },
        { name: 'permitNo', label: 'Permit no.', type: 'text', admin: { description: 'Leave empty if this property has no permit: the page then shows no permit details.' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'authority', label: 'Land department (short)', type: 'text', admin: { placeholder: 'DLD', description: 'For example SLD. Empty means DLD.' } },
        { name: 'authorityName', label: 'Land department (full name)', type: 'text', admin: { placeholder: 'Dubai Land Department', description: 'Used in sentences on the page.' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'transferFeePct', label: 'Transfer fee (%)', type: 'number', min: 0, admin: { step: 0.01, description: 'Empty uses the value in Fees & costs. 0 hides this cost.' } },
        { name: 'adminFee', label: 'Admin fee (AED)', type: 'number', min: 0, admin: { description: 'Empty uses the value in Fees & costs. 0 hides this cost.' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'purpose', type: 'select', required: true, options: [{ label: 'For sale', value: 'buy' }, { label: 'For rent', value: 'rent' }] },
        { name: 'type', type: 'select', required: true, options: PROPERTY_TYPES },
        { name: 'price', label: 'Price (AED; yearly for rentals)', type: 'number', required: true, min: 0, admin: { components: { Cell: '/payload/components/ListingTitleCell#PriceCell' } } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'beds', type: 'number', required: true, min: 0, admin: { description: '0 = studio' } },
        { name: 'baths', type: 'number', required: true, min: 0 },
        { name: 'size', label: 'Size (sq ft)', type: 'number', required: true, min: 0 },
        { name: 'parking', type: 'number', defaultValue: 0, min: 0 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'community', type: 'relationship', relationTo: 'communities', required: true },
        { name: 'building', label: 'Building / cluster', type: 'text', required: true },
        { name: 'developer', type: 'relationship', relationTo: 'developers' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'furnishing', type: 'select', required: true, defaultValue: 'Unfurnished', options: ['Furnished', 'Unfurnished', 'Fitted'] },
        { name: 'completionStatus', label: 'Completion', type: 'select', required: true, defaultValue: 'Ready', options: ['Ready', 'Off-plan'] },
        { name: 'completion', label: 'Year built / handover', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'view', type: 'text' },
        { name: 'serviceCharge', label: 'Service charge (AED / sq ft / yr)', type: 'number', min: 0 },
      ],
    },
    { name: 'desc', label: 'Description', type: 'textarea', required: true },
    { name: 'amenities', type: 'text', hasMany: true },
    galleryField(),
    {
      type: 'row',
      fields: [
        { name: 'videoUrl', label: 'Video link', type: 'text', admin: { description: 'YouTube, Vimeo or a direct MP4 link. Plays in a pop-up on the card and the property page.' } },
        { name: 'tourUrl', label: '360° tour link', type: 'text', admin: { description: 'Matterport, Kuula or any 360° viewer link that allows embedding.' } },
      ],
    },
    ...imageFields('floorPlan', 'Floor plan'),
    seoGroup,
    statusField,
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Show on the homepage.', components: { Cell: '/payload/components/ListingTitleCell#YesNoCell' } } },
    { name: 'agent', type: 'relationship', relationTo: 'agents', required: true, admin: { position: 'sidebar' } },
    { name: 'listedAt', label: 'Listed on', type: 'date', required: true, defaultValue: () => new Date().toISOString(), admin: { position: 'sidebar' } },
    { name: 'views', type: 'number', defaultValue: 0, admin: { position: 'sidebar', readOnly: true } },
    slugField('title'),
  ],
};

/** F29 — off-plan projects with payment plans and unit types. */
export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Off-plan project', plural: 'Off-plan projects' },
  admin: { components: { beforeListTable: ['/payload/components/StatusPills#StatusPills'] }, group: 'Listings', useAsTitle: 'name', defaultColumns: ['name', 'developer', 'community', 'startPrice', 'handover', 'status'] },
  access: { read: publishedOrStaff, ...editorWrite },
  hooks: contentHooks,
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'developer', type: 'relationship', relationTo: 'developers', required: true },
        { name: 'community', type: 'relationship', relationTo: 'communities', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'startPrice', label: 'Starting price (AED)', type: 'number', required: true, min: 0 },
        { name: 'handover', type: 'text', required: true, admin: { placeholder: 'Q4 2028' } },
        { name: 'paymentPlan', label: 'Payment plan label', type: 'text', required: true, admin: { placeholder: '80/20' } },
        { name: 'constructionStatus', type: 'text', required: true, admin: { placeholder: 'New Launch' } },
      ],
    },
    { name: 'desc', label: 'Overview', type: 'textarea', required: true },
    {
      name: 'plan',
      label: 'Payment plan milestones',
      type: 'array',
      minRows: 1,
      fields: [{ type: 'row', fields: [{ name: 'label', type: 'text', required: true }, { name: 'pct', label: '%', type: 'number', required: true, min: 0, max: 100 }] }],
      validate: (rows: unknown) => {
        const list = (rows as { pct?: number }[] | undefined) ?? [];
        const total = list.reduce((s, r) => s + (Number(r?.pct) || 0), 0);
        return list.length === 0 || total === 100 ? true : `Milestones add up to ${total}%; they must total 100%.`;
      },
    },
    {
      name: 'units',
      label: 'Unit types',
      type: 'array',
      fields: [{ type: 'row', fields: [{ name: 'type', type: 'text', required: true }, { name: 'size', label: 'Size range (sq ft)', type: 'text', required: true }, { name: 'from', label: 'From (AED)', type: 'number', required: true }] }],
    },
    ...imageFields('image', 'Main image', true),
    galleryField(),
    { name: 'brochure', type: 'upload', relationTo: 'media', admin: { description: 'PDF sent to people who request the brochure.' } },
    { name: 'amenities', type: 'text', hasMany: true },
    {
      name: 'highlights', type: 'relationship', relationTo: 'highlights', hasMany: true,
      admin: { description: 'Highlights that apply to this project. Ones with an automatic rule (e.g. Escrow protected, Golden Visa from AED 2M) are added for you; no need to tick them.' },
    },
    {
      name: 'highlightsOff', label: 'Hide automatic highlights', type: 'relationship', relationTo: 'highlights', hasMany: true,
      admin: { description: 'Rarely needed: switch off an automatic highlight that does not apply to this project.' },
    },
    seoGroup,
    statusField,
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', components: { Cell: '/payload/components/ListingTitleCell#YesNoCell' } } },
    slugField('name'),
  ],
};

/**
 * Project highlights (Pay from 10% down, Escrow protected, Golden Visa eligible…). The team can
 * add their own. Each is either ticked per project, or applied automatically by a rule.
 */
export const Highlights: CollectionConfig = {
  slug: 'highlights',
  admin: { group: 'Listings', useAsTitle: 'label', defaultColumns: ['label', 'rule', 'order'], description: 'Shown on off-plan project cards, project pages and the homepage band. A project shows only the highlights that apply to it.' },
  access: { read: () => true, ...editorWrite },
  hooks: contentHooks,
  defaultSort: 'order',
  fields: [
    { type: 'row', fields: [
      { name: 'label', type: 'text', required: true, admin: { placeholder: 'Golden Visa eligible' } },
      { name: 'short', label: 'Short label (cards)', type: 'text', admin: { placeholder: 'Golden Visa', description: 'Optional shorter text for the small chips on cards.' } },
      { name: 'icon', type: 'select', required: true, defaultValue: 'check', options: HIGHLIGHT_ICONS },
    ] },
    { name: 'desc', label: 'One-line description', type: 'textarea', admin: { description: 'Shown on the project page under the label.' } },
    { type: 'row', fields: [
      {
        name: 'rule', label: 'Apply automatically', type: 'select', defaultValue: 'none',
        options: [
          { label: 'No, I tick it per project', value: 'none' },
          { label: 'Every off-plan project', value: 'all' },
          { label: 'When the starting price is at least…', value: 'minPrice' },
        ],
      },
      { name: 'minPrice', label: 'Minimum starting price (AED)', type: 'number', min: 0, admin: { condition: (_, s) => s?.rule === 'minPrice' } },
    ] },
    orderField,
  ],
};

/** F11 — communities / area guides with market figures. */
export const Communities: CollectionConfig = {
  slug: 'communities',
  labels: { singular: 'Community', plural: 'Communities' },
  admin: { components: { beforeListTable: ['/payload/components/StatusPills#StatusPills'] }, group: 'Content', useAsTitle: 'name', defaultColumns: ['name', 'avgSale', 'avgRent', 'roi', 'status'] },
  access: { read: publishedOrStaff, ...editorWrite },
  hooks: contentHooks,
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'tag', label: 'Tagline', type: 'text', required: true },
    { name: 'desc', label: 'Guide text', type: 'textarea', required: true },
    ...imageFields('image', 'Main image', true),
    latLngGroup(),
    {
      type: 'row',
      fields: [
        { name: 'avgSale', label: 'Avg. sale price (AED / sq ft)', type: 'number', required: true },
        { name: 'avgRent', label: 'Avg. annual rent (AED)', type: 'number', required: true },
        { name: 'roi', label: 'Gross yield (%)', type: 'number', required: true },
      ],
    },
    { name: 'highlights', type: 'text', hasMany: true, admin: { description: 'Landmarks, metro, schools, beaches…' } },
    {
      type: 'collapsible', label: 'Area guide (community page)',
      admin: { description: 'The long-form guide on the community page. Leave empty to show the short "Living in" text instead.' },
      fields: [
        { name: 'intro', type: 'textarea', admin: { description: 'Two or three sentences under the page title. Falls back to the price summary.' } },
        {
          name: 'guide', label: 'Guide topics', type: 'array',
          admin: { description: 'e.g. Location & connectivity, Community overview, Property, Amenities & lifestyle.' },
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'items', label: 'Sub-topics', type: 'array',
              fields: [
                { name: 'heading', type: 'text', required: true },
                { name: 'text', type: 'textarea', required: true, admin: { description: 'Leave a blank line between paragraphs.' } },
              ],
            },
          ],
        },
        { type: 'row', fields: [
          { name: 'pros', type: 'text', hasMany: true },
          { name: 'cons', type: 'text', hasMany: true },
        ] },
        { type: 'row', fields: [
          { name: 'suits', label: 'Suits you if…', type: 'textarea' },
          { name: 'notFor', label: 'Think twice if…', type: 'textarea' },
        ] },
        { name: 'nearby', label: 'Nearby communities', type: 'relationship', relationTo: 'communities', hasMany: true, admin: { description: 'Leave empty to pick the closest ones automatically.' } },
        {
          name: 'faqs', label: 'Questions for this community', type: 'array', labels: { singular: 'Question', plural: 'Questions' },
          admin: { initCollapsed: true, description: 'Shown on this community\u2019s page after the automatic questions.' },
          fields: [{ name: 'q', label: 'Question', type: 'text', required: true }, { name: 'a', label: 'Answer', type: 'textarea', required: true }],
        },
      ],
    },
    {
      name: 'life', label: 'Lifestyle (homepage area finder)', type: 'group',
      admin: { description: 'Used by the "Which area fits your life?" finder on the homepage.' },
      fields: [
        { type: 'row', fields: [
          { name: 'beach', label: 'Beach nearby', type: 'checkbox', defaultValue: false },
          { name: 'metro', label: 'Metro access', type: 'checkbox', defaultValue: false },
        ] },
        { type: 'row', fields: [
          { name: 'schools', label: 'Schools nearby', type: 'number', min: 0, defaultValue: 0 },
          { name: 'toDowntown', label: 'Minutes to Downtown', type: 'number', min: 0, defaultValue: 20 },
          { name: 'toAirport', label: 'Minutes to DXB airport', type: 'number', min: 0, defaultValue: 30 },
        ] },
      ],
    },
    seoGroup,
    statusField,
    orderField,
    slugField('name'),
  ],
};

/** F12 — developers. */
export const Developers: CollectionConfig = {
  slug: 'developers',
  admin: { group: 'Content', useAsTitle: 'name', defaultColumns: ['name', 'founded'] },
  access: { read: () => true, ...editorWrite },
  hooks: contentHooks,
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'desc', label: 'Description', type: 'textarea', required: true },
    { type: 'row', fields: [{ name: 'founded', type: 'number', required: true }, { name: 'projects', label: 'Projects delivered', type: 'number' }] },
    { name: 'about', type: 'textarea', admin: { description: 'Short "About" section on the developer page: two short paragraphs, with a blank line between them.' } },
    { name: 'knownFor', label: 'Known for', type: 'text', hasMany: true, admin: { description: 'Landmark projects or communities, shown as chips.' } },
    { name: 'logo', type: 'upload', relationTo: 'media', admin: { description: 'Only with written permission from the developer.' } },
    { name: 'heroImage', label: 'Banner photo', type: 'upload', relationTo: 'media', admin: { description: 'Top of the developer page. Leave empty to use a photo of one of their projects.' } },
    { name: 'website', label: 'Website link', type: 'text', admin: { placeholder: 'https://…' },
      validate: (v: unknown) => !v || (typeof v === 'string' && /^https?:\/\//.test(v)) ? true : 'Start the link with https://' },
    {
      name: 'faqs', label: 'Questions about this developer', type: 'array', labels: { singular: 'Question', plural: 'Questions' },
      admin: { initCollapsed: true, description: 'Shown at the bottom of the developer page.' },
      fields: [{ name: 'q', label: 'Question', type: 'text', required: true }, { name: 'a', label: 'Answer', type: 'textarea', required: true }],
    },
    orderField,
    slugField('name'),
  ],
};

/** F15 — agent profiles shown on the website (published with consent). */
export const Agents: CollectionConfig = {
  slug: 'agents',
  labels: { singular: 'Team member', plural: 'Team' },
  admin: { components: { beforeListTable: ['/payload/components/StatusPills#StatusPills'] }, group: 'Content', useAsTitle: 'name', defaultColumns: ['name', 'title', 'brn', 'status'] },
  access: { read: publishedOrStaff, ...editorWrite },
  hooks: contentHooks,
  defaultSort: 'order',
  fields: [
    { type: 'row', fields: [{ name: 'name', type: 'text', required: true }, { name: 'title', label: 'Job title', type: 'text', required: true }] },
    ...imageFields('photo', 'Photo', true),
    { type: 'row', fields: [{ name: 'brn', label: 'RERA BRN', type: 'text', required: true }, { name: 'phone', type: 'text', required: true }, { name: 'email', type: 'email', required: true }] },
    { name: 'languages', type: 'text', hasMany: true, required: true },
    { name: 'specialties', label: 'Specialist areas', type: 'text', hasMany: true },
    { name: 'bio', type: 'textarea', required: true },
    { name: 'deals', label: 'Closed deals', type: 'number' },
    { type: 'row', fields: [
      { name: 'linkedin', label: 'LinkedIn link', type: 'text', admin: { placeholder: 'https://www.linkedin.com/in/…' } },
      { name: 'instagram', label: 'Instagram link', type: 'text', admin: { placeholder: 'https://www.instagram.com/…' } },
    ] },
    statusField,
    orderField,
    slugField('name'),
  ],
};

/** F16 — Insights articles, with the AEO/GEO fields used on the article page. */
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Article', plural: 'Articles' },
  admin: { components: { beforeListTable: ['/payload/components/StatusPills#StatusPills'] }, group: 'Content', useAsTitle: 'title', defaultColumns: ['title', 'category', 'date', 'author', 'status'] },
  access: { read: publishedOrStaff, ...editorWrite },
  hooks: contentHooks,
  defaultSort: '-date',
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 90 },
    { type: 'row', fields: [
      { name: 'category', type: 'text', required: true, admin: { components: { Field: '/payload/components/CategoryField#CategoryField' }, description: 'Categories are set in Admin > Insights pages.' } },
      { name: 'date', label: 'Published on', type: 'date', required: true },
      { name: 'lastReviewed', label: 'Last reviewed / updated', type: 'date' },
    ] },
    { name: 'author', type: 'relationship', relationTo: 'agents', required: true },
    ...imageFields('image', 'Featured image', true),
    { name: 'excerpt', type: 'textarea', required: true, maxLength: 220 },
    { name: 'summary', label: '"In short" summary', type: 'textarea', admin: { description: '2–3 sentences answering the title directly (shown first, used by answer engines).' } },
    { name: 'sampleNote', type: 'textarea', admin: { description: 'Shown as a notice while figures are sample data. Clear it when real data is in.' } },
    { name: 'body', type: 'richText', required: true },
    { name: 'takeaways', label: 'Key takeaways', type: 'array', fields: [{ name: 'text', type: 'text', required: true }] },
    { name: 'steps', label: 'Step by step', type: 'array', fields: [{ name: 'title', type: 'text', required: true }, { name: 'text', type: 'textarea', required: true }] },
    {
      name: 'table',
      label: 'Comparison table',
      type: 'group',
      fields: [
        { type: 'row', fields: [{ name: 'title', type: 'text' }, { name: 'caption', type: 'text' }] },
        { name: 'head', label: 'Column headings', type: 'text', hasMany: true },
        { name: 'rows', type: 'array', fields: [{ name: 'cells', type: 'text', hasMany: true, required: true }] },
      ],
    },
    {
      name: 'communityRows',
      label: 'Community comparison rows',
      type: 'group',
      admin: { description: 'Builds a table from live community figures.' },
      fields: [
        { type: 'row', fields: [{ name: 'title', type: 'text' }, { name: 'caption', type: 'text' }] },
        { name: 'rows', type: 'array', fields: [{ type: 'row', fields: [{ name: 'community', type: 'relationship', relationTo: 'communities', required: true }, { name: 'bestFor', type: 'text', required: true }] }] },
      ],
    },
    { name: 'showCommunityComparison', label: 'Show full community comparison table', type: 'checkbox' },
    { name: 'faqs', label: 'FAQs', type: 'array', fields: [{ name: 'q', label: 'Question', type: 'text', required: true }, { name: 'a', label: 'Answer', type: 'textarea', required: true }] },
    { name: 'sources', type: 'array', fields: [{ type: 'row', fields: [{ name: 'label', type: 'text', required: true }, { name: 'url', type: 'text', required: true }] }] },
    seoGroup,
    statusField,
    slugField('title'),
  ],
};

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: { group: 'Content', useAsTitle: 'name', defaultColumns: ['name', 'role', 'rating', 'status'], description: 'Real client reviews only, published with consent.' },
  access: { read: publishedOrStaff, ...editorWrite },
  hooks: contentHooks,
  defaultSort: 'order',
  fields: [
    { type: 'row', fields: [{ name: 'name', label: 'Name (first name and initial)', type: 'text', required: true }, { name: 'role', label: 'Context', type: 'text', required: true }] },
    { name: 'text', type: 'textarea', required: true },
    { type: 'row', fields: [
      { name: 'kind', label: 'Client type', type: 'select', required: true, defaultValue: 'buyer', options: TESTIMONIAL_KINDS,
        admin: { description: 'Used by the "who are you" filter on the homepage.' } },
      { name: 'outcome', label: 'Result (optional)', type: 'text', admin: { description: 'Short, true result, e.g. "Sold 6% over asking" or "Moved in 7 days".' } },
      { name: 'rating', type: 'number', min: 1, max: 5, defaultValue: 5 },
    ] },
    ...imageFields('image', 'Home photo'),
    ...imageFields('photo', 'Client photo'),
    statusField,
    orderField,
  ],
};

export const Services: CollectionConfig = {
  slug: 'services',
  admin: { group: 'Content', useAsTitle: 'name', defaultColumns: ['name', 'order', 'status'] },
  access: { read: publishedOrStaff, ...editorWrite },
  hooks: contentHooks,
  defaultSort: 'order',
  fields: [
    { type: 'row', fields: [{ name: 'name', type: 'text', required: true }, { name: 'icon', type: 'select', required: true, options: ICONS }] },
    { name: 'desc', label: 'Description', type: 'textarea', required: true },
    { name: 'points', label: 'Key points', type: 'text', hasMany: true },
    ...imageFields('image', 'Image'),
    { type: 'row', fields: [
      { name: 'ctaLabel', label: 'Extra button: label', type: 'text', admin: { placeholder: 'e.g. Mortgage calculator' } },
      { name: 'ctaHref', label: 'Extra button: link', type: 'text', admin: { placeholder: '/mortgage' },
        validate: (v: unknown) => !v || (typeof v === 'string' && /^(\/|https?:\/\/)/.test(v)) ? true : 'Start with / for a page on this site, or https://' },
    ] },
    {
      name: 'faqs', label: 'Questions about this service', type: 'array', labels: { singular: 'Question', plural: 'Questions' },
      admin: { initCollapsed: true, description: 'Shown in the questions section at the bottom of the Services page.' },
      fields: [{ name: 'q', label: 'Question', type: 'text', required: true }, { name: 'a', label: 'Answer', type: 'textarea', required: true }],
    },
    statusField,
    orderField,
    slugField('name'),
  ],
};

export const Careers: CollectionConfig = {
  slug: 'careers',
  labels: { singular: 'Job opening', plural: 'Careers' },
  admin: { group: 'Content', useAsTitle: 'title', defaultColumns: ['title', 'dept', 'type', 'status'] },
  access: { read: publishedOrStaff, ...editorWrite },
  hooks: contentHooks,
  fields: [
    { name: 'title', type: 'text', required: true },
    { type: 'row', fields: [{ name: 'dept', label: 'Department', type: 'text', required: true }, { name: 'type', label: 'Employment type', type: 'text', required: true }, { name: 'location', type: 'text', required: true }] },
    { name: 'desc', label: 'Description', type: 'textarea', required: true },
    { type: 'row', fields: [{ name: 'postedAt', label: 'Posted on', type: 'date' }, { name: 'closesAt', label: 'Closes on', type: 'date' }, { name: 'salary', label: 'Salary range', type: 'text' }] },
    statusField,
  ],
};
