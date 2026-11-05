// @ts-nocheck -- Cloudflare runtime entry; imports the generated OpenNext worker, which exists only after a build.

// Loaded only when a page must be rendered, so saved pages are served without starting the whole site.
const app = () => import('./.open-next/worker.js').then(m => m.default);

/**
 * Serves public pages from the Cloudflare location nearest the visitor. A saved page is returned at once;
 * if it is older than FRESH_MS it is rebuilt in the background, so a CMS edit reaches each location on the
 * first visit after saving and shows from the next one. Staff (signed in) always get live pages.
 */
const FRESH_MS = 30_000;
const KEEP_SECONDS = 7 * 24 * 3600;
const TRACKING = /^(utm_.+|gclid|fbclid|msclkid|ttclid)$/i;
const SKIP = /^\/(admin|api|next|_next|cdn-cgi)(\/|$)/;

function cacheKey(request) {
  const url = new URL(request.url);
  if (request.method !== 'GET' || SKIP.test(url.pathname)) return null;
  if (/(^|;\s*)payload-token=/.test(request.headers.get('cookie') ?? '')) return null;
  const rsc = request.headers.has('rsc');
  if (rsc && !url.searchParams.has('_rsc')) return null; // only hashed page-data requests vary safely by address
  for (const name of [...url.searchParams.keys()]) if (TRACKING.test(name)) url.searchParams.delete(name);
  url.searchParams.sort();
  url.searchParams.set('__edge', rsc ? 'data' : 'page');
  return new Request(url.toString());
}

async function renderAndSave(request, key, env, ctx) {
  const headers = new Headers(request.headers);
  headers.delete('if-none-match');
  headers.delete('if-modified-since');
  const response = await (await app()).fetch(new Request(request, { headers }), env, ctx);
  if (response.status !== 200 || response.headers.has('set-cookie')) return response;
  const saved = new Response(response.clone().body, response);
  saved.headers.set('Cache-Control', `public, max-age=${KEEP_SECONDS}`);
  saved.headers.set('X-Saved-At', String(Date.now()));
  ctx.waitUntil(caches.default.put(key, saved));
  return response;
}

function toVisitor(response, state) {
  const out = new Response(response.body, response);
  out.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  out.headers.delete('X-Saved-At');
  out.headers.set('X-Edge-Cache', state);
  return out;
}

export default {
  async fetch(request, env, ctx) {
    const key = cacheKey(request);
    if (!key) return (await app()).fetch(request, env, ctx);
    const hit = await caches.default.match(key);
    if (hit) {
      const age = Date.now() - Number(hit.headers.get('X-Saved-At') ?? 0);
      if (age > FRESH_MS) {
        ctx.waitUntil(renderAndSave(request.clone(), key, env, ctx).catch(() => {}));
        return toVisitor(hit, 'STALE');
      }
      return toVisitor(hit, 'HIT');
    }
    return toVisitor(await renderAndSave(request, key, env, ctx), 'MISS');
  },
};
