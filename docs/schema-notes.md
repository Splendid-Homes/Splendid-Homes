# Structured data: validation notes

Status as of 21 Oct 2026 (Phase 8). Builders live in `src/lib/seo.ts` (site-wide) and `src/lib/schema.ts` (per page); FAQ copy in `src/lib/faq.ts`.

## Types by page

| Page | JSON-LD types | Source |
| --- | --- | --- |
| Every page | `RealEstateAgent` + `Organization` (one node), `WebSite` | `organizationJsonLd()` in the root layout |
| `/property/[slug]` | `RealEstateListing`, `BreadcrumbList`, `FAQPage` | `listingJsonLd()`, `<Breadcrumbs>`, `<FaqBlock>` |
| `/buy`, `/rent` | `BreadcrumbList`, `ItemList` (listings on the current page) | `<Breadcrumbs>`, `ListingsPage` |
| `/community/[slug]` | `Place`, `BreadcrumbList`, `FAQPage` | `placeJsonLd()`, `communityFaqs()` |
| `/communities` | `BreadcrumbList`, `ItemList` of communities | `itemListJsonLd()` |
| `/off-plan` | `BreadcrumbList`, `ItemList` of projects | `itemListJsonLd()` |
| `/off-plan/[slug]` | `RealEstateListing` (mainEntity `ApartmentComplex`/`Residence`, `AggregateOffer`), `BreadcrumbList`, `FAQPage` | `projectJsonLd()`, `projectFaqs()` |
| `/insights` | `BreadcrumbList`, `ItemList` of articles | `itemListJsonLd()` |
| `/insights/[slug]` | `BlogPosting`, `BreadcrumbList`, `FAQPage` | `blogPostingJsonLd()`, `data/postExtras.ts` |
| `/team` | `BreadcrumbList`, `ItemList` of members | `itemListJsonLd()` |
| `/team/[slug]` | `ProfilePage` (mainEntity `Person` + RERA BRN, languages, specialties), `BreadcrumbList` | `profileJsonLd()` |
| `/developers`, `/developer/[slug]` | `ItemList`; `Organization` (description, founding year) | `developerJsonLd()` |
| `/services` | `ItemList` of `Service` (provider = agency, areaServed Dubai) | inline |
| `/sell`, `/mortgage` | `FAQPage`, `BreadcrumbList` | page FAQs |
| `/about`, `/contact` | `AboutPage`, `ContactPage` (about = agency) | inline |
| `/saved`, `/legal/*` | none extra; **noindex** | — |

## Property page mapping

- `RealEstateListing` (the page): `url`, `name`, `description`, `image[]`, `datePosted`, `inLanguage`, `identifier` (Reference + **DLD Permit No.**), `provider` → organisation `@id`, `author` → agent `Person` with **RERA BRN** as `identifier`.
- `mainEntity` (the home): `Apartment` (apartments, penthouses), `SingleFamilyResidence` (villas), `House` (townhouses), `Place` (offices). Carries `address`, `geo`, `floorSize` (`QuantitativeValue`, unitCode `FTK` = sq ft), `numberOfRooms` (beds + baths), `numberOfBedrooms`, `numberOfBathroomsTotal`, `amenityFeature[]`, `yearBuilt` (ready homes only).
- `offers`: `Offer` with `price` (number) and `priceCurrency: AED`, `businessFunction` Sell or LeaseOut. Rentals add a `UnitPriceSpecification` with unitCode `ANN` (per year). `itemOffered` points at the home, `offeredBy` at the agency.
- The same DLD permit, reference, agent BRN and company ORN are shown visibly in the "Regulatory information" block, as the SEO brief requires.

## Community page mapping

- `Place` with `geo`, `address` (locality = community, region Dubai, country AE), `containedInPlace` City Dubai, `amenityFeature` (highlights), `slogan` (tagline).
- Headline figures as `additionalProperty` `PropertyValue`s (price per sq ft, annual rent, gross yield) with `unitText`, and the source + date in `description`. The same figures, source line and "last updated" date are visible on the page.
- 6 FAQs (5 for non-freehold areas), answers built from the same figures and our live listing counts.

## Off-plan project mapping

- `RealEstateListing` page; `mainEntity` is the development (`ApartmentComplex` for apartment towers, `Residence` for villa/mansion projects) with address, geo and amenities; `about` names the developer.
- `AggregateOffer` in AED: `lowPrice` / `highPrice` across unit types, `offerCount` = unit types, offered by the agency.
- Visible payment-plan bar and an AED schedule table (milestone, %, amount on the starting price), unit-type table, and 6–7 FAQs (price, plan, handover, units, freehold, escrow under Dubai Law No. 8 of 2007, Golden Visa).

## Insights article mapping

- `BlogPosting`: headline, description, `abstract` (the visible "In short" summary), image, `datePublished`, `dateModified`, `articleSection`, `wordCount` (computed from all visible text), `inLanguage`, `isAccessibleForFree`.
- `author`: `Person` with job title, photo, languages, profile URL and **RERA BRN** as `identifier`; the same credentials show in the byline and the "About the author" box.
- `publisher`: the agency `@id` (logo lives on that node). `citation`: one `CreativeWork` per listed source (DLD, Central Bank of the UAE, u.ae, ICP, KHDA).
- Every article shows Published / Updated dates, a Sources box with an "as of" date, and 5–6 FAQs.

## Listing pages

- Filters live in the URL; metadata is static, so **every filtered or sorted URL canonicalises to `/buy` or `/rent`**. Unknown parameter values are ignored (whitelisted parser).
- `ItemList` covers the listings shown on the current page; results are in the server HTML (Partial Prerender: static hero shell + streamed results in the same response).

## Checks done (local)

`scratchpad/pp/schemacheck.mjs` fetches every URL in `/sitemap/properties.xml` (14 listings) and checks:

- every block parses and uses `@context: https://schema.org`;
- listing has url/name/description/images, ISO `datePosted`, numeric AED price, DLD permit identifier, AE address, Dubai geo, floor size and integer room count (homes), agent BRN;
- breadcrumbs are ordered from position 1 with absolute URLs;
- FAQ has 5 or more Q&As and **every answer is also visible in the page HTML** (Google's FAQ content policy);
- exactly one `<h1>` and a self-referencing canonical.

Result: **14/14 pages pass.**

`scratchpad/pp/schemacheck2.mjs` covers the 9 community pages (Place basics, Dubai geo, stats as PropertyValues, 5–8 FAQs visible on page, breadcrumbs, visible source + last-updated line, comparison table, canonical), the `/communities` ItemList and `/buy` + `/rent` (filtered URL canonical, ItemList, breadcrumbs). Result: **all pass.**

`scratchpad/pp/schemacheck3.mjs` covers the 6 projects (AggregateOffer in AED, entity + geo, 5–8 visible FAQs, breadcrumbs, payment plan), the 6 articles (BlogPosting basics, ISO dates with modified ≥ published, author Person + BRN visible on page, publisher, absolute citation URLs, word count, 5–8 visible FAQs, summary before body, sources visible) and both index pages, including base canonicals on filtered URLs. Result: **all pass.**

**Site-wide audit** (`scratchpad/pp/siteaudit.mjs`, all 66 indexable pages + noindex pages): exactly one `<h1>`, self-referencing canonical, robots correct (noindex only on `/saved` and `/legal/*`), title ≤ 75 characters, description 50–320 characters, no duplicate HTML ids, JSON-LD parses, site-wide organisation on every page and breadcrumbs on every inner page. **All pass.** Link crawl (`crawl.mjs`): **0 broken internal links**, every indexable page is in a sitemap.

Type counts across the site: RealEstateAgent+Organization 66, WebSite 66, BreadcrumbList 65, FAQPage 37, RealEstateListing 20, Place 9, ItemList 9, Organization 7, BlogPosting 6, ProfilePage 6, AboutPage 1, ContactPage 1.

## Still to do on staging (needs a public URL)

1. Google Rich Results Test and validator.schema.org on one buy, one rent and one office listing, plus the homepage.
2. Search Console → Enhancements once indexed (production only; staging is `noindex`).

## Decisions and caveats

- **Geo** uses the community's coordinates until the CMS stores an exact pin per listing. The map facade uses the same point.
- **FAQPage**: since 2023 Google shows FAQ rich results only for government and health sites. The markup is still valid, and answer engines (ChatGPT, Perplexity, Google AI Overviews) read it, which is the AEO goal. Answers are built from listing data or standing Dubai rules: 4% DLD transfer fee, AED 2M Golden Visa property threshold, Ejari registration, and freehold areas (explicit allow-list in `faq.ts`).
- **RealEstateListing** is not a Google rich-result type. It is used for entity clarity and answer engines; Google reads the Offer/price and images.
- **No `AggregateRating` / `Review`** anywhere: the homepage Google rating is a placeholder. Markup is added only once real, visible reviews are connected.
- **Market figures are sample data.** The source line says so in plain words until real DLD/Ejari figures are loaded (`MARKET_DATA` in `src/lib/market.ts`).
- **Off-plan projects are prototype samples** attributed to real developers (Emaar, Nakheel, Sobha, DAMAC, Ellington, Binghatti). They must be replaced with real, permitted launches before the site is public.
- **Two articles are marked sample** (Q3 market report, family communities) and say so on the page; the four guides state standing rules only and cite official sources.
- **No JobPosting** on `/careers` until each role has a real posting date, closing date and salary range.
- **No agent ratings or awards** are shown or marked up: the prototype's star ratings and award badges had no verifiable source.
- **Offer `availability`** is omitted on purpose: stock terms (`InStock`) do not fit property, and sold/let listings are unpublished rather than marked.
