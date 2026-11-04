'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Sidebar shortcut that lights up on its own page. */
export function ShNavLink({ href, className, exact, children }: { href: string; className: string; exact?: boolean; children: React.ReactNode }) {
  const path = usePathname();
  const on = exact ? path === href : path === href || path.startsWith(`${href}/`);
  return <Link href={href} className={className} aria-current={on ? 'page' : undefined}>{children}</Link>;
}
