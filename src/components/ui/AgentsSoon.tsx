import { data } from '@/lib/cms';

/** Shown instead of agent cards while no agent is published (CMS > About & Team pages). */
export async function AgentsSoon() {
  const { site } = await data();
  return <p className="rounded-[26px] soft-raised px-6 py-[clamp(36px,5vw,56px)] text-center text-[clamp(1.1rem,1.6vw,1.3rem)] font-bold text-ink">{site.aboutTeam.text.agentsSoon}</p>;
}
