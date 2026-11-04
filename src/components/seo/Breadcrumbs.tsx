import Link from 'next/link';
import { Icon } from '@/components/icons';
import { breadcrumbJsonLd, type Crumb } from '@/lib/schema';
import { JsonLd } from './JsonLd';

/** Visible breadcrumb trail plus matching BreadcrumbList schema. The last crumb is the current page. */
export function Breadcrumbs({ items, className = '', tone = 'dark' }: { items: Crumb[]; className?: string; tone?: 'dark' | 'light' }) {
  const light = tone === 'light';
  return (
    <>
      <nav aria-label="Breadcrumb" className={className}>
        <ol className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.84rem] ${light ? 'text-[#B9DBC2]' : 'text-muted'}`}>
          {items.map((c, i) => {
            const last = i === items.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-1.5">
                {last
                  ? <span aria-current="page" className={`font-semibold ${light ? 'text-white' : 'text-ink-2'}`}>{c.name}</span>
                  : <Link href={c.href} className={`transition-colors ${light ? 'hover:text-white' : 'hover:text-forest'}`}>{c.name}</Link>}
                {!last && <Icon name="chevR" className="size-3.5 opacity-60" />}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  );
}
