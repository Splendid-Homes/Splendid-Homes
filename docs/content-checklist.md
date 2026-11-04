# Content checklist by page type

All content below is edited in the admin (`/admin`, see `cms-and-leads.md`). Items start as **Draft**; switch to **Published** when the checklist is complete.

Used by the editors when publishing in the CMS. "Auto" means the site generates it from the listing fields.

## Property page (`/property/[slug]`)

**Required fields (page will not publish without them)**
- [ ] Title: type + key feature + building, e.g. "Opera Grand 3BR with Full Burj Khalifa View" (under 70 characters)
- [ ] Purpose (sale / rent), type, price in AED (rent = per year)
- [ ] Bedrooms, bathrooms, built-up area (sq ft), furnishing, status, completion / handover year
- [ ] Community and building
- [ ] **DLD (Trakheesi) permit number** and internal reference, both shown on the page
- [ ] Agent with a valid **RERA BRN**
- [ ] At least 5 photos, landscape, 1400 px or wider; first photo is the strongest exterior or view shot (it is the hero and the share image)
- [ ] Description: 80–200 words, factual, no ALL CAPS, no phone numbers in the text

**Recommended**
- [ ] View (proper nouns capitalised, e.g. "Sea & Atlantis"), parking, service charge per sq ft (sale)
- [ ] 6–12 amenities from the standard list
- [ ] Developer
- [ ] Exact map pin (until set, the community location is used)

**Auto-generated, check once**
- [ ] One-sentence summary under the title (answer engines quote it)
- [ ] Price per sq ft
- [ ] FAQ: 6–8 questions on price, size, service charge or rent payment, freehold, Golden Visa, buying costs, viewing and permit
- [ ] Breadcrumbs: Home › Buy/Rent › Community › Listing
- [ ] Meta title "{Title}, {Community} | Splendid Homes" and description with size, baths, price, ref and permit
- [ ] Canonical URL, social image (first photo), JSON-LD (see `schema-notes.md`)

**Before go-live**
- [ ] Price and permit match the DLD record
- [ ] Listing unpublished as soon as it is sold or let (no "sold" pages left indexed)

## Community page (`/community/[slug]`)

- [ ] Name, tagline, 30–60 word description (first sentence says what the area is)
- [ ] Hero photo of the actual area (current photos are prototype stock; e.g. Dubai Marina shows the Burj Al Arab)
- [ ] Map coordinates (centre of the community)
- [ ] 4–6 highlights: landmarks, metro/tram, schools, beaches, malls
- [ ] **Market figures with provenance**: average sale price per sq ft, average annual rent, gross yield, plus source (e.g. DLD transactions / Ejari, last 12 months) and the date. Replace the sample figures and update `MARKET_DATA` before launch.
- [ ] Auto: summary sentence, KPI strip, comparison table, 6 FAQs, Place + FAQPage + breadcrumbs

## Buy / Rent listing pages

- [ ] Hero copy (H1 is fixed: "Properties for sale/rent in Dubai")
- [ ] "Good to know" points reviewed yearly (fees, Golden Visa threshold, deposits)
- [ ] Auto: results, filters in the URL, canonical to the base page, ItemList

## Off-plan project (`/off-plan/[slug]`)

- [ ] **Real project only**: name, developer and details from the developer's official sales material, with permission to advertise (the six prototype projects are fictional and must be removed)
- [ ] Starting price, handover quarter, status
- [ ] Payment plan milestones that add up to 100%
- [ ] Unit types with size ranges and "from" prices
- [ ] 4–8 photos/renders, amenities, short description (first sentence says what and where)
- [ ] Auto: KPI strip, payment bar and AED schedule, unit table, 6–7 FAQs, RealEstateListing + AggregateOffer + FAQPage

## Insights article (`/insights/[slug]`)

- [ ] Title (under 65 characters), category, excerpt (one line)
- [ ] **"In short" summary**: 2–3 sentences that answer the title's question directly
- [ ] Author = a team member with a RERA BRN and a bio
- [ ] Body: lists for steps and costs, a table for any comparison
- [ ] **Every statistic has a source and a date**; add each source to the Sources list
- [ ] 5–8 FAQs, each answered in the first sentence
- [ ] Published date, and Updated date whenever facts change
- [ ] Remove the "sample" note only when real figures replace the prototype ones

## Team member (`/team/[slug]`)

- [ ] Real name, job title, professional photo (4:5)
- [ ] **RERA BRN** (verify on the DLD app) and languages
- [ ] Bio of 40–80 words: experience, areas, specialties
- [ ] Direct phone and email
- [ ] Auto: listings and articles by this person, ProfilePage + Person schema

## Developer (`/developer/[slug]`)

- [ ] Description and founding year from the developer's own material
- [ ] Official logo only with written permission (typographic wordmark until then)

## Static pages

- [ ] Sell, Services, About: replace prototype stock photography; confirm the stats (years, value sold, clients, agents) are accurate
- [ ] Mortgage: re-check Central Bank limits and DLD fees every 6 months (page shows "Last reviewed")
- [ ] Careers: add posting date, closing date and salary range per role to enable JobPosting markup
- [ ] **Legal: Privacy Policy and Terms from legal counsel** (pages are placeholders and noindex until then)
- [ ] Google Business Profile link once live (NAP must match `src/lib/site.ts`)
