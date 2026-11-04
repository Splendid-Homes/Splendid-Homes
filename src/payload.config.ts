import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite';
import { resendAdapter } from '@payloadcms/email-resend';
import { importExportPlugin } from '@payloadcms/plugin-import-export';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { r2Storage } from '@payloadcms/storage-r2';
import { type CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare';
import { buildConfig } from 'payload';
import type { GetPlatformProxyOptions } from 'wrangler';
import { isAdmin } from './payload/access';
import { Agents, Careers, Communities, Developers, Highlights, Posts, Projects, Properties, Services, Testimonials } from './payload/collections/content';
import { Activity, Leads, Media, Resumes, Users } from './payload/collections/system';
import { Fees } from './payload/globals/Fees';
import { ListingPages } from './payload/globals/ListingPages';
import { CommunitiesList } from './payload/globals/CommunitiesList';
import { DeveloperPages } from './payload/globals/DeveloperPages';
import { AboutTeam } from './payload/globals/AboutTeam';
import { ContactCareers } from './payload/globals/ContactCareers';
import { InsightsPages } from './payload/globals/InsightsPages';
import { CompareSaved } from './payload/globals/CompareSaved';
import { LegalPages } from './payload/globals/LegalPages';
import { AdminDashboard } from './payload/globals/AdminDashboard';
import { Menus } from './payload/globals/Menus';
import { PageSeo } from './payload/globals/PageSeo';
import { MortgagePage } from './payload/globals/MortgagePage';
import { NotFoundPage } from './payload/globals/NotFoundPage';
import { SellPage } from './payload/globals/SellPage';
import { ServicesPage } from './payload/globals/ServicesPage';
import { CommunityPages } from './payload/globals/CommunityPages';
import { OffplanPages } from './payload/globals/OffplanPages';
import { PropertyPage } from './payload/globals/PropertyPage';
import { Settings } from './payload/globals/Settings';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/* ---------- Cloudflare bindings (D1 database, R2 files) ----------
   In the deployed Worker they come from getCloudflareContext(). Locally (next dev / next start /
   payload CLI) wrangler's platform proxy emulates them in .wrangler/state; set
   CLOUDFLARE_REMOTE_BINDINGS=true to talk to the real D1/R2 (migrations at deploy time). */
const realpath = (value: string) => {
  try { return fs.existsSync(value) ? fs.realpathSync(value) : undefined; } catch { return undefined; }
};
const isCLI = process.argv.some(value => {
  const resolved = realpath(value);
  return Boolean(resolved && (resolved.endsWith(path.join('payload', 'bin.js')) || resolved.endsWith(path.join('next', 'dist', 'bin', 'next'))));
});
const isProduction = process.env.NODE_ENV === 'production';
const inWorker = typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers';

function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(({ getPlatformProxy }) =>
    getPlatformProxy({
      environment: process.env.CLOUDFLARE_ENV,
      remoteBindings: process.env.CLOUDFLARE_REMOTE_BINDINGS === 'true',
    } satisfies GetPlatformProxyOptions),
  );
}

const cloudflare = !inWorker && (isCLI || !isProduction || process.env.CLOUDFLARE_LOCAL === 'true')
  ? await getCloudflareContextFromWrangler()
  : await getCloudflareContext({ async: true });

/* ---------- Email: Resend over HTTPS (works in Workers). Without a key, emails are logged. ---------- */
const email = process.env.RESEND_API_KEY
  ? resendAdapter({
    apiKey: process.env.RESEND_API_KEY,
    defaultFromAddress: process.env.EMAIL_FROM ?? 'website@splendidhomes.ae',
    defaultFromName: 'Splendid Homes website',
  })
  : undefined;

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL,
  secret: process.env.PAYLOAD_SECRET || '',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · Splendid Homes admin', icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/icon.svg' }] },
    theme: 'dark',
    components: {
      graphics: { Logo: '/payload/components/AdminBrand#AdminLogo', Icon: '/payload/components/AdminBrand#AdminIcon' },
      beforeLogin: ['/payload/components/AdminChrome#LoginIntro'],
      beforeNavLinks: ['/payload/components/AdminChrome#NavShortcuts'],
      afterNavLinks: ['/payload/components/AdminChrome#NavUser'],
      actions: ['/payload/components/HeaderTools#HeaderTools'],
      providers: ['/payload/components/AdminChrome#AdminFonts'],
      beforeDashboard: ['/payload/components/LeadStats#LeadStats'],
      views: {
        leadBoard: { Component: '/payload/components/LeadBoard#LeadBoard', path: '/lead-board' },
      },
    },
  },
  collections: [Leads, Resumes, Properties, Projects, Highlights, Communities, Developers, Agents, Posts, Testimonials, Services, Careers, Media, Users, Activity],
  globals: [Settings, ListingPages, PropertyPage, OffplanPages, CommunitiesList, CommunityPages, DeveloperPages, SellPage, ServicesPage, MortgagePage, AboutTeam, ContactCareers, InsightsPages, CompareSaved, LegalPages, Menus, PageSeo, AdminDashboard, NotFoundPage, Fees],
  editor: lexicalEditor(),
  email,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: sqliteD1Adapter({ binding: cloudflare.env.D1, push: false, migrationDir: path.resolve(dirname, 'migrations') }),
  upload: { limits: { fileSize: 10 * 1024 * 1024 } },
  plugins: [
    r2Storage({ bucket: cloudflare.env.R2, collections: { media: true, resumes: true, exports: true } }),
    importExportPlugin({
      collections: [{ slug: 'leads', export: true, import: false }],
      // F32: CSV export is limited to the main admin (and logged in the activity log).
      overrideExportCollection: ({ collection }) => ({
        ...collection,
        admin: { ...collection.admin, group: 'Leads', hidden: ({ user }) => (user as { role?: string } | null)?.role !== 'admin' },
        access: { ...collection.access, read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
      }),
    }),
  ],
});
