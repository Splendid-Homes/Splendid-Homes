import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Don't advertise the stack (Payload would otherwise add "X-Powered-By: Next.js, Payload").
  poweredByHeader: false,
  experimental: {
    // Tailwind CSS is small (~13 KB gzipped): inlining it removes the render-blocking
    // stylesheet round trip, which sets FCP/LCP for first-time mobile visitors.
    inlineCss: true,
    // Branded 404 with a true 404 status for addresses that match no route (app/global-not-found.tsx).
    globalNotFound: true,
    // Career applications upload a CV (max 5 MB) through the lead server action.
    serverActions: { bodySizeLimit: '6mb' },
    // Local builds read the emulated D1 (one SQLite file via wrangler); parallel build workers
    // each start their own emulator and collide on it. Use one worker unless building against
    // the real D1 (CLOUDFLARE_REMOTE_BINDINGS=true, e.g. in CI).
    ...(process.env.CLOUDFLARE_REMOTE_BINDINGS === 'true' ? {} : { cpus: 1 }),
  },
  turbopack: {
    ...(process.env.CF_WORKER_BUILD === 'true' ? { resolveAlias: { 'drizzle-kit/api': './src/lib/drizzle-kit-stub.ts' } } : {}),
    rules: {
      // Only the site stylesheet goes through Tailwind (not Payload's admin CSS).
      'globals.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  images: {
    // Prototype photography is remote (Unsplash) until the client's own media is uploaded;
    // uploads are served by Payload from Cloudflare R2 under /api/media/file/.
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/**' }],
    formats: ['image/avif', 'image/webp'],
    // One setting for every photo: smaller files, and the main photo is what Google times on phones.
    qualities: [55],
    // Temporary preview over a home connection: browsers fetch photos directly instead of through this machine.
    unoptimized: process.env.PREVIEW_DIRECT_IMAGES === 'true',
  },
  // Packages with Cloudflare Workers (workerd) specific code (OpenNext guidance, Payload template).
  serverExternalPackages: ['jose', 'pg-cloudflare'],
};

const withCms = withPayload(nextConfig, { devBundleServerPackages: false });
const payloadHeaders = withCms.headers;

/**
 * Payload adds `Critical-CH: Sec-CH-Prefers-Color-Scheme` (+ Accept-CH, Vary) to every path for its
 * admin dark mode. On the public site that forces Chrome to retry each page request with the hint
 * (an extra round trip, ~600 ms on mobile) and the Vary splits the CDN cache. Keep it on /admin only.
 */
export default {
  ...withCms,
  async headers() {
    const list = payloadHeaders ? await payloadHeaders() : [];
    return [
      ...list.map(rule =>
        rule.source === '/:path*' && rule.headers.some(h => h.key === 'Critical-CH') ? { ...rule, source: '/admin/:path*' } : rule),
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
        ],
      },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
  /** The blog lives at /insights; /blog and /blog/<slug> are common guesses, so send them there (permanent). */
  async redirects() {
    const own = withCms.redirects ? await withCms.redirects() : [];
    return [
      ...own,
      { source: '/blog', destination: '/insights', permanent: true },
      { source: '/blog/:slug', destination: '/insights/:slug', permanent: true },
    ];
  },
} satisfies NextConfig;
