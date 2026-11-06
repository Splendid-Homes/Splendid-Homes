/**
 * One-off content migration: loads the prototype data (src/data/mock.ts + postExtras.ts) into
 * Payload. Run with:  npm run seed      (skips collections that already have documents)
 *                     npm run seed -- --fresh   (deletes seeded content first; keeps users and leads)
 * Creates the first Main admin account if none exists; its password is written to .env.local.
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getPayload } from 'payload';
import config from './payload.config';
import { agents, careers, communities, developers, posts, projects, properties, services, settings, testimonials } from './data/mock';
import { POST_EXTRAS } from './data/postExtras';
import { BUDGET_BANDS, FINDER_WANTS, HERO_CARDS, HOME_SECTIONS, LAUNCHES_BLURB } from './payload/homeOptions';

const payload = await getPayload({ config });
const fresh = process.argv.includes('--fresh');
const log = (m: string) => payload.logger.info(`[seed] ${m}`);

const lexical = (paras: string[]) => ({
  root: {
    type: 'root', format: '' as const, indent: 0, version: 1, direction: 'ltr' as const,
    children: paras.map(text => ({
      type: 'paragraph', format: '' as const, indent: 0, version: 1, direction: 'ltr' as const, textFormat: 0, textStyle: '',
      children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
    })),
  },
});

type Slug = 'developers' | 'communities' | 'agents' | 'properties' | 'projects' | 'highlights' | 'posts' | 'testimonials' | 'services' | 'careers';
async function prepare(collection: Slug) {
  const { totalDocs } = await payload.count({ collection });
  if (totalDocs && fresh) {
    await payload.delete({ collection, where: { id: { exists: true } } });
    return true;
  }
  if (totalDocs) log(`${collection}: ${totalDocs} already present, skipped`);
  return totalDocs === 0;
}
const idMap = async (collection: Slug, key: 'slug' = 'slug') => {
  const res = await payload.find({ collection, limit: 0, pagination: false, depth: 0 });
  return new Map(res.docs.map(d => [String((d as unknown as Record<string, unknown>)[key]), d.id]));
};

// Delete in dependency order when re-seeding.
if (fresh) for (const c of ['posts', 'properties', 'projects', 'highlights', 'testimonials', 'services', 'careers', 'agents', 'communities', 'developers'] as Slug[]) await prepare(c);

if (await prepare('developers')) {
  for (const d of developers) await payload.create({ collection: 'developers', data: { name: d.name, slug: d.slug, desc: d.desc, founded: d.founded, projects: d.projects } });
  log(`developers: ${developers.length}`);
}
// Sample lifestyle facts for the area finder: beach, metro, schools nearby, minutes to Downtown / DXB.
const LIFE: Record<string, [boolean, boolean, number, number, number]> = {
  'palm-jumeirah': [true, false, 2, 20, 35], 'downtown-dubai': [false, true, 3, 0, 15], 'dubai-marina': [true, true, 4, 25, 35],
  'dubai-hills-estate': [false, false, 6, 15, 25], 'business-bay': [false, true, 3, 5, 15], 'jumeirah-village-circle': [false, false, 8, 25, 35],
  'arabian-ranches': [false, false, 5, 25, 30], 'dubai-creek-harbour': [false, false, 2, 15, 12], 'emirates-hills': [false, false, 4, 25, 35],
};
const lifeOf = (slug: string) => { const l = LIFE[slug]; return l ? { beach: l[0], metro: l[1], schools: l[2], toDowntown: l[3], toAirport: l[4] } : undefined; };
if (await prepare('communities')) {
  for (const [i, c] of communities.entries()) {
    await payload.create({
      collection: 'communities',
      data: { name: c.name, slug: c.slug, tag: c.tag, desc: c.desc, imageUrl: c.img, coords: { lat: c.coords[0], lng: c.coords[1] }, avgSale: c.avgSale, avgRent: c.avgRent, roi: c.roi, highlights: c.highlights, life: lifeOf(c.slug), status: 'published', order: i },
    });
  }
  log(`communities: ${communities.length}`);
}
if (await prepare('agents')) {
  for (const [i, a] of agents.entries()) {
    await payload.create({
      collection: 'agents',
      data: { name: a.name, slug: a.slug, title: a.title, photoUrl: a.img, brn: a.brn, phone: a.phone, email: a.email, languages: a.languages, specialties: a.specialties, bio: a.bio, deals: a.deals, status: 'published', order: i },
    });
  }
  log(`agents: ${agents.length}`);
}

const commIds = await idMap('communities');
const devIds = await idMap('developers');
const agentSlugById = new Map(agents.map(a => [a.id, a.slug]));
const agentIds = await idMap('agents');
const agentRef = (legacyId: string) => agentIds.get(agentSlugById.get(legacyId) ?? '') as number;

if (await prepare('properties')) {
  for (const p of properties) {
    await payload.create({
      collection: 'properties',
      data: {
        title: p.title, slug: p.slug, ref: p.ref, permitNo: p.permit, purpose: p.purpose, type: p.type, price: p.price,
        beds: p.beds, baths: p.baths, size: p.size, parking: p.parking, community: commIds.get(p.community) as number, building: p.building,
        developer: devIds.get(p.developer) as number | undefined, furnishing: p.furnishing, completionStatus: p.status, completion: p.completion,
        view: p.view, serviceCharge: p.serviceCharge, desc: p.desc, amenities: p.amenities, images: p.images.map(url => ({ url })),
        // Sample drawing until the client uploads the real floor plan.
        floorPlanUrl: `/samples/floorplan-${['Villa', 'Townhouse'].includes(p.type) ? 'villa' : p.type === 'Office' ? 'office' : 'apartment'}.svg`,
        status: p.published ? 'published' : 'draft', featured: p.featured, agent: agentRef(p.agent), listedAt: new Date(p.created).toISOString(), views: p.views,
      },
    });
  }
  log(`properties: ${properties.length}`);
}
// Project highlights: two apply automatically by rule, the rest are ticked per project below.
const HIGHLIGHTS = [
  { key: 'down', label: 'Pay from 10% down', short: '10% down', icon: 'cal', desc: 'Secure your unit with 10% and spread the rest through construction.', rule: 'none' },
  { key: 'escrow', label: 'Escrow protected', short: 'Escrow', icon: 'shield', desc: 'Payments are held in a regulated escrow account (Dubai Law No. 8 of 2007).', rule: 'all' },
  { key: 'prelaunch', label: 'Pre-launch prices', icon: 'trend', desc: 'Launch-phase pricing before the public release.', rule: 'none' },
  { key: 'visa', label: 'Golden Visa eligible', short: 'Golden Visa', icon: 'star', desc: 'Homes worth AED 2M+ from approved developers can qualify for 10-year residency.', rule: 'minPrice', minPrice: 2_000_000 },
  { key: 'post', label: 'Post-handover plan', short: 'Post-handover', icon: 'key', desc: 'Keep paying after you get the keys, interest-free.', rule: 'none' },
] as const;
// Sample assignments (the client edits these per project in the CMS).
const PROJECT_HIGHLIGHTS: Record<string, string[]> = {
  'binghatti-skyrise': ['down'], 'ellington-serenity': ['down', 'post'], 'lumina-lagoon-villas': ['down'],
  'verde-towers-by-sobha': ['prelaunch'], 'the-aurum-residences': ['prelaunch'],
};
const hlIds = new Map<string, number>();
if (await prepare('highlights')) {
  for (const [i, h] of HIGHLIGHTS.entries()) {
    const { key, ...data } = h;
    const doc = await payload.create({ collection: 'highlights', data: { ...data, order: i } });
    hlIds.set(key, doc.id);
  }
  log(`highlights: ${HIGHLIGHTS.length}`);
} else {
  const existing = await payload.find({ collection: 'highlights', limit: 0, pagination: false, depth: 0 });
  for (const h of HIGHLIGHTS) { const doc = existing.docs.find(d => d.label === h.label); if (doc) hlIds.set(h.key, doc.id); }
}
if (await prepare('projects')) {
  for (const p of projects) {
    await payload.create({
      collection: 'projects',
      data: {
        name: p.name, slug: p.slug, developer: devIds.get(p.developer) as number, community: commIds.get(p.community) as number,
        startPrice: p.startPrice, handover: p.handover, paymentPlan: p.paymentPlan, constructionStatus: p.status, desc: p.desc,
        plan: p.plan, units: p.units, imageUrl: p.img, images: p.images.map(url => ({ url })), amenities: p.amenities,
        status: p.published ? 'published' : 'draft', featured: p.featured,
        highlights: (PROJECT_HIGHLIGHTS[p.slug] ?? []).flatMap(k => hlIds.get(k) ?? []),
      },
    });
  }
  log(`projects: ${projects.length}`);
}
if (await prepare('posts')) {
  for (const p of posts) {
    const x = POST_EXTRAS[p.slug];
    await payload.create({
      collection: 'posts',
      data: {
        title: p.title, slug: p.slug, category: p.cat as 'Guides', date: new Date(p.date).toISOString(),
        lastReviewed: x?.updated && x.updated !== p.date ? new Date(x.updated).toISOString() : undefined,
        author: agentRef(p.author), imageUrl: p.img, excerpt: p.excerpt, summary: x?.summary, sampleNote: x?.sample,
        body: lexical(p.body as string[]),
        takeaways: x?.takeaways?.map(text => ({ text })),
        steps: x?.steps,
        table: x?.table ? { title: x.table.title, caption: x.table.caption, head: x.table.head, rows: x.table.rows.map(cells => ({ cells })) } : undefined,
        communityRows: x?.communityRows
          ? { title: x.communityRows.title, caption: x.communityRows.caption, rows: x.communityRows.rows.map(r => ({ community: commIds.get(r.slug) as number, bestFor: r.bestFor })) }
          : undefined,
        showCommunityComparison: Boolean(x?.communityTable),
        faqs: x?.faqs, sources: x?.sources, status: 'published',
      },
    });
  }
  log(`posts: ${posts.length}`);
}
if (await prepare('testimonials')) {
  for (const [i, t] of testimonials.entries()) await payload.create({ collection: 'testimonials', data: { name: t.name, role: t.role, text: t.text, rating: t.rating, kind: t.kind, outcome: t.outcome, imageUrl: t.img, status: 'published', order: i } });
  log(`testimonials: ${testimonials.length}`);
} else {
  // Client type, result and home photo were added later: fill them in on sample reviews that do not have them yet.
  const { docs } = await payload.find({ collection: 'testimonials', limit: 0, pagination: false, depth: 0 });
  let n = 0;
  for (const d of docs) {
    const t = testimonials.find(x => x.name === d.name);
    if (!t || (d.outcome && (d.image || d.imageUrl))) continue;
    await payload.update({ collection: 'testimonials', id: d.id, data: { kind: d.outcome ? d.kind : t.kind, outcome: d.outcome || t.outcome, imageUrl: d.image ? d.imageUrl : d.imageUrl || t.img } });
    n++;
  }
  if (n) log(`testimonials: type, result and photo added to ${n}`);
}
if (await prepare('services')) {
  for (const [i, s] of services.entries()) await payload.create({ collection: 'services', data: { name: s.name, slug: s.slug, icon: s.icon as 'key', desc: s.desc, points: s.points, status: 'published', order: i } });
  log(`services: ${services.length}`);
}
if (await prepare('careers')) {
  for (const c of careers) await payload.create({ collection: 'careers', data: { title: c.title, dept: c.dept, type: c.type, location: c.location, desc: c.desc, status: 'published' } });
  log(`careers: ${careers.length}`);
}

const WHY_ROWS = [
  { topic: 'Licensed advisors', icon: 'shield', us: 'Every consultant RERA-certified', them: 'Often freelancers' },
  { topic: 'Pricing', icon: 'chart', us: 'Live DLD transaction data', them: 'Asking-price guesswork' },
  { topic: 'After the sale', icon: 'users', us: 'Mortgage, visa and management in-house', them: 'Hands you a list of contacts' },
  { topic: 'Mortgage', icon: 'clock', us: 'Pre-approval in 48 hours', them: '2 to 3 weeks on your own' },
  { topic: 'Languages', icon: 'globe', us: 'Advisors in 9 languages', them: 'English only' },
] as const;
const current = await payload.findGlobal({ slug: 'settings' });
if (!current?.company || fresh) {
  await payload.updateGlobal({
    slug: 'settings',
    data: {
      company: settings.company, orn: settings.orn, tagline: settings.tagline, phone: settings.phone, whatsapp: settings.whatsapp, email: settings.email,
      street: 'Office 2401, Burj Daman, DIFC', address: settings.address, hours: settings.hours, lat: 25.2116, lng: 55.2812,
      socials: settings.socials, stats: settings.stats,
      heroTitle: settings.home.heroTitle, heroSubtitle: settings.home.heroSubtitle, heroImageUrl: settings.home.heroImage,
      // Homepage: every section in the default order with its default wording, ranges, finder chips and hero cards.
      homeSections: HOME_SECTIONS.map(h => ({ section: h.key, show: true, ...h.copy, intro: h.copy.intro ?? undefined })),
      budgetBands: BUDGET_BANDS.map(b => ({ ...b })), showLaunches: true, launchesBlurb: LAUNCHES_BLURB,
      finderWants: FINDER_WANTS.map(w => ({ want: w.key, label: w.label, limit: w.limit ?? undefined, startOn: Boolean(w.on) })),
      heroCards: { badge: HERO_CARDS.badge, showMarket: true, showExperts: true, priceLabel: HERO_CARDS.priceLabel, yieldLabel: HERO_CARDS.yieldLabel,
        expertsTitle: HERO_CARDS.expertsTitle, expertsStatus: HERO_CARDS.expertsStatus },
      marketSource: 'Splendid Homes market estimates (sample figures, to be replaced with Dubai Land Department data before launch)',
      marketSourceUrl: 'https://dubailand.gov.ae', marketUpdated: new Date('2026-10-20').toISOString(),
      rates: Object.entries(settings.rates).map(([code, rate]) => ({ code, rate })),
      leadEmails: [settings.email], sheetsEnabled: false,
    },
  });
  log('settings: saved');
}
// "Why Splendid Homes" comparison rows: added once, then owned by the CMS.
if (!current?.whyRows?.length || fresh) {
  await payload.updateGlobal({ slug: 'settings', data: { whyThem: 'Typical agent', whyRows: [...WHY_ROWS] } });
  log(`why rows: ${WHY_ROWS.length}`);
}
// One-tap popular searches under the hero search.
if (!current?.heroPicks?.length || fresh) {
  await payload.updateGlobal({ slug: 'settings', data: { heroPicks: [
    { label: 'Villas in Dubai Hills', href: '/buy?community=dubai-hills-estate&type=Villa' },
    { label: 'New off-plan launches', href: '/off-plan' },
    { label: 'Dubai Marina rentals', href: '/rent?community=dubai-marina' },
    { label: 'Golden Visa homes', href: '/buy?min=2000000' },
  ] } });
  log('hero picks: saved');
}
// Quarter-on-quarter changes for the homepage market pulse (sample figures, like the community data).
if (current?.priceChange == null || fresh) {
  await payload.updateGlobal({ slug: 'settings', data: { priceChange: 4.2, yieldChange: 0.3 } });
  log('market pulse changes: saved');
}

const { totalDocs: users } = await payload.count({ collection: 'users' });
if (!users) {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@splendidhomes.local';
  const password = crypto.randomBytes(12).toString('base64url');
  await payload.create({ collection: 'users', data: { name: 'Main admin', email, password, role: 'admin', active: true } });
  const envFile = path.resolve(process.cwd(), '.env.local');
  fs.appendFileSync(envFile, `\n# First Main admin account created by the seed script (change the password after first sign-in)\nSEED_ADMIN_EMAIL=${email}\nSEED_ADMIN_PASSWORD=${password}\n`);
  log(`admin user created: ${email} (password saved in .env.local)`);
}

log('done');
process.exit(0);
