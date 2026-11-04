import type { Metadata } from 'next';
import { NotFoundBody } from '@/components/layout/NotFoundBody';

export const metadata: Metadata = { title: 'Page not found' };

/** Shown when a page calls notFound() (e.g. a listing, community or article that was removed). */
export default function NotFound() {
  return <NotFoundBody />;
}
