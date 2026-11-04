import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/icons';
import { SectionHead } from '@/components/ui/SectionHead';
import type { Post } from '@/data/types';
import { data } from '@/lib/cms';
import { readingMinutes } from '@/lib/insights';
import { fmtDate } from '@/lib/market';
import { marketPulse } from '@/lib/pulse';
import { sectionCopy, titleSegments } from '@/lib/homeCopy';

const monthYear = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/**
 * Insights (soft UI bento): the latest article large, the next two beside it, and a pressed-in
 * "market pulse" built from the community figures in the CMS (average AED per sq ft, average
 * yield, communities tracked) with the optional quarter-on-quarter changes from Site settings.
 */
export async function Insights() {
  const copy = await sectionCopy('insights');
  const d = await data();
  const posts = d.latestPosts(3);
  if (!posts.length) return null;
  const { communities } = d.c;
  const m = d.site.market;
  const report = d.c.posts.filter(p => p.cat === 'Market Reports').sort((a, b) => b.date.localeCompare(a.date))[0];
  const pulse = marketPulse(communities, m);
  const kpis: { value: string; label: string; change?: number; unit?: string }[] = [
    { value: pulse.pricePerSqft, label: 'Avg price / sq ft', change: pulse.priceChange, unit: '%' },
    { value: pulse.yield, label: 'Avg rental yield', change: pulse.yieldChange, unit: ' pts' },
    { value: String(pulse.tracked), label: 'Communities tracked' },
  ];
  return (
    <section aria-labelledby="insights-title" className="cv-auto bg-mist py-[clamp(56px,8vw,110px)]">
      <div className="wrap">
        <SectionHead id="insights-title" eyebrow={copy.eyebrow} link="/insights" linkLabel="All articles"
          title={titleSegments(copy)} />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          {posts.map((p, i) => <Tile key={p.id} p={p} big={i === 0} minRead={d.site.insights.text.minRead} />)}
          {communities.length > 0 && (
            <div className="grid items-center gap-5 rounded-[26px] soft-inset p-[clamp(18px,2vw,24px)] md:col-span-2 lg:grid-cols-[auto_1fr]">
              <div className="grid max-w-[220px] gap-2">
                <span className="eyebrow !mb-0">Market pulse</span>
                <b className="text-[1.15rem]">Dubai this quarter</b>
                <span className="text-[0.8rem] text-muted">Updated {monthYear(m.updated)}. <span className="line-clamp-2">{m.source}</span></span>
                {report && (
                  <Link href={`/insights/${report.slug}`} className="group mt-1 inline-flex items-center gap-2.5 text-[0.9rem] font-bold text-forest">
                    Read the latest report
                    <span className="grid size-8 place-items-center rounded-full soft-raised-sm transition-transform duration-300 group-hover:translate-x-1"><Icon name="arrow" className="size-4" /></span>
                  </Link>
                )}
              </div>
              <dl className="grid gap-3 sm:grid-cols-3">
                {kpis.map(k => (
                  <div key={k.label} className="flex flex-col rounded-[18px] soft-raised-sm p-3.5">
                    <dt className="order-2 text-[0.76rem] font-bold text-muted">{k.label}</dt>
                    <dd className="order-1 text-[clamp(1.05rem,1.8vw,1.35rem)] font-extrabold tracking-[-0.02em] text-forest">{k.value}</dd>
                    {k.change != null && (
                      <dd className={`order-3 mt-1 text-[0.78rem] font-extrabold ${k.change >= 0 ? 'text-[#127A3F]' : 'text-[#B42318]'}`}>
                        <span aria-hidden="true">{k.change >= 0 ? '▲' : '▼'} </span>
                        <span className="sr-only">{k.change >= 0 ? 'Up' : 'Down'} </span>{Math.abs(k.change)}{k.unit} vs last quarter
                      </dd>
                    )}
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Tile({ p, big, minRead }: { p: Post; big: boolean; minRead: string }) {
  return (
    <article data-cursor="Read"
      className={`group relative flex flex-col rounded-[26px] soft-raised p-2.5 transition-[translate] duration-500 ease-[cubic-bezier(.16,1,.3,1)] pointer-fine:hover:-translate-y-1.5 ${big ? 'md:col-span-2 lg:col-span-1 lg:row-span-2' : ''}`}>
      <span className={`relative block overflow-hidden rounded-[18px] ${big ? 'h-[clamp(220px,26vw,340px)] lg:h-auto lg:min-h-[300px] lg:flex-1' : 'h-[180px]'}`}>
        <Image src={p.img} alt="" fill sizes={big ? '(min-width:1024px) 520px, 100vw' : '(min-width:1024px) 340px, (min-width:768px) 50vw, 100vw'}
          className="object-cover transition-[scale] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05]" />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-mist/93 px-2.5 py-1 text-[0.72rem] font-extrabold tracking-[0.03em] text-forest shadow-[3px_3px_8px_rgba(18,38,26,.2)] backdrop-blur-md">{p.cat}</span>
      </span>
      <div className="grid gap-2 px-2 pb-2 pt-3.5">
        <p className="flex items-center gap-2.5 text-[0.8rem] font-semibold text-muted">
          <time dateTime={p.date}>{fmtDate(p.date)}</time><i aria-hidden="true" className="size-1 rounded-full bg-gold" />{readingMinutes(p)} {minRead}
        </p>
        <h3 className={big ? 'text-[clamp(1.25rem,2vw,1.5rem)]' : 'text-[1.05rem]'}>
          <Link href={`/insights/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] group-hover:text-forest">{p.title}</Link>
        </h3>
        {big && <p className="text-ink-2">{p.excerpt}</p>}
      </div>
    </article>
  );
}
