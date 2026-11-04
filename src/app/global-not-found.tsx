import type { Metadata } from 'next';
import { NotFoundBody } from '@/components/layout/NotFoundBody';
import SiteLayout from './(site)/layout';

export const metadata: Metadata = { title: 'Page not found | Splendid Homes', robots: { index: false } };

/**
 * Addresses that match no route at all (e.g. /xyz) get a true 404 status with the branded page.
 * The app has two root layouts (site and admin), so this reuses the site layout around the page.
 */
export default function GlobalNotFound() {
  return <SiteLayout params={Promise.resolve({})}><NotFoundBody /></SiteLayout>;
}
