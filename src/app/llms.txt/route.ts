import { data } from '@/lib/cms';
import { absoluteUrl } from '@/lib/seo';

// /llms.txt — a plain-language map of the site for AI assistants (https://llmstxt.org).
// Built from CMS content (cached; refreshed when content changes).
export async function GET() {
  const { site: SITE, c } = await data();
  const { communities, projects, services } = c;
  const body = `# ${SITE.name}

> ${SITE.description} Regulated by RERA (ORN ${SITE.orn}). Office: ${SITE.address.full}. Phone: ${SITE.phone}. Email: ${SITE.email}.

## Properties
- [Properties for sale in Dubai](${absoluteUrl('/buy')}): apartments, villas, townhouses and penthouses for sale, with prices in AED, permit numbers where issued and agent BRNs.
- [Properties for rent in Dubai](${absoluteUrl('/rent')}): homes to rent, with yearly rents in AED.
- [Commercial property](${absoluteUrl('/commercial')}): offices for lease and sale.
- [Off-plan projects](${absoluteUrl('/off-plan')}): new launches with payment plans and handover dates.

## Area guides
${communities.map(c => `- [${c.name}](${absoluteUrl(`/community/${c.slug}`)}): ${c.tag.toLowerCase()}; average sale price AED ${c.avgSale.toLocaleString('en-US')} per sq ft, average rental yield ${c.roi}%.`).join('\n')}

## Off-plan projects
${projects.map(p => `- [${p.name}](${absoluteUrl(`/off-plan/${p.slug}`)}): from AED ${p.startPrice.toLocaleString('en-US')}, handover ${p.handover}, ${p.paymentPlan} payment plan.`).join('\n')}

## Services
${services.map(s => `- ${s.name}: ${s.desc}`).join('\n')}
- [Mortgage calculator](${absoluteUrl('/mortgage')}): monthly repayments and upfront costs of buying in Dubai.

## Company
- [About us](${absoluteUrl('/about')})
- [Our team](${absoluteUrl('/team')}): RERA-certified advisors and their languages.
- [Market insights](${absoluteUrl('/insights')}): market reports and buyer guides.
- [Contact](${absoluteUrl('/contact')}): ${SITE.phone}, ${SITE.email}, ${SITE.hours}.
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
