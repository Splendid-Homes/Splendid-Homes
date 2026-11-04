import config from '@payload-config';
import { cacheLife, cacheTag } from 'next/cache';
import { BUDGET_BANDS, FINDER_WANTS, HERO_CARDS, HOME_SECTIONS, LAUNCHES_BLURB, type HomeSectionKey } from '@/payload/homeOptions';
import { FEE_DEFAULTS, type Fees } from '@/payload/feeDefaults';
import { CONTACT_WAYS, CTA_WORDS, FOOTER_COLUMNS, MAIN_NAV, MENU_DEFAULTS, MOBILE_EXTRA, MORE_COLUMNS, type MenuText } from '@/payload/menuDefaults';
import { SEO_PAGES, type SeoOverrides } from '@/payload/seoDefaults';
import { LEGAL_DEFAULTS, LEGAL_PAGES, type LegalText } from '@/payload/legalDefaults';
import { BUY_BANDS, COMPARE_ROWS, COMPARE_SAVED_DEFAULTS, RENT_BANDS, type CompareSavedText } from '@/payload/compareSavedDefaults';
import { COMMUNITY_COLUMNS, INSIGHT_CATEGORIES, INSIGHTS_DEFAULTS, type InsightsText } from '@/payload/insightsDefaults';
import { CAREER_PERKS, CONTACT_CAREERS_DEFAULTS, CONTACT_INTERESTS, type ContactCareersText } from '@/payload/contactCareersDefaults';
import { ABOUT_TEAM_DEFAULTS, ABOUT_VALUES, type AboutTeamText } from '@/payload/aboutTeamDefaults';
import { MORTGAGE_FAQS, MORTGAGE_RULE_DEFAULTS, MORTGAGE_TEXT_DEFAULTS, type MortgageRules, type MortgageText } from '@/payload/mortgageDefaults';
import { SERVICES_TEXT_DEFAULTS, type ServicesText } from '@/payload/servicesDefaults';
import { SELL_FAQS, SELL_INTENTS, SELL_STEPS, SELL_TEXT_DEFAULTS, SELL_WHY, type SellText } from '@/payload/sellDefaults';
import { NOT_FOUND_DEFAULTS, NOT_FOUND_LINKS, type NotFoundText } from '@/payload/notFoundDefaults';
import { DEVELOPER_OPTIONS_DEFAULTS, DEVELOPER_TEXT_DEFAULTS, type DeveloperText, type DevOrder } from '@/payload/developerDefaults';
import { COMMUNITY_OPTIONS_DEFAULTS, COMMUNITY_TEXT_DEFAULTS, LIFE_DEFAULTS, LIFE_OPTIONS, type CardFigure, type CommunityText, type LifeKey, type RankKey } from '@/payload/communityDefaults';
import { OFFPLAN_OPTIONS_DEFAULTS, OFFPLAN_TEXT_DEFAULTS, WHY_OFFPLAN_DEFAULTS, type OffplanText } from '@/payload/offplanDefaults';
import { DETAIL_ROW_DEFAULTS, KEY_FACT_DEFAULTS, PROPERTY_OPTIONS_DEFAULTS, PROPERTY_PAGE_DEFAULTS, type FactKey, type PropertyPageText } from '@/payload/propertyDefaults';
import { CHIP_DEFAULTS, GOOD_DEFAULTS, LISTING_TEXT_DEFAULTS, RESULTS_DEFAULTS, type Chip } from '@/payload/listingDefaults';
import type { SortKey } from './listings';
import { getPayload } from 'payload';
import type { Agent, Career, Community, Developer, Post, Project, ProjectHighlight, Property, Service, Site, Testimonial } from '@/data/types';
import { db } from './data';
import { BRAND } from './site';

/**
 * Website content from Payload. One cached snapshot of everything published (the site is small:
 * tens of documents), tagged "content" and revalidated by Payload hooks on every edit
 * (src/payload/hooks.ts). Pages stay static and fast; edits show up on the next request.
 * Documents are mapped onto the types the components already use.
 */
export type Content = {
  properties: Property[];
  projects: Project[];
  communities: Community[];
  developers: Developer[];
  agents: Agent[];
  posts: Post[];
  testimonials: Testimonial[];
  services: Service[];
  careers: Career[];
  site: Site;
};

export const CONTENT_TAG = 'content';

type Img = { url?: string | null } | number | null | undefined;
const fileUrl = (media: Img, fallback?: string | null) => (media && typeof media === 'object' && media.url ? media.url : fallback ?? '');
/** Homepage sections in CMS order (blank headings fall back to the defaults); any not listed are added, shown, at the end. */
function homeSections(rows: { section: HomeSectionKey; show?: boolean | null; eyebrow?: string | null; title?: string | null; titleItalic?: string | null; titleEnd?: string | null; intro?: string | null }[]) {
  const seen = new Set<string>();
  const out = rows.flatMap(r => {
    const def = HOME_SECTIONS.find(d => d.key === r.section);
    if (!def || seen.has(r.section)) return [];
    seen.add(r.section);
    const own = r.title || r.titleItalic || r.titleEnd; // any title field set: use the CMS title as a whole
    return [{ key: def.key, show: r.show !== false, copy: {
      eyebrow: r.eyebrow || def.copy.eyebrow, intro: r.intro || def.copy.intro || '',
      title: own ? r.title ?? '' : def.copy.title, titleItalic: own ? r.titleItalic ?? '' : def.copy.titleItalic, titleEnd: own ? r.titleEnd ?? '' : def.copy.titleEnd,
    } }];
  });
  for (const d of HOME_SECTIONS) if (!seen.has(d.key)) out.push({ key: d.key, show: true, copy: { ...d.copy, intro: d.copy.intro ?? '' } });
  return out;
}
/** Quick-search chips from the CMS (falls back to the defaults when the list is empty). */
function chipsOf(rows: { label: string; type?: string | null; beds?: string | null; min?: number | null; max?: number | null; status?: string | null; furnishing?: string | null }[] | null | undefined, purpose: 'buy' | 'rent'): Chip[] {
  if (!rows?.length) return CHIP_DEFAULTS[purpose];
  return rows.map(r => ({ label: r.label, type: r.type ?? undefined, beds: r.beds ?? undefined, min: r.min ?? undefined, max: r.max ?? undefined, status: r.status ?? undefined, furnishing: r.furnishing ?? undefined }));
}
const ymd = (iso?: string | null) => (iso ? iso.slice(0, 10) : '');
const rel = <T extends { id: number | string }>(v: T | number | string | null | undefined) => (v && typeof v === 'object' ? v : null);
const published = { status: { equals: 'published' } } as const;

export async function getContent(): Promise<Content> {
  'use cache';
  cacheTag(CONTENT_TAG);
  cacheLife('max');

  const payload = await getPayload({ config });
  const all = { limit: 0, pagination: false, depth: 1, overrideAccess: true } as const;
  const [props, projs, comms, devs, agents, posts, testi, svcs, jobs, s, hls, lp, fe, pp, op, cp, cl, dp, nf, sp, svp, mp, at, cc, ip, cs, lg, mn, ps] = await Promise.all([
    payload.find({ collection: 'properties', ...all, where: published, sort: '-listedAt' }),
    payload.find({ collection: 'projects', ...all, where: published }),
    payload.find({ collection: 'communities', ...all, where: published, sort: 'order' }),
    payload.find({ collection: 'developers', ...all, sort: 'order' }),
    payload.find({ collection: 'agents', ...all, where: published, sort: 'order' }),
    payload.find({ collection: 'posts', ...all, where: published, sort: '-date' }),
    payload.find({ collection: 'testimonials', ...all, where: published, sort: 'order' }),
    payload.find({ collection: 'services', ...all, where: published, sort: 'order' }),
    payload.find({ collection: 'careers', ...all, where: published }),
    payload.findGlobal({ slug: 'settings', depth: 1, overrideAccess: true }),
    payload.find({ collection: 'highlights', ...all, sort: 'order' }),
    payload.findGlobal({ slug: 'listingPages', depth: 1, overrideAccess: true }),
    payload.findGlobal({ slug: 'fees', depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'propertyPage', depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'offplanPages', depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'communityPages', depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'communitiesList', depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'developerPages', depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'notFoundPage', depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'sellPage', depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'servicesPage', depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'mortgagePage', depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'aboutTeam', depth: 1, overrideAccess: true }),
    payload.findGlobal({ slug: 'contactCareers', depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'insightsPages', depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'compareSaved', depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'legalPages', depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'menus', depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'pageSeo', depth: 0, overrideAccess: true }),
  ]);

  const communities: Community[] = comms.docs.map(c => ({
    slug: c.slug ?? '', name: c.name, img: fileUrl(c.image, c.imageUrl), coords: [c.coords.lat, c.coords.lng],
    avgSale: c.avgSale, avgRent: c.avgRent, roi: c.roi, tag: c.tag, desc: c.desc, highlights: c.highlights ?? [],
    life: { beach: Boolean(c.life?.beach), metro: Boolean(c.life?.metro), schools: c.life?.schools ?? 0, toDowntown: c.life?.toDowntown ?? 20, toAirport: c.life?.toAirport ?? 30 },
    intro: c.intro ?? '',
    guide: (c.guide ?? []).map(g => ({ title: g.title, items: (g.items ?? []).map(i => ({ heading: i.heading, text: i.text })) })),
    pros: c.pros ?? [], cons: c.cons ?? [], suits: c.suits ?? '', notFor: c.notFor ?? '',
    nearby: (c.nearby ?? []).map(n => rel(n)?.slug ?? '').filter(Boolean),
    faqs: (c.faqs ?? []).map(f => ({ q: f.q, a: f.a })),
  }));
  const developers: Developer[] = devs.docs.map(d => ({ slug: d.slug ?? '', name: d.name, founded: d.founded, desc: d.desc, projects: d.projects ?? 0, about: d.about ?? '', knownFor: d.knownFor ?? [],
    logo: fileUrl(d.logo), heroImage: fileUrl(d.heroImage), website: d.website ?? '', faqs: (d.faqs ?? []).map(f => ({ q: f.q, a: f.a })),
  }));
  const agentsOut: Agent[] = agents.docs.map(a => ({
    slug: a.slug ?? '', id: String(a.id), name: a.name, title: a.title, img: fileUrl(a.photo, a.photoUrl), languages: a.languages ?? [],
    brn: a.brn, phone: a.phone, email: a.email, specialties: a.specialties ?? [], deals: a.deals ?? 0, bio: a.bio,
    linkedin: a.linkedin ?? '', instagram: a.instagram ?? '',
  }));
  const images = (list?: { image?: Img; url?: string | null }[] | null) => (list ?? []).map(i => fileUrl(i.image, i.url)).filter(Boolean);

  const properties: Property[] = props.docs.flatMap(p => {
    const community = rel(p.community), agent = rel(p.agent), developer = rel(p.developer);
    if (!community || !agent) return [];
    return [{
      slug: p.slug ?? '', id: String(p.id), ref: p.ref, title: p.title, purpose: p.purpose, type: p.type, price: p.price,
      beds: p.beds, baths: p.baths, size: p.size, community: community.slug ?? '', building: p.building,
      furnishing: p.furnishing, status: p.completionStatus, completion: p.completion ?? '', developer: developer?.slug ?? '',
      view: p.view ?? '', parking: p.parking ?? 0, serviceCharge: p.serviceCharge ?? 0, amenities: p.amenities ?? [],
      images: images(p.images), agent: String(agent.id), permit: p.permit, featured: Boolean(p.featured), published: true,
      video: Boolean(p.videoUrl), tour: Boolean(p.tourUrl), videoUrl: p.videoUrl ?? undefined, tourUrl: p.tourUrl ?? undefined, floorPlan: fileUrl(p.floorPlan, p.floorPlanUrl) || undefined,
      created: ymd(p.listedAt), views: p.views ?? 0, desc: p.desc, seo: p.seo ?? undefined,
    }];
  });

  // Highlights per project: ticked by hand, plus rule-based ones (all off-plan / minimum price),
  // minus any automatic ones switched off for that project. Kept in CMS order.
  const idsOf = (list?: (number | { id: number })[] | null) => new Set((list ?? []).map(x => (typeof x === 'object' ? x.id : x)));
  const highlightsFor = (p: { startPrice: number; highlights?: (number | { id: number })[] | null; highlightsOff?: (number | { id: number })[] | null }): ProjectHighlight[] => {
    const on = idsOf(p.highlights), off = idsOf(p.highlightsOff);
    return hls.docs
      .filter(h => on.has(h.id) || (!off.has(h.id) && (h.rule === 'all' || (h.rule === 'minPrice' && h.minPrice != null && p.startPrice >= h.minPrice))))
      .map(h => ({ id: String(h.id), label: h.label, short: h.short || h.label, icon: h.icon, desc: h.desc ?? '', order: hls.docs.indexOf(h) }));
  };

  const projects: Project[] = projs.docs.flatMap(p => {
    const community = rel(p.community), developer = rel(p.developer);
    if (!community || !developer) return [];
    return [{
      slug: p.slug ?? '', id: String(p.id), name: p.name, developer: developer.slug ?? '', community: community.slug ?? '',
      startPrice: p.startPrice, handover: p.handover, paymentPlan: p.paymentPlan, plan: (p.plan ?? []).map(m => ({ label: m.label, pct: m.pct })),
      units: (p.units ?? []).map(u => ({ type: u.type, size: u.size, from: u.from })), status: p.constructionStatus,
      img: fileUrl(p.image, p.imageUrl), images: images(p.images), featured: Boolean(p.featured), published: true,
      amenities: p.amenities ?? [], desc: p.desc, brochure: fileUrl(p.brochure) || undefined, seo: p.seo ?? undefined,
      highlights: highlightsFor(p),
    }];
  });

  const postsOut: Post[] = posts.docs.flatMap(p => {
    const author = rel(p.author);
    if (!author) return [];
    const table = p.table?.rows?.length ? { title: p.table.title ?? '', caption: p.table.caption ?? '', head: p.table.head ?? [], rows: p.table.rows.map(r => r.cells ?? []) } : undefined;
    const communityRows = p.communityRows?.rows?.length
      ? {
        title: p.communityRows.title ?? '', caption: p.communityRows.caption ?? '',
        rows: p.communityRows.rows.flatMap(r => { const c = rel(r.community); return c ? [{ slug: c.slug ?? '', bestFor: r.bestFor }] : []; }),
      }
      : undefined;
    return [{
      slug: p.slug ?? '', id: String(p.id), title: p.title, cat: p.category, date: ymd(p.date), img: fileUrl(p.image, p.imageUrl),
      author: String(author.id), excerpt: p.excerpt, body: p.body,
      summary: p.summary ?? undefined, updated: ymd(p.lastReviewed) || undefined, sample: p.sampleNote ?? undefined,
      takeaways: p.takeaways?.map(t => t.text), steps: p.steps?.map(s2 => ({ title: s2.title, text: s2.text })),
      table, communityRows, communityTable: Boolean(p.showCommunityComparison),
      faqs: p.faqs?.map(f => ({ q: f.q, a: f.a })), sources: p.sources?.map(src => ({ label: src.label, url: src.url })), seo: p.seo ?? undefined,
    }];
  });

  const site: Site = {
    name: BRAND.name, description: BRAND.description, legalName: s.company, tagline: s.tagline, orn: s.orn, phone: s.phone, whatsapp: s.whatsapp,
    email: s.email, hours: s.hours, address: { street: s.street, locality: 'Dubai', country: 'AE', full: s.address }, geo: { lat: s.lat, lng: s.lng },
    socials: {
      instagram: s.socials?.instagram ?? '', linkedin: s.socials?.linkedin ?? '', youtube: s.socials?.youtube ?? '',
      tiktok: s.socials?.tiktok ?? '', facebook: s.socials?.facebook ?? '',
    },
    googleBusinessProfile: s.googleBusinessProfile ?? '',
    stats: { years: s.stats.years, sold: s.stats.sold, clients: s.stats.clients, agents: s.stats.agents },
    rates: Object.fromEntries([['AED', 1], ...(s.rates ?? []).map(r => [r.code, r.rate])]),
    home: {
      heroTitle: s.heroTitle, heroSubtitle: s.heroSubtitle, heroImage: fileUrl(s.heroImage, s.heroImageUrl), heroVideo: fileUrl(s.heroVideo) || undefined,
      sections: homeSections(s.homeSections ?? []),
      cards: {
        // A blank badge hides it (the CMS is prefilled with HERO_CARDS.badge).
        badge: s.heroCards?.badge ?? '', showMarket: s.heroCards?.showMarket !== false, showExperts: s.heroCards?.showExperts !== false,
        priceValue: s.heroCards?.priceValue ?? '', priceLabel: s.heroCards?.priceLabel || HERO_CARDS.priceLabel,
        yieldValue: s.heroCards?.yieldValue ?? '', yieldLabel: s.heroCards?.yieldLabel || HERO_CARDS.yieldLabel,
        expertsTitle: s.heroCards?.expertsTitle || HERO_CARDS.expertsTitle, expertsStatus: s.heroCards?.expertsStatus || HERO_CARDS.expertsStatus,
      },
      bands: s.budgetBands?.length
        ? s.budgetBands.map(b => ({ label: b.label, min: b.min ?? undefined, max: b.max ?? undefined, icon: b.icon ?? 'home', blurb: b.blurb ?? '' }))
        : BUDGET_BANDS.map(b => ({ ...b })),
      launches: { show: s.showLaunches !== false, blurb: s.launchesBlurb || LAUNCHES_BLURB },
      finder: s.finderWants?.length
        ? s.finderWants.map(w => ({ key: w.want, label: w.label, limit: w.limit ?? FINDER_WANTS.find(d => d.key === w.want)?.limit ?? null, on: Boolean(w.startOn) }))
        : FINDER_WANTS.map(w => ({ key: w.key, label: w.label, limit: w.limit, on: Boolean(w.on) })),
      picks: (s.heroPicks ?? []).map(p => ({ label: p.label, href: p.href })),
    },
    market: { source: s.marketSource, sourceUrl: s.marketSourceUrl ?? '', updated: ymd(s.marketUpdated), priceChange: s.priceChange ?? undefined, yieldChange: s.yieldChange ?? undefined },
    menus: {
      text: Object.fromEntries(Object.entries(MENU_DEFAULTS).map(([k, v]) => [k, ((mn as unknown as Record<string, unknown>)[k] as string | null) || v])) as MenuText,
      mainNav: mn.mainNav?.length ? mn.mainNav.map(l => ({ label: l.label, href: l.href })) : MAIN_NAV,
      moreCols: mn.moreCols?.length
        ? mn.moreCols.map(c => ({ title: c.title, icon: c.icon ?? 'key', source: c.source ?? 'links', links: (c.links ?? []).map(l => ({ label: l.label, href: l.href })), allLabel: c.allLabel ?? '', allHref: c.allHref ?? '' }))
        : MORE_COLUMNS,
      mobileExtra: mn.mobileExtra?.length ? mn.mobileExtra.map(l => ({ label: l.label, href: l.href })) : MOBILE_EXTRA,
      footerCols: mn.footerCols?.length ? mn.footerCols.map(c => ({ title: c.title, links: (c.links ?? []).map(l => ({ label: l.label, href: l.href })) })) : FOOTER_COLUMNS,
      ways: mn.ways?.length ? mn.ways.map(w => ({ title: w.title, note: w.note ?? '', icon: w.icon ?? 'phone', href: w.href, tone: w.tone ?? 'forest' })) : CONTACT_WAYS,
      ctaWords: mn.ctaWords?.length ? mn.ctaWords : CTA_WORDS,
    },
    seo: Object.fromEntries(SEO_PAGES.map(([k]) => {
      const g = (ps as unknown as Record<string, { title?: string | null; description?: string | null } | undefined>)[k];
      return [k, { title: g?.title ?? '', description: g?.description ?? '' }];
    })) as SeoOverrides,
    legal: {
      text: Object.fromEntries(Object.entries(LEGAL_DEFAULTS).map(([k, v]) => [k, ((lg as unknown as Record<string, unknown>)[k] as string | null) || v])) as LegalText,
      pages: lg.pages?.length
        ? lg.pages.map(p => ({ slug: p.slug, title: p.title, about: p.about ?? '', footerLabel: p.footerLabel ?? '', inFooter: p.inFooter !== false, updated: p.updated ? ymd(p.updated) : '', body: p.body ?? null }))
        : LEGAL_PAGES,
      showRera: lg.showRera !== false, showContact: lg.showContact !== false,
    },
    why: { them: s.whyThem || 'Typical agent', rows: (s.whyRows ?? []).map(r => ({ topic: r.topic, icon: r.icon, us: r.us, them: r.them })) },
    fees: Object.fromEntries(Object.entries(FEE_DEFAULTS).map(([k, v]) => [k, (fe as unknown as Record<string, unknown>)[k] ?? v])) as Fees,
    compare: {
      text: Object.fromEntries(Object.entries(COMPARE_SAVED_DEFAULTS).map(([k, v]) => [k, ((cs as unknown as Record<string, unknown>)[k] as string | null) || v])) as CompareSavedText,
      rows: cs.rows?.length
        ? cs.rows.map(r => ({ key: r.key, label: r.label || COMPARE_ROWS.find(([k]) => k === r.key)![1] }))
        : COMPARE_ROWS.map(([key, label]) => ({ key, label })),
      buyBands: cs.buyBands?.length ? cs.buyBands.map(b => ({ label: b.label, min: b.min ?? null, max: b.max ?? null })) : BUY_BANDS,
      rentBands: cs.rentBands?.length ? cs.rentBands.map(b => ({ label: b.label, min: b.min ?? null, max: b.max ?? null })) : RENT_BANDS,
      showBest: cs.showBest !== false,
      max: Math.min(4, Math.max(2, cs.compareMax || 3)),
      savedButtons: [cs.savedShowBtn1 !== false, cs.savedShowBtn2 !== false],
    },
    insights: {
      text: Object.fromEntries(Object.entries(INSIGHTS_DEFAULTS).map(([k, v]) => [k, ((ip as unknown as Record<string, unknown>)[k] as string | null) || v])) as InsightsText,
      categories: ip.categories?.length ? ip.categories.map(c => ({ name: c.name, intro: c.intro ?? '' })) : INSIGHT_CATEGORIES.map(name => ({ name, intro: '' })),
      featured: ip.featured ?? 'newest',
      featuredId: ip.featured === 'pick' && ip.featuredPost != null ? String(typeof ip.featuredPost === 'object' ? ip.featuredPost.id : ip.featuredPost) : '',
      perPage: ip.perPage || 12,
      nlShow: ip.nlShow !== false, nlOnArticles: !!ip.nlOnArticles,
      communityCols: ip.communityCols?.length === 5 ? ip.communityCols : COMMUNITY_COLUMNS,
      formShow: ip.formShow !== false,
      relatedCount: ip.relatedCount ?? 3,
    },
    contactCareers: {
      text: Object.fromEntries(Object.entries(CONTACT_CAREERS_DEFAULTS).map(([k, v]) => [k, ((cc as unknown as Record<string, unknown>)[k] as string | null) || v])) as ContactCareersText,
      extraRows: (cc.extraRows ?? []).map(r => ({ label: r.label, value: r.value, icon: r.icon ?? 'building', href: r.href ?? '' })),
      showMap: cc.showMap !== false,
      interests: cc.interests?.length ? cc.interests : CONTACT_INTERESTS,
      perks: cc.perks?.length ? cc.perks.map(x => ({ icon: x.icon ?? 'star', title: x.title, text: x.text })) : CAREER_PERKS,
      careersEmail: cc.careersEmail ?? '',
      showSalary: cc.showSalary !== false,
    },
    aboutTeam: {
      text: Object.fromEntries(Object.entries(ABOUT_TEAM_DEFAULTS).map(([k, v]) => [k, ((at as unknown as Record<string, unknown>)[k] as string | null) || v])) as AboutTeamText,
      storyImage: fileUrl(at.storyImage as Img),
      showStats: at.showStats !== false,
      values: at.values?.length ? at.values.map(v => ({ icon: v.icon ?? 'star', title: v.title, text: v.text })) : ABOUT_VALUES,
      leaders: (at.leaders ?? []).map(l => String(typeof l === 'object' && l ? l.id : l)),
      showDeals: at.showDeals !== false,
      waTo: at.waTo === 'agent' ? 'agent' : 'company',
    },
    mortgage: {
      rules: Object.fromEntries(Object.entries(MORTGAGE_RULE_DEFAULTS).map(([k, v]) => [k, ((mp as unknown as Record<string, unknown>)[k] as number | null) ?? v])) as MortgageRules,
      text: Object.fromEntries(Object.entries(MORTGAGE_TEXT_DEFAULTS).map(([k, v]) => [k, ((mp as unknown as Record<string, unknown>)[k] as string | null) || v])) as MortgageText,
      faqs: mp.faqs?.length ? mp.faqs.map(x => ({ q: x.q, a: x.a })) : MORTGAGE_FAQS,
    },
    servicesPage: {
      text: Object.fromEntries(Object.entries(SERVICES_TEXT_DEFAULTS).map(([k, v]) => [k, ((svp as unknown as Record<string, unknown>)[k] as string | null) || v])) as ServicesText,
      faqs: (svp.faqs ?? []).map(x => ({ q: x.q, a: x.a })),
      showCta: svp.showCta !== false,
    },
    sell: {
      text: Object.fromEntries(Object.entries(SELL_TEXT_DEFAULTS).map(([k, v]) => [k, ((sp as unknown as Record<string, unknown>)[k] as string | null) || v])) as SellText,
      why: sp.whyPoints?.length ? sp.whyPoints.map(x => ({ title: x.title, text: x.text })) : SELL_WHY,
      showStats: sp.showStats !== false,
      steps: sp.steps?.length ? sp.steps.map(x => ({ title: x.title, text: x.text })) : SELL_STEPS,
      faqs: sp.faqs?.length ? sp.faqs.map(x => ({ q: x.q, a: x.a })) : SELL_FAQS,
      intents: sp.intents?.length ? sp.intents : SELL_INTENTS,
    },
    notFound: {
      text: Object.fromEntries(Object.entries(NOT_FOUND_DEFAULTS).map(([k, v]) => [k, ((nf as unknown as Record<string, unknown>)[k] as string | null) || v])) as NotFoundText,
      links: nf.links?.length ? nf.links.map(l => ({ label: l.label, href: l.href })) : NOT_FOUND_LINKS,
      showContact: nf.showContact !== false,
    },
    developerPage: {
      text: Object.fromEntries(Object.entries(DEVELOPER_TEXT_DEFAULTS).map(([k, v]) => [k, ((dp as unknown as Record<string, unknown>)[k] as string | null) || v])) as DeveloperText,
      listOrder: (dp.listOrder ?? DEVELOPER_OPTIONS_DEFAULTS.listOrder) as DevOrder,
      showLogos: Boolean(dp.showLogos),
      showFacts: dp.showFacts !== false, showKnownFor: dp.showKnownFor !== false, showResale: dp.showResale !== false,
      resaleCount: dp.resaleCount ?? DEVELOPER_OPTIONS_DEFAULTS.resaleCount,
    },
    communityPage: {
      // Text lives on two globals (Community page + Communities list); each key is on one of them.
      text: Object.fromEntries(Object.entries(COMMUNITY_TEXT_DEFAULTS).map(([k, v]) => [k, ((cp as unknown as Record<string, unknown>)[k] as string | null) || ((cl as unknown as Record<string, unknown>)[k] as string | null) || v])) as CommunityText,
      life: cl.lifeFilters?.length
        ? cl.lifeFilters.map(f => ({ key: f.want as LifeKey, label: f.label, limit: f.limit ?? LIFE_OPTIONS.find(o => o.value === f.want)?.limit ?? null }))
        : LIFE_DEFAULTS.map(k => { const o = LIFE_OPTIONS.find(x => x.value === k)!; return { key: k, label: o.label, limit: o.limit }; }),
      perTab: cp.perTab ?? COMMUNITY_OPTIONS_DEFAULTS.perTab,
      nearbyCount: cp.nearbyCount ?? COMMUNITY_OPTIONS_DEFAULTS.nearbyCount,
      rankBy: (cl.rankBy ?? COMMUNITY_OPTIONS_DEFAULTS.rankBy) as RankKey,
      showAutoFaqs: cp.showAutoFaqs !== false,
      extraFaqs: (cp.extraFaqs ?? []).map(x => ({ q: x.q, a: x.a })),
      cardFigures: (cl.cardFigures?.length ? cl.cardFigures : COMMUNITY_OPTIONS_DEFAULTS.cardFigures) as CardFigure[],
      showCardChips: cl.showCardChips !== false,
      showMap: cp.showMap !== false,
    },
    offplan: {
      text: Object.fromEntries(Object.entries(OFFPLAN_TEXT_DEFAULTS).map(([k, v]) => [k, ((op as unknown as Record<string, unknown>)[k] as string | null) || v])) as OffplanText,
      whyCards: op.whyCards?.length ? op.whyCards.map(w => ({ icon: w.icon ?? 'star', title: w.title, text: w.text })) : WHY_OFFPLAN_DEFAULTS,
      budgets: op.budgets?.length ? [...op.budgets].sort((a, b) => a - b) : OFFPLAN_OPTIONS_DEFAULTS.budgets,
      moreCount: op.moreCount ?? OFFPLAN_OPTIONS_DEFAULTS.moreCount,
      showAutoFaqs: op.showAutoFaqs !== false,
      extraFaqs: (op.extraFaqs ?? []).map(x => ({ q: x.q, a: x.a })),
      deskAgent: op.deskAgent == null ? '' : String(typeof op.deskAgent === 'object' ? op.deskAgent.id : op.deskAgent),
    },
    propertyPage: {
      text: Object.fromEntries(Object.entries(PROPERTY_PAGE_DEFAULTS).map(([k, v]) => [k, ((pp as unknown as Record<string, unknown>)[k] as string | null) || v])) as PropertyPageText,
      similarCount: pp.similarCount ?? PROPERTY_OPTIONS_DEFAULTS.similarCount,
      matchMin: pp.matchMin ?? PROPERTY_OPTIONS_DEFAULTS.matchMin,
      showReasons: pp.showReasons !== false,
      showAutoFaqs: pp.showAutoFaqs !== false,
      extraFaqs: (pp.extraFaqs ?? []).map(x => ({ q: x.q, a: x.a })),
      keyFacts: (pp.keyFacts?.length ? pp.keyFacts : KEY_FACT_DEFAULTS) as FactKey[],
      detailRows: pp.detailRows?.length
        ? pp.detailRows.filter(r => r.show !== false).map(r => ({ fact: r.fact as FactKey, label: r.label ?? '' }))
        : DETAIL_ROW_DEFAULTS.map(fact => ({ fact, label: '' })),
    },
    listings: {
      chips: { buy: chipsOf(lp.buyChips, 'buy'), rent: chipsOf(lp.rentChips, 'rent') },
      good: {
        buy: { title: lp.buyGoodTitle || GOOD_DEFAULTS.buy.title, titleItalic: lp.buyGoodItalic || GOOD_DEFAULTS.buy.titleItalic, items: lp.buyGood?.length ? lp.buyGood.map(x => ({ q: x.q, a: x.a })) : GOOD_DEFAULTS.buy.items },
        rent: { title: lp.rentGoodTitle || GOOD_DEFAULTS.rent.title, titleItalic: lp.rentGoodItalic || GOOD_DEFAULTS.rent.titleItalic, items: lp.rentGood?.length ? lp.rentGood.map(x => ({ q: x.q, a: x.a })) : GOOD_DEFAULTS.rent.items },
      },
      tiles: (lp.tiles ?? []).map(t => rel(t)?.slug ?? '').filter(Boolean),
      showMarket: lp.showMarket !== false,
      pageSize: lp.pageSize || RESULTS_DEFAULTS.pageSize,
      sort: { buy: (lp.buySort || RESULTS_DEFAULTS.sort.buy) as SortKey, rent: (lp.rentSort || RESULTS_DEFAULTS.sort.rent) as SortKey },
      steps: {
        buy: lp.buySteps?.length ? [...lp.buySteps].sort((a, b) => a - b) : RESULTS_DEFAULTS.steps.buy,
        rent: lp.rentSteps?.length ? [...lp.rentSteps].sort((a, b) => a - b) : RESULTS_DEFAULTS.steps.rent,
      },
      text: Object.fromEntries(Object.entries(LISTING_TEXT_DEFAULTS).map(([k, v]) => [k, ((lp as unknown as Record<string, unknown>)[k] as string | null) || v])) as typeof LISTING_TEXT_DEFAULTS,
    },
    heroes: Object.fromEntries((s.pageHeroes ?? []).map(v => {
      return [v.page, {
        eyebrow: v.eyebrow ?? '', title: v.title ?? '', titleItalic: v.titleItalic ?? '', sub: v.sub ?? '',
        img: fileUrl(v.image), alt: (v.image && typeof v.image === 'object' && (v.image as { alt?: string | null }).alt) || '',
      }];
    })),
  };

  return {
    properties, projects, communities, developers, agents: agentsOut, posts: postsOut,
    testimonials: testi.docs.map(t => ({ id: String(t.id), name: t.name, role: t.role, text: t.text, rating: t.rating ?? 5, kind: t.kind, outcome: t.outcome || undefined,
      img: fileUrl(t.image, t.imageUrl) || undefined, photo: fileUrl(t.photo, t.photoUrl) || undefined })),
    services: svcs.docs.map(sv => ({ slug: sv.slug ?? '', name: sv.name, icon: sv.icon, desc: sv.desc, points: sv.points ?? [], img: fileUrl(sv.image, sv.imageUrl) || undefined,
      ctaLabel: sv.ctaLabel ?? '', ctaHref: sv.ctaHref ?? '', faqs: (sv.faqs ?? []).map(f => ({ q: f.q, a: f.a })) })),
    careers: jobs.docs.map(j => ({
      id: String(j.id), title: j.title, dept: j.dept, type: j.type, location: j.location, desc: j.desc,
      postedAt: ymd(j.postedAt) || undefined, closesAt: ymd(j.closesAt) || undefined, salary: j.salary ?? undefined,
    })),
    site,
  };
}

/** Content plus the lookup helpers from lib/data, bound to it. */
export async function data() {
  const c = await getContent();
  return { ...db(c), c, site: c.site };
}
export type Data = Awaited<ReturnType<typeof data>>;
