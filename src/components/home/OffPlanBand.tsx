import Link from 'next/link';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { Icon, type IconName } from '@/components/icons';
import { data } from '@/lib/cms';
import { OffPlanScroller } from './OffPlanScroller';
import { sectionCopy, TitleText } from '@/lib/homeCopy';

/**
 * Off-plan band (homepage round 2, item 8): an intro panel, every live project and a closing
 * "view all" panel in one horizontal track (see OffPlanScroller). Not content-visibility:auto,
 * because the paint containment would break the pinned (fixed) state.
 */
export async function OffPlanBand() {
  const copy = await sectionCopy('offplan');
  const d = await data();
  const projects = d.liveProjects();
  // Only highlights that live projects have, with how many (the 4 most common). Empty = hidden.
  const perks = d.projectHighlightCounts().slice(0, 4);
  return (
    // Side margins live on a wrapper: ScrollTrigger sizes the pinned element without its margins.
    <div className="mx-4 max-sm:mx-0">
      <section aria-labelledby="offplan-title" className="grain grain-live drift-dark relative overflow-hidden rounded-[40px] bg-forest py-[clamp(48px,6vw,88px)] text-white max-sm:rounded-[24px]">
        <OffPlanScroller total={projects.length}>
          <div className="flex w-[min(400px,84vw)] shrink-0 snap-start flex-col justify-between gap-8 py-2 pr-[clamp(8px,2vw,32px)]">
            <div>
              <span className="eyebrow mb-3 text-[#B9DBC2]">{copy.eyebrow}</span>
              <h2 id="offplan-title" className="mb-4 text-[clamp(1.9rem,3.2vw,2.9rem)] text-white">
                <TitleText c={copy} emClassName="text-[#B9DBC2]" />
              </h2>
              {copy.intro && <p className="text-white/75">{copy.intro.replace('{count}', String(projects.length))}</p>}
            </div>
            {perks.length > 0 && (
              <ul aria-label="Highlights across these projects" className="grid grid-cols-2 gap-2.5 text-[0.84rem] font-semibold">
                {perks.map(({ h, n }) => (
                  <li key={h.id} className="flex items-center gap-2 rounded-[14px] soft-dark-inset px-3 py-2.5">
                    <Icon name={h.icon as IconName} className="shrink-0 text-gold" />
                    <span className="min-w-0 flex-1 leading-tight">{h.label}</span>
                    <span className="text-white/60" aria-label={`${n} ${n === 1 ? 'project' : 'projects'}`}>{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {projects.map(p => (
            <div key={p.id} data-hcard="" className="w-[min(360px,82vw)] shrink-0 snap-start [&>a]:h-full">
              <ProjectCard p={p} onDark />
            </div>
          ))}
          <Link href="/off-plan" data-cursor="View"
            className="group grid w-[min(300px,70vw)] shrink-0 snap-start place-items-center rounded-card border soft-dark-card p-8 text-center transition-colors hover:border-gold">
            <span>
              <span className="mx-auto mb-5 grid size-20 place-items-center rounded-full bg-white text-forest shadow-[-4px_-4px_10px_rgba(255,255,255,0.08),6px_6px_14px_rgba(0,0,0,0.4)] transition-[background-color,rotate] duration-500 group-hover:-rotate-45 group-hover:bg-gold group-hover:text-deep">
                <Icon name="arrow" className="size-6" />
              </span>
              <span className="block text-[1.4rem] font-bold">View all projects</span>
              <span className="mt-1 block text-[0.9rem] text-white/70">Payment plans, floor plans and availability</span>
            </span>
          </Link>
        </OffPlanScroller>
      </section>
    </div>
  );
}
