import Link from 'next/link';
import { Icon, type IconName } from '@/components/icons';
import { CountUp } from '@/components/motion/CountUp';
import { SplitHeading } from '@/components/motion/SplitHeading';
import { data } from '@/lib/cms';
import { sectionCopy, titleSegments } from '@/lib/homeCopy';

/**
 * "Why Splendid Homes" (soft UI): us vs a typical agent. The comparison rows and the
 * other column's heading are edited in the CMS (Site settings > Homepage). The table sits
 * pressed into the page; a row rises out of it on hover (the first one until then).
 * Explicit ARIA roles keep it a table for screen readers after CSS turns it into a grid;
 * below sm each row becomes its own raised card with the column names inline.
 */
export async function WhySection() {
  const copy = await sectionCopy('why');
  const { site } = await data();
  const { rows, them } = site.why;
  if (!rows.length) return null;
  const s = site.stats;
  const stats = [[`${s.years}+`, 'Years in Dubai'], [s.clients, 'Happy clients']];
  return (
    <section aria-labelledby="why-title" className="bg-mist py-[clamp(56px,8vw,110px)]">
      <div className="wrap grid items-center gap-[clamp(28px,4vw,56px)] lg:grid-cols-[1fr_1.35fr]">
        <div>
          <span className="eyebrow mb-3">{copy.eyebrow}</span>
          <SplitHeading id="why-title" segments={titleSegments(copy)}
            className="mb-4 text-[clamp(1.7rem,3vw,2.6rem)]" />
          {copy.intro && <p className="max-w-[46ch] text-[1.05rem] text-ink-2">{copy.intro}</p>}
          <dl className="mt-7 grid max-w-[460px] grid-cols-2 gap-3.5">
            {stats.map(([v, l]) => (
              <div key={l} className="flex flex-col-reverse rounded-[20px] soft-inset-sm p-[18px]">
                <dt className="text-[0.84rem] font-bold tracking-[0.03em] text-muted">{l}</dt>
                <dd className="text-[clamp(1.9rem,3vw,2.5rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-forest"><CountUp value={v} /></dd>
              </div>
            ))}
          </dl>
          <Link href="/contact" className="mt-7 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3.5 text-[0.92rem] font-bold text-white shadow-btn transition hover:brightness-110">
            Talk to an advisor <Icon name="arrow" className="size-4" />
          </Link>
        </div>

        <div role="table" aria-label={`Splendid Homes compared with a ${them.toLowerCase()}`} className="vs-table rounded-[30px] soft-inset p-3 max-sm:p-2.5">
          <div role="row" className="vs-cols px-3 pb-3 pt-1.5 text-[0.76rem] font-extrabold uppercase tracking-[0.08em] text-muted max-sm:hidden">
            <span role="columnheader">What you get</span>
            <span role="columnheader" className="text-forest">Splendid Homes</span>
            <span role="columnheader">{them}</span>
          </div>
          <div role="rowgroup" className="vs-rows">
            {rows.map(r => (
              <div key={r.topic} role="row" className="vs-row vs-cols rounded-[20px] p-3">
                <span role="rowheader" className="flex items-center gap-3 font-bold">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full soft-raised-sm text-forest"><Icon name={r.icon as IconName} className="size-[18px]" /></span>
                  {r.topic}
                </span>
                <span role="cell" className="flex items-start gap-2 text-[0.9rem] font-bold text-forest">
                  <Icon name="check" className="mt-0.5 size-[18px] shrink-0 text-gold" />
                  <span><span className="block text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-muted sm:hidden">Splendid Homes</span>{r.us}</span>
                </span>
                <span role="cell" className="flex items-start gap-2 text-[0.87rem] text-muted">
                  <Icon name="close" className="mt-0.5 size-4 shrink-0 opacity-60" />
                  <span><span className="block text-[0.7rem] font-extrabold uppercase tracking-[0.08em] sm:hidden">{them}</span>{r.them}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
