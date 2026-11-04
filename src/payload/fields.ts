import type { Field, TextField } from 'payload';

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

/** Web address segment, generated from `from` when left empty. Unique per collection. */
export const slugField = (from = 'title'): TextField => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  admin: { position: 'sidebar', description: 'Page address. Leave empty to generate it from the name.' },
  hooks: {
    beforeValidate: [({ value, data }) => (value ? slugify(String(value)) : data?.[from] ? slugify(String(data[from])) : value)],
  },
});

/** Draft/published switch used by the public-read access rule. */
export const statusField: Field = {
  name: 'status',
  type: 'select',
  required: true,
  defaultValue: 'draft',
  options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }],
  admin: { position: 'sidebar' },
};

/**
 * Image = uploaded file (preferred) or an external URL. The URL field holds the prototype's
 * stock photography until the client's own photos are uploaded.
 */
export const imageFields = (name: string, label: string, required = false): Field[] => [
  { name, label, type: 'upload', relationTo: 'media' },
  {
    name: `${name}Url`,
    label: `${label} (external URL)`,
    type: 'text',
    admin: { description: 'Used only when no file is uploaded above (sample photography).' },
    validate: (v: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
      !required || v || siblingData?.[name] ? true : `Upload ${label.toLowerCase()} or enter a URL.`,
  },
];

export const galleryField = (name = 'images', label = 'Gallery'): Field => ({
  name,
  label,
  type: 'array',
  minRows: 1,
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'url', type: 'text', admin: { description: 'External URL (sample photography) when no file is uploaded.' } },
  ],
});

export const seoGroup: Field = {
  name: 'seo',
  label: 'SEO',
  type: 'group',
  admin: { description: 'Optional. Leave empty to use the automatic title and description.' },
  fields: [
    { name: 'metaTitle', type: 'text', maxLength: 70 },
    { name: 'metaDescription', type: 'textarea', maxLength: 300 },
  ],
};

export const orderField: Field = { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar', description: 'Lower numbers show first.' } };
export const latLngGroup = (name = 'coords', label = 'Map position'): Field => ({
  name,
  label,
  type: 'group',
  fields: [{ type: 'row', fields: [{ name: 'lat', type: 'number', required: true }, { name: 'lng', type: 'number', required: true }] }],
});
