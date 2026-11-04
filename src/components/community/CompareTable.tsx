import Link from 'next/link';
import { StatSource } from '@/components/seo/StatSource';
import { num } from '@/lib/data';
import { data } from '@/lib/cms';

/**
 * Communities compared on price per sq ft, rent and yield: a real <table> (answer engines and
 * featured snippets lift tables), sourced and dated. `current` highlights one row.
 */
export async function CompareTable({ current, caption }: { current?: string; caption: string }) {
  const d = await data();
  const C = d.site.communityPage, T = C.text;
  const rows = d.ranked(C.rankBy);
  const m = d.site.market;
  const th = 'px-4 py-3 text-left text-[0.74rem] font-bold uppercase tracking-[0.08em] text-muted';
  const td = 'px-4 py-3.5 tabular-nums';
  return (
    <div>
      <div role="region" aria-label={caption} tabIndex={0} className="overflow-x-auto rounded-[24px] soft-inset p-2 focus-visible:outline-2">
        <table className="soft-table w-full min-w-[620px] text-[0.94rem]">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col" className={th}>{T.colCommunity}</th>
              <th scope="col" className={`${th} text-right`}>{T.colPrice}</th>
              <th scope="col" className={`${th} text-right`}>{T.colRent}</th>
              <th scope="col" className={`${th} text-right`}>{T.colYield}</th>
              <th scope="col" className={`${th} text-right`}>{T.colListings}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(c => {
              const n = d.communityCounts(c.slug);
              const on = c.slug === current;
              return (
                <tr key={c.slug} aria-current={on ? 'true' : undefined} className={on ? 'soft-table-on font-bold' : undefined}>
                  <th scope="row" className={`${td} text-left font-semibold`}>
                    {on ? c.name : <Link href={`/community/${c.slug}`} className="text-forest underline-offset-4 hover:underline">{c.name}</Link>}
                  </th>
                  <td className={`${td} text-right`}>AED {num(c.avgSale)}</td>
                  <td className={`${td} text-right`}>AED {num(c.avgRent)}</td>
                  <td className={`${td} text-right`}>{c.roi}%</td>
                  <td className={`${td} text-right`}>{n.sale + n.rent}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <StatSource className="mt-3" source={m.source} url={m.sourceUrl} updated={m.updated} />
    </div>
  );
}
