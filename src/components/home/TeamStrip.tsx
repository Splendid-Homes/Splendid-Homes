import { AgentsSoon } from '@/components/ui/AgentsSoon';
import { SectionHead } from '@/components/ui/SectionHead';
import { data } from '@/lib/cms';
import { ExpertFinder } from './ExpertFinder';
import { sectionCopy, titleSegments } from '@/lib/homeCopy';

/** Meet the experts: find an agent by language and area (see ExpertFinder). */
export async function TeamStrip() {
  const copy = await sectionCopy('team');
  const { agents } = (await data()).c;
  return (
    <section aria-labelledby="team-title" className="cv-auto bg-mist py-[clamp(56px,8vw,110px)]">
      <div className="wrap">
        <SectionHead id="team-title" eyebrow={copy.eyebrow} link="/team" linkLabel="Full team"
          title={titleSegments(copy)} />
        {agents.length ? <ExpertFinder agents={agents} /> : <AgentsSoon />}
      </div>
    </section>
  );
}
