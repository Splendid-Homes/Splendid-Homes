/**
 * Small front Worker for splendid-homes.com. The site itself is a 45 MB Worker that takes 1-2 seconds to
 * start, so this one answers saved pages and resized photos without waking it.
 *
 * Lookup order: this location's cache, then one shared copy in R2 (so a location that has not seen a page
 * yet does not wait for a render), then the site. A saved page older than FRESH_MS is rebuilt in the
 * background, so a CMS edit shows from the next visit after the first. Signed-in staff get live pages.
 */
const FRESH_MS = 30_000;
const SHARED_EVERY_MS = 5 * 60_000; // how often a page's shared copy is rewritten
const PAGE_SECONDS = 7 * 24 * 3600;
const IMAGE_SECONDS = 30 * 24 * 3600;
const TRACKING = /^(utm_.+|gclid|fbclid|msclkid|ttclid)$/i;
const SKIP = /^\/(admin|api|next|_next|cdn-cgi)(\/|$)/;
const DROP_HEADERS = new Set(['set-cookie', 'x-edge-cache', 'x-saved-at', 'x-shared-at', 'cf-cache-status', 'age', 'content-length', 'content-encoding', 'transfer-encoding', 'connection', 'date', 'report-to', 'nel', 'server', 'cf-ray', 'alt-svc']);

/** What to save this request as, or null to send it straight to the site. */
function classify(request, env) {
  if (request.method !== 'GET') return null;
  const url = new URL(request.url);
  if (/(^|;\s*)payload-token=/.test(request.headers.get('cookie') ?? '')) return null;
  const version = env.APP_BUILD ?? '';
  if (url.pathname === '/_next/image') {
    const accept = request.headers.get('accept') ?? '';
    const format = accept.includes('image/avif') ? 'avif' : accept.includes('image/webp') ? 'webp' : 'plain';
    url.searchParams.sort();
    url.searchParams.set('__edge', `image-${format}`);
    return { kind: 'image', key: url.toString() };
  }
  if (SKIP.test(url.pathname)) return null;
  const rsc = request.headers.has('rsc');
  if (rsc && !url.searchParams.has('_rsc')) return null; // only hashed page-data requests vary safely by address
  for (const name of [...url.searchParams.keys()]) if (TRACKING.test(name)) url.searchParams.delete(name);
  url.searchParams.sort();
  url.searchParams.set('__edge', rsc ? 'data' : 'page');
  // Saved pages point at the code files of their own build, so each build keeps its own copies.
  url.searchParams.set('__v', version);
  return { kind: 'page', key: url.toString() };
}

/**
 * Keeps listing cards, the newsletter box and the Compare picker inside the screen on phones. The same fix is in
 * the site's own code; this covers a live site built before it, and can go once a later build is live.
 */
const PHONE_FIT = String.raw`@media (max-width:767px){.grid:has(>article.group\/card),.grid:has(>.lg\:w-\[380px\]),ul.grid:has(>li.flex.items-center.gap-3.p-2\.5),.mb-5.grid:has(>fieldset){grid-template-columns:minmax(0,1fr)}article.group\/card,.lg\:w-\[380px\],li.flex.items-center.gap-3.p-2\.5{min-width:0}}`;

/**
 * The site inlines a large stylesheet, so its first chunk of HTML has no </head> yet and Next.js writes its
 * old-browser script ahead of <!DOCTYPE html>. That puts every browser in quirks mode. Only browsers without
 * module support (none the site runs on) would ever load that script, so it is dropped.
 */
async function fixDoctype(response) {
  if (!(response.headers.get('content-type') ?? '').includes('text/html') || !response.body) return response;
  const reader = response.body.getReader();
  const decoder = new TextDecoder(), encoder = new TextEncoder();
  let head = '';
  while (!head.includes('<!DOCTYPE') && head.length < 8192) {
    const { done, value } = await reader.read();
    if (done) break;
    head += decoder.decode(value, { stream: true });
  }
  const fixed = head.replace(/^<script[^>]*noModule[^>]*><\/script>(?=<!DOCTYPE)/i, '');
  const body = new ReadableStream({
    start(controller) { controller.enqueue(encoder.encode(fixed)); },
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        const rest = decoder.decode();
        if (rest) controller.enqueue(encoder.encode(rest));
        controller.close();
      } else controller.enqueue(encoder.encode(decoder.decode(value, { stream: true })));
    },
    cancel(reason) { return reader.cancel(reason); },
  });
  const out = new Response(body, response);
  out.headers.delete('content-length');
  return new HTMLRewriter().on('head', { element(head) { head.append(`<style>${PHONE_FIT}</style>`, { html: true }); } }).transform(out);
}

async function sharedName(key) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  return `edge/${[...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('')}`;
}

/** Ask the site for a fresh copy, save it here and (when due) in the shared store. */
async function renderAndSave(request, entry, env, ctx, sharedAt = 0) {
  const headers = new Headers(request.headers);
  headers.delete('if-none-match');
  headers.delete('if-modified-since');
  const response = await fixDoctype(await env.APP.fetch(new Request(request, { headers })));
  if (response.status === 404 || response.status === 410) { // deleted or unpublished: drop the saved copies too
    ctx.waitUntil(caches.default.delete(entry.key));
    ctx.waitUntil(sharedName(entry.key).then(name => env.SHARED.delete(name)).catch(() => {}));
    return response;
  }
  if (response.status !== 200 || response.headers.has('set-cookie')) return response;
  const now = Date.now();
  const shareNow = now - sharedAt > SHARED_EVERY_MS;
  const saved = new Response(response.clone().body, response);
  saved.headers.set('Cache-Control', `public, max-age=${entry.kind === 'image' ? IMAGE_SECONDS : PAGE_SECONDS}`);
  saved.headers.set('X-Saved-At', String(now));
  saved.headers.set('X-Shared-At', String(shareNow ? now : sharedAt));
  ctx.waitUntil(caches.default.put(entry.key, saved));
  if (shareNow) ctx.waitUntil(saveShared(response.clone(), entry, env, now).catch(() => {}));
  return response;
}

async function saveShared(response, entry, env, now) {
  const kept = Object.fromEntries([...response.headers].filter(([k]) => !DROP_HEADERS.has(k.toLowerCase())));
  const meta = JSON.stringify(kept);
  if (new TextEncoder().encode(meta).length > 1900) return; // R2 metadata limit; the page still works without a shared copy
  await env.SHARED.put(await sharedName(entry.key), await response.arrayBuffer(), { customMetadata: { h: meta, at: String(now) } });
}

async function fromShared(entry, env, ctx) {
  const object = await env.SHARED.get(await sharedName(entry.key));
  if (!object) return null;
  const at = Number(object.customMetadata?.at ?? 0);
  const headers = new Headers(JSON.parse(object.customMetadata?.h ?? '{}'));
  const body = await object.arrayBuffer();
  const copy = new Response(body, { headers });
  copy.headers.set('Cache-Control', `public, max-age=${entry.kind === 'image' ? IMAGE_SECONDS : PAGE_SECONDS}`);
  copy.headers.set('X-Saved-At', String(at));
  copy.headers.set('X-Shared-At', String(at));
  ctx.waitUntil(caches.default.put(entry.key, copy));
  return { response: new Response(body, { headers }), at };
}

function toVisitor(response, entry, state) {
  const out = new Response(response.body, response);
  // Photos never change at a given address; pages must be rechecked so CMS edits show.
  out.headers.set('Cache-Control', entry.kind === 'image' ? `public, max-age=${IMAGE_SECONDS}, immutable` : 'public, max-age=0, must-revalidate');
  out.headers.delete('X-Saved-At');
  out.headers.delete('X-Shared-At');
  out.headers.set('X-Edge-Cache', state);
  return out;
}

export default {
  async fetch(request, env, ctx) {
    const entry = classify(request, env);
    if (!entry) return request.method === 'GET' ? fixDoctype(await env.APP.fetch(request)) : env.APP.fetch(request);
    const refresh = sharedAt => ctx.waitUntil(renderAndSave(request.clone(), entry, env, ctx, sharedAt).catch(() => {}));

    const hit = await caches.default.match(entry.key);
    if (hit) {
      const stale = entry.kind === 'page' && Date.now() - Number(hit.headers.get('X-Saved-At') ?? 0) > FRESH_MS;
      if (stale) refresh(Number(hit.headers.get('X-Shared-At') ?? 0));
      return toVisitor(hit, entry, stale ? 'STALE' : 'HIT');
    }
    const shared = await fromShared(entry, env, ctx).catch(() => null);
    if (shared) {
      if (entry.kind === 'page') refresh(shared.at);
      return toVisitor(shared.response, entry, 'SHARED');
    }
    return toVisitor(await renderAndSave(request, entry, env, ctx), entry, 'MISS');
  },
};
