import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload';

/** Single cache tag for all public content (see src/lib/cms.ts). */
export const CONTENT_TAG = 'content';

/**
 * Expires cached public pages after an edit, so the next visit renders fresh content instead of waiting on
 * a background refresh. Outside a Next request (seed script, CLI) it is a no-op.
 */
async function revalidateContent() {
  try {
    const { revalidateTag } = await import('next/cache');
    revalidateTag(CONTENT_TAG, { expire: 0 });
  } catch {
    /* not running inside Next (e.g. `payload run`) */
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc }) => { await revalidateContent(); return doc; };
export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => { await revalidateContent(); return doc; };
export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc }) => { await revalidateContent(); return doc; };

const titleOf = (doc: Record<string, unknown>) => String(doc.title ?? doc.name ?? doc.email ?? doc.slug ?? doc.id ?? '');

/** Activity log (Document 5): who changed what, and when. Only staff actions are logged. */
export const logChange: CollectionAfterChangeHook = async ({ doc, operation, req, collection }) => {
  if (!req.user || collection.slug === 'activity') return doc;
  await req.payload.create({
    collection: 'activity',
    data: { user: req.user.id, action: operation === 'create' ? 'created' : 'updated', collectionSlug: collection.slug, docId: String(doc.id), title: titleOf(doc) },
    overrideAccess: true,
    req,
  });
  return doc;
};

export const logDelete: CollectionAfterDeleteHook = async ({ doc, req, collection }) => {
  if (!req.user || collection.slug === 'activity') return doc;
  await req.payload.create({
    collection: 'activity',
    data: { user: req.user.id, action: 'deleted', collectionSlug: collection.slug, docId: String(doc.id), title: titleOf(doc) },
    overrideAccess: true,
    req,
  });
  return doc;
};

/** Hooks for every public content collection. */
export const contentHooks = {
  afterChange: [revalidateAfterChange, logChange],
  afterDelete: [revalidateAfterDelete, logDelete],
};
