import Link from 'next/link';
import { LogoMark } from '@/components/brand/Logo';
import { Marquee } from '@/components/motion/Marquee';
import { data } from '@/lib/cms';
import { sectionCopy } from '@/lib/homeCopy';

/**
 * Monochrome developer wordmarks under the hero, in soft UI: the marquee runs inside a
 * pressed-in track on the mist band, each developer a raised pill that presses in on hover.
 * Typographic placeholders: swap for official SVG logos once the client has
 * permission from each developer to display them.
 */
export async function DeveloperMarquee() {
  const copy = await sectionCopy('marquee');
  const { developers } = (await data()).c;
  const marks = developers.map(d => d.name.replace(/ (Properties|Realty)$/, ''));
  return (
    <section aria-label="Developers we work with" className="bg-mist py-8">
      <p className="mb-5 text-center text-[0.74rem] font-bold uppercase tracking-[0.18em] text-muted">{copy.eyebrow}</p>
      <div className="wrap">
        <div className="rounded-full soft-inset px-2">
          {/* Vertical padding inside the marquee so the pills' soft shadows aren't clipped. */}
          <Marquee duration={38} label="Developer partners" fade="from-mist" className="rounded-full py-4">
            {developers.map((d, i) => (
              <Link key={d.slug} href={`/developer/${d.slug}`}
                className="group mr-[clamp(14px,2vw,24px)] flex items-center gap-3 rounded-full soft-raised-sm px-[clamp(18px,2.4vw,28px)] py-3 text-muted transition-[color,box-shadow] duration-300 hover:soft-pressed hover:text-forest">
                <LogoMark size={16} className="text-line-strong transition-colors duration-300 group-hover:text-gold" />
                <span className="whitespace-nowrap text-[clamp(0.95rem,1.4vw,1.15rem)] font-extrabold uppercase tracking-[0.2em]">{marks[i]}</span>
              </Link>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
