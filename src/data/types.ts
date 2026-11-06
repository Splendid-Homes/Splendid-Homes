import type { Fees } from '@/payload/feeDefaults';
import type { SortKey } from '@/lib/listings';
import type { FactKey, PropertyPageText } from '@/payload/propertyDefaults';
import type { OffplanText } from '@/payload/offplanDefaults';
import type { CardFigure, CommunityText, LifeKey, RankKey } from '@/payload/communityDefaults';
import type { DeveloperText, DevOrder } from '@/payload/developerDefaults';
import type { NotFoundText } from '@/payload/notFoundDefaults';
import type { SellText } from '@/payload/sellDefaults';
import type { ServicesText } from '@/payload/servicesDefaults';
import type { MortgageRules, MortgageText } from '@/payload/mortgageDefaults';
import type { AboutTeamText } from '@/payload/aboutTeamDefaults';
import type { ContactCareersText } from '@/payload/contactCareersDefaults';
import type { InsightsText } from '@/payload/insightsDefaults';
import type { CompareConfig } from '@/payload/compareSavedDefaults';
import type { LegalPageDef, LegalText } from '@/payload/legalDefaults';
import type { ContactWay, FooterColumn, MenuLink, MenuText, MoreColumn } from '@/payload/menuDefaults';
import type { SeoOverrides } from '@/payload/seoDefaults';
import type { Chip, LISTING_TEXT_DEFAULTS, Qa } from '@/payload/listingDefaults';
import type { FinderKey, HomeSectionKey, SectionCopy } from '@/payload/homeOptions';
// Shapes ported from the approved prototype (prototype/assets/shared/data.js).
// These mirror the planned CMS collections in Document 5 (database schema).

export type Purpose = 'buy' | 'rent';
export type PropertyType = 'Apartment' | 'Villa' | 'Townhouse' | 'Penthouse' | 'Office';

export interface Property {
  slug: string;
  id: string;
  ref: string;
  title: string;
  purpose: Purpose;
  type: PropertyType;
  /** AED; yearly for rentals */
  price: number;
  beds: number;
  baths: number;
  /** sq ft */
  size: number;
  community: string;
  building: string;
  furnishing: 'Furnished' | 'Unfurnished' | 'Fitted';
  status: 'Ready' | 'Off-plan';
  completion: string;
  developer: string;
  view: string;
  parking: number;
  serviceCharge: number;
  amenities: string[];
  images: string[];
  agent: string;
  /** Advertising permit number; empty when the property has none */
  permit: string;
  /** Land department short name, such as DLD or SLD; empty means DLD */
  authority?: string;
  authorityName?: string;
  /** Transfer fee and admin fee for this property; empty uses the site-wide fees */
  transferFeePct?: number;
  adminFee?: number;
  featured: boolean;
  published: boolean;
  video: boolean;
  tour: boolean;
  created: string;
  views: number;
  desc: string;
  videoUrl?: string;
  tourUrl?: string;
  /** Floor plan image or PDF; a /samples/ path marks a sample drawing. */
  floorPlan?: string;
  seo?: Seo;
}

export interface PaymentMilestone { label: string; pct: number }
export interface UnitType { type: string; size: string; from: number }

/** A project highlight from the CMS (Escrow protected, Golden Visa eligible…). */
export interface ProjectHighlight {
  id: string;
  label: string;
  /** Shorter text for chips on cards (falls back to label). */
  short: string;
  icon: string;
  desc: string;
  /** Position in the CMS list (for sorting). */
  order: number;
}

export interface Project {
  slug: string;
  id: string;
  name: string;
  developer: string;
  community: string;
  startPrice: number;
  handover: string;
  paymentPlan: string;
  plan: PaymentMilestone[];
  units: UnitType[];
  status: string;
  img: string;
  images: string[];
  featured: boolean;
  published: boolean;
  amenities: string[];
  desc: string;
  brochure?: string;
  seo?: Seo;
  /** Highlights that apply to this project, in CMS order (ticked + automatic − switched off). */
  highlights: ProjectHighlight[];
}

export interface Community {
  slug: string;
  name: string;
  img: string;
  coords: [number, number];
  avgSale: number;
  avgRent: number;
  roi: number;
  tag: string;
  desc: string;
  highlights: string[];
  /** Lifestyle facts for the homepage area finder (CMS). */
  life: { beach: boolean; metro: boolean; schools: number; toDowntown: number; toAirport: number };
  /** Long-form area guide (CMS "Area guide"); empty arrays/strings when not written yet. */
  intro: string;
  guide: { title: string; items: { heading: string; text: string }[] }[];
  pros: string[];
  cons: string[];
  suits: string;
  notFor: string;
  /** Slugs of hand-picked nearby communities (empty = pick the closest automatically). */
  nearby: string[];
  /** This community's own questions (CMS > Area guide). */
  faqs: Qa[];
}

export interface Developer {
  slug: string; name: string; founded: number; desc: string; projects: number;
  /** "About" section on the developer page (CMS); empty until written. */
  about: string; knownFor: string[];
  /** Logo, banner photo and website (CMS); empty strings when not set. */
  logo: string; heroImage: string; website: string;
  faqs: Qa[];
}

export interface Agent {
  slug: string;
  id: string;
  name: string;
  title: string;
  img: string;
  languages: string[];
  brn: string;
  phone: string;
  email: string;
  specialties: string[];
  deals: number;
  rating?: number;
  bio: string;
  /** Optional social profile links (CMS). */
  linkedin: string; instagram: string;
}

export interface Post {
  slug: string;
  id: string;
  title: string;
  cat: string;
  date: string;
  img: string;
  author: string;
  excerpt: string;
  /** Lexical rich text from the CMS (string[] only in the legacy seed data). */
  body: unknown;
  /** Editorial extras (AEO/GEO), edited in the CMS. */
  summary?: string;
  updated?: string;
  sample?: string;
  takeaways?: string[];
  steps?: { title: string; text: string }[];
  table?: { title: string; caption: string; head: string[]; rows: string[][] };
  communityRows?: { title: string; caption: string; rows: { slug: string; bestFor: string }[] };
  communityTable?: boolean;
  faqs?: { q: string; a: string }[];
  sources?: { label: string; url: string }[];
  seo?: Seo;
}

export type TestimonialKind = 'buyer' | 'seller' | 'investor' | 'tenant' | 'landlord';
export interface Testimonial { id: string; name: string; role: string; text: string; rating: number; kind: TestimonialKind; outcome?: string; img?: string; photo?: string }
export interface Seo { metaTitle?: string | null; metaDescription?: string | null }
export interface Service {
  slug: string; name: string; icon: string; desc: string; points: string[]; img?: string;
  /** Optional extra button and the service's own questions (CMS). */
  ctaLabel: string; ctaHref: string; faqs: Qa[];
}
export interface Career { id: string; title: string; dept: string; type: string; location: string; desc: string; postedAt?: string; closesAt?: string; salary?: string }

export interface SiteSettings {
  company: string;
  orn: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  socials: Record<'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'facebook', string>;
  rates: Record<string, number>;
  home: {
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    heroVideo?: string;
    sections: Record<string, boolean>;
  };
  showFigures: boolean;
  stats: { years: number; sold: string; clients: string; agents: number };
  feeds: Record<string, boolean>;
  seo: { page: string; title: string; desc: string }[];
}

/** Site-wide settings as used by the website (from the CMS "Site settings" global). */
export interface Site {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  orn: string;
  phone: string;
  whatsapp: string;
  email: string;
  hours: string;
  address: { street: string; locality: string; country: string; full: string };
  geo: { lat: number; lng: number };
  socials: Record<'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'facebook', string>;
  googleBusinessProfile: string;
  showFigures: boolean;
  stats: { years: number; sold: string; clients: string; agents: number };
  rates: Record<string, number>;
  home: {
    heroTitle: string; heroSubtitle: string; heroImage: string; heroVideo?: string; picks: { label: string; href: string }[];
    /** Sections below the hero in display order, with CMS headings merged over the defaults. */
    sections: { key: HomeSectionKey; show: boolean; copy: SectionCopy }[];
    cards: { badge: string; showMarket: boolean; showExperts: boolean; priceValue: string; priceLabel: string; yieldValue: string; yieldLabel: string; expertsTitle: string; expertsStatus: string };
    bands: { label: string; min?: number; max?: number; icon: string; blurb: string }[];
    launches: { show: boolean; blurb: string };
    finder: { key: FinderKey; label: string; limit: number | null; on: boolean }[];
  };
  market: { source: string; sourceUrl: string; updated: string; priceChange?: number; yieldChange?: number };
  /** Header menus, phone menu, footer links and footer call to action (CMS global). */
  menus: {
    text: MenuText; mainNav: MenuLink[]; moreCols: MoreColumn[]; mobileExtra: MenuLink[]; footerCols: FooterColumn[]; ways: ContactWay[]; ctaWords: string[];
  };
  /** Google title / description overrides for the main pages (CMS global). */
  seo: SeoOverrides;
  /** Legal pages and the form consent line (CMS global). */
  legal: { text: LegalText; pages: LegalPageDef[]; showRera: boolean; showContact: boolean };
  why: { them: string; rows: WhyRow[] };
  /** Page hero overrides from Site settings > Page heroes (empty strings = keep the page's own text). */
  heroes: Record<string, HeroCopy>;
  /** Fees & costs (CMS global), with defaults filled in. */
  fees: Fees;
  /** Compare and Saved pages, plus the compare tray (CMS global). */
  compare: CompareConfig;
  /** Insights list and article pages (CMS global). */
  insights: {
    text: InsightsText; categories: { name: string; intro: string }[]; featured: 'newest' | 'pick' | 'none'; featuredId: string; perPage: number;
    nlShow: boolean; nlOnArticles: boolean; communityCols: string[]; formShow: boolean; relatedCount: number;
  };
  /** Contact and Careers pages (CMS global). */
  contactCareers: {
    text: ContactCareersText; extraRows: { label: string; value: string; icon: string; href: string }[]; showMap: boolean;
    interests: string[]; perks: { icon: string; title: string; text: string }[]; careersEmail: string; showSalary: boolean;
  };
  /** About page, Team page and agent profiles (CMS global). */
  aboutTeam: {
    text: AboutTeamText; storyImage: string; showStats: boolean; values: { icon: string; title: string; text: string }[];
    leaders: string[]; showDeals: boolean; waTo: 'agent' | 'company';
  };
  /** Mortgage page: lending rules, calculator defaults, wording and Q&A (CMS global). */
  mortgage: { rules: MortgageRules; text: MortgageText; faqs: Qa[] };
  /** Services page wording, Q&A and closing band (CMS global). */
  servicesPage: { text: ServicesText; faqs: Qa[]; showCta: boolean };
  /** Sell page wording, lists and valuation form text (CMS global). */
  sell: { text: SellText; why: { title: string; text: string }[]; showStats: boolean; steps: { title: string; text: string }[]; faqs: Qa[]; intents: string[] };
  /** "Page not found" wording and links (CMS global). */
  notFound: { text: NotFoundText; links: { label: string; href: string }[]; showContact: boolean };
  /** Developers list and developer pages (CMS global). */
  developerPage: {
    text: DeveloperText; listOrder: DevOrder; showLogos: boolean;
    showFacts: boolean; showKnownFor: boolean; showResale: boolean; resaleCount: number;
  };
  /** Communities list and community pages (CMS global). */
  communityPage: {
    text: CommunityText; life: { key: LifeKey; label: string; limit: number | null }[]; perTab: number; nearbyCount: number;
    rankBy: RankKey; showAutoFaqs: boolean; extraFaqs: Qa[];
    cardFigures: CardFigure[]; showCardChips: boolean; showMap: boolean;
  };
  /** Off-plan list and project pages (CMS global). */
  offplan: {
    text: OffplanText; whyCards: { icon: string; title: string; text: string }[]; budgets: number[];
    moreCount: number; showAutoFaqs: boolean; extraFaqs: Qa[]; deskAgent: string;
  };
  /** Property page wording and options (CMS global). */
  propertyPage: {
    text: PropertyPageText; similarCount: number; matchMin: number; showReasons: boolean; showAutoFaqs: boolean; extraFaqs: Qa[];
    keyFacts: FactKey[]; detailRows: { fact: FactKey; label: string }[];
  };
  /** Buy & Rent pages (CMS global). */
  listings: {
    chips: Record<'buy' | 'rent', Chip[]>;
    good: Record<'buy' | 'rent', { title: string; titleItalic: string; items: Qa[] }>;
    tiles: string[];
    showMarket: boolean;
    text: typeof LISTING_TEXT_DEFAULTS;
    pageSize: number;
    sort: Record<'buy' | 'rent', SortKey>;
    steps: Record<'buy' | 'rent', number[]>;
  };
}

export interface HeroCopy { eyebrow: string; title: string; titleItalic: string; sub: string; img: string; alt: string }

/** One "Why Splendid Homes" comparison row (CMS: Site settings > Homepage). */
export interface WhyRow { topic: string; icon: string; us: string; them: string }
