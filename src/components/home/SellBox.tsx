import { Icon } from '@/components/icons';
import { SplitHeading } from '@/components/motion/SplitHeading';
import { data } from '@/lib/cms';
import { ValuationForm } from './ValuationForm';
import { sectionCopy, titleSegments } from '@/lib/homeCopy';

const PERKS = ['Valuation within 24 hours', 'Free professional photography', 'No obligation, no fees to ask'];

/** Free valuation (soft UI): the pitch on the left, the three-step valuation request on the right. */
export async function SellBox() {
  const copy = await sectionCopy('sell');
  const { communities } = (await data()).c;
  return (
    <section aria-labelledby="sell-title" className="cv-auto bg-mist py-[clamp(56px,8vw,110px)]">
      <div className="wrap grid items-center gap-[clamp(28px,4vw,56px)] lg:grid-cols-[0.9fr_1.2fr]">
        <div>
          <span className="eyebrow mb-3">{copy.eyebrow}</span>
          <SplitHeading id="sell-title" segments={titleSegments(copy)}
            className="mb-4 text-[clamp(1.7rem,3vw,2.6rem)]" />
          {copy.intro && <p className="max-w-[46ch] text-[1.05rem] text-ink-2">{copy.intro}</p>}
          <ul className="mt-6 flex flex-col gap-3">
            {PERKS.map(x => (
              <li key={x} className="flex items-center gap-3 font-semibold">
                <span className="grid size-8 shrink-0 place-items-center rounded-full soft-raised-sm text-gold"><Icon name="check" className="size-4" /></span>{x}
              </li>
            ))}
          </ul>
        </div>
        <ValuationForm communities={communities.map(c => c.name)} />
      </div>
    </section>
  );
}
